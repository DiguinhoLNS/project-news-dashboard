import type { GenerationJob } from '../domain/generation-job.js'
import type { GenerationJobEntity } from '../entities/generation-job.entity.js'

/** Domínio → resposta HTTP. O payload do WordPress não é exposto. */
export class GenerationJobMapper {
    static toEntity(job: GenerationJob): GenerationJobEntity {
        const props = job.toSnapshot()
        return {
            id: props.id,
            sourceUrl: props.sourceUrl,
            status: props.status,
            attempts: props.attempts,
            errorMessage: props.errorMessage,
            source: props.source,
            article: props.article,
            llmProvider: props.llmProvider,
            llmModel: props.llmModel,
            usage: props.usage,
            wpPostId: props.wpPostId,
            permalink: props.permalink,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        }
    }
}
