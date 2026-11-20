import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import {
    GENERATE_POST_JOB,
    GENERATION_JOB_OPTIONS,
    GENERATION_QUEUE_NAME,
} from '../constants/generation-queue.constants.js'
import type {
    GenerationJobPayload,
    IGenerationQueue,
} from '../interfaces/generation-queue.interface.js'

@Injectable()
export class BullMqGenerationQueue implements IGenerationQueue {
    constructor(
        @InjectQueue(GENERATION_QUEUE_NAME)
        private readonly queue: Queue<GenerationJobPayload>,
    ) {}

    async dispatch(jobId: string): Promise<void> {
        const job = await this.queue.getJob(jobId)

        if (!job) {
            await this.queue.add(
                GENERATE_POST_JOB,
                { jobId },
                { ...GENERATION_JOB_OPTIONS, jobId },
            )

            return
        }

        const state = await job.getState()

        if (state !== 'failed' && state !== 'completed') {
            return
        }

        await job.retry(state, {
            resetAttemptsMade: true,
            resetAttemptsStarted: true,
        })
    }
}
