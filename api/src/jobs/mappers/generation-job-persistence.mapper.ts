import {
    type GenerationJob as GenerationJobRow,
    Prisma,
} from '../../generated/prisma/client.js'
import type { GeneratedArticle } from '../../generation/interfaces/generated-article.interface.js'
import type { WordPressPostPayload } from '../../publishing/interfaces/wordpress-post-payload.interface.js'
import { GenerationJob } from '../domain/generation-job.js'
import type { SourceMetadata } from '../interfaces/source-metadata.interface.js'

/** Tradução entre a linha do Prisma e a entidade de domínio. */
export class GenerationJobPersistenceMapper {
    static toDomain(row: GenerationJobRow): GenerationJob {
        return GenerationJob.restore({
            id: row.id,
            sourceUrl: row.sourceUrl,
            sourceUrlHash: row.sourceUrlHash,
            status: row.status,
            attempts: row.attempts,
            errorMessage: row.errorMessage,
            source: row.source as unknown as SourceMetadata | null,
            article: row.article as unknown as GeneratedArticle | null,
            payload: row.payload as unknown as WordPressPostPayload | null,
            llmProvider: row.llmProvider,
            llmModel: row.llmModel,
            usage:
                row.inputTokens === null || row.outputTokens === null
                    ? null
                    : {
                          inputTokens: row.inputTokens,
                          outputTokens: row.outputTokens,
                      },
            wpPostId: row.wpPostId,
            permalink: row.permalink,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            version: row.version,
        })
    }

    static toMutableData(job: GenerationJob) {
        const props = job.toSnapshot()
        return {
            status: props.status,
            attempts: props.attempts,
            errorMessage: props.errorMessage,
            source: toJson(props.source),
            article: toJson(props.article),
            payload: toJson(props.payload),
            llmProvider: props.llmProvider,
            llmModel: props.llmModel,
            inputTokens: props.usage?.inputTokens ?? null,
            outputTokens: props.usage?.outputTokens ?? null,
            wpPostId: props.wpPostId,
            permalink: props.permalink,
        } satisfies Prisma.GenerationJobUpdateInput
    }
}

function toJson(value: object | null) {
    return value === null
        ? Prisma.DbNull
        : (value as unknown as Prisma.InputJsonObject)
}
