import {
    type ArgumentsHost,
    Catch,
    type ExceptionFilter,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { PinoLogger } from 'nestjs-pino'
import type { ApiResponse } from '../interfaces/api-response.interface.js'

/**
 * Captura toda exceção lançada pela aplicação e devolve o formato
 * padronizado de erro: { ok: false, message, data: null }
 *
 * Registrado via APP_FILTER (em app.module.ts) em vez de instanciado
 * manualmente no main.ts: PinoLogger é um provider transient-scoped
 * (criado por requisição), e só o container de DI do Nest sabe resolvê-lo.
 */
@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(@Inject(PinoLogger) private readonly logger: PinoLogger) {
        this.logger.setContext(AllExceptionsFilter.name)
    }

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()

        const isHttpException = exception instanceof HttpException
        const status = isHttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR

        // Erros fora de HttpException não expõem detalhes internos ao cliente.
        const errorPayload: ApiResponse<null> = {
            ok: false,
            message: isHttpException
                ? extractMessage(exception)
                : 'Erro interno do servidor.',
            data: null,
        }

        const context = {
            requestId: request.id,
            route: request.url,
            method: request.method,
            status,
            body: request.body,
            query: request.query,
            params: request.params,
        }
        // Erros do cliente (4xx) são esperados: sem stack, só como aviso.
        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                {
                    ...context,
                    stack:
                        exception instanceof Error
                            ? exception.stack
                            : undefined,
                },
                'Requisição finalizada com erro',
            )
        } else {
            this.logger.warn(context, 'Requisição recusada')
        }

        response.status(status).json(errorPayload)
    }
}

function extractMessage(exception: HttpException): string {
    const body = exception.getResponse()
    if (typeof body === 'string') {
        return body
    }
    if (typeof body === 'object' && body !== null && 'message' in body) {
        const message = (body as { message: string | string[] }).message
        return Array.isArray(message) ? message.join(' ') : message
    }
    return exception.message
}
