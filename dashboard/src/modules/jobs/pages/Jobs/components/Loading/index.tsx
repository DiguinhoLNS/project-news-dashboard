import clsx from 'clsx'
import { Skeleton } from '@/components/ui/skeleton'

export default function JobsLoading() {

    return (

        <>
            <div className={clsx('flex flex-col gap-3')}>
                <Skeleton className={clsx('h-10 w-full')} />
                {Array.from({ length: 6 }, (_, index) => (
                    <Skeleton
                        key={index}
                        className={clsx('h-14 w-full')}
                    />
                ))}
                <Skeleton className={clsx('h-8 w-64 self-end')} />
            </div>
        </>

    )

}
