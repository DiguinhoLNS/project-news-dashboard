import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import JobsService from '../services/jobsService'
import JobsController from '../controllers/jobsController'
import type { IJobsParams } from '../interfaces/IJobsParams'

const POLLING_INTERVAL_MS = 2000
const LIST_POLLING_INTERVAL_MS = 5000

export const jobsKeys = {
    all: ['jobs'] as const,
    lists: () => [...jobsKeys.all, 'list'] as const,
    list: (params: IJobsParams) => [...jobsKeys.lists(), params] as const,
    details: () => [...jobsKeys.all, 'detail'] as const,
    detail: (id: string) => [...jobsKeys.details(), id] as const,
}

export const jobsQueries = {
    list: (params: IJobsParams) => queryOptions({
        queryKey: jobsKeys.list(params),
        queryFn: ({ signal }) => JobsService.getJobs(params, { signal }),
        placeholderData: keepPreviousData,
        refetchInterval: (query) => query.state.data?.items.some(job => JobsController.isRunning(job))
            ? LIST_POLLING_INTERVAL_MS
            : false,
        meta: { silent: true },
    }),

    detail: (id: string) => queryOptions({
        queryKey: jobsKeys.detail(id),
        queryFn: ({ signal }) => JobsService.getJob(id, { signal }),
        enabled: !!id,
        staleTime: 0,
        refetchInterval: (query) => JobsController.isRunning(query.state.data) ? POLLING_INTERVAL_MS : false,
        meta: { silent: true },
    }),
}

export function useJobsQuery(params: IJobsParams) {
    return useQuery(jobsQueries.list(params))
}

export function useJobQuery(id: string) {
    return useQuery(jobsQueries.detail(id))
}
