import clsx from 'clsx'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
    page: number
    totalPages: number
    hrefFor: (page: number) => string
    children?: React.ReactNode
}

export default function Pagination({ page, totalPages, hrefFor, children }: PaginationProps) {

    const hasPrevious = page > 1
    const hasNext = page < totalPages

    return (

        <>
            <nav
                aria-label='Paginação'
                className={clsx('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between')}
            >
                <p className={clsx('text-sm text-muted-foreground')}>{children}</p>

                <div className={clsx('flex items-center gap-2')}>
                    <Button
                        variant='outline'
                        size='sm'
                        disabled={!hasPrevious}
                        asChild={hasPrevious}
                    >
                        {hasPrevious && (
                            <Link href={hrefFor(page - 1)}>
                                <ChevronLeft />
                                Anterior
                            </Link>
                        ) || (
                            <>
                                <ChevronLeft />
                                Anterior
                            </>
                        )}
                    </Button>

                    <span className={clsx('px-2 text-sm tabular-nums')}>
                        {page} de {Math.max(totalPages, 1)}
                    </span>

                    <Button
                        variant='outline'
                        size='sm'
                        disabled={!hasNext}
                        asChild={hasNext}
                    >
                        {hasNext && (
                            <Link href={hrefFor(page + 1)}>
                                Próxima
                                <ChevronRight />
                            </Link>
                        ) || (
                            <>
                                Próxima
                                <ChevronRight />
                            </>
                        )}
                    </Button>
                </div>
            </nav>
        </>

    )

}
