import clsx from 'clsx'
import ThemeToggle from '@/components/common/ThemeToggle'

export default function ErrorLayout({ children }: Readonly<{ children?: React.ReactNode }>) {

    return (

        <>
            <div className={clsx('relative flex flex-col flex-1 items-center justify-center-safe w-full p-4 pt-16')}>
                <div className={clsx('absolute top-4 right-4')}>
                    <ThemeToggle />
                </div>

                {children}
            </div>
        </>

    )

}
