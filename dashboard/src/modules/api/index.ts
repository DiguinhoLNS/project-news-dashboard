import { handleDefaultResponse } from '@/utils/responseHandler'
import ApiService from './services/apiService'
import type { TApiProxyService } from './server/servicesRegistry'

export function createApiProxyService(serviceName: TApiProxyService, handleResponse = handleDefaultResponse) {
    return new ApiService(`/api/proxy/${serviceName}`, handleResponse)
}

/**
 * API do Project News.
 * Responde no formato `{ ok, message, data }`.
 */
export const apiNews = createApiProxyService('news')
