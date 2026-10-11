import clsx from 'clsx'
import Header from '@/components/page/Header'
import Sidebar from '@/components/page/Sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {

    return (

        <>
            <SidebarProvider>
                <Sidebar />

                <SidebarInset>
                    <Header />

                    <main className={clsx('flex flex-1 flex-col gap-6 w-full p-4 md:p-6')}>
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </>

    )

}
