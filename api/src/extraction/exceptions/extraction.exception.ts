/** Base dos erros da extração. `retryable` indica se vale tentar de novo. */
export abstract class ExtractionError extends Error {
    abstract readonly retryable: boolean

    constructor(message: string, options?: ErrorOptions) {
        super(message, options)
        this.name = new.target.name
    }
}

/** A URL aponta para um endereço que não é público (rede interna, localhost). */
export class BlockedUrlError extends ExtractionError {
    readonly retryable = false
}

/** Não foi possível baixar a página: rede, timeout, HTTP de erro ou tamanho. */
export class SourceUnavailableError extends ExtractionError {
    readonly retryable = true
}

/** A página não é HTML ou não tem texto de matéria suficiente. */
export class NotReadableError extends ExtractionError {
    readonly retryable = false
}
