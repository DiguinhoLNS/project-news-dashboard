import { Injectable } from '@nestjs/common'
import { Prisma } from '../../generated/prisma/client.js'
import { PrismaService } from '../../prisma/prisma.service.js'
import type { GenerationJob } from '../domain/generation-job.js'
import { ACTIVE_JOB_STATUSES } from '../domain/job-status.js'
import { ActiveJobConflictError } from '../exceptions/active-job-conflict.exception.js'
import { StaleJobError } from '../exceptions/stale-job.exception.js'
import type {
    GenerationJobList,
    IGenerationJobRepository,
    ListGenerationJobsParams,
} from '../interfaces/generation-job-repository.interface.js'
import { GenerationJobPersistenceMapper as Mapper } from '../mappers/generation-job-persistence.mapper.js'

@Injectable()
export class GenerationJobRepository implements IGenerationJobRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(job: GenerationJob): Promise<GenerationJob> {
        const { id, sourceUrl, sourceUrlHash, status } = job.toSnapshot()
        try {
            const row = await this.prisma.generationJob.create({
                data: { id, sourceUrl, sourceUrlHash, status },
            })
            return Mapper.toDomain(row)
        } catch (error) {
            throw toRepositoryError(error, id)
        }
    }

    async save(job: GenerationJob): Promise<GenerationJob> {
        const { id, version } = job.toSnapshot()
        try {
            const row = await this.prisma.generationJob.update({
                where: { id, version },
                data: {
                    ...Mapper.toMutableData(job),
                    version: { increment: 1 },
                },
            })
            return Mapper.toDomain(row)
        } catch (error) {
            throw toRepositoryError(error, id)
        }
    }

    async findById(id: string): Promise<GenerationJob | null> {
        const row = await this.prisma.generationJob.findUnique({
            where: { id },
        })
        return row ? Mapper.toDomain(row) : null
    }

    /** Job mais recente da URL que ainda ocupa a URL: em andamento ou concluído. */
    async findLatestActiveByUrlHash(
        sourceUrlHash: string,
    ): Promise<GenerationJob | null> {
        const row = await this.prisma.generationJob.findFirst({
            where: { sourceUrlHash, status: { in: [...ACTIVE_JOB_STATUSES] } },
            orderBy: { createdAt: 'desc' },
        })
        return row ? Mapper.toDomain(row) : null
    }

    async list({
        page,
        pageSize,
    }: ListGenerationJobsParams): Promise<GenerationJobList> {
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.generationJob.findMany({
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.generationJob.count(),
        ])
        return { items: rows.map((row) => Mapper.toDomain(row)), total }
    }
}

function toRepositoryError(error: unknown, jobId: string): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            return new ActiveJobConflictError({ cause: error })
        }
        if (error.code === 'P2025') {
            return new StaleJobError(jobId, { cause: error })
        }
    }
    return error
}
