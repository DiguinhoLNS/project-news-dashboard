import { z } from 'zod'
import type { Env } from './interfaces/env.interface.js'
import { envSchema } from './schemas/env.schema.js'

export function validateEnv(config: Record<string, unknown>): Env {
    const result = envSchema.safeParse(config)
    if (!result.success) {
        throw new Error(
            `Variáveis de ambiente inválidas:\n${z.prettifyError(result.error)}`,
        )
    }
    return result.data
}
