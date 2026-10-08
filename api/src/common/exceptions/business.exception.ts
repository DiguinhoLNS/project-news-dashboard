import { HttpException, HttpStatus } from '@nestjs/common'

/**
 * Exceção para regras de negócio violadas (ex: URL inválida, matéria já
 * publicada). Services devem lançar esta exceção em vez de erros genéricos,
 * garantindo mensagens consistentes para quem consome a API.
 */
export class BusinessException extends HttpException {
    constructor(
        message: string,
        status: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY,
    ) {
        super(message, status)
    }
}

export class NotFoundBusinessException extends BusinessException {
    constructor(entity: string) {
        super(`${entity} não encontrado(a).`, HttpStatus.NOT_FOUND)
    }
}

export class ForbiddenBusinessException extends BusinessException {
    constructor(message = 'Você não tem permissão para realizar esta ação.') {
        super(message, HttpStatus.FORBIDDEN)
    }
}

export class ConflictBusinessException extends BusinessException {
    constructor(message: string) {
        super(message, HttpStatus.CONFLICT)
    }
}
