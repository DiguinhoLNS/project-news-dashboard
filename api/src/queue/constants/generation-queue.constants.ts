import type { JobsOptions } from 'bullmq'

export const GENERATION_QUEUE_NAME = 'generation'

export const GENERATE_POST_JOB = 'generate-post'

export const GENERATION_JOB_OPTIONS: JobsOptions = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 15_000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 500 },
}
