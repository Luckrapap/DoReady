'use client'

import { useEffect } from 'react'
import { useLoading } from './LoadingProvider'

export default function NavigationLoader() {
    const { startLoading, stopLoading } = useLoading()

    useEffect(() => {
        let safetyTimeout: NodeJS.Timeout | null = null

        const handleStart = () => {
            startLoading('navigation', "Cargando...")
            // Timeout de seguridad: detiene la carga tras 4s si algo falla
            if (safetyTimeout) clearTimeout(safetyTimeout)
            safetyTimeout = setTimeout(() => {
                stopLoading('navigation')
            }, 4000)
        }

        const handleStop = () => {
            stopLoading('navigation')
            if (safetyTimeout) clearTimeout(safetyTimeout)
        }

        window.addEventListener('navigation-start', handleStart)
        window.addEventListener('navigation-stop', handleStop)
        window.addEventListener('close-mobile-drawer', handleStop)

        return () => {
            window.removeEventListener('navigation-start', handleStart)
            window.removeEventListener('navigation-stop', handleStop)
            window.removeEventListener('close-mobile-drawer', handleStop)
            if (safetyTimeout) clearTimeout(safetyTimeout)
        }
    }, [startLoading, stopLoading])

    return null // UI is handled by Global Loading Overlay rendered in the provider
}
