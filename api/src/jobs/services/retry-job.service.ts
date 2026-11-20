import {
    Inject,
    Injectable,
    Logger,
    ServiceUnavailableException,
} from '@nestjs/common'
import {
    ConflictBusinessException,
    NotFoundBusinessException,
} from '../../common/exceptions/business.exception.js'
import {
    GENERATION_QUEUE,
    type IGenerationQueue,
} from '../../queue/interfaces/generation-queue.interface.js'
import type {
    GenerationJob,
    RequeueSnapshot,
} from '../domain/generation-job.js'
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
        @Inject(GENERATION_QUEUE)
        private readonly generationQueue: IGenerationQueue,
    ) {}

    async execute(id: string): Promise<GenerationJobEntity> {
        const job = await this.generationJobRepository.findById(id)

        if (!job) {
            throw new NotFoundBusinessException('Job')
        }

        const previous = requeue(job)

        // Volta para QUEUED antes de enfileirar: se o worker pegar o job na
        // hora, as etapas dele não são sobrescritas por esta atualização.
        const queued = await this.saveRequeued(job)

        let requeued: boolean

        try {
            requeued = await this.generationQueue.requeue(id)
        } catch (error) {
            this.logger.error(`Não foi possível reenfileirar o job ${id}: ${error instanceof Error ? error.message : String(error)}`)

            await this.undo(queued, previous)

            throw new ServiceUnavailableException('Não foi possível reenviar o job. Tente novamente em instantes.')
        }

        if (!requeued) {
            await this.undo(queued, previous)

            throw new ConflictBusinessException('Este job ainda está na fila de processamento.')
        }

        this.logger.log(`Job ${id} reenviado para a fila (estava ${previous.status})`)

        return GenerationJobMapper.toEntity(queued)
    }

    private async saveRequeued(job: GenerationJob): Promise<GenerationJob> {
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

    private async undo(queued: GenerationJob, previous: RequeueSnapshot): Promise<void> {
        queued.undoRequeue(previous)

        try {
            await this.generationJobRepository.save(queued)
        } catch (error) {
            if (!(error instanceof StaleJobError)) throw error

            this.logger.warn(`Job ${queued.id} mudou antes de o reenvio ser desfeito; mantido como está`)
        }
    }
}

function requeue(job: GenerationJob): RequeueSnapshot {
    try {
        return job.requeue()
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
