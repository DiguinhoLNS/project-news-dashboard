import { apiNews } from '@/modules/api'
import type { IRequestOptions } from '@/modules/api/services/requestService'
import objToParams from '@/utils/objToParams'
import type { IJobsParams } from '../interfaces/IJobsParams'
import type { IGenerationJob } from '../interfaces/IGenerationJob'
import type { IGeneratePostData } from '../interfaces/IGeneratePostData'
import type { IGenerationJobPage } from '../interfaces/IGenerationJobPage'

export default class JobsService {

    public static async getJobs(params: IJobsParams, options?: IRequestOptions) {
        return await apiNews.get<IGenerationJobPage>(`jobs?${objToParams({ ...params })}`, options)
    }

    public static async getJob(id: string, options?: IRequestOptions) {
        return await apiNews.get<IGenerationJob>(`jobs/${id}`, options)
    }

    public static async generatePost(data: IGeneratePostData) {
        return await apiNews.post<IGenerationJob, IGeneratePostData>('generate-post', data)
    }

    public static async retryJob(id: string) {
        return await apiNews.post<IGenerationJob>(`jobs/${id}/retry`)
    }

}
