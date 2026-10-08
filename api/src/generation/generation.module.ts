import { GoogleGenAI } from '@google/genai'
import { Logger, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Env } from '../config/interfaces/env.interface.js'
import {
    type ILlmProvider,
    LLM_PROVIDER,
} from './interfaces/llm-provider.interface.js'
import { GeminiProvider } from './providers/gemini.provider.js'
import { ArticleGeneratorService } from './services/article-generator.service.js'

@Module({
    providers: [
        {
            provide: LLM_PROVIDER,
            inject: [ConfigService],
            useFactory: createGeminiProvider,
        },
        ArticleGeneratorService,
    ],
    exports: [ArticleGeneratorService],
})
export class GenerationModule {}

function createGeminiProvider(config: ConfigService<Env, true>): ILlmProvider {
    const model = config.get('GEMINI_MODEL', { infer: true })
    new Logger(GenerationModule.name).log(
        `Geração de conteúdo com o Gemini (${model}).`,
    )

    const client = new GoogleGenAI({
        apiKey: config.get('GEMINI_API_KEY', { infer: true }),
    })
    return new GeminiProvider(client.models, {
        model,
        timeoutMs: config.get('LLM_TIMEOUT_MS', { infer: true }),
    })
}
