import type { WordPressPostPayload } from './wordpress-post-payload.interface.js'

export const WORDPRESS_CLIENT = Symbol('WORDPRESS_CLIENT')

export interface PublishedPost {
    postId: number
    permalink: string
    created: boolean
}

export interface IWordPressClient {
    publish(payload: WordPressPostPayload): Promise<PublishedPost>
}
