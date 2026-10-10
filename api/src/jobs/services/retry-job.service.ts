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
import { type GenerationJob, JobStatus } from '../../generated/prisma/client.js'
import {
    GENERATION_QUEUE,
    type IGenerationQueue,
} from '../../queue/interfaces/generation-queue.interface.js'
import { RETRYABLE_JOB_STATUSES } from '../constants/retry-job.constants.js'
import type { GenerationJobEntity } from '../entities/generation-job.entity.js'
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

        await this.assertRetryable(job)

        // Volta para QUEUED antes de enfileirar: se o worker pegar o job na
        // hora, as etapas dele não são sobrescritas por esta atualização.
        const queued = await this.generationJobRepository.update(id, {
            status: JobStatus.QUEUED,
            errorMessage: null,
        })

        let requeued: boolean

        try {
            requeued = await this.generationQueue.requeue(id)
        } catch (error) {
            this.logger.error(`Não foi possível reenfileirar o job ${id}: ${error instanceof Error ? error.message : String(error)}`)

            await this.restore(job)

            throw new ServiceUnavailableException('Não foi possível reenviar o job. Tente novamente em instantes.')
        }

        if (!requeued) {
            await this.restore(job)

            throw new ConflictBusinessException('Este job ainda está na fila de processamento.')
        }

        this.logger.log(`Job ${id} reenviado para a fila (estava ${job.status})`)

        return GenerationJobMapper.toEntity(queued)
    }

    private async assertRetryable(job: GenerationJob): Promise<void> {
        if (job.status === JobStatus.PUBLISHED) {
            throw new ConflictBusinessException('Esta matéria já foi publicada.')
        }

        if (!RETRYABLE_JOB_STATUSES.has(job.status)) {
            throw new ConflictBusinessException('Este job ainda está em processamento.')
        }

        const latest = await this.generationJobRepository.findLatestActiveByUrlHash(job.sourceUrlHash

        )
        if (latest && latest.id !== job.id) {
            throw new ConflictBusinessException(`Esta matéria já tem outro job ativo: ${latest.id}.`)
        }
    }

    private async restore(job: GenerationJob): Promise<void> {
        await this.generationJobRepository.update(job.id, {
            status: job.status,
            errorMessage: job.errorMessage,
        })
    }
}
