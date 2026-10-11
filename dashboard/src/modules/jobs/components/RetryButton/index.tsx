'use client'

import clsx from 'clsx'
import { LoaderCircle, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import JobsController from '@/modules/jobs/controllers/jobsController'
import { useRetryJobMutation } from '@/modules/jobs/queries/jobsMutations'
import type { IGenerationJob } from '@/modules/jobs/interfaces/IGenerationJob'

interface JobRetryButtonProps {
    job: IGenerationJob
    size?: 'default' | 'sm'
}

export default function JobRetryButton({ job, size = 'default' }: JobRetryButtonProps) {

    const { mutate: retryJob, isPending } = useRetryJobMutation(job.id)

    if (!JobsController.canRetry(job)) return null

    return (

        <>
            <Button
                variant='outline'
                size={size}
                disabled={isPending}
                onClick={() => retryJob()}
            >
                {isPending && (
                    <LoaderCircle className={clsx('animate-spin')} />
                ) || (
                    <RotateCw />
                )}
                Tentar novamente
            </Button>
        </>

    )

}
