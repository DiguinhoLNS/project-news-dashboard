import type { GeneratedArticle } from './generated-article.interface.js'
import type { LlmUsage } from './llm-provider.interface.js'

export interface GenerationResult {
    article: GeneratedArticle
    provider: string
    model: string
    usage: LlmUsage
    attempts: number
}
