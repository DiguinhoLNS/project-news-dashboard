import { Inject, Injectable, Logger } from '@nestjs/common'
import { InvalidLlmOutputError } from '../exceptions/generation.exception.js'
import type { GenerationResult } from '../interfaces/generation-result.interface.js'
import {
    type ILlmProvider,
    LLM_PROVIDER,
    type LlmUsage,
} from '../interfaces/llm-provider.interface.js'
import type { SourceArticle } from '../interfaces/source-article.interface.js'
import { parseLlmOutput } from '../utils/parse-llm-output.js'

/** Uma tentativa extra quando o modelo responde fora do contrato. */
const MAX_ATTEMPTS = 2

@Injectable()
export class ArticleGeneratorService {
    private readonly logger = new Logger(ArticleGeneratorService.name)

    constructor(@Inject(LLM_PROVIDER) private readonly llm: ILlmProvider) {}

    async generate(source: SourceArticle): Promise<GenerationResult> {
        const usage: LlmUsage = { inputTokens: 0, outputTokens: 0 }

        for (let attempt = 1; ; attempt++) {
            try {
                const response = await this.llm.generateArticle(source)
                usage.inputTokens += response.usage.inputTokens
                usage.outputTokens += response.usage.outputTokens

                return {
                    article: parseLlmOutput(response.text),
                    provider: this.llm.name,
                    model: response.model,
                    usage,
                    attempts: attempt,
                }
            } catch (error) {
                if (
                    !(error instanceof InvalidLlmOutputError) ||
                    attempt >= MAX_ATTEMPTS
                ) {
                    throw error
                }
                this.logger.warn(
                    `Resposta fora do contrato (${this.llm.name}, tentativa ${attempt}/${MAX_ATTEMPTS}): ${error.message}`,
                )
            }
        }
    }
}
