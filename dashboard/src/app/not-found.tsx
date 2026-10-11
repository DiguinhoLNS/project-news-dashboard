import type { Metadata } from 'next'
import ErrorNotFound from '@/modules/error/pages/NotFound'

export const metadata: Metadata = {
    title: 'Página não encontrada'
}

export default function NotFound() {
    return <ErrorNotFound />
}
