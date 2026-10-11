import AppLayout from '@/components/layout/App'

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {

    return <AppLayout>{children}</AppLayout>

}
