import { GenerationJobEntity } from './generation-job.entity.js'

export class GenerationJobPageEntity {
    items: GenerationJobEntity[]
    page: number
    pageSize: number
    total: number
}
