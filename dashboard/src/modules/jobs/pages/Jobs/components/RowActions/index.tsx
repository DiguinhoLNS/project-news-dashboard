'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { Ellipsis, ExternalLink, Eye, Newspaper, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import JobsController from '@/modules/jobs/controllers/jobsController'
import { useRetryJobMutation } from '@/modules/jobs/queries/jobsMutations'
import type { IGenerationJob } from '@/modules/jobs/interfaces/IGenerationJob'

interface JobRowActionsProps {
    job: IGenerationJob
}

export default function JobRowActions({ job }: JobRowActionsProps) {

    const { mutate: retryJob, isPending } = useRetryJobMutation(job.id)

    return (

        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant='ghost'
                        size='icon-sm'
                        aria-label='Ações da matéria'
                    >
                        <Ellipsis />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align='end'
                    className={clsx('w-48')}
                >
                    <DropdownMenuItem asChild>
                        <Link href={`/jobs/${job.id}`}>
                            <Eye />
                            Ver andamento
                        </Link>
                    </DropdownMenuItem>

                    {!!job.permalink && (
                        <DropdownMenuItem asChild>
                            <a
                                href={job.permalink}
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                <ExternalLink />
                                Ver post
                            </a>
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                        <a
                            href={job.sourceUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <Newspaper />
                            Matéria original
                        </a>
                    </DropdownMenuItem>

                    {JobsController.canRetry(job) && (
                        <>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                disabled={isPending}
                                onSelect={() => retryJob()}
                            >
                                <RotateCw />
                                Tentar novamente
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>

    )

}
