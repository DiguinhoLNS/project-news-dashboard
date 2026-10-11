import { CircleCheck, Clock, FileSearch, Send, Sparkles, type LucideIcon } from 'lucide-react'

interface IJobStep {
    label: string
    description: string
    icon: LucideIcon
}

const jobSteps: IJobStep[] = [
    {
        label: 'Na fila',
        description: 'Aguardando o worker',
        icon: Clock
    },
    {
        label: 'Lendo a matéria',
        description: 'Baixa a página e extrai o texto',
        icon: FileSearch
    },
    {
        label: 'Gerando com IA',
        description: 'A IA reescreve o conteúdo',
        icon: Sparkles
    },
    {
        label: 'Publicando',
        description: 'Envia o post ao WordPress',
        icon: Send
    },
    {
        label: 'Publicada',
        description: 'Disponível no site',
        icon: CircleCheck
    },
]

export default jobSteps
