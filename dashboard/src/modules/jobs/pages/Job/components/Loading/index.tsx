import clsx from 'clsx'
import { Skeleton } from '@/components/ui/skeleton'

export default function JobLoading() {

    return (

        <>
            <div className={clsx('flex flex-col gap-2')}>
                <Skeleton className={clsx('h-8 w-full max-w-xl')} />
                <Skeleton className={clsx('h-5 w-64')} />
            </div>

            <div className={clsx('grid gap-6 lg:grid-cols-3')}>
                <div className={clsx('flex flex-col gap-6 lg:col-span-2')}>
                    <Skeleton className={clsx('h-80 w-full rounded-xl')} />
                    <Skeleton className={clsx('h-64 w-full rounded-xl')} />
                </div>

                <Skeleton className={clsx('h-96 w-full rounded-xl')} />
            </div>
        </>

    )

}
