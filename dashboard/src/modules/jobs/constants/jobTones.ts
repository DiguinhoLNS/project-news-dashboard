import type { TJobTone } from '../interfaces/TJobTone'

interface IJobToneClasses {
    soft: string
    solid: string
    line: string
}

const jobTones: Record<TJobTone, IJobToneClasses> = {
    neutral: {
        soft: 'border-border bg-muted text-muted-foreground',
        solid: 'border-muted-foreground bg-muted-foreground text-background',
        line: 'bg-border'
    },
    info: {
        soft: 'border-primary/25 bg-primary/10 text-primary',
        solid: 'border-primary bg-primary text-primary-foreground',
        line: 'bg-primary'
    },
    warning: {
        soft: 'border-warning/30 bg-warning/10 text-warning',
        solid: 'border-warning bg-warning text-warning-foreground',
        line: 'bg-warning'
    },
    success: {
        soft: 'border-success/30 bg-success/10 text-success',
        solid: 'border-success bg-success text-success-foreground',
        line: 'bg-success'
    },
    destructive: {
        soft: 'border-destructive/30 bg-destructive/10 text-destructive',
        solid: 'border-destructive bg-destructive text-white',
        line: 'bg-destructive'
    },
}

export default jobTones
