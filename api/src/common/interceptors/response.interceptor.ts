import {
    type CallHandler,
    type ExecutionContext,
    Injectable,
    type NestInterceptor,
} from '@nestjs/common'
import { map, type Observable } from 'rxjs'
import type { ApiResponse } from '../interfaces/api-response.interface.js'

/**
 * Envolve toda resposta de sucesso no formato padrão: { ok, message, data }
 *
 * Um controller pode opcionalmente retornar { message, data } para
 * customizar a mensagem; caso contrário a mensagem fica vazia.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
    T,
    ApiResponse<T>
> {
    intercept(
        _context: ExecutionContext,
        next: CallHandler<T>,
    ): Observable<ApiResponse<T>> {
        return next.handle().pipe(
            map((result: unknown) => {
                if (
                    result &&
                    typeof result === 'object' &&
                    'message' in result &&
                    'data' in result
                ) {
                    const { message, data } = result as {
                        message: string
                        data: T
                    }
                    return { ok: true, message, data }
                }

                return { ok: true, message: '', data: (result ?? null) as T }
            }),
        )
    }
}
