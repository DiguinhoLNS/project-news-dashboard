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

    async enqueue(jobId: string): Promise<void> {
        await this.queue.add(
            GENERATE_POST_JOB,
            { jobId },
            { ...GENERATION_JOB_OPTIONS, jobId },
        )
    }
}
