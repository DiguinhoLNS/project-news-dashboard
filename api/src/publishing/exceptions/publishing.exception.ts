/** Base dos erros do envio ao WordPress. `retryable` indica se vale tentar de novo. */
export abstract class PublishingError extends Error {
    abstract readonly retryable: boolean

    constructor(message: string, options?: ErrorOptions) {
        super(message, options)
        this.name = new.target.name
    }
}

/** Rede, timeout, 5xx, 409 ou resposta fora do contrato: vale tentar mais tarde. */
export class WordPressUnavailableError extends PublishingError {
    readonly retryable = true
}

/** Assinatura recusada, rota inexistente ou payload inválido: repetir não resolve. */
export class WordPressRejectedError extends PublishingError {
    readonly retryable = false
}
