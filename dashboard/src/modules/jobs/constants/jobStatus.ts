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
import type { TJobTone } from '../interfaces/TJobTone'

interface IJobStatusInfo {
    label: string
    icon: LucideIcon
    tone: TJobTone
}

const jobStatus: Record<TJobStatus, IJobStatusInfo> = {
    QUEUED: {
        label: 'Na fila',
        icon: Clock,
        tone: 'neutral'
    },
    EXTRACTING: {
        label: 'Lendo a matéria',
        icon: FileSearch,
        tone: 'info'
    },
    GENERATING: {
        label: 'Gerando com IA',
        icon: Sparkles,
        tone: 'info'
    },
    GENERATED: {
        label: 'Conteúdo gerado',
        icon: FileText,
        tone: 'warning'
    },
    PUBLISHING: {
        label: 'Publicando',
        icon: Send,
        tone: 'info'
    },
    PUBLISHED: {
        label: 'Publicada',
        icon: CircleCheck,
        tone: 'success'
    },
    FAILED: {
        label: 'Falhou',
        icon: CircleX,
        tone: 'destructive'
    },
}

/** Status em que o job não muda mais sozinho: o painel para de atualizar. */
export const finalJobStatuses: ReadonlySet<TJobStatus> = new Set(['PUBLISHED', 'FAILED'])

export default jobStatus
