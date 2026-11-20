import { Injectable } from '@nestjs/common'
import {
    type GenerationJob,
    JobStatus,
    Prisma,
} from '../../generated/prisma/client.js'
import { PrismaService } from '../../prisma/prisma.service.js'
import { ActiveJobConflictError } from '../exceptions/active-job-conflict.exception.js'
import type {
    CreateGenerationJobData,
    GenerationJobList,
    IGenerationJobRepository,
    ListGenerationJobsParams,
    UpdateGenerationJobData,
} from '../interfaces/generation-job-repository.interface.js'

@Injectable()
export class GenerationJobRepository implements IGenerationJobRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: CreateGenerationJobData): Promise<GenerationJob> {
        try {
            return await this.prisma.generationJob.create({ data })
        } catch (error) {
            throw toConflictError(error)
        }
    }

    findById(id: string): Promise<GenerationJob | null> {
        return this.prisma.generationJob.findUnique({ where: { id } })
    }

    /** Job mais recente da URL que não falhou: em andamento ou concluído. */
    findLatestActiveByUrlHash(
        sourceUrlHash: string,
    ): Promise<GenerationJob | null> {
        return this.prisma.generationJob.findFirst({
            where: { sourceUrlHash, status: { not: JobStatus.FAILED } },
            orderBy: { createdAt: 'desc' },
        })
    }

    async list({
        page,
        pageSize,
    }: ListGenerationJobsParams): Promise<GenerationJobList> {
        const [items, total] = await this.prisma.$transaction([
            this.prisma.generationJob.findMany({
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.generationJob.count(),
        ])
        return { items, total }
    }

    async update(
        id: string,
        { source, article, payload, ...data }: UpdateGenerationJobData,
    ): Promise<GenerationJob> {
        try {
            return await this.prisma.generationJob.update({
                where: { id },
                data: {
                    ...data,
                    source: toJson(source),
                    article: toJson(article),
                    payload: toJson(payload),
                },
            })
        } catch (error) {
            throw toConflictError(error)
        }
    }
}

function toConflictError(error: unknown): unknown {
    if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
    ) {
        return new ActiveJobConflictError({ cause: error })
    }
    return error
}

function toJson(value: object | undefined) {
    return value as Prisma.InputJsonObject | undefined
}
