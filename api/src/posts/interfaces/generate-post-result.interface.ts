import type { GenerationJobEntity } from '../../jobs/entities/generation-job.entity.js'

export interface GeneratePostResult {
    job: GenerationJobEntity
    /** A URL já tinha um job em andamento ou concluído, devolvido sem gerar de novo. */
    reused: boolean
}
