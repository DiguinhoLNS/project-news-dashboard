import type { GenerationJob } from '../domain/generation-job.js'

export interface ListGenerationJobsParams {
    page: number
    pageSize: number
}

export interface GenerationJobList {
    items: GenerationJob[]
    total: number
}

export const GENERATION_JOB_REPOSITORY = Symbol('GENERATION_JOB_REPOSITORY')

export interface IGenerationJobRepository {
    /**
     * Grava o job e os eventos pendentes dele no outbox, atomicamente.
     *
     * @throws ActiveJobConflictError se a URL já tiver um job ativo.
     */
    create(job: GenerationJob): Promise<GenerationJob>

    /**
     * Grava o estado atual do job e os eventos pendentes no outbox,
     * atomicamente, e devolve a versão persistida, que deve substituir a
     * anterior.
     *
     * @throws StaleJobError se outro processo alterou o job desde a leitura.
     * @throws ActiveJobConflictError se reativar um job cuja URL já tem outro ativo.
     */
    save(job: GenerationJob): Promise<GenerationJob>

    findById(id: string): Promise<GenerationJob | null>
    findLatestActiveByUrlHash(
        sourceUrlHash: string,
    ): Promise<GenerationJob | null>
    list(params: ListGenerationJobsParams): Promise<GenerationJobList>
}
