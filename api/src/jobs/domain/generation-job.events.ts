/**
 * Eventos que o job registra ao mudar de estado. O repositório os grava no
 * outbox na mesma transação do job, e o relay do worker os entrega à fila.
 */
export const GenerationJobEventType = {
    PROCESSING_REQUESTED: 'generation-job.processing-requested',
} as const

export type GenerationJobEventType =
    (typeof GenerationJobEventType)[keyof typeof GenerationJobEventType]

export interface GenerationJobEvent {
    type: GenerationJobEventType
    jobId: string
}
