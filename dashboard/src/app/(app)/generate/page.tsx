import type { Metadata } from 'next'
import Generate from '@/modules/generate/pages/Generate'

export const metadata: Metadata = {
    title: 'Nova matéria'
}

export default function Page() {
    return <Generate />
}
