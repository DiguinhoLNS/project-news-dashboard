import type { ArticleCategory } from '../../generation/interfaces/generated-article.interface.js'

export class GeneratedArticleEntity {
    title: string
    excerpt: string
    bodyMarkdown: string
    keyPoints: string[]
    tags: string[]
    category: ArticleCategory
    metaDescription: string
}
