import clsx from 'clsx'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from '@/components/ui/empty'

interface JobsEmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    action?: { label: string, href?: string, onClick?: () => void }
}

export default function JobsEmptyState({ icon: Icon, title, description, action }: JobsEmptyStateProps) {

    return (

        <>
            <Empty className={clsx('flex-none border border-dashed')}>
                <EmptyHeader>
                    <EmptyMedia variant='icon'>
                        <Icon />
                    </EmptyMedia>
                    <EmptyTitle>{title}</EmptyTitle>
                    <EmptyDescription>{description}</EmptyDescription>
                </EmptyHeader>

                {!!action && (
                    <EmptyContent>
                        {action.href && (
                            <Button asChild>
                                <Link href={action.href}>{action.label}</Link>
                            </Button>
                        ) || (
                            <Button onClick={action.onClick}>{action.label}</Button>
                        )}
                    </EmptyContent>
                )}
            </Empty>
        </>

    )

}
