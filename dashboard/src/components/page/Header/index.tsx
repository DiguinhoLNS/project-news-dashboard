'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import ThemeToggle from '@/components/common/ThemeToggle'
import sidebarLinks from '../Sidebar/constants/links'

export default function Header() {

    const pathName = usePathname()

    const currentLink = sidebarLinks.find(item => pathName.startsWith(item.link))

    return (

        <>
            <header
                className={clsx(
                    'sticky top-0 z-10 flex items-center gap-2 h-14 shrink-0 px-4 border-b',
                    'bg-background/80 backdrop-blur-sm'
                )}
            >
                <SidebarTrigger className={clsx('-ml-1')} />

                <Separator
                    orientation='vertical'
                    className={clsx('mr-2 data-vertical:h-4 data-vertical:self-center')}
                />

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className={clsx('hidden md:block')}>
                            <BreadcrumbLink asChild>
                                <Link href='/generate'>Project News</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        {!!currentLink && (
                            <>
                                <BreadcrumbSeparator className={clsx('hidden md:block')} />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{currentLink.label}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>

                <div className={clsx('ml-auto')}>
                    <ThemeToggle />
                </div>
            </header>
        </>

    )

}
