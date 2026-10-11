import type { Metadata } from 'next'
import Jobs from '@/modules/jobs/pages/Jobs'

export const metadata: Metadata = {
    title: 'Histórico'
}

export default function Page() {
    return <Jobs />
}
