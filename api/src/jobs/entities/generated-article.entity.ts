import { ApiProperty } from '@nestjs/swagger'
import { ARTICLE_CATEGORIES } from '../../generation/constants/article-categories.constants.js'
import type { ArticleCategory } from '../../generation/interfaces/generated-article.interface.js'

export class GeneratedArticleEntity {
    title: string
    excerpt: string
    bodyMarkdown: string
    keyPoints: string[]
    tags: string[]
    @ApiProperty({ enum: ARTICLE_CATEGORIES, enumName: 'ArticleCategory' })
    category: ArticleCategory
    metaDescription: string
    featuredImageUrl?: string
}
