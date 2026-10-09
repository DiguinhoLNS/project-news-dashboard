import type { SourceArticle } from '../../generation/interfaces/source-article.interface.js'

export type SourceMetadata = Omit<SourceArticle, 'text'>
