import { useMutation, useQueryClient } from '@tanstack/react-query'
import JobsService from '../services/jobsService'
import type { IGenerationJob } from '../interfaces/IGenerationJob'
import type { IGeneratePostData } from '../interfaces/IGeneratePostData'
import { jobsKeys } from './jobsQueries'

function useJobUpdated() {
    const queryClient = useQueryClient()

    return (job: IGenerationJob) => {
        queryClient.setQueryData(jobsKeys.detail(job.id), job)
        queryClient.invalidateQueries({ queryKey: jobsKeys.lists() })
    }
}

export function useGeneratePostMutation() {
    const onJobUpdated = useJobUpdated()

    return useMutation({
        mutationKey: [...jobsKeys.all, 'generate'],
        mutationFn: (data: IGeneratePostData) => JobsService.generatePost(data),
        onSuccess: onJobUpdated,
        meta: { successMessage: 'Matéria recebida. Acompanhe o andamento.' },
    })
}

export function useRetryJobMutation(id: string) {
    const onJobUpdated = useJobUpdated()

    return useMutation({
        mutationKey: [...jobsKeys.detail(id), 'retry'],
        mutationFn: () => JobsService.retryJob(id),
        onSuccess: onJobUpdated,
        meta: { successMessage: 'Job reenviado para processamento.' },
    })
}
