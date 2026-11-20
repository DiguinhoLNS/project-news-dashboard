import { randomUUID } from 'node:crypto'
import type { GeneratedArticle } from '../../generation/interfaces/generated-article.interface.js'
import type { GenerationResult } from '../../generation/interfaces/generation-result.interface.js'
import type { PublishedPost } from '../../publishing/interfaces/wordpress-client.interface.js'
import type { WordPressPostPayload } from '../../publishing/interfaces/wordpress-post-payload.interface.js'
import type { SourceMetadata } from '../interfaces/source-metadata.interface.js'
import {
    InvalidJobTransitionError,
    JobAlreadyPublishedError,
    JobInProgressError,
    JobNotProcessableError,
} from './generation-job.errors.js'
import {
    ACTIVE_JOB_STATUSES,
    JobStatus,
    RETRYABLE_JOB_STATUSES,
    TERMINAL_JOB_STATUSES,
} from './job-status.js'

export interface LlmUsage {
    inputTokens: number
    outputTokens: number
}

export interface GenerationJobProps {
    id: string
    sourceUrl: string
    sourceUrlHash: string
    status: JobStatus
    attempts: number
    errorMessage: string | null
    source: SourceMetadata | null
    article: GeneratedArticle | null
    payload: WordPressPostPayload | null
    llmProvider: string | null
    llmModel: string | null
    usage: LlmUsage | null
    wpPostId: number | null
    permalink: string | null
    createdAt: Date
    updatedAt: Date
    /** Versão para lock otimista: o repositório só grava se ela não mudou. */
    version: number
}

/** Estado anterior a um reenvio, para desfazê-lo se a fila recusar. */
export type RequeueSnapshot = Pick<GenerationJobProps, 'status' | 'errorMessage'>

/**
 * Job de geração de uma matéria. Toda mudança de estado passa por aqui:
 * cada método confere se a transição é permitida antes de aplicá-la.
 *
 * QUEUED → EXTRACTING → GENERATING → GENERATED → PUBLISHING → PUBLISHED
 *
 * Qualquer estado não final pode ir para QUEUED (nova tentativa automática)
 * ou FAILED. FAILED e GENERATED podem voltar para QUEUED a pedido do usuário.
 */
export class GenerationJob {
    private constructor(private readonly props: GenerationJobProps) {}

    static create(sourceUrl: string, sourceUrlHash: string): GenerationJob {
        const now = new Date()
        return new GenerationJob({
            id: randomUUID(),
            sourceUrl,
            sourceUrlHash,
            status: JobStatus.QUEUED,
            attempts: 0,
            errorMessage: null,
            source: null,
            article: null,
            payload: null,
            llmProvider: null,
            llmModel: null,
            usage: null,
            wpPostId: null,
            permalink: null,
            createdAt: now,
            updatedAt: now,
            version: 0,
        })
    }

    /** Reconstrói um job já persistido. Não valida transições. */
    static restore(props: GenerationJobProps): GenerationJob {
        return new GenerationJob({ ...props })
    }

    get id(): string {
        return this.props.id
    }

    get sourceUrl(): string {
        return this.props.sourceUrl
    }

    get sourceUrlHash(): string {
        return this.props.sourceUrlHash
    }

    get status(): JobStatus {
        return this.props.status
    }

    get errorMessage(): string | null {
        return this.props.errorMessage
    }

    /** Ocupa a URL: impede outro job para a mesma matéria. */
    get isActive(): boolean {
        return ACTIVE_JOB_STATUSES.includes(this.props.status)
    }

    get isTerminal(): boolean {
        return TERMINAL_JOB_STATUSES.includes(this.props.status)
    }

    /** O conteúdo já foi gerado (e talvez publicado). */
    get isProcessed(): boolean {
        return (
            this.props.status === JobStatus.GENERATED ||
            this.props.status === JobStatus.PUBLISHED
        )
    }

    /** Uma tentativa anterior já gerou o conteúdo: dá para só publicar. */
    get hasGeneratedContent(): boolean {
        return this.props.payload !== null
    }

    toSnapshot(): Readonly<GenerationJobProps> {
        return { ...this.props }
    }

