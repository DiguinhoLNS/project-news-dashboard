import type { SourceArticle } from './source-article.interface.js'

export const LLM_PROVIDER = Symbol('LLM_PROVIDER')

export interface LlmUsage {
    inputTokens: number
    outputTokens: number
}

export interface LlmResponse {
    text: string
    model: string
    usage: LlmUsage
}

export interface ILlmProvider {
    readonly name: string
    generateArticle(source: SourceArticle): Promise<LlmResponse>
}
