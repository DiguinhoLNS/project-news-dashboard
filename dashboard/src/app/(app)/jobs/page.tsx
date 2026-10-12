import { Suspense } from 'react'
import type { Metadata } from 'next'
import Jobs from '@/modules/jobs/pages/Jobs'
import JobsLoading from '@/modules/jobs/pages/Jobs/components/Loading'

export const metadata: Metadata = {
    title: 'Histórico'
}

export default function Page() {
    return (
        <Suspense fallback={<JobsLoading />}>
            <Jobs />
        </Suspense>
    )
}
