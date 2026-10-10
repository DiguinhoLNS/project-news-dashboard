import { RETRYABLE_STATUSES } from '../constants/wordpress.constants.js'
import {
    type PublishingError,
    WordPressRejectedError,
    WordPressUnavailableError,
} from '../exceptions/publishing.exception.js'
import { errorResponseSchema } from '../schemas/wordpress-response.schema.js'

export function toPublishingError(
    status: number,
    body: unknown,
): PublishingError {
    const detail = errorResponseSchema.safeParse(body).data?.message
    const message = detail
        ? `WordPress respondeu ${status}: ${detail}`
        : `WordPress respondeu ${status}`

    if (status >= 500 || RETRYABLE_STATUSES.has(status)) {
        return new WordPressUnavailableError(message)
    }
    
    return new WordPressRejectedError(message)
}
