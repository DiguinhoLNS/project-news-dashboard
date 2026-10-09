import { Inject, Injectable } from '@nestjs/common'
import type { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js'
import type { GenerationJobPageEntity } from '../entities/generation-job-page.entity.js'
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from '../interfaces/generation-job-repository.interface.js'
import { GenerationJobMapper } from '../mappers/generation-job.mapper.js'

@Injectable()
export class ListJobsService {
    constructor(
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly generationJobRepository: IGenerationJobRepository,
    ) {}

    async execute({
        page,
        pageSize,
    }: PaginationQueryDto): Promise<GenerationJobPageEntity> {
        const { items, total } = await this.generationJobRepository.list({
            page,
            pageSize,
        })
        return {
            items: items.map((job) => GenerationJobMapper.toEntity(job)),
            page,
            pageSize,
            total,
        }
    }
}
