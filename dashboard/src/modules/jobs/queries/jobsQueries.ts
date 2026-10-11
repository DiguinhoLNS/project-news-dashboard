import { queryOptions, useQuery } from '@tanstack/react-query'
import JobsController from '../controllers/jobsController'
import JobsService from '../services/jobsService'

const POLLING_INTERVAL_MS = 2000

export const jobsKeys = {
    all: ['jobs'] as const,
    lists: () => [...jobsKeys.all, 'list'] as const,
    details: () => [...jobsKeys.all, 'detail'] as const,
    detail: (id: string) => [...jobsKeys.details(), id] as const,
}

export const jobsQueries = {
    detail: (id: string) => queryOptions({
        queryKey: jobsKeys.detail(id),
        queryFn: ({ signal }) => JobsService.getJob(id, { signal }),
        enabled: !!id,
        staleTime: 0,
        refetchInterval: (query) => JobsController.isRunning(query.state.data) ? POLLING_INTERVAL_MS : false,
        meta: { silent: true },
    }),
}

export function useJobQuery(id: string) {
    return useQuery(jobsQueries.detail(id))
}
