import clsx from 'clsx'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import formatDateTime from '@/utils/formatDateTime'
import JobStatusBadge from '@/modules/jobs/components/StatusBadge'
import type { IGenerationJob } from '@/modules/jobs/interfaces/IGenerationJob'
import JobRowActions from '../RowActions'

interface JobsTableProps {
    jobs: IGenerationJob[]
    isUpdating?: boolean
}

export default function JobsTable({ jobs, isUpdating = false }: JobsTableProps) {

    return (

        <>
            <div className={clsx('rounded-lg border transition-opacity', isUpdating && 'opacity-60')}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className={clsx('w-full')}>Matéria</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className={clsx('hidden md:table-cell')}>Editoria</TableHead>
                            <TableHead className={clsx('hidden lg:table-cell')}>Enviada em</TableHead>
                            <TableHead className={clsx('w-12')} />
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {jobs.map(job => {

                            const sourceHost = new URL(job.sourceUrl).hostname.replace(/^www\./, '')
                            const title = job.article?.title ?? job.source?.title ?? sourceHost
                            const isFailed = job.status === 'FAILED'

                            return (
                                <TableRow key={job.id}>
                                    <TableCell className={clsx('w-full max-w-0')}>
                                        <Link
                                            href={`/jobs/${job.id}`}
                                            className={clsx('block font-medium truncate hover:underline underline-offset-4')}
                                        >
                                            {title}
                                        </Link>
                                        <p className={clsx('truncate', isFailed ? 'text-destructive' : 'text-muted-foreground')}>
                                            {isFailed && job.errorMessage || sourceHost}
                                        </p>
                                    </TableCell>

                                    <TableCell>
                                        <JobStatusBadge status={job.status} />
                                    </TableCell>

                                    <TableCell className={clsx('hidden md:table-cell')}>
                                        {job.article && (
                                            <Badge variant='outline'>{job.article.category}</Badge>
                                        ) || (
                                            <span className={clsx('text-muted-foreground')}>—</span>
                                        )}
                                    </TableCell>

                                    <TableCell className={clsx('hidden lg:table-cell text-muted-foreground tabular-nums')}>
                                        {formatDateTime(job.createdAt)}
                                    </TableCell>

                                    <TableCell>
                                        <JobRowActions job={job} />
                                    </TableCell>
                                </TableRow>
                            )

                        })}
                    </TableBody>
                </Table>
            </div>
        </>

    )

}
