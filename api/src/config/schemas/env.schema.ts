import { z } from 'zod'

export const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    PORT: z.coerce.number().int().positive().default(3333),
    APP_NAME: z.string().trim().min(1).default('Project News Dashboard API'),
    DATABASE_URL: z.string().trim().min(1, 'obrigatória'),
    REDIS_URL: z.string().trim().min(1, 'obrigatória'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    THROTTLE_TTL: z.coerce.number().int().positive().default(60),
    THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),
    LLM_PROVIDER: z.enum(['gemini']).default('gemini'),
    LLM_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
    GEMINI_API_KEY: z.string().trim().min(1, 'obrigatória'),
    GEMINI_MODEL: z.string().trim().min(1).default('gemini-3.5-flash-lite'),
    WORDPRESS_URL: z.url().default('http://localhost:8080'),
    WORDPRESS_WEBHOOK_SECRET: z
        .string()
        .trim()
        .min(16, 'obrigatória, com pelo menos 16 caracteres'),
    WORDPRESS_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
    WORDPRESS_POST_STATUS: z.enum(['publish', 'draft']).default('publish'),
})
