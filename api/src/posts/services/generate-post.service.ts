import { Inject, Injectable } from '@nestjs/common'
import {
    BusinessException,
    ConflictBusinessException,
} from '../../common/exceptions/business.exception.js'
import {
    BlockedUrlError,
    ExtractionError,
} from '../../extraction/exceptions/extraction.exception.js'
import { assertPublicUrl } from '../../extraction/utils/assert-public-url.js'
import { GenerationJob } from '../../jobs/domain/generation-job.js'
import { ActiveJobConflictError } from '../../jobs/exceptions/active-job-conflict.exception.js'
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from '../../jobs/interfaces/generation-job-repository.interface.js'
import { GenerationJobMapper } from '../../jobs/mappers/generation-job.mapper.js'
import type { GeneratePostResult } from '../interfaces/generate-post-result.interface.js'
import { hashUrl, normalizeUrl } from '../utils/normalize-url.js'

@Injectable()
export class GeneratePostService {
    constructor(
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
            return toResult(existing, true)
        }

        await this.assertReachable(sourceUrl)

        let job: GenerationJob
        try {
            job = await this.generationJobRepository.create(
                GenerationJob.create(sourceUrl, sourceUrlHash),
            )
        } catch (error) {
            if (error instanceof ActiveJobConflictError) {
                return this.reuseConcurrentJob(sourceUrlHash)
            }
            throw error
        }

        return toResult(job, false)
    }

    private async reuseConcurrentJob(
        sourceUrlHash: string,
    ): Promise<GeneratePostResult> {
        const existing =
            await this.generationJobRepository.findLatestActiveByUrlHash(
                sourceUrlHash,
            )
        if (!existing) {
            throw new ConflictBusinessException(
                'Esta matéria acabou de ser enviada por outra requisição. Tente novamente em instantes.',
            )
        }
        return toResult(existing, true)
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

function toResult(job: GenerationJob, reused: boolean): GeneratePostResult {
    return {
        job: GenerationJobMapper.toEntity(job),
        reused,
        processed: job.isProcessed,
    }
}
