import type { GenerationJob, JobStatus } from '../../generated/prisma/client.js'
import type { GeneratedArticle } from '../../generation/interfaces/generated-article.interface.js'
import type { WordPressPostPayload } from '../../publishing/interfaces/wordpress-post-payload.interface.js'
import type { SourceMetadata } from './source-metadata.interface.js'

export interface CreateGenerationJobData {
    sourceUrl: string
    sourceUrlHash: string
}

export interface UpdateGenerationJobData {
    status?: JobStatus
    attempts?: number
    errorMessage?: string | null
    source?: SourceMetadata
    article?: GeneratedArticle
    payload?: WordPressPostPayload
    llmProvider?: string
    llmModel?: string
    inputTokens?: number
    outputTokens?: number
    wpPostId?: number
    permalink?: string
}

export interface ListGenerationJobsParams {
    page: number
    pageSize: number
}

export interface GenerationJobList {
    items: GenerationJob[]
    total: number
}

export const GENERATION_JOB_REPOSITORY = Symbol('GENERATION_JOB_REPOSITORY')

export interface IGenerationJobRepository {
    create(data: CreateGenerationJobData): Promise<GenerationJob>
    findById(id: string): Promise<GenerationJob | null>
    findLatestActiveByUrlHash(
        sourceUrlHash: string,
    ): Promise<GenerationJob | null>
    list(params: ListGenerationJobsParams): Promise<GenerationJobList>
    update(id: string, data: UpdateGenerationJobData): Promise<GenerationJob>
}