    /** O worker chama ao tirar o job da fila. */
    assertProcessable(): void {
        if (this.isTerminal) {
            throw new JobNotProcessableError(this.props.id, this.props.status)
        }
    }

    /** EXTRACTING e GENERATING entram na lista para o caso de o worker ter caído no meio. */
    startExtraction(attempt: number): void {
        this.transition(
            [JobStatus.QUEUED, JobStatus.EXTRACTING, JobStatus.GENERATING],
            JobStatus.EXTRACTING,
        )
        this.props.attempts = attempt
        this.props.errorMessage = null
    }

    startGeneration(source: SourceMetadata): void {
        this.transition([JobStatus.EXTRACTING], JobStatus.GENERATING)
        this.props.source = source
    }

    markGenerated(
        generation: GenerationResult,
        payload: WordPressPostPayload,
    ): void {
        this.transition([JobStatus.GENERATING], JobStatus.GENERATED)
        this.props.article = generation.article
        this.props.payload = payload
        this.props.llmProvider = generation.provider
        this.props.llmModel = generation.model
        this.props.usage = {
            inputTokens: generation.usage.inputTokens,
            outputTokens: generation.usage.outputTokens,
        }
    }

    /**
     * Devolve o payload a enviar. QUEUED vale quando uma tentativa anterior
     * já gerou o conteúdo; PUBLISHING, quando o worker caiu durante o envio
     * (o WordPress deduplica pela chave de idempotência).
     */
    startPublishing(attempt: number): WordPressPostPayload {
        const { payload } = this.props
        if (!payload) {
            throw new InvalidJobTransitionError(
                this.props.id,
                this.props.status,
                JobStatus.PUBLISHING,
            )
        }
        this.transition(
            [JobStatus.QUEUED, JobStatus.GENERATED, JobStatus.PUBLISHING],
            JobStatus.PUBLISHING,
        )
        this.props.attempts = attempt
        this.props.errorMessage = null
        return payload
    }

    markPublished(post: PublishedPost): void {
        this.transition([JobStatus.PUBLISHING], JobStatus.PUBLISHED)
        this.props.wpPostId = post.postId
        this.props.permalink = post.permalink
    }

    /** Falha temporária: volta para a fila e o BullMQ tenta de novo. */
    scheduleRetry(message: string): void {
        this.transitionFromNonTerminal(JobStatus.QUEUED)
        this.props.errorMessage = message
    }

    fail(message: string): void {
        this.transitionFromNonTerminal(JobStatus.FAILED)
        this.props.errorMessage = message
    }

    /** Reenvio pedido pelo usuário. Devolve o estado anterior para um eventual undo. */
    requeue(): RequeueSnapshot {
        if (this.props.status === JobStatus.PUBLISHED) {
            throw new JobAlreadyPublishedError(this.props.id)
        }
        if (!RETRYABLE_JOB_STATUSES.includes(this.props.status)) {
            throw new JobInProgressError(this.props.id, this.props.status)
        }
        const previous: RequeueSnapshot = {
            status: this.props.status,
            errorMessage: this.props.errorMessage,
        }
        this.props.status = JobStatus.QUEUED
        this.props.errorMessage = null
        return previous
    }

    /** Desfaz o reenvio quando a fila não aceitou o job. */
    undoRequeue(previous: RequeueSnapshot): void {
        if (!RETRYABLE_JOB_STATUSES.includes(previous.status)) {
            throw new InvalidJobTransitionError(
                this.props.id,
                this.props.status,
                previous.status,
            )
        }
        this.transition([JobStatus.QUEUED], previous.status)
        this.props.errorMessage = previous.errorMessage
    }

    private transitionFromNonTerminal(to: JobStatus): void {
        if (this.isTerminal) {
            throw new InvalidJobTransitionError(
                this.props.id,
                this.props.status,
                to,
            )
        }
        this.props.status = to
    }

    private transition(from: readonly JobStatus[], to: JobStatus): void {
        if (!from.includes(this.props.status)) {
            throw new InvalidJobTransitionError(
                this.props.id,
                this.props.status,
                to,
            )
        }
        this.props.status = to
    }
}
