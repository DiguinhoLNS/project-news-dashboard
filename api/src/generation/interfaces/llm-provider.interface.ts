import type { SourceArticle } from './source-article.interface.js'

export const LLM_PROVIDER = Symbol('LLM_PROVIDER')

export interface LlmUsage {
    inputTokens: number
    outputTokens: number
}

export interface LlmResponse {
    /** JSON bruto devolvido pelo modelo; a validação acontece fora do provedor. */
    text: string
    model: string
    usage: LlmUsage
}

/** Adapter de um provedor de IA: trocar de provedor é escrever outra implementação. */
export interface ILlmProvider {
    readonly name: string
    generateArticle(source: SourceArticle): Promise<LlmResponse>
}
