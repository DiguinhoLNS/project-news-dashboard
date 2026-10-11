import 'server-only'

type ApiProxyServiceConfig = {
    baseUrlEnv: string
}

/**
 * Serviços liberados no proxy (`/api/proxy/[service]/...`).
 * A URL fica apenas no servidor — nunca use `NEXT_PUBLIC_` para ela.
 */
export const apiProxyServices = {
    news: {
        baseUrlEnv: 'NEWS_API_URL'
    }
} as const satisfies Record<string, ApiProxyServiceConfig>

export type TApiProxyService = keyof typeof apiProxyServices

export function getServiceRuntimeConfig(serviceName: string) {
    if (!Object.hasOwn(apiProxyServices, serviceName)) {
        return null
    }

    const config = apiProxyServices[serviceName as TApiProxyService]

    const baseUrl = process.env[config.baseUrlEnv]

    if (!baseUrl) {
        return null
    }

    return { baseUrl }
}
