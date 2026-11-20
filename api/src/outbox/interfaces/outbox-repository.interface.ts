export interface OutboxMessage {
    id: string
    type: string
    aggregateId: string
    attempts: number
}

export const OUTBOX_REPOSITORY = Symbol('OUTBOX_REPOSITORY')

export interface IOutboxRepository {
    claim(limit: number, leaseMs: number): Promise<OutboxMessage[]>
    markProcessed(id: string): Promise<void>
    markFailed(id: string, error: string, retryInMs: number): Promise<void>
}
