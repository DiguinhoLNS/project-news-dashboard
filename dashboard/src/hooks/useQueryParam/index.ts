'use client'

import { useSearchParams } from 'next/navigation'

export function useQueryParam(param: string): string | null {
    const searchParams = useSearchParams()

    return searchParams.get(param)
}
