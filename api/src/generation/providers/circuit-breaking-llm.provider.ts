import type { CircuitBreaker } from '../../common/resilience/circuit-breaker.js'
import type {
    ILlmProvider,
    LlmResponse,
} from '../interfaces/llm-provider.interface.js'
import type { SourceArticle } from '../interfaces/source-article.interface.js'

export class CircuitBreakingLlmProvider implements ILlmProvider {
    readonly name: string

    constructor(
        private readonly inner: ILlmProvider,
        private readonly breaker: CircuitBreaker,
    ) {
        this.name = inner.name
    }

    generateArticle(source: SourceArticle): Promise<LlmResponse> {
        return this.breaker.execute(() => this.inner.generateArticle(source))
    }
}
