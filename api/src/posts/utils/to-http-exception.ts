import { HttpException, HttpStatus } from '@nestjs/common'
import { BusinessException } from '../../common/exceptions/business.exception.js'
import {
    BlockedUrlError,
    ExtractionError,
} from '../../extraction/exceptions/extraction.exception.js'
import {
    GenerationError,
    LlmUnavailableError,
    NotAnArticleError,
} from '../../generation/exceptions/generation.exception.js'

/**
 * Traduz os erros do fluxo para HTTP. Problemas com a URL ou com a página de
 * origem são do cliente (422); falhas da IA são do lado do servidor (502/503).
 */
export function toHttpException(error: unknown): Error {
    if (error instanceof BlockedUrlError) {
        return new BusinessException(`URL não permitida: ${error.message}.`)
    }
    if (error instanceof ExtractionError) {
        return new BusinessException(
            `Não foi possível ler a matéria: ${error.message}.`,
        )
    }
    if (error instanceof NotAnArticleError) {
        return new BusinessException(
            `A página não parece ser uma matéria: ${error.message}`,
        )
    }
    if (error instanceof LlmUnavailableError) {
        return new HttpException(
            'O serviço de IA está indisponível no momento. Tente novamente em instantes.',
            HttpStatus.SERVICE_UNAVAILABLE,
            { cause: error },
        )
    }
    if (error instanceof GenerationError) {
        return new HttpException(
            'Não foi possível gerar o conteúdo com a IA.',
            HttpStatus.BAD_GATEWAY,
            { cause: error },
        )
    }
    return error instanceof Error ? error : new Error(String(error))
}
