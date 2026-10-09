import type { GenerationJob } from '../../generated/prisma/client.js'
import type { GeneratedArticle } from '../../generation/interfaces/generated-article.interface.js'
import type { GenerationJobEntity } from '../entities/generation-job.entity.js'
import type { SourceMetadata } from '../interfaces/source-metadata.interface.js'

export class GenerationJobMapper {
    static toEntity(job: GenerationJob): GenerationJobEntity {
        return {
            id: job.id,
            sourceUrl: job.sourceUrl,
            status: job.status,
            attempts: job.attempts,
            errorMessage: job.errorMessage,
            // Colunas JSON gravadas só pela própria API, já validadas.
            source: job.source as unknown as SourceMetadata | null,
            article: job.article as unknown as GeneratedArticle | null,
            llmProvider: job.llmProvider,
            llmModel: job.llmModel,
            usage:
                job.inputTokens === null || job.outputTokens === null
                    ? null
                    : {
                          inputTokens: job.inputTokens,
                          outputTokens: job.outputTokens,
                      },
            wpPostId: job.wpPostId,
            permalink: job.permalink,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        }
    }
}
