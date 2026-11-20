import type { CircuitBreaker } from '../../common/resilience/circuit-breaker.js'
import type {
    IWordPressClient,
    PublishedPost,
} from '../interfaces/wordpress-client.interface.js'
import type { WordPressPostPayload } from '../interfaces/wordpress-post-payload.interface.js'

export class CircuitBreakingWordPressClient implements IWordPressClient {
    constructor(
        private readonly inner: IWordPressClient,
        private readonly breaker: CircuitBreaker,
    ) {}

    publish(payload: WordPressPostPayload): Promise<PublishedPost> {
        return this.breaker.execute(() => this.inner.publish(payload))
    }
}
