import {
    Inject,
    Injectable,
    Logger,
    type OnApplicationBootstrap,
    type OnApplicationShutdown,
} from '@nestjs/common'
import { withTimeout } from '../../common/utils/with-timeout.js'
import { GenerationJobEventType } from '../../jobs/domain/generation-job.events.js'
import {
    GENERATION_QUEUE,
    type IGenerationQueue,
} from '../../queue/interfaces/generation-queue.interface.js'
import {
    OUTBOX_BATCH_SIZE,
    OUTBOX_DISPATCH_TIMEOUT_MS,
    OUTBOX_LEASE_MS,
    OUTBOX_POLL_INTERVAL_MS,
    OUTBOX_RETRY_BASE_MS,
    OUTBOX_RETRY_MAX_MS,
} from '../constants/outbox.constants.js'
import {
    type IOutboxRepository,
    OUTBOX_REPOSITORY,
    type OutboxMessage,
} from '../interfaces/outbox-repository.interface.js'

/**
 * Lê o outbox e entrega as mensagens à fila. Roda no worker. A entrega é
 * "pelo menos uma vez": se cair entre enviar e marcar como processada, a
 * mensagem sai de novo, e a fila trata o repetido.
 */
@Injectable()
export class OutboxRelayService
    implements OnApplicationBootstrap, OnApplicationShutdown
{
    private readonly logger = new Logger(OutboxRelayService.name)
    private running = false
    private timer: NodeJS.Timeout | undefined
    private currentTick: Promise<void> | undefined

    constructor(
        @Inject(OUTBOX_REPOSITORY)
        private readonly outboxRepository: IOutboxRepository,
        @Inject(GENERATION_QUEUE)
        private readonly generationQueue: IGenerationQueue,
    ) {}

    onApplicationBootstrap(): void {
        this.running = true
        this.schedule(0)
        this.logger.log('Relay do outbox iniciado')
    }

    async onApplicationShutdown(): Promise<void> {
        this.running = false
        clearTimeout(this.timer)
        await this.currentTick
    }

    private schedule(delayMs: number): void {
        if (!this.running) {
            return
        }
        this.timer = setTimeout(() => {
            this.currentTick = this.tick().then((hadWork) =>
                // Com mensagens na fila, lê de novo na hora; vazio, espera.
                this.schedule(hadWork ? 0 : OUTBOX_POLL_INTERVAL_MS),
            )
        }, delayMs)
    }

    /** Devolve se havia mensagens, para decidir quando ler de novo. */
    private async tick(): Promise<boolean> {
        try {
            const messages = await this.outboxRepository.claim(
                OUTBOX_BATCH_SIZE,
                OUTBOX_LEASE_MS,
            )
            for (const message of messages) {
                await this.deliver(message)
            }
            return messages.length === OUTBOX_BATCH_SIZE
        } catch (error) {
            this.logger.error(
                `Falha ao ler o outbox: ${error instanceof Error ? error.message : String(error)}`,
            )
            return false
        }
    }

    private async deliver(message: OutboxMessage): Promise<void> {
        try {
            await withTimeout(this.dispatch(message), OUTBOX_DISPATCH_TIMEOUT_MS)
            await this.outboxRepository.markProcessed(message.id)
            this.logger.log(
                `Outbox: job ${message.aggregateId} entregue à fila`,
            )
        } catch (error) {
            const reason = error instanceof Error ? error.message : String(error)
            const retryInMs = Math.min(
                OUTBOX_RETRY_BASE_MS * 2 ** (message.attempts - 1),
                OUTBOX_RETRY_MAX_MS,
            )
            this.logger.warn(
                `Outbox: não foi possível entregar o job ${message.aggregateId} (tentativa ${message.attempts}, nova em ${retryInMs / 1000} s): ${reason}`,
            )
            await this.outboxRepository.markFailed(message.id, reason, retryInMs)
        }
    }

    private dispatch(message: OutboxMessage): Promise<void> {
        switch (message.type) {
            case GenerationJobEventType.PROCESSING_REQUESTED:
                return this.generationQueue.dispatch(message.aggregateId)
            default:
                return Promise.reject(
                    new Error(`tipo de mensagem desconhecido: ${message.type}`),
                )
        }
    }
}
