import type { JobStatus } from './job-status.js'

/** Base dos erros de regra do job. Não conhecem HTTP nem banco. */
export abstract class GenerationJobError extends Error {
    constructor(message: string) {
        super(message)
        this.name = new.target.name
    }
}

/** Alguém tentou uma transição que a máquina de estados não permite. */
export class InvalidJobTransitionError extends GenerationJobError {
    constructor(
        readonly jobId: string,
        readonly from: JobStatus,
        readonly to: JobStatus,
    ) {
        super(`job ${jobId}: transição inválida de ${from} para ${to}`)
    }
}

/** O job saiu da fila mas já está num estado final (FAILED ou PUBLISHED). */
export class JobNotProcessableError extends GenerationJobError {
    constructor(
        readonly jobId: string,
        readonly status: JobStatus,
    ) {
        super(`job ${jobId} está ${status} e não pode ser processado`)
    }
}

/** Reenvio pedido para uma matéria que já foi publicada. */
export class JobAlreadyPublishedError extends GenerationJobError {
    constructor(readonly jobId: string) {
        super(`job ${jobId} já foi publicado`)
    }
}

/** Reenvio pedido para um job que ainda está em processamento. */
export class JobInProgressError extends GenerationJobError {
    constructor(
        readonly jobId: string,
        readonly status: JobStatus,
    ) {
        super(`job ${jobId} ainda está em processamento (${status})`)
    }
}
