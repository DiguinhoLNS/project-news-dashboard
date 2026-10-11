'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, House, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from '@/components/ui/empty'
import ErrorLayout from '../../components/layout/Error'

export default function ErrorNotFound() {

    const router = useRouter()

    const goBack = () => {
        if (window.history.length > 1) return router.back()

        router.replace('/generate')
    }

    return (

        <>
            <ErrorLayout>
                <Empty className={clsx('flex-none max-w-md')}>
                    <EmptyHeader>
                        <p
                            className={clsx(
                                'text-8xl font-bold tracking-tighter tabular-nums',
                                'bg-linear-to-b from-foreground to-muted-foreground/40 bg-clip-text text-transparent'
                            )}
                        >
                            404
                        </p>

                        <EmptyMedia variant='icon'>
                            <SearchX />
                        </EmptyMedia>

                        <EmptyTitle className={clsx('text-lg')}>Página não encontrada</EmptyTitle>
                        <EmptyDescription>
                            A página que você tentou acessar não existe ou foi movido. Confira a URL ou volte para a Home.
                        </EmptyDescription>
                    </EmptyHeader>

                    <EmptyContent>
                        <div className={clsx('flex flex-col gap-2 w-full sm:flex-row sm:justify-center')}>
                            <Button
                                variant='outline'
                                onClick={goBack}
                            >
                                <ArrowLeft />
                                Voltar
                            </Button>

                            <Button asChild>
                                <Link href=''>
                                    <House />
                                    Ir para Home
                                </Link>
                            </Button>
                        </div>
                    </EmptyContent>
                </Empty>
            </ErrorLayout>
        </>

    )

}
