import type { z } from 'zod'
import type { envSchema } from '../schemas/env.schema.js'

export type Env = z.infer<typeof envSchema>
