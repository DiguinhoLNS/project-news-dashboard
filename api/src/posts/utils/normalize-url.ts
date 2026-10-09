import { createHash } from 'node:crypto'

const TRACKING_PARAMS = /^(utm_.+|fbclid|gclid)$/i

export function normalizeUrl(raw: string): string {
    const url = new URL(raw)
    url.hash = ''
    for (const key of Array.from(url.searchParams.keys())) {
        if (TRACKING_PARAMS.test(key)) {
            url.searchParams.delete(key)
        }
    }
    return url.href
}

export function hashUrl(url: string): string {
    return createHash('sha256').update(url).digest('hex')
}
