/**
 * Estados do job no domínio. Os valores são os mesmos do enum do banco, mas
 * o domínio não depende do Prisma: o repositório faz a tradução.
 */
export const JobStatus = {
    QUEUED: 'QUEUED',
    EXTRACTING: 'EXTRACTING',
    GENERATING: 'GENERATING',
    GENERATED: 'GENERATED',
    PUBLISHING: 'PUBLISHING',
    PUBLISHED: 'PUBLISHED',
    FAILED: 'FAILED',
} as const

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus]

/**
 * Estados em que a URL fica ocupada: só um job por URL pode estar em algum
 * deles (o índice único parcial do banco garante isso).
 */
export const ACTIVE_JOB_STATUSES: readonly JobStatus[] = [
    JobStatus.QUEUED,
    JobStatus.EXTRACTING,
    JobStatus.GENERATING,
    JobStatus.GENERATED,
    JobStatus.PUBLISHING,
    JobStatus.PUBLISHED,
]

/** Estados finais: o job não volta a ser processado sozinho. */
export const TERMINAL_JOB_STATUSES: readonly JobStatus[] = [
    JobStatus.PUBLISHED,
    JobStatus.FAILED,
]

/**
 * Estados de onde o usuário pode reenviar o job. GENERATED só fica parado se
 * o worker caiu entre gerar e publicar.
 */
export const RETRYABLE_JOB_STATUSES: readonly JobStatus[] = [
    JobStatus.FAILED,
    JobStatus.GENERATED,
]
