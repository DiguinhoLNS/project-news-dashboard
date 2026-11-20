import { Logger, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createCircuitBreaker } from '../common/resilience/create-circuit-breaker.js'
import type { Env } from '../config/interfaces/env.interface.js'
import { WORDPRESS_CIRCUIT_BREAKER } from './constants/wordpress-circuit-breaker.constants.js'
import { WORDPRESS_POSTS_PATH } from './constants/wordpress.constants.js'
import { WordPressUnavailableError } from './exceptions/publishing.exception.js'
import {
    type IWordPressClient,
    WORDPRESS_CLIENT,
} from './interfaces/wordpress-client.interface.js'
import { CircuitBreakingWordPressClient } from './providers/circuit-breaking-wordpress.client.js'
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

    const client = new WordPressHttpClient({
        endpoint: endpoint.href,
        secret: config.get('WORDPRESS_WEBHOOK_SECRET', { infer: true }),
        timeoutMs: config.get('WORDPRESS_TIMEOUT_MS', { infer: true }),
    })

    return new CircuitBreakingWordPressClient(
        client,
        createCircuitBreaker({
            name: 'WordPress',
            ...WORDPRESS_CIRCUIT_BREAKER,
            isFailure: (error) => error instanceof WordPressUnavailableError,
        }),
    )
}

/** Mantém o caminho de instalações em subpasta, como http://site/blog. */
function withTrailingSlash(url: string): string {
    return url.endsWith('/') ? url : `${url}/`
}
