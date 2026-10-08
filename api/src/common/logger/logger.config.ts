import { randomUUID } from 'node:crypto'
import type { Params } from 'nestjs-pino'

/**
 * Toda requisição é registrada via Pino, nunca via console.log.
 * O requestId é gerado (ou propagado pelo header x-request-id) para
 * correlacionar os logs de uma mesma requisição.
 */
export const buildLoggerConfig = (
    logLevel: string,
    isProduction: boolean,
): Params => ({
    pinoHttp: {
        level: logLevel,
        genReqId: (req) =>
            (req.headers['x-request-id'] as string | undefined) ?? randomUUID(),
        transport: isProduction
            ? undefined
            : {
                  target: 'pino-pretty',
                  options: { singleLine: true, colorize: true },
              },
        serializers: {
            req: (req) => ({
                id: req.id,
                method: req.method,
                url: req.url,
            }),
            res: (res) => ({
                statusCode: res.statusCode,
            }),
        },
        customSuccessMessage: (req, res, responseTime) =>
            `${req.method} ${req.url} ${res.statusCode} - ${responseTime}ms`,
    },
})
