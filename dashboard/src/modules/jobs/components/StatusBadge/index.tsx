import { Badge } from '@/components/ui/badge'
import jobStatus from '@/modules/jobs/constants/jobStatus'
import type { TJobStatus } from '@/modules/jobs/interfaces/TJobStatus'

interface JobStatusBadgeProps {
    status: TJobStatus
}

export default function JobStatusBadge({ status }: JobStatusBadgeProps) {

    const { label, icon: Icon, variant } = jobStatus[status]

    return (

        <>
            <Badge variant={variant}>
                <Icon data-icon='inline-start' />
                {label}
            </Badge>
        </>

    )

}
