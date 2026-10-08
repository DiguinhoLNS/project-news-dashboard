import type { GenerationResult } from '../../generation/interfaces/generation-result.interface.js'
import type { SourceArticle } from '../../generation/interfaces/source-article.interface.js'

/** Metadados da matéria original; o texto completo não volta na resposta. */
export type SourceMetadata = Omit<SourceArticle, 'text'>

export interface GeneratedPost extends GenerationResult {
    source: SourceMetadata
}
