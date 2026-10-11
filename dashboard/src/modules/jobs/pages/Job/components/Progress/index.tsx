'use client'

import clsx from 'clsx'
import { Check, CircleCheck, CircleX, ExternalLink, LoaderCircle, RotateCw, TriangleAlert, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import jobSteps from '@/modules/jobs/constants/jobSteps'
import JobsController from '@/modules/jobs/controllers/jobsController'
import JobStatusBadge from '@/modules/jobs/components/StatusBadge'
import type { IGenerationJob } from '@/modules/jobs/interfaces/IGenerationJob'

const MAX_ATTEMPTS = 3

interface JobProgressProps {
    job: IGenerationJob
}

export default function JobProgress({ job }: JobProgressProps) {

    const currentStep = JobsController.getStep(job)
    const isFailed = job.status === 'FAILED'
    const isPublished = job.status === 'PUBLISHED'
    const isRunning = JobsController.isRunning(job)
    const isStalled = JobsController.isStalled(job)

    return (

        <>
            <Card>
                <CardHeader>
                    <CardTitle>Andamento</CardTitle>
                    <CardDescription>
                        {isRunning && (
                            <span className={clsx('inline-flex items-center gap-1.5')}>
                                <LoaderCircle className={clsx('size-3.5 animate-spin')} />
                                Atualizando automaticamente
                            </span>
                        ) || 'Processamento encerrado'}
                    </CardDescription>
                    <CardAction>
                        <JobStatusBadge status={job.status} />
                    </CardAction>
                </CardHeader>

                <CardContent className={clsx('flex flex-col gap-6')}>
                    <ol className={clsx('flex flex-col')}>
                        {jobSteps.map(({ label, description, icon: Icon }, index) => {

                            const isDone = index < currentStep || (isPublished && index === currentStep)
                            const isCurrent = index === currentStep && !isPublished
                            const isLast = index === jobSteps.length - 1

                            return (
                                <li
                                    key={label}
                                    className={clsx('relative flex gap-3 pb-6 last:pb-0')}
                                    aria-current={isCurrent ? 'step' : undefined}
                                >
                                    {!isLast && (
                                        <span
                                            aria-hidden
                                            className={clsx(
                                                'absolute top-8 bottom-0 left-4 w-px -translate-x-1/2',
                                                isDone ? 'bg-primary' : 'bg-border'
                                            )}
                                        />
                                    )}

                                    <div
                                        className={clsx(
                                            'relative flex shrink-0 items-center justify-center size-8 rounded-full border',
                                            isDone && 'border-primary bg-primary text-primary-foreground',
                                            isCurrent && !isFailed && 'border-primary bg-primary/10 text-primary',
                                            isCurrent && isFailed && 'border-destructive bg-destructive/10 text-destructive',
                                            !isDone && !isCurrent && 'border-border text-muted-foreground'
                                        )}
                                    >
                                        {isDone && <Check className={clsx('size-4')} />}
                                        {isCurrent && isFailed && <X className={clsx('size-4')} />}
                                        {isCurrent && !isFailed && isRunning && <LoaderCircle className={clsx('size-4 animate-spin')} />}
                                        {isCurrent && !isFailed && !isRunning && <Icon className={clsx('size-4')} />}
                                        {!isDone && !isCurrent && <Icon className={clsx('size-4')} />}
                                    </div>

                                    <div className={clsx('flex flex-col pt-1 text-sm')}>
                                        <span className={clsx('font-medium', !isDone && !isCurrent && 'text-muted-foreground')}>
                                            {label}
                                        </span>
                                        <span className={clsx('text-muted-foreground')}>{description}</span>
                                    </div>
                                </li>
                            )

                        })}
                    </ol>

                    {isPublished && !!job.permalink && (
                        <Alert>
                            <CircleCheck />
                            <AlertTitle>Publicada no WordPress</AlertTitle>
                            <AlertDescription className={clsx('flex flex-col items-start gap-3')}>
                                <p>A matéria já está no ar, com o crédito e o link da fonte original.</p>
                                <Button
                                    size='sm'
                                    asChild
                                >
                                    <a
                                        href={job.permalink}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                    >
                                        <ExternalLink />
                                        Ver post publicado
                                    </a>
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {isFailed && (
                        <Alert variant='destructive'>
                            <CircleX />
                            <AlertTitle>Não foi possível concluir</AlertTitle>
                            <AlertDescription>
                                <p>{job.errorMessage ?? 'O processamento falhou.'}</p>
                                <p>Tentativas: {job.attempts} de {MAX_ATTEMPTS}.</p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {JobsController.isWaitingRetry(job) && !isStalled && (
                        <Alert>
                            <RotateCw />
                            <AlertTitle>A tentativa {job.attempts} falhou</AlertTitle>
                            <AlertDescription>{job.errorMessage}</AlertDescription>
                        </Alert>
                    )}

                    {isStalled && (
                        <Alert>
                            <TriangleAlert />
                            <AlertTitle>Job parado</AlertTitle>
                            <AlertDescription>
                                {JobsController.canRetry(job)
                                    ? 'O conteúdo foi gerado, mas a publicação não aconteceu. Use "Tentar novamente" para retomar.'
                                    : 'Nada mudou nos últimos minutos. Confira se o worker está rodando.'}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </>

    )

}
