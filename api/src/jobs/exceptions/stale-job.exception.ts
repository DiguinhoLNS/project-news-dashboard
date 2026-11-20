export class StaleJobError extends Error {
    constructor(
        readonly jobId: string,
        options?: ErrorOptions,
    ) {
        super(`job ${jobId} foi alterado por outro processo`, options)
        this.name = new.target.name
    }
}
