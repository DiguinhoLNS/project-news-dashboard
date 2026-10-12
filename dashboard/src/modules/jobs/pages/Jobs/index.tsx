'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { Inbox, SearchX, Sparkles, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/page/PageHeader'
import Pagination from '@/components/common/Pagination'
import { useQueryParam } from '@/hooks/useQueryParam'
import { getErrorMessage } from '@/utils/toast'
import { useJobsQuery } from '@/modules/jobs/queries/jobsQueries'
import JobsTable from './components/Table'
import JobsLoading from './components/Loading'
import JobsEmptyState from './components/EmptyState'

const PAGE_SIZE = 10

export default function Jobs() {

    const page = Math.max(1, Number.parseInt(useQueryParam('page') ?? '', 10) || 1)

    const { data, isPending, isError, error, refetch, isPlaceholderData } = useJobsQuery({ page, pageSize: PAGE_SIZE })

    const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0

    return (

        <>
            <PageHeader
                title='Histórico'
                description='Matérias enviadas para a IA, com o andamento e o link do post publicado.'
            >
                <Button asChild>
                    <Link href='/generate'>
                        <Sparkles />
                        Nova matéria
                    </Link>
                </Button>
            </PageHeader>

            {isPending && <JobsLoading />}

            {isError && !data && (
                <JobsEmptyState
                    icon={TriangleAlert}
                    title='Não foi possível carregar o histórico'
                    description={getErrorMessage(error)}
                    action={{ label: 'Tentar de novo', onClick: () => refetch() }}
                />
            )}

            {data?.total === 0 && (
                <JobsEmptyState
                    icon={Inbox}
                    title='Nenhuma matéria ainda'
                    description='As matérias que você enviar aparecem aqui, com o andamento de cada uma.'
                    action={{ label: 'Gerar a primeira matéria', href: '/generate' }}
                />
            )}

            {!!data && data.total > 0 && data.items.length === 0 && (
                <JobsEmptyState
                    icon={SearchX}
                    title='Esta página não existe'
                    description={`O histórico tem ${totalPages} ${totalPages === 1 ? 'página' : 'páginas'}.`}
                    action={{ label: 'Ir para a primeira página', href: '/jobs' }}
                />
            )}

            {!!data && data.items.length > 0 && (
                <div className={clsx('flex flex-col gap-4')}>
                    <JobsTable
                        jobs={data.items}
                        isUpdating={isPlaceholderData}
                    />

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        hrefFor={(target) => target === 1 ? '/jobs' : `/jobs?page=${target}`}
                    >
                        {data.total} {data.total === 1 ? 'matéria' : 'matérias'}
                    </Pagination>
                </div>
            )}
        </>

    )

}
