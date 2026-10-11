import { NextResponse, type NextRequest } from 'next/server'
import { getServiceRuntimeConfig } from '@/modules/api/server/servicesRegistry'

interface RouteContext {
    params: Promise<{
        service: string
        path: string[]
    }>
}

async function forward(request: NextRequest, { params }: RouteContext) {
    const { service, path } = await params
    const config = getServiceRuntimeConfig(service)

    if (!config) {
        return NextResponse.json(
            { ok: false, message: `Serviço inválido ou sem configuração: ${service}.`, data: null },
            { status: 400 }
        )
    }

    const baseUrl = config.baseUrl.replace(/\/+$/, '')
    const targetUrl = `${baseUrl}/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`

    const headers = new Headers({
        Accept: request.headers.get('Accept') ?? 'application/json'
    })

    const contentType = request.headers.get('Content-Type')

    if (contentType) headers.set('Content-Type', contentType)

    const hasBody = !['GET', 'HEAD'].includes(request.method)

    try {
        const body = hasBody ? await request.arrayBuffer() : undefined

        const upstream = await fetch(targetUrl, {
            method: request.method,
            headers,
            body: body?.byteLength ? body : undefined,
            cache: 'no-store',
            signal: request.signal
        })

        const responseHeaders = new Headers()
        const responseContentType = upstream.headers.get('Content-Type')

        if (responseContentType) responseHeaders.set('Content-Type', responseContentType)

        return new Response(upstream.body, {
            status: upstream.status,
            headers: responseHeaders
        })
    } catch (error) {
        console.error(`[proxy:${service}] Falha ao encaminhar para ${targetUrl}`, error)

        return NextResponse.json(
            { ok: false, message: 'A API não respondeu. Confira se ela está no ar.', data: null },
            { status: 502 }
        )
    }
}

export {
    forward as GET,
    forward as POST,
    forward as PUT,
    forward as PATCH,
    forward as DELETE
}
