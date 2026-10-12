import { SourceImageEntity } from './source-image.entity.js'

export class SourceMetadataEntity {
    url: string
    title: string
    siteName?: string
    author?: string
    publishedAt?: string
    images?: SourceImageEntity[]
}
