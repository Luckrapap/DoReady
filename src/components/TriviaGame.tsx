'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ArrowRight, Gamepad2, Brain } from 'lucide-react'
import { cn } from '@/utils/utils'
import type { TriviaResponse } from '@/app/api/trivia/route'

interface TriviaGameProps {
    onBack?: () => void
}

export default function TriviaGame({ onBack }: TriviaGameProps) {
    const [gameState, setGameState] = useState<'loading' | 'playing' | 'answered' | 'error'>('loading')
    const [currentTrivia, setCurrentTrivia] = useState<TriviaResponse | null>(null)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [streak, setStreak] = useState(0)
    const [isFetching, setIsFetching] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const fetchTrivia = useCallback(async (isMountedRef?: { current: boolean }) => {
        if (isFetching) return

        // If no ref is provided (e.g. from button click), we assume it's mounted
        const isMounted = isMountedRef || { current: true }

        setIsFetching(true)
        setGameState('loading')
        setSelectedAnswer(null)
        try {
            const res = await fetch('/api/trivia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: null })
            })
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }))
                throw new Error(errorData.details || errorData.error || 'Failed to fetch trivia')
            }
            const data: TriviaResponse = await res.json()

            if (!isMounted.current) return

            // Randomize options order
            const shuffledOptions = [...data.options].sort(() => Math.random() - 0.5)
            setCurrentTrivia({ ...data, options: shuffledOptions })

            setGameState('playing')
        } catch (error: any) {
            if (!isMounted.current) return
            console.error(error)
            setErrorMessage(error.message || 'Error al cargar la pregunta.')
            setGameState('error')
        } finally {
            if (isMounted.current) setIsFetching(false)
        }
    }, [isFetching])

    // Load first question on mount
    useEffect(() => {
        const isMounted = { current: true }
        fetchTrivia(isMounted)
        return () => { isMounted.current = false }
    }, [])

    const handleAnswer = (answer: string) => {
        if (gameState !== 'playing' || !currentTrivia) return

        setSelectedAnswer(answer)
        setGameState('answered')

        if (answer === currentTrivia.correctAnswer) {
            setStreak(prev => prev + 1)
        } else {
            setStreak(0)
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Header & Streak */}
            <div className="flex items-center justify-between mb-8 px-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500"
                        style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
                    >
                        <Gamepad2 size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                                >
                                    ← Volver
                                </button>
                            )}
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
                                Trivia General
                            </h2>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mt-1.5 opacity-60">
                            Desafío Diario DoReady
                        </p>
                    </div>
                </div>

                {streak > 0 && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-2xl border transition-colors duration-500"
                        style={{ backgroundColor: 'var(--border)', borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)' }}
                    >
                        <Brain className="text-zinc-900 dark:text-zinc-100" size={18} />
                        <span className="text-sm font-black tracking-tighter" style={{ color: 'var(--accent)' }}> Streak {streak}</span>
                    </motion.div>
                )}
            </div>

            {/* Game Container */}
            <AnimatePresence mode="wait">
                {gameState === 'loading' ? (
                    <motion.div
                        key="loading"
                        className="p-12 border rounded-[2.5rem] flex flex-col items-center justify-center gap-4 transition-colors duration-500"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                        <Loader2 className="animate-spin text-zinc-400" size={32} />
                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Invocando pregunta...</p>
                    </motion.div>
                ) : gameState === 'error' ? (
                    <motion.div
                        key="error"
                        className="p-12 border rounded-[2.5rem] transition-colors duration-500"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-red-500 font-medium">{errorMessage}</p>
                            <button
                                onClick={() => fetchTrivia()}
                                className="px-6 py-2 rounded-full font-bold text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black"
                            >
                                Reintentar
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-10 border rounded-[2.5rem] shadow-xl md:shadow-2xl transition-colors duration-500"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                        <h3 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-8 leading-tight">
                            {currentTrivia?.question}
                        </h3>

                        <div className="grid grid-cols-1 gap-3">
                            {currentTrivia?.options.map((option, idx) => {
                                const isSelected = selectedAnswer === option
                                const isCorrect = gameState === 'answered' && option === currentTrivia?.correctAnswer
                                const isWrong = gameState === 'answered' && isSelected && option !== currentTrivia?.correctAnswer

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(option)}
                                        disabled={gameState === 'answered'}
                                        className={cn(
                                            "group relative w-full p-5 text-left rounded-2xl font-bold transition-all border-2 overflow-hidden",
                                            gameState === 'playing'
                                                ? "hover:border-zinc-900 dark:hover:border-zinc-50 hover:scale-[1.01]"
                                                : "cursor-default"
                                        )}
                                        style={{
                                            backgroundColor: isCorrect
                                                ? 'rgba(34, 197, 94, 0.1)'
                                                : isWrong
                                                    ? 'rgba(239, 68, 68, 0.1)'
                                                    : 'color-mix(in srgb, var(--surface) 95%, var(--accent))',
                                            borderColor: isCorrect
                                                ? '#22c55e'
                                                : isWrong
                                                    ? '#ef4444'
                                                    : 'var(--border)'
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "text-sm tracking-tight transition-colors",
                                                isCorrect ? "text-green-600 dark:text-green-400" :
                                                    isWrong ? "text-red-600 dark:text-red-400" :
                                                        "text-zinc-700 dark:text-zinc-300"
                                            )}>
                                                {option}
                                            </span>
                                            <ArrowRight
                                                size={16}
                                                className={cn(
                                                    "transition-all",
                                                    gameState === 'playing' ? "opacity-0 group-hover:opacity-100 group-hover:translate-x-1" : "opacity-0"
                                                )}
                                            />
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {gameState === 'answered' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-8 pt-6 border-t"
                                style={{ borderColor: 'var(--border)' }}
                            >
                                <button
                                    onClick={() => fetchTrivia()}
                                    className="w-full py-4 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 group"
                                    style={{ backgroundColor: 'var(--accent)' }}
                                >
                                    Siguiente Pregunta
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
