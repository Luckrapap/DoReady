'use client'

import { useEffect } from 'react'
import { useLoading } from './LoadingProvider'

interface SectionLoaderProps {
    isVisible?: boolean
    message?: string
    fullScreen?: boolean
}

export default function SectionLoader({ 
    message = "Cargando...", 
    fullScreen = true 
}: SectionLoaderProps) {
    const { startLoading, stopLoading } = useLoading()

    useEffect(() => {
        // En un sistema global, el SectionLoader solo actúa como un "puntero"
        // que mantiene el cargador global encendido mientras este componente esté montado.
        startLoading('section', message)
        
        return () => {
            stopLoading('section')
        }
    }, [startLoading, stopLoading, message])

    return null // El UI real está en el LoadingProvider a nivel de Layout
}
