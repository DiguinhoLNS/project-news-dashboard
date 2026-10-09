import { HttpException, Inject, Injectable, Logger } from '@nestjs/common'
import { ArticleExtractorService } from '../../extraction/services/article-extractor.service.js'
import { JobStatus } from '../../generated/prisma/client.js'
import { ArticleGeneratorService } from '../../generation/services/article-generator.service.js'
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from '../../jobs/interfaces/generation-job-repository.interface.js'
import { GenerationJobMapper } from '../../jobs/mappers/generation-job.mapper.js'
import type { GeneratePostResult } from '../interfaces/generate-post-result.interface.js'
import { hashUrl, normalizeUrl } from '../utils/normalize-url.js'
import { toHttpException } from '../utils/to-http-exception.js'

@Injectable()
export class GeneratePostService {
    private readonly logger = new Logger(GeneratePostService.name)

    constructor(
        private readonly extractor: ArticleExtractorService,
        private readonly generator: ArticleGeneratorService,
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly generationJobRepository: IGenerationJobRepository,
    ) {}

    async execute(url: string): Promise<GeneratePostResult> {
        const sourceUrl = normalizeUrl(url)
        const sourceUrlHash = hashUrl(sourceUrl)

        const existing =
            await this.generationJobRepository.findLatestActiveByUrlHash(
                sourceUrlHash,
            )
        if (existing) {
            return { job: GenerationJobMapper.toEntity(existing), reused: true }
        }

        const job = await this.generationJobRepository.create({
            sourceUrl,
            sourceUrlHash,
        })

        try {
            await this.generationJobRepository.update(job.id, {
                status: JobStatus.EXTRACTING,
                attempts: job.attempts + 1,
            })
            const source = await this.extractor.extract(sourceUrl)
            const { text: _text, ...metadata } = source

            await this.generationJobRepository.update(job.id, {
                status: JobStatus.GENERATING,
                source: metadata,
            })
            const generation = await this.generator.generate(source)

            const generated = await this.generationJobRepository.update(
                job.id,
                {
                    status: JobStatus.GENERATED,
                    article: generation.article,
                    llmProvider: generation.provider,
                    llmModel: generation.model,
                    inputTokens: generation.usage.inputTokens,
                    outputTokens: generation.usage.outputTokens,
                },
            )
            return {
                job: GenerationJobMapper.toEntity(generated),
                reused: false,
            }
        } catch (error) {
            const httpError = toHttpException(error)
            await this.generationJobRepository.update(job.id, {
                status: JobStatus.FAILED,
                errorMessage:
                    httpError instanceof HttpException
                        ? httpError.message
                        : 'Erro interno ao processar a matéria.',
            })
            this.logger.warn(
                `Falha ao gerar post de ${sourceUrl}: ${error instanceof Error ? `${error.name}: ${error.message}` : String(error)}`,
            )
            throw httpError
        }
    }
}
