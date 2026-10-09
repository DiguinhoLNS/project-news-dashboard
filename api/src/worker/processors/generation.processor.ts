import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Inject, Logger } from '@nestjs/common'
import { type Job, UnrecoverableError } from 'bullmq'
import { JobStatus } from '../../generated/prisma/client.js'
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

        try {
            await this.processGenerationJobService.execute(jobId, attempt)
        } catch (error) {
            const failure = describeFailure(error)
            const willRetry = failure.retryable && attempt < maxAttempts

            this.logger.warn(
                `Job ${jobId} falhou (tentativa ${attempt}/${maxAttempts}, ${willRetry ? 'vai tentar de novo' : 'definitivo'}): ${error instanceof Error ? `${error.name}: ${error.message}` : String(error)}`,
            )

            await this.generationJobRepository.update(jobId, {
                status: willRetry ? JobStatus.QUEUED : JobStatus.FAILED,
                errorMessage: willRetry
                    ? `${failure.message} Nova tentativa em instantes.`
                    : failure.message,
            })

            // UnrecoverableError faz o BullMQ desistir sem gastar as tentativas restantes.
            throw failure.retryable
                ? error
                : new UnrecoverableError(failure.message)
        }
    }
}
