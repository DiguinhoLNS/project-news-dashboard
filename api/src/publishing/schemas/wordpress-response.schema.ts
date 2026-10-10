import { z } from 'zod'

export const publishResponseSchema = z.object({
    post_id: z.number().int().positive(),
    permalink: z.url(),
    created: z.boolean(),
})

export const errorResponseSchema = z.object({
    code: z.string(),
    message: z.string(),
})
