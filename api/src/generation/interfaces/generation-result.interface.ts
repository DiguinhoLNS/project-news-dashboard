import type { GeneratedArticle } from './generated-article.interface.js'
import type { LlmUsage } from './llm-provider.interface.js'

export interface GenerationResult {
    article: GeneratedArticle
    provider: string
    model: string
    /** Soma de todas as tentativas, para acompanhar custo. */
    usage: LlmUsage
    attempts: number
}
