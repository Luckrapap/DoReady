'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { LoadingOverlay } from './LoadingOverlay'

interface LoadingContextType {
    startLoading: (id: string, message?: string) => void
    stopLoading: (id: string) => void
    isLoading: boolean
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [loadingTasks, setLoadingTasks] = useState<Map<string, string>>(new Map())

    const startLoading = useCallback((id: string, message: string = "Cargando...") => {
        setLoadingTasks(prev => {
            const next = new Map(prev)
            next.set(id, message)
            return next
        })
    }, [])

    const stopLoading = useCallback((id: string) => {
        setLoadingTasks(prev => {
            if (!prev.has(id)) return prev
            const next = new Map(prev)
            next.delete(id)
            return next
        })
    }, [])

    const isLoading = loadingTasks.size > 0
    // Get the latest message (from the most recently added task)
    const currentMessage = Array.from(loadingTasks.values()).pop() || "Cargando..."

    return (
        <LoadingContext.Provider value={{ startLoading, stopLoading, isLoading }}>
            {children}
            <AnimatePresence>
                {isLoading && (
                    <LoadingOverlay 
                        message={currentMessage} 
                        seamless={true} 
                    />
                )}
            </AnimatePresence>
        </LoadingContext.Provider>
    )
}

export function useLoading() {
    const context = useContext(LoadingContext)
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider')
    }
    return context
}
