export const WORDPRESS_POSTS_PATH = 'wp-json/project-news/v1/posts'

export const WEBHOOK_TIMESTAMP_HEADER = 'X-Project-News-Timestamp'

export const WEBHOOK_SIGNATURE_HEADER = 'X-Project-News-Signature'

/** 409: o plugin ainda está publicando a mesma matéria (trava ocupada). */
export const RETRYABLE_STATUSES = new Set([408, 409, 425, 429])
