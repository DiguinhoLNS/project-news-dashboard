export interface GenerationJobPayload {
    jobId: string
}

export const GENERATION_QUEUE = Symbol('GENERATION_QUEUE')

export interface IGenerationQueue {
    enqueue(jobId: string): Promise<void>
}
