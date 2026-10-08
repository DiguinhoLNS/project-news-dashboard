import type { ARTICLE_CATEGORIES } from '../constants/article-categories.constants.js'

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number]

export interface GeneratedArticle {
    title: string
    excerpt: string
    bodyMarkdown: string
    keyPoints: string[]
    tags: string[]
    category: ArticleCategory
    metaDescription: string
}
