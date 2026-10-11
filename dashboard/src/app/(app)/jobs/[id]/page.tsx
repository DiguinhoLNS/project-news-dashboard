import { Suspense } from 'react'
import type { Metadata } from 'next'
import Job from '@/modules/jobs/pages/Job'
import JobLoading from '@/modules/jobs/pages/Job/components/Loading'

export const metadata: Metadata = {
    title: 'Andamento da matéria'
}

export default function Page({ params }: PageProps<'/jobs/[id]'>) {
    return (
        <Suspense fallback={<JobLoading />}>
            {params.then(({ id }) => <Job id={id} />)}
        </Suspense>
    )
}
