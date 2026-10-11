import { apiNews } from '@/modules/api'
import type { IRequestOptions } from '@/modules/api/services/requestService'
import type { IGeneratePostData } from '../interfaces/IGeneratePostData'
import type { IGenerationJob } from '../interfaces/IGenerationJob'

export default class JobsService {

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
