import type { Env } from '../../config/interfaces/env.interface.js'

export type WordPressPostStatus = Env['WORDPRESS_POST_STATUS']

export interface WordPressPostSource {
    url: string
    site_name: string | null
    author: string | null
    published_at: string | null
}

export interface WordPressPostPayload {
    idempotency_key: string
    title: string
    slug: string
    excerpt: string
    content_html: string
    key_points: string[]
    tags: string[]
    category: string
    meta_description: string
    reading_time_minutes: number
    featured_image_url: string | null
    source: WordPressPostSource
    status: WordPressPostStatus
}
