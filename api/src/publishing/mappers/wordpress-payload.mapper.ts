import type { BuildWordPressPayloadInput } from '../interfaces/build-wordpress-payload-input.interface.js'
import type { WordPressPostPayload } from '../interfaces/wordpress-post-payload.interface.js'
import { readingTimeMinutes } from '../utils/reading-time.js'
import { renderArticleHtml } from '../utils/render-article-html.js'
import { slugify } from '../utils/slugify.js'

export class WordPressPayloadMapper {
    static toPayload({
        article,
        source,
        idempotencyKey,
        status,
    }: BuildWordPressPayloadInput): WordPressPostPayload {
        return {
            idempotency_key: idempotencyKey,
            title: article.title,
            slug: slugify(article.title),
            excerpt: article.excerpt,
            content_html: renderArticleHtml(article.bodyMarkdown),
            key_points: article.keyPoints,
            tags: article.tags,
            category: article.category,
            meta_description: article.metaDescription,
            reading_time_minutes: readingTimeMinutes(article.bodyMarkdown),
            featured_image_url: source.imageUrl ?? null,
            source: {
                url: source.url,
                site_name: source.siteName ?? null,
                author: source.author ?? null,
                published_at: source.publishedAt ?? null,
            },
            status,
        }
    }
}
