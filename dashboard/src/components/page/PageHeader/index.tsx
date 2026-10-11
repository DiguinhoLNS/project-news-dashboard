import clsx from 'clsx'

interface PageHeaderProps {
    title: string
    description?: string
    children?: React.ReactNode
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {

    return (

        <>
            <div className={clsx('flex flex-col gap-4 w-full sm:flex-row sm:items-end sm:justify-between')}>
                <div className={clsx('flex flex-col gap-1')}>
                    <h1 className={clsx('text-2xl font-semibold tracking-tight')}>
                        {title}
                    </h1>

                    {!!description && (
                        <p className={clsx('text-muted-foreground')}>
                            {description}
                        </p>
                    )}
                </div>

                {!!children && (
                    <div className={clsx('flex items-center gap-2')}>
                        {children}
                    </div>
                )}
            </div>
        </>

    )

}
