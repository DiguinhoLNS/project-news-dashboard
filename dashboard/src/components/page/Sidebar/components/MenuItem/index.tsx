'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import type { ISidebarLink } from '../../interfaces/ISidebarLink'

export default function SidebarLinkItem({ link, icon: Icon, label }: ISidebarLink) {

    const pathName = usePathname()
    const { isMobile, setOpenMobile } = useSidebar()

    const isActive = pathName === link || pathName.startsWith(`${link}/`)

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
