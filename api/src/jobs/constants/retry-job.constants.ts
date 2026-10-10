import { JobStatus } from '../../generated/prisma/client.js'

/**
 * GENERATED só fica parado se o worker caiu entre gerar e publicar, ou em
 * jobs criados antes da publicação existir.
 */
export const RETRYABLE_JOB_STATUSES: ReadonlySet<JobStatus> = new Set([
    JobStatus.FAILED,
    JobStatus.GENERATED,
])

export const RETRY_JOB_THROTTLE = { limit: 5, ttl: 60_000 }
