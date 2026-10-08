import {
    ApiError,
    FinishReason,
    type GenerateContentResponse,
} from '@google/genai'
import { z } from 'zod'
import {
    InvalidLlmOutputError,
    LlmConfigurationError,
    LlmUnavailableError,
} from '../exceptions/generation.exception.js'
import type {
    GeminiModels,
    GeminiProviderOptions,
} from '../interfaces/gemini-provider.interface.js'
import type {
    ILlmProvider,
    LlmResponse,
} from '../interfaces/llm-provider.interface.js'
import type { SourceArticle } from '../interfaces/source-article.interface.js'
import {
    ARTICLE_SYSTEM_INSTRUCTION,
    buildArticlePrompt,
} from '../prompts/article.prompt.js'
import { llmOutputSchema } from '../schemas/llm-output.schema.js'
import { toGeminiJsonSchema } from '../utils/gemini-json-schema.js'

const RESPONSE_JSON_SCHEMA = toGeminiJsonSchema(z.toJSONSchema(llmOutputSchema))

export class GeminiProvider implements ILlmProvider {
    readonly name = 'gemini'

    constructor(
        private readonly models: GeminiModels,
        private readonly options: GeminiProviderOptions,
    ) {}

    async generateArticle(source: SourceArticle): Promise<LlmResponse> {
        const response = await this.request(source)
        const finishReason = response.candidates?.[0]?.finishReason

        if (finishReason === FinishReason.MAX_TOKENS) {
            throw new InvalidLlmOutputError(
                'a resposta foi cortada pelo limite de tokens',
            )
        }
        const text = response.text
        if (!text) {
            const reason =
                finishReason ??
                response.promptFeedback?.blockReason ??
                'desconhecido'
            throw new InvalidLlmOutputError(
                `o Gemini não devolveu conteúdo (motivo: ${reason})`,
            )
        }

        const usage = response.usageMetadata
        return {
            text,
            model: response.modelVersion ?? this.options.model,
            usage: {
                inputTokens: usage?.promptTokenCount ?? 0,
                outputTokens:
                    (usage?.candidatesTokenCount ?? 0) +
                    (usage?.thoughtsTokenCount ?? 0),
            },
        }
    }

    private async request(
        source: SourceArticle,
    ): Promise<GenerateContentResponse> {
        try {
            return await this.models.generateContent({
                model: this.options.model,
                contents: buildArticlePrompt(source),
                config: {
                    systemInstruction: ARTICLE_SYSTEM_INSTRUCTION,
                    responseMimeType: 'application/json',
                    responseJsonSchema: RESPONSE_JSON_SCHEMA,
                    httpOptions: { timeout: this.options.timeoutMs },
                },
            })
        } catch (error) {
            throw toGenerationError(error)
        }
    }
}

function toGenerationError(error: unknown): Error {
    if (error instanceof ApiError) {
        if (error.status === 429 || error.status >= 500) {
            return new LlmUnavailableError(
                `Gemini indisponível no momento (HTTP ${error.status})`,
                { cause: error },
            )
        }
        return new LlmConfigurationError(
            `Gemini recusou a requisição (HTTP ${error.status}): ${error.message}`,
            { cause: error },
        )
    }
    // Timeout e falhas de rede não chegam como ApiError.
    return new LlmUnavailableError('falha ao chamar o Gemini', {
        cause: error,
    })
}
