import {
    BlockedUrlError,
    ExtractionError,
} from '../../extraction/exceptions/extraction.exception.js'
import {
    GenerationError,
    LlmUnavailableError,
    NotAnArticleError,
} from '../../generation/exceptions/generation.exception.js'
import { PublishingError } from '../../publishing/exceptions/publishing.exception.js'
import type { JobFailure } from '../interfaces/job-failure.interface.js'

export function describeFailure(error: unknown): JobFailure {
    if (error instanceof BlockedUrlError) {
        return {
            message: `URL não permitida: ${error.message}.`,
            retryable: false,
        }
    }
    if (error instanceof ExtractionError) {
        return {
            message: `Não foi possível ler a matéria: ${error.message}.`,
            retryable: error.retryable,
        }
    }
    if (error instanceof NotAnArticleError) {
        return {
            message: `A página não parece ser uma matéria: ${error.message}`,
            retryable: false,
        }
    }
    if (error instanceof LlmUnavailableError) {
        return {
            message: 'O serviço de IA está indisponível no momento.',
            retryable: true,
        }
    }
    if (error instanceof GenerationError) {
        return {
            message: 'Não foi possível gerar o conteúdo com a IA.',
            retryable: error.retryable,
        }
    }
    if (error instanceof PublishingError) {
        return {
            message: `Não foi possível publicar no WordPress: ${error.message}.`,
            retryable: error.retryable,
        }
    }
    return { message: 'Erro interno ao processar a matéria.', retryable: true }
}
