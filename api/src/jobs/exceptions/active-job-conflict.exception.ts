/**
 * A URL já tem outro job ativo (não FAILED). Vem do índice único parcial
 * `generation_jobs_active_source_url_hash_key`, que é quem garante a regra
 * mesmo com requisições simultâneas.
 */
export class ActiveJobConflictError extends Error {
    constructor(options?: ErrorOptions) {
        super('já existe um job ativo para esta URL', options)
        this.name = new.target.name
    }
}
