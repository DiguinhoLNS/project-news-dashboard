'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import type { ISidebarLink } from '../../interfaces/ISidebarLink'

export default function SidebarLinkItem(props: ISidebarLink) {

    return (

        <>
            <Suspense fallback={<SidebarLinkItemContent {...props} />}>
                <ActiveSidebarLinkItem {...props} />
            </Suspense>
        </>

    )

}

function ActiveSidebarLinkItem(props: ISidebarLink) {

    const pathName = usePathname()

    const isActive = pathName === props.link || pathName.startsWith(`${props.link}/`)

    return (
        <SidebarLinkItemContent
            {...props}
            isActive={isActive}
        />
    )

}

function SidebarLinkItemContent({ link, icon: Icon, label, isActive = false }: ISidebarLink & { isActive?: boolean }) {

    const { isMobile, setOpenMobile } = useSidebar()

    return (

        <>
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={label}
                >
                    <Link
                        href={link}
                        onClick={() => isMobile && setOpenMobile(false)}
                    >
                        <Icon />
                        <span>{label}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </>

    )

}
