import type { IGenerationJob } from './IGenerationJob'

export interface IGenerationJobPage {
    items: IGenerationJob[]
    page: number
    pageSize: number
    total: number
}
