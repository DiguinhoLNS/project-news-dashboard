import {
    FETCH_TIMEOUT_MS,
    FETCH_USER_AGENT,
    MAX_HTML_BYTES,
    MAX_REDIRECTS,
} from '../constants/extraction.constants.js'
import {
    ExtractionError,
    NotReadableError,
    SourceUnavailableError,
} from '../exceptions/extraction.exception.js'
import type { FetchedPage } from '../interfaces/fetched-page.interface.js'
import { assertPublicUrl } from './assert-public-url.js'

const HTML_CONTENT_TYPES = ['text/html', 'application/xhtml+xml']

/** Respostas que podem mudar numa nova tentativa; os demais 4xx são definitivos. */
const TRANSIENT_STATUSES = new Set([408, 425, 429])

/**
 * Baixa a página seguindo redirects manualmente, para validar cada destino:
 * um redirect para a rede interna seria uma forma de contornar o bloqueio.
 */
export async function fetchPage(rawUrl: string): Promise<FetchedPage> {
    const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS)
    let url = new URL(rawUrl)

    for (let redirects = 0; ; redirects++) {
        await assertPublicUrl(url)

        const response = await request(url, signal)
        const location = response.headers.get('location')

        if (response.status >= 300 && response.status < 400 && location) {
            if (redirects >= MAX_REDIRECTS) {
                throw new SourceUnavailableError('a página redireciona demais')
            }

            url = new URL(location, url)
            continue
        }

        if (!response.ok) {
            const message = `a página respondeu HTTP ${response.status}`
            throw response.status >= 500 ||
                TRANSIENT_STATUSES.has(response.status)
                ? new SourceUnavailableError(message)
                : new NotReadableError(message)
        }
        const contentType = response.headers.get('content-type') ?? ''
        if (!HTML_CONTENT_TYPES.some((type) => contentType.includes(type))) {
            throw new NotReadableError(
                `a URL não é uma página HTML (${contentType || 'tipo desconhecido'})`,
            )
        }

        return { url, html: await readBody(response, signal), contentType }
    }
}

async function request(url: URL, signal: AbortSignal): Promise<Response> {
    try {
        return await fetch(url, {
            redirect: 'manual',
            signal,
            headers: {
                'user-agent': FETCH_USER_AGENT,
                accept: 'text/html,application/xhtml+xml',
                'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8',
            },
        })
    } catch (error) {
        throw toUnavailable(error)
    }
}

async function readBody(
    response: Response,
    signal: AbortSignal,
): Promise<Buffer> {
    const declaredLength = Number(response.headers.get('content-length'))

    if (declaredLength > MAX_HTML_BYTES) {
        throw new SourceUnavailableError('a página é grande demais')
    }

    const reader = response.body?.getReader()

    if (!reader) {
        throw new NotReadableError('a página veio vazia')
    }

    const chunks: Uint8Array[] = []
    let size = 0

    try {
        for (;;) {
            const { done, value } = await reader.read()

            if (done) {
                break
            }

            size += value.byteLength

            if (size > MAX_HTML_BYTES) {
                await reader.cancel()
                throw new SourceUnavailableError('a página é grande demais')
            }

            chunks.push(value)
        }
    } catch (error) {
        throw error instanceof ExtractionError ? error : toUnavailable(error)
    }

    if (signal.aborted) {
        throw new SourceUnavailableError(
            'a página demorou demais para responder',
        )
    }
    return Buffer.concat(chunks)
}

function toUnavailable(error: unknown): SourceUnavailableError {
    const timedOut = error instanceof Error && error.name === 'TimeoutError'
    return new SourceUnavailableError(
        timedOut
            ? 'a página demorou demais para responder'
            : 'não foi possível acessar a página',
        { cause: error },
    )
}
