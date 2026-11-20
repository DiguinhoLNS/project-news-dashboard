import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service.js'
import type {
    IOutboxRepository,
    OutboxMessage,
} from '../interfaces/outbox-repository.interface.js'

@Injectable()
export class OutboxRepository implements IOutboxRepository {
    constructor(private readonly prisma: PrismaService) {}

    claim(limit: number, leaseMs: number): Promise<OutboxMessage[]> {
        return this.prisma.$queryRaw<OutboxMessage[]>`
            UPDATE "outbox_messages"
            SET
                "available_at" = now() + ${leaseMs} * interval '1 millisecond',
                "attempts" = "attempts" + 1
            WHERE "id" IN (
                SELECT "id"
                FROM "outbox_messages"
                WHERE "processed_at" IS NULL AND "available_at" <= now()
                ORDER BY "created_at"
                LIMIT ${limit}
                FOR UPDATE SKIP LOCKED
            )
            RETURNING
                "id",
                "type",
                "aggregate_id" AS "aggregateId",
                "attempts"
        `
    }

    async markProcessed(id: string): Promise<void> {
        await this.prisma.outboxMessage.update({
            where: { id },
            data: { processedAt: new Date(), lastError: null },
        })
    }

    async markFailed(
        id: string,
        error: string,
        retryInMs: number,
    ): Promise<void> {
        await this.prisma.outboxMessage.update({
            where: { id },
            data: {
                lastError: error,
                availableAt: new Date(Date.now() + retryInMs),
            },
        })
    }
}
