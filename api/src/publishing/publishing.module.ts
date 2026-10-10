import { Logger, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Env } from '../config/interfaces/env.interface.js'
import { WORDPRESS_POSTS_PATH } from './constants/wordpress.constants.js'
import {
    type IWordPressClient,
    WORDPRESS_CLIENT,
} from './interfaces/wordpress-client.interface.js'
import { WordPressHttpClient } from './providers/wordpress-http.client.js'

@Module({
    providers: [
        {
            provide: WORDPRESS_CLIENT,
            inject: [ConfigService],
            useFactory: createWordPressClient,
        },
    ],
    exports: [WORDPRESS_CLIENT],
})
export class PublishingModule {}

function createWordPressClient(
    config: ConfigService<Env, true>,
): IWordPressClient {
    const baseUrl = config.get('WORDPRESS_URL', { infer: true })
    const endpoint = new URL(WORDPRESS_POSTS_PATH, withTrailingSlash(baseUrl))
    new Logger(PublishingModule.name).log(`Publicação em ${endpoint.href}.`)

    return new WordPressHttpClient({
        endpoint: endpoint.href,
        secret: config.get('WORDPRESS_WEBHOOK_SECRET', { infer: true }),
        timeoutMs: config.get('WORDPRESS_TIMEOUT_MS', { infer: true }),
    })
}

/** Mantém o caminho de instalações em subpasta, como http://site/blog. */
function withTrailingSlash(url: string): string {
    return url.endsWith('/') ? url : `${url}/`
}
