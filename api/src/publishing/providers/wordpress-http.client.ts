import {
    WEBHOOK_SIGNATURE_HEADER,
    WEBHOOK_TIMESTAMP_HEADER,
} from '../constants/wordpress.constants.js'
import { WordPressUnavailableError } from '../exceptions/publishing.exception.js'
import type {
    IWordPressClient,
    PublishedPost,
} from '../interfaces/wordpress-client.interface.js'
import type { WordPressHttpClientOptions } from '../interfaces/wordpress-http-client.interface.js'
import type { WordPressPostPayload } from '../interfaces/wordpress-post-payload.interface.js'
import { publishResponseSchema } from '../schemas/wordpress-response.schema.js'
import { signWebhook } from '../utils/sign-webhook.js'
import { toPublishingError } from '../utils/to-publishing-error.js'

export class WordPressHttpClient implements IWordPressClient {
    constructor(private readonly options: WordPressHttpClientOptions) {}

    async publish(payload: WordPressPostPayload): Promise<PublishedPost> {
        const body = JSON.stringify(payload)
        const timestamp = Math.floor(Date.now() / 1000).toString()

        const response = await this.post(body, timestamp)
        const data: unknown = await response.json().catch(() => null)

        if (!response.ok) {
            throw toPublishingError(response.status, data)
        }

        const parsed = publishResponseSchema.safeParse(data)
        
        if (!parsed.success) {
            throw new WordPressUnavailableError(
                'WordPress respondeu fora do formato esperado',
            )
        }

        return {
            postId: parsed.data.post_id,
            permalink: parsed.data.permalink,
            created: parsed.data.created,
        }
    }

    private async post(body: string, timestamp: string): Promise<Response> {
        try {
            return await fetch(this.options.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [WEBHOOK_TIMESTAMP_HEADER]: timestamp,
                    [WEBHOOK_SIGNATURE_HEADER]: signWebhook(
                        body,
                        timestamp,
                        this.options.secret,
                    ),
                },
                body,
                redirect: 'manual',
                signal: AbortSignal.timeout(this.options.timeoutMs),
            })
        } catch (error) {
            throw new WordPressUnavailableError(
                'WordPress não respondeu a tempo ou está fora do ar',
                { cause: error },
            )
        }
    }
}
