import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Env } from '../../config/interfaces/env.interface.js'
import { ArticleExtractorService } from '../../extraction/services/article-extractor.service.js'
import { JobStatus } from '../../generated/prisma/client.js'
import { ArticleGeneratorService } from '../../generation/services/article-generator.service.js'
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from '../../jobs/interfaces/generation-job-repository.interface.js'
import { WordPressPayloadMapper } from '../../publishing/mappers/wordpress-payload.mapper.js'

@Injectable()
export class ProcessGenerationJobService {
    constructor(
        private readonly extractor: ArticleExtractorService,
        private readonly generator: ArticleGeneratorService,
        private readonly configService: ConfigService<Env, true>,
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly generationJobRepository: IGenerationJobRepository,
    ) {}

    async execute(jobId: string, attempt: number): Promise<void> {
        const job = await this.generationJobRepository.findById(jobId)
        if (!job) {
            throw new Error(`job ${jobId} não existe no banco`)
        }

        await this.generationJobRepository.update(jobId, {
            status: JobStatus.EXTRACTING,
            attempts: attempt,
            errorMessage: null,
        })
        const source = await this.extractor.extract(job.sourceUrl)
        const { text: _text, ...metadata } = source

        await this.generationJobRepository.update(jobId, {
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

        await this.generationJobRepository.update(jobId, {
            status: JobStatus.GENERATED,
            article: generation.article,
            payload,
            llmProvider: generation.provider,
            llmModel: generation.model,
            inputTokens: generation.usage.inputTokens,
            outputTokens: generation.usage.outputTokens,
        })
    }
}
