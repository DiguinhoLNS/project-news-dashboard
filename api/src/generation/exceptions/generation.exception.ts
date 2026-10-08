/** Base dos erros da geração. `retryable` indica se vale tentar o job de novo. */
export abstract class GenerationError extends Error {
    abstract readonly retryable: boolean

    constructor(message: string, options?: ErrorOptions) {
        super(message, options)
        this.name = new.target.name
    }
}

/** O modelo respondeu fora do contrato: JSON inválido ou campos fora das regras. */
export class InvalidLlmOutputError extends GenerationError {
    readonly retryable = false
}

/** O texto de origem não é uma matéria (home, vídeo, paywall...). */
export class NotAnArticleError extends GenerationError {
    readonly retryable = false
}

/** Limite de requisições, erro 5xx, timeout ou rede: vale tentar mais tarde. */
export class LlmUnavailableError extends GenerationError {
    readonly retryable = true
}

/** Chave inválida, modelo inexistente ou requisição recusada: repetir não resolve. */
export class LlmConfigurationError extends GenerationError {
    readonly retryable = false
}
