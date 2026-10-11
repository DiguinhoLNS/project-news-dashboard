'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { History, RotateCw, SearchX, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from '@/components/ui/empty'
import ApiError from '@/modules/api/errors/ApiError'
import { getErrorMessage } from '@/utils/toast'

interface JobErrorProps {
    error: Error
    onRetry: () => void
}

export default function JobError({ error, onRetry }: JobErrorProps) {

    const isNotFound = error instanceof ApiError && error.status === 404

    return (

        <>
            <Empty className={clsx('flex-none max-w-md mx-auto mt-10')}>
                <EmptyHeader>
                    <EmptyMedia variant='icon'>
                        {isNotFound && <SearchX /> || <TriangleAlert />}
                    </EmptyMedia>

                    <EmptyTitle>{isNotFound ? 'Job não encontrado' : 'Não foi possível carregar o job'}</EmptyTitle>
                    <EmptyDescription>
                        {isNotFound
                            ? 'O endereço não corresponde a nenhuma matéria enviada. Ela pode ter sido apagada.'
                            : getErrorMessage(error)}
                    </EmptyDescription>
                </EmptyHeader>

                <EmptyContent>
                    <div className={clsx('flex flex-col gap-2 w-full sm:flex-row sm:justify-center')}>
                        {!isNotFound && (
                            <Button
                                variant='outline'
                                onClick={onRetry}
                            >
                                <RotateCw />
                                Tentar de novo
                            </Button>
                        )}

                        <Button asChild>
                            <Link href='/jobs'>
                                <History />
                                Ir para o histórico
                            </Link>
                        </Button>
                    </div>
                </EmptyContent>
            </Empty>
        </>

    )

}
