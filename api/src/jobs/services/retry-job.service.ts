import { Inject, Injectable, Logger } from '@nestjs/common'
import {
    ConflictBusinessException,
    NotFoundBusinessException,
} from '../../common/exceptions/business.exception.js'
import type { GenerationJob } from '../domain/generation-job.js'
import {
    JobAlreadyPublishedError,
    JobInProgressError,
} from '../domain/generation-job.errors.js'
import type { GenerationJobEntity } from '../entities/generation-job.entity.js'
import { ActiveJobConflictError } from '../exceptions/active-job-conflict.exception.js'
import { StaleJobError } from '../exceptions/stale-job.exception.js'
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from '../interfaces/generation-job-repository.interface.js'
import { GenerationJobMapper } from '../mappers/generation-job.mapper.js'

@Injectable()
export class RetryJobService {
    private readonly logger = new Logger(RetryJobService.name)

    constructor(
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly generationJobRepository: IGenerationJobRepository,
    ) {}

    async execute(id: string): Promise<GenerationJobEntity> {
        const job = await this.generationJobRepository.findById(id)

        if (!job) {
            throw new NotFoundBusinessException('Job')
        }

        const previousStatus = job.status

        requeue(job)

        const queued = await this.save(job)

        this.logger.log(`Job ${id} reenviado para a fila (estava ${previousStatus})`)

        return GenerationJobMapper.toEntity(queued)
    }

    private async save(job: GenerationJob): Promise<GenerationJob> {
        try {
            return await this.generationJobRepository.save(job)
        } catch (error) {
            if (error instanceof ActiveJobConflictError) {
                throw new ConflictBusinessException('Esta matéria já tem outro job ativo.')
            }
            if (error instanceof StaleJobError) {
                throw new ConflictBusinessException('O job mudou enquanto era reenviado. Atualize e tente novamente.')
            }
            throw error
        }
    }
}

function requeue(job: GenerationJob): void {
    try {
        job.requeue()
    } catch (error) {
        if (error instanceof JobAlreadyPublishedError) {
            throw new ConflictBusinessException('Esta matéria já foi publicada.')
        }
        if (error instanceof JobInProgressError) {
            throw new ConflictBusinessException('Este job ainda está em processamento.')
        }
        throw error
    }
}
