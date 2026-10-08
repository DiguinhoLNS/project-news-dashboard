import { GeneratedArticleEntity } from './generated-article.entity.js'
import { LlmUsageEntity } from './llm-usage.entity.js'
import { SourceMetadataEntity } from './source-metadata.entity.js'

export class GeneratedPostEntity {
    source: SourceMetadataEntity
    article: GeneratedArticleEntity
    provider: string
    model: string
    usage: LlmUsageEntity
    attempts: number
}
