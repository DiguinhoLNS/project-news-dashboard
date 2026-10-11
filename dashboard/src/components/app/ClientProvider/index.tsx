'use client'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function AppClientProvider({ children }: Readonly<{ children: React.ReactNode }>) {

    return (

        <>
            <TooltipProvider>
                {children}

                <Toaster
                    position='top-right'
                    richColors
                    closeButton
                />
            </TooltipProvider>
        </>

    )

}
