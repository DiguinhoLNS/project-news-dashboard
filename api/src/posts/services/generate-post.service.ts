import {
    Inject,
    Injectable,
    Logger,
    ServiceUnavailableException,
} from '@nestjs/common'
import { BusinessException } from '../../common/exceptions/business.exception.js'
import {
    BlockedUrlError,
    ExtractionError,
} from '../../extraction/exceptions/extraction.exception.js'
import { assertPublicUrl } from '../../extraction/utils/assert-public-url.js'
import { JobStatus } from '../../generated/prisma/client.js'
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from '../../jobs/interfaces/generation-job-repository.interface.js'
import { GenerationJobMapper } from '../../jobs/mappers/generation-job.mapper.js'
import {
    GENERATION_QUEUE,
    type IGenerationQueue,
} from '../../queue/interfaces/generation-queue.interface.js'
import type { GeneratePostResult } from '../interfaces/generate-post-result.interface.js'
import { hashUrl, normalizeUrl } from '../utils/normalize-url.js'

@Injectable()
export class GeneratePostService {
    private readonly logger = new Logger(GeneratePostService.name)

    constructor(
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly generationJobRepository: IGenerationJobRepository,
        @Inject(GENERATION_QUEUE)
        private readonly generationQueue: IGenerationQueue,
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

        await this.assertReachable(sourceUrl)

        const job = await this.generationJobRepository.create({
            sourceUrl,
            sourceUrlHash,
        })

        try {
            await this.generationQueue.enqueue(job.id)
        } catch (error) {
            this.logger.error(
                `Não foi possível enfileirar o job ${job.id}: ${error instanceof Error ? error.message : String(error)}`,
            )
            await this.generationJobRepository.update(job.id, {
                status: JobStatus.FAILED,
                errorMessage: 'A fila de processamento está indisponível.',
            })
            throw new ServiceUnavailableException(
                'Não foi possível enviar a matéria para processamento. Tente novamente em instantes.',
            )
        }

        return { job: GenerationJobMapper.toEntity(job), reused: false }
    }

    private async assertReachable(sourceUrl: string): Promise<void> {
        try {
            await assertPublicUrl(new URL(sourceUrl))
        } catch (error) {
            if (error instanceof BlockedUrlError) {
                throw new BusinessException(
                    `URL não permitida: ${error.message}.`,
                )
            }
            if (error instanceof ExtractionError) {
                throw new BusinessException(
                    `Não foi possível acessar a URL: ${error.message}.`,
                )
            }
            throw error
        }
    }
}
