import clsx from 'clsx'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import JobsController from '@/modules/jobs/controllers/jobsController'
import type { IGeneratedArticle } from '@/modules/jobs/interfaces/IGeneratedArticle'

interface JobArticleProps {
    article: IGeneratedArticle
}

export default function JobArticle({ article }: JobArticleProps) {

    const blocks = JobsController.toArticleBlocks(article.bodyMarkdown)

    return (

        <>
            <Card>
                <CardHeader>
                    <CardTitle>Conteúdo gerado</CardTitle>
                    <CardDescription>O texto que a IA escreveu e que vai para o WordPress.</CardDescription>
                    <CardAction>
                        <Badge variant='secondary'>{article.category}</Badge>
                    </CardAction>
                </CardHeader>

                <CardContent className={clsx('flex flex-col gap-5')}>
                    <div className={clsx('flex flex-col gap-2')}>
                        <h2 className={clsx('text-xl font-semibold leading-snug text-balance')}>
                            {article.title}
                        </h2>
                        <p className={clsx('text-muted-foreground text-pretty')}>{article.excerpt}</p>
                    </div>

                    {article.keyPoints.length > 0 && (
                        <div className={clsx('flex flex-col gap-2 p-4 rounded-lg bg-muted/50')}>
                            <h3 className={clsx('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>
                                Pontos principais
                            </h3>
                            <ul className={clsx('flex flex-col gap-1.5 pl-4 list-disc marker:text-primary')}>
                                {article.keyPoints.map(point => (
                                    <li key={point}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Separator />

                    <div className={clsx('flex flex-col gap-3 leading-relaxed')}>
                        {blocks.map((block, index) => block.type === 'heading' && (
                            <h3
                                key={index}
                                className={clsx('mt-2 font-semibold')}
                            >
                                {block.text}
                            </h3>
                        ) || (
                            <p
                                key={index}
                                className={clsx('text-pretty')}
                            >
                                {block.text}
                            </p>
                        ))}
                    </div>

                    {article.tags.length > 0 && (
                        <div className={clsx('flex flex-wrap gap-1.5')}>
                            {article.tags.map(tag => (
                                <Badge
                                    key={tag}
                                    variant='outline'
                                >
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>

    )

}
