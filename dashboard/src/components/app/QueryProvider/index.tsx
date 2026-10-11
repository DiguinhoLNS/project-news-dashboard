'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import getQueryClient from '@/modules/api/query/queryClient'

export default function AppQueryProvider({ children }: { children?: React.ReactNode }) {

    const queryClient = getQueryClient()

    return (

        <>
            <QueryClientProvider client={queryClient}>
                {children}

                <ReactQueryDevtools buttonPosition='bottom-left' />
            </QueryClientProvider>
        </>

    )

}
