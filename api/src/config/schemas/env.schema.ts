import { z } from 'zod'

export const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    APP_NAME: z.string().trim().min(1).default('Project News Dashboard API'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    THROTTLE_TTL: z.coerce.number().int().positive().default(60),
    THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),
    LLM_PROVIDER: z.enum(['gemini']).default('gemini'),
    LLM_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
    GEMINI_API_KEY: z.string().trim().min(1, 'obrigatória'),
    GEMINI_MODEL: z.string().trim().min(1).default('gemini-3.5-flash-lite'),
})
