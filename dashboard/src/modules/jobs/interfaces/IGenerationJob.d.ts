import type { IGeneratedArticle } from './IGeneratedArticle'
import type { ILlmUsage } from './ILlmUsage'
import type { ISourceMetadata } from './ISourceMetadata'
import type { TJobStatus } from './TJobStatus'

export interface IGenerationJob {
    id: string
    sourceUrl: string
    status: TJobStatus
    attempts: number
    errorMessage: string | null
    source: ISourceMetadata | null
    article: IGeneratedArticle | null
    llmProvider: string | null
    llmModel: string | null
    usage: ILlmUsage | null
    wpPostId: number | null
    permalink: string | null
    createdAt: string
    updatedAt: string
}
