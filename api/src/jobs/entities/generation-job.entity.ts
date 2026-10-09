import { ApiProperty } from '@nestjs/swagger'
import { JobStatus } from '../../generated/prisma/client.js'
import { GeneratedArticleEntity } from './generated-article.entity.js'
import { LlmUsageEntity } from './llm-usage.entity.js'
import { SourceMetadataEntity } from './source-metadata.entity.js'

export class GenerationJobEntity {
    id: string
    sourceUrl: string
    @ApiProperty({ enum: JobStatus, enumName: 'JobStatus' })
    status: JobStatus
    attempts: number
    errorMessage: string | null
    source: SourceMetadataEntity | null
    article: GeneratedArticleEntity | null
    llmProvider: string | null
    llmModel: string | null
    usage: LlmUsageEntity | null
    wpPostId: number | null
    permalink: string | null
    createdAt: Date
    updatedAt: Date
}
