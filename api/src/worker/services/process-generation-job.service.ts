import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Env } from '../../config/interfaces/env.interface.js'
import { ArticleExtractorService } from '../../extraction/services/article-extractor.service.js'
import { type GenerationJob, JobStatus } from '../../generated/prisma/client.js'
import { ArticleGeneratorService } from '../../generation/services/article-generator.service.js'
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from '../../jobs/interfaces/generation-job-repository.interface.js'
import {
    type IWordPressClient,
    WORDPRESS_CLIENT,
} from '../../publishing/interfaces/wordpress-client.interface.js'
import type { WordPressPostPayload } from '../../publishing/interfaces/wordpress-post-payload.interface.js'
import { WordPressPayloadMapper } from '../../publishing/mappers/wordpress-payload.mapper.js'

@Injectable()
export class ProcessGenerationJobService {
    private readonly logger = new Logger(ProcessGenerationJobService.name)

    constructor(
        private readonly extractor: ArticleExtractorService,
        private readonly generator: ArticleGeneratorService,
        private readonly configService: ConfigService<Env, true>,
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly generationJobRepository: IGenerationJobRepository,
        @Inject(WORDPRESS_CLIENT)
        private readonly wordPressClient: IWordPressClient,
    ) {}

    async execute(jobId: string, attempt: number): Promise<void> {
        const job = await this.generationJobRepository.findById(jobId)
        if (!job) {
            throw new Error(`job ${jobId} não existe no banco`)
        }

        // Se a tentativa anterior falhou no envio, o conteúdo já gerado é
        // reaproveitado: o Gemini não é chamado de novo.
        const stored = job.payload as unknown as WordPressPostPayload | null
        if (stored) {
            this.logger.log(
                `Job ${jobId}: reaproveitando o conteúdo gerado na tentativa anterior`,
            )
        }
        const payload = stored ?? (await this.generate(job, attempt))

        this.logger.log(`Job ${jobId}: enviando ao WordPress`)
        await this.generationJobRepository.update(jobId, {
            status: JobStatus.PUBLISHING,
            attempts: attempt,
            errorMessage: null,
        })
        const post = await this.wordPressClient.publish(payload)

        await this.generationJobRepository.update(jobId, {
            status: JobStatus.PUBLISHED,
            wpPostId: post.postId,
            permalink: post.permalink,
        })
        this.logger.log(
            `Job ${jobId}: publicado como post ${post.postId} (${post.created ? 'novo' : 'já existia'}) ${post.permalink}`,
        )
    }

    private async generate(
        job: GenerationJob,
        attempt: number,
    ): Promise<WordPressPostPayload> {
        this.logger.log(
            `Job ${job.id}: lendo a matéria original ${job.sourceUrl}`,
        )
        await this.generationJobRepository.update(job.id, {
            status: JobStatus.EXTRACTING,
            attempts: attempt,
            errorMessage: null,
        })
        const source = await this.extractor.extract(job.sourceUrl)
        const { text: _text, ...metadata } = source

        this.logger.log(
            `Job ${job.id}: gerando o conteúdo com a IA ("${source.title}")`,
        )
        await this.generationJobRepository.update(job.id, {
            status: JobStatus.GENERATING,
            source: metadata,
        })
        const generation = await this.generator.generate(source)

        const payload = WordPressPayloadMapper.toPayload({
            article: generation.article,
            source: metadata,
            idempotencyKey: job.sourceUrlHash,
            status: this.configService.get('WORDPRESS_POST_STATUS', {
                infer: true,
            }),
        })

        await this.generationJobRepository.update(job.id, {
            status: JobStatus.GENERATED,
            article: generation.article,
            payload,
            llmProvider: generation.provider,
            llmModel: generation.model,
            inputTokens: generation.usage.inputTokens,
            outputTokens: generation.usage.outputTokens,
        })
        this.logger.log(
            `Job ${job.id}: conteúdo gerado com ${generation.model} (${generation.usage.inputTokens} tokens de entrada, ${generation.usage.outputTokens} de saída)`,
        )
        return payload
    }
}
