import {
    CircleCheck,
    CircleX,
    Clock,
    FileSearch,
    FileText,
    Send,
    Sparkles,
    type LucideIcon
} from 'lucide-react'
import type { TJobStatus } from '../interfaces/TJobStatus'

interface IJobStatusInfo {
    label: string
    icon: LucideIcon
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
}

const jobStatus: Record<TJobStatus, IJobStatusInfo> = {
    QUEUED: {
        label: 'Na fila',
        icon: Clock,
        variant: 'outline'
    },
    EXTRACTING: {
        label: 'Lendo a matéria',
        icon: FileSearch,
        variant: 'secondary'
    },
    GENERATING: {
        label: 'Gerando com IA',
        icon: Sparkles,
        variant: 'secondary'
    },
    GENERATED: {
        label: 'Conteúdo gerado',
        icon: FileText,
        variant: 'secondary'
    },
    PUBLISHING: {
        label: 'Publicando',
        icon: Send,
        variant: 'secondary'
    },
    PUBLISHED: {
        label: 'Publicada',
        icon: CircleCheck,
        variant: 'default'
    },
    FAILED: {
        label: 'Falhou',
        icon: CircleX,
        variant: 'destructive'
    },
}

/** Status em que o job não muda mais sozinho: o painel para de atualizar. */
export const finalJobStatuses: ReadonlySet<TJobStatus> = new Set(['PUBLISHED', 'FAILED'])

export default jobStatus
