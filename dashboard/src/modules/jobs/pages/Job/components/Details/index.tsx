import clsx from 'clsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import formatDateTime from '@/utils/formatDateTime'
import type { IGenerationJob } from '@/modules/jobs/interfaces/IGenerationJob'

const numberFormatter = new Intl.NumberFormat('pt-BR')

interface JobDetailsProps {
    job: IGenerationJob
}

export default function JobDetails({ job }: JobDetailsProps) {

    const sourceHost = new URL(job.sourceUrl).hostname.replace(/^www\./, '')

    const items: { label: string, value: React.ReactNode }[] = [
        {
            label: 'Fonte',
            value: (
                <a
                    href={job.sourceUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={clsx('underline underline-offset-4 hover:text-primary')}
                >
                    {job.source?.siteName ?? sourceHost}
                </a>
            )
        },
        { label: 'Título original', value: job.source?.title },
        { label: 'Autor original', value: job.source?.author !== job.source?.siteName ? job.source?.author : null },
        { label: 'Modelo de IA', value: job.llmModel },
        {
            label: 'Tokens',
            value: job.usage && `${numberFormatter.format(job.usage.inputTokens)} de entrada · ${numberFormatter.format(job.usage.outputTokens)} de saída`
        },
        { label: 'Tentativas', value: job.attempts },
        { label: 'Post no WordPress', value: job.wpPostId && `#${job.wpPostId}` },
        { label: 'Enviado em', value: formatDateTime(job.createdAt) },
        { label: 'Atualizado em', value: formatDateTime(job.updatedAt) },
    ]

    return (

        <>
            <Card className={clsx('self-start')}>
                <CardHeader>
                    <CardTitle>Detalhes</CardTitle>
                </CardHeader>

                <CardContent>
                    <dl className={clsx('flex flex-col gap-3 text-sm')}>
                        {items.filter(item => item.value !== null && item.value !== undefined && item.value !== '').map(({ label, value }) => (
                            <div
                                key={label}
                                className={clsx('flex flex-col gap-0.5')}
                            >
                                <dt className={clsx('text-muted-foreground')}>{label}</dt>
                                <dd className={clsx('break-words')}>{value}</dd>
                            </div>
                        ))}

                        <div className={clsx('flex flex-col gap-0.5')}>
                            <dt className={clsx('text-muted-foreground')}>ID do job</dt>
                            <dd className={clsx('font-mono text-xs break-all')}>{job.id}</dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>
        </>

    )

}
