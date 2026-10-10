export interface GenerationJobPayload {
    jobId: string
}

export const GENERATION_QUEUE = Symbol('GENERATION_QUEUE')

export interface IGenerationQueue {
    enqueue(jobId: string): Promise<void>
    /** Devolve false quando o job ainda está na fila ou em execução. */
    requeue(jobId: string): Promise<boolean>
}
