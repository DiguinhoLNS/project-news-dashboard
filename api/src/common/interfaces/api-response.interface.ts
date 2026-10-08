export interface ApiResponse<T = unknown> {
    ok: boolean
    message: string
    data: T | null
}
