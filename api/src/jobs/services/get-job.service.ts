import { Inject, Injectable } from '@nestjs/common'
import { NotFoundBusinessException } from '../../common/exceptions/business.exception.js'
import type { GenerationJobEntity } from '../entities/generation-job.entity.js'
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from '../interfaces/generation-job-repository.interface.js'
import { GenerationJobMapper } from '../mappers/generation-job.mapper.js'

@Injectable()
export class GetJobService {
    constructor(
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly generationJobRepository: IGenerationJobRepository,
    ) {}

    async execute(id: string): Promise<GenerationJobEntity> {
        const job = await this.generationJobRepository.findById(id)
        if (!job) {
            throw new NotFoundBusinessException('Job')
        }
        return GenerationJobMapper.toEntity(job)
    }
}
