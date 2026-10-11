'use client'

import clsx from 'clsx'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/page/PageHeader'
import JobRetryButton from '@/modules/jobs/components/RetryButton'
import { useJobQuery } from '@/modules/jobs/queries/jobsQueries'
import JobError from './components/Error'
import JobLoading from './components/Loading'
import JobDetails from './components/Details'
import JobArticle from './components/Article'
import JobProgress from './components/Progress'

interface JobProps {
    id: string
}

export default function Job({ id }: JobProps) {

    const { data: job, isPending, isError, error, refetch } = useJobQuery(id)

    if (isPending) return <JobLoading />

    if (isError) {
        return (
            <JobError
                error={error}
                onRetry={() => refetch()}
            />
        )
    }

    const title = job.article?.title ?? job.source?.title ?? 'Matéria em processamento'
    const sourceHost = new URL(job.sourceUrl).hostname.replace(/^www\./, '')

    return (

        <>
            <PageHeader
                title={title}
                description={`Matéria original em ${sourceHost}`}
            >
                <JobRetryButton job={job} />

                {!!job.permalink && (
                    <Button asChild>
                        <a
                            href={job.permalink}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <ExternalLink />
                            Ver post
                        </a>
                    </Button>
                )}
            </PageHeader>

            <div className={clsx('grid gap-6 lg:grid-cols-3')}>
                <div className={clsx('flex flex-col gap-6 min-w-0 lg:col-span-2')}>
                    <JobProgress job={job} />

                    {!!job.article && <JobArticle article={job.article} />}
                </div>

                <JobDetails job={job} />
            </div>
        </>

    )

}
