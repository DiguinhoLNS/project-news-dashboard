import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Inject, Logger } from '@nestjs/common'
import { type Job, UnrecoverableError } from 'bullmq'
import { JobNotProcessableError } from '../../jobs/domain/generation-job.errors.js'
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from '../../jobs/interfaces/generation-job-repository.interface.js'
import { GENERATION_QUEUE_NAME } from '../../queue/constants/generation-queue.constants.js'
import type { GenerationJobPayload } from '../../queue/interfaces/generation-queue.interface.js'
import {
    GENERATION_RATE_LIMIT,
    GENERATION_WORKER_CONCURRENCY,
} from '../constants/generation-worker.constants.js'
import { ProcessGenerationJobService } from '../services/process-generation-job.service.js'
import { describeFailure } from '../utils/describe-failure.js'

@Processor(GENERATION_QUEUE_NAME, {
    concurrency: GENERATION_WORKER_CONCURRENCY,
    limiter: GENERATION_RATE_LIMIT,
})
export class GenerationProcessor extends WorkerHost {
    private readonly logger = new Logger(GenerationProcessor.name)

    constructor(
        private readonly processGenerationJobService: ProcessGenerationJobService,
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly generationJobRepository: IGenerationJobRepository,
    ) {
        super()
    }

    async process(job: Job<GenerationJobPayload>): Promise<void> {
        const { jobId } = job.data
        const attempt = job.attemptsMade + 1
        const maxAttempts = job.opts.attempts ?? 1
        const startedAt = performance.now()

        this.logger.log(
            `Job ${jobId}: iniciando (tentativa ${attempt}/${maxAttempts})`,
        )

        try {
            await this.processGenerationJobService.execute(jobId, attempt)
            this.logger.log(
                `Job ${jobId}: concluído em ${((performance.now() - startedAt) / 1000).toFixed(1)} s`,
            )
        } catch (error) {
            if (error instanceof JobNotProcessableError) {
                this.logger.warn(`Job ${jobId}: ignorado, ${error.message}`)
                return
            }

            const failure = describeFailure(error)
            const willRetry = failure.retryable && attempt < maxAttempts

            this.logger.warn(
                `Job ${jobId} falhou (tentativa ${attempt}/${maxAttempts}, ${willRetry ? 'vai tentar de novo' : 'definitivo'}): ${error instanceof Error ? `${error.name}: ${error.message}` : String(error)}`,
            )

            await this.recordFailure(
                jobId,
                willRetry
                    ? `${failure.message} Nova tentativa em instantes.`
                    : failure.message,
                willRetry,
            )

            // UnrecoverableError faz o BullMQ desistir sem gastar as tentativas restantes.
            throw failure.retryable
                ? error
                : new UnrecoverableError(failure.message)
        }
    }

    private async recordFailure(
        jobId: string,
        message: string,
        willRetry: boolean,
    ): Promise<void> {
        try {
            const job = await this.generationJobRepository.findById(jobId)
            if (!job || job.isTerminal) {
                return
            }
            if (willRetry) {
                job.scheduleRetry(message)
            } else {
                job.fail(message)
            }
            await this.generationJobRepository.save(job)
        } catch (error) {
            this.logger.error(
                `Job ${jobId}: não foi possível registrar a falha: ${error instanceof Error ? error.message : String(error)}`,
            )
        }
    }
}
