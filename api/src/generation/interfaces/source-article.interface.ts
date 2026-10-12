import type { SourceImage } from './source-image.interface.js'

/** Matéria original já extraída da URL: é a entrada da geração. */
export interface SourceArticle {
    url: string
    title: string
    text: string
    siteName?: string
    author?: string
    publishedAt?: string
    images: SourceImage[]
}
