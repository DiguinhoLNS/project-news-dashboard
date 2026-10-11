'use client'

import clsx from 'clsx'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@wrksz/themes/client'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export default function ThemeToggle() {

    const { resolvedTheme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    }

    return (

        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant='ghost'
                        size='icon'
                        aria-label='Alternar tema'
                        onClick={toggleTheme}
                    >
                        <Sun className={clsx('scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90')} />
                        <Moon className={clsx('absolute scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0')} />
                    </Button>
                </TooltipTrigger>

                <TooltipContent>Alternar tema claro/escuro</TooltipContent>
            </Tooltip>
        </>

    )

}
