import type { ISourceImage } from './ISourceImage'

export interface ISourceMetadata {
    url: string
    title: string
    siteName?: string
    author?: string
    publishedAt?: string
    images?: ISourceImage[]
}
