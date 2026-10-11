import { finalJobStatuses } from '../constants/jobStatus'
import type { IGenerationJob } from '../interfaces/IGenerationJob'
import type { TJobStatus } from '../interfaces/TJobStatus'

const STALLED_AFTER_MS = 5 * 60 * 1000

const stepByStatus: Record<Exclude<TJobStatus, 'FAILED'>, number> = {
    QUEUED: 0,
    EXTRACTING: 1,
    GENERATING: 2,
    GENERATED: 3,
    PUBLISHING: 3,
    PUBLISHED: 4,
}

export interface IJobArticleBlock {
    type: 'heading' | 'paragraph'
    text: string
}

export default class JobsController {

    public static isFinal(job: IGenerationJob) {
        return finalJobStatuses.has(job.status)
    }

    public static isStalled(job: IGenerationJob) {
        return !this.isFinal(job) && Date.now() - new Date(job.updatedAt).getTime() > STALLED_AFTER_MS
    }

    public static isRunning(job?: IGenerationJob) {
        return !!job && !this.isFinal(job) && !this.isStalled(job)
    }

    public static isWaitingRetry(job: IGenerationJob) {
        return job.status === 'QUEUED' && !!job.errorMessage
    }

    public static canRetry(job: IGenerationJob) {
        return job.status === 'FAILED' || (job.status === 'GENERATED' && this.isStalled(job))
    }

    public static getStep(job: IGenerationJob) {
        if (job.status !== 'FAILED') return stepByStatus[job.status]

        if (job.article) return stepByStatus.PUBLISHING
        if (job.source) return stepByStatus.GENERATING

        return job.attempts > 0 ? stepByStatus.EXTRACTING : stepByStatus.QUEUED
    }

    public static toArticleBlocks(markdown: string): IJobArticleBlock[] {
        return markdown
            .split(/\n{2,}/)
            .map(block => block.trim())
            .filter(Boolean)
            .map(block => block.startsWith('## ')
                ? { type: 'heading', text: block.slice(3).trim() }
                : { type: 'paragraph', text: block })
    }

}
