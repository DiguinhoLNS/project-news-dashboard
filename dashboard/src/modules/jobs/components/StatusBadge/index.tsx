import { Badge } from '@/components/ui/badge'
import jobTones from '@/modules/jobs/constants/jobTones'
import jobStatus from '@/modules/jobs/constants/jobStatus'
import type { TJobStatus } from '@/modules/jobs/interfaces/TJobStatus'

interface JobStatusBadgeProps {
    status: TJobStatus
}

export default function JobStatusBadge({ status }: JobStatusBadgeProps) {

    const { label, icon: Icon, tone } = jobStatus[status]

    return (

        <>
            <Badge
                variant='outline'
                className={jobTones[tone].soft}
            >
                <Icon data-icon='inline-start' />
                {label}
            </Badge>
        </>

    )

}
