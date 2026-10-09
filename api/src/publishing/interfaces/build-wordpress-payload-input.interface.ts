import type { GeneratedArticle } from '../../generation/interfaces/generated-article.interface.js'
import type { SourceMetadata } from '../../jobs/interfaces/source-metadata.interface.js'
import type { WordPressPostStatus } from './wordpress-post-payload.interface.js'

export interface BuildWordPressPayloadInput {
    article: GeneratedArticle
    source: SourceMetadata
    idempotencyKey: string
    status: WordPressPostStatus
}
