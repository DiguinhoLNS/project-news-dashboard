import type { GenerationJobEntity } from '../../jobs/entities/generation-job.entity.js'

export interface GeneratePostResult {
    job: GenerationJobEntity
    reused: boolean
}
