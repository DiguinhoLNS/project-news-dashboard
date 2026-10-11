import { History, Sparkles } from 'lucide-react'
import type { ISidebarLink } from '../interfaces/ISidebarLink'

const sidebarLinks: ISidebarLink[] = [
    {
        link: '/generate',
        icon: Sparkles,
        label: 'Nova matéria',
        description: 'Envie a URL de uma notícia para a IA reescrever'
    },
    {
        link: '/jobs',
        icon: History,
        label: 'Histórico',
        description: 'Acompanhe as matérias geradas e publicadas'
    },
]

export default sidebarLinks
