import clsx from 'clsx'
import jobSteps from '@/modules/jobs/constants/jobSteps'

const steps = jobSteps.slice(1)

export default function GenerateHowItWorks() {

    return (

        <>
            <section className={clsx('flex flex-col gap-3')}>
                <h2 className={clsx('text-sm font-medium text-muted-foreground')}>Como funciona</h2>

                <ol className={clsx('grid gap-3 sm:grid-cols-2 lg:grid-cols-4')}>
                    {steps.map(({ label, description, icon: Icon }, index) => (
                        <li
                            key={label}
                            className={clsx('flex gap-3 p-4 rounded-xl ring-1 ring-foreground/10')}
                        >
                            <div
                                className={clsx(
                                    'flex shrink-0 items-center justify-center size-8 rounded-lg',
                                    'bg-primary/10 text-primary'
                                )}
                            >
                                <Icon className={clsx('size-4')} />
                            </div>

                            <div className={clsx('flex flex-col gap-0.5 text-sm')}>
                                <span className={clsx('font-medium')}>
                                    {index + 1}. {label}
                                </span>
                                <span className={clsx('text-muted-foreground')}>{description}</span>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>
        </>

    )

}
