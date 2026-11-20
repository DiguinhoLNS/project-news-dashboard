import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Env } from '../../config/interfaces/env.interface.js'
import { ArticleExtractorService } from '../../extraction/services/article-extractor.service.js'
import { ArticleGeneratorService } from '../../generation/services/article-generator.service.js'
import type { GenerationJob } from '../../jobs/domain/generation-job.js'
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from '../../jobs/interfaces/generation-job-repository.interface.js'
import {
    type IWordPressClient,
    WORDPRESS_CLIENT,
} from '../../publishing/interfaces/wordpress-client.interface.js'
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

    /** @throws JobNotProcessableError se o job já estiver FAILED ou PUBLISHED. */
    async execute(jobId: string, attempt: number): Promise<void> {
        let job = await this.generationJobRepository.findById(jobId)
        if (!job) {
            throw new Error(`job ${jobId} não existe no banco`)
        }
        job.assertProcessable()

        // Se a tentativa anterior falhou no envio, o conteúdo já gerado é
        // reaproveitado: o Gemini não é chamado de novo.
        if (job.hasGeneratedContent) {
            this.logger.log(
                `Job ${jobId}: reaproveitando o conteúdo gerado na tentativa anterior`,
            )
        } else {
            job = await this.generate(job, attempt)
        }

        this.logger.log(`Job ${jobId}: enviando ao WordPress`)
        const payload = job.startPublishing(attempt)
        job = await this.generationJobRepository.save(job)

        const post = await this.wordPressClient.publish(payload)

        job.markPublished(post)
        await this.generationJobRepository.save(job)
        this.logger.log(
            `Job ${jobId}: publicado como post ${post.postId} (${post.created ? 'novo' : 'já existia'}) ${post.permalink}`,
        )
    }

    private async generate(
        job: GenerationJob,
        attempt: number,
    ): Promise<GenerationJob> {
        this.logger.log(
            `Job ${job.id}: lendo a matéria original ${job.sourceUrl}`,
        )
        job.startExtraction(attempt)
        job = await this.generationJobRepository.save(job)

        const source = await this.extractor.extract(job.sourceUrl)
        const { text: _text, ...metadata } = source

        this.logger.log(
            `Job ${job.id}: gerando o conteúdo com a IA ("${source.title}")`,
        )
        job.startGeneration(metadata)
        job = await this.generationJobRepository.save(job)

        const generation = await this.generator.generate(source)

        const payload = WordPressPayloadMapper.toPayload({
            article: generation.article,
            source: metadata,
            idempotencyKey: job.sourceUrlHash,
            status: this.configService.get('WORDPRESS_POST_STATUS', {
                infer: true,
            }),
        })

        job.markGenerated(generation, payload)
        job = await this.generationJobRepository.save(job)
        this.logger.log(
            `Job ${job.id}: conteúdo gerado com ${generation.model} (${generation.usage.inputTokens} tokens de entrada, ${generation.usage.outputTokens} de saída)`,
        )
        return job
    }
}
