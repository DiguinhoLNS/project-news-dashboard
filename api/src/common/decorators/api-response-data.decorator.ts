import { applyDecorators, HttpStatus, type Type } from '@nestjs/common'
import {
    ApiExtraModels,
    ApiResponse,
    type ApiResponseSchemaHost,
    getSchemaPath,
} from '@nestjs/swagger'

interface ApiOkResponseDataOptions {
    isArray?: boolean
    description?: string
    /** Use quando o endpoint devolve data: null. */
    nullable?: boolean
    /** Padrão 200; use para documentar outros sucessos, como 202. */
    status?: HttpStatus
}

/**
 * Documenta um endpoint que devolve o envelope padrão da API
 * ({ ok, message, data }) com `data` tipado. Uso:
 *
 *   @ApiOkResponseData(JobEntity)                       // data: JobEntity
 *   @ApiOkResponseData(JobEntity, { isArray: true })     // data: JobEntity[]
 *   @ApiOkResponseData(null, { nullable: true })         // data: null
 *
 * Nota: as propriedades ok/message são declaradas diretamente aqui (em vez
 * de compostas via `allOf` com uma classe de envelope compartilhada) de
 * propósito: o Swagger UI não gera o "Example Value" corretamente para
 * schemas compostos com `allOf` aninhado.
 */
export function ApiOkResponseData<TModel extends Type<unknown>>(
    model: TModel | null,
    options: ApiOkResponseDataOptions = {},
): ReturnType<typeof applyDecorators> {
    let dataSchema: ApiResponseSchemaHost['schema']

    if (options.nullable || !model) {
        dataSchema = { type: 'object', nullable: true, example: null }
    } else if (options.isArray) {
        dataSchema = { type: 'array', items: { $ref: getSchemaPath(model) } }
    } else {
        dataSchema = { $ref: getSchemaPath(model) }
    }

    return applyDecorators(
        ...(model ? [ApiExtraModels(model)] : []),
        ApiResponse({
            status: options.status ?? HttpStatus.OK,
            description: options.description,
            schema: {
                type: 'object',
                properties: {
                    ok: { type: 'boolean', example: true },
                    message: {
                        type: 'string',
                        example: 'Operação realizada com sucesso.',
                    },
                    data: dataSchema,
                },
            },
        }),
    )
}
