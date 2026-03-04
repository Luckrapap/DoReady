'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ArrowRight, Gamepad2, Brain } from 'lucide-react'
import { cn } from '@/utils/utils'
import type { TriviaResponse } from '@/app/api/trivia/route'

export default function TriviaGame() {
    const [gameState, setGameState] = useState<'loading' | 'playing' | 'answered' | 'error'>('loading')
    const [currentTrivia, setCurrentTrivia] = useState<TriviaResponse | null>(null)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [streak, setStreak] = useState(0)
    const [errorMessage, setErrorMessage] = useState('')

    const fetchTrivia = useCallback(async () => {
        setGameState('loading')
        setSelectedAnswer(null)
        try {
            const res = await fetch('/api/trivia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: null }) // We let the AI pick a random topic
            })
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }))
                throw new Error(errorData.details || errorData.error || 'Failed to fetch trivia')
            }
            const data: TriviaResponse = await res.json()

            // Randomize options order
            const shuffledOptions = [...data.options].sort(() => Math.random() - 0.5)
            setCurrentTrivia({ ...data, options: shuffledOptions })

            setGameState('playing')
        } catch (error: any) {
            console.error(error)
            setErrorMessage(error.message || 'Error al cargar la pregunta.')
            setGameState('error')
        }
    }, [])

    // Load first question on mount
    useEffect(() => {
        fetchTrivia()
    }, [fetchTrivia])

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
                    <div className="w-12 h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg">
                        <Gamepad2 size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
                            Trivia ProcasTive
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium mt-1">
                            Alimenta tu cerebro, no tu ansiedad.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Racha</span>
                    <motion.div
                        key={streak}
                        initial={{ scale: 1.5, color: '#22c55e' }}
                        animate={{ scale: 1, color: '' }}
                        className="text-2xl font-black text-zinc-900 dark:text-zinc-50"
                    >
                        {streak} 🔥
                    </motion.div>
                </div>
            </div>

            {/* Game Container */}
            <div className="relative w-full min-h-[400px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2rem] p-6 md:p-10 shadow-sm overflow-hidden flex flex-col">

                <AnimatePresence mode="wait">
                    {/* LOADING STATE */}
                    {gameState === 'loading' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm z-10"
                        >
                            <Loader2 size={40} className="animate-spin text-zinc-400" />
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest animate-pulse">
                                Generando pregunta...
                            </p>
                        </motion.div>
                    )}

                    {/* ERROR STATE */}
                    {gameState === 'error' && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 gap-4"
                        >
                            <p className="text-red-500 font-medium">{errorMessage}</p>
                            <button
                                onClick={fetchTrivia}
                                className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full text-sm font-bold"
                            >
                                Reintentar
                            </button>
                        </motion.div>
                    )}

                    {/* PLAYING / ANSWERED STATE */}
                    {(gameState === 'playing' || gameState === 'answered') && currentTrivia && (
                        <motion.div
                            key={currentTrivia.question}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col h-full flex-1"
                        >
                            <h3 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-8 leading-snug">
                                {currentTrivia.question}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 flex-1 content-start">
                                {currentTrivia.options.map((option, idx) => {
                                    const isSelected = selectedAnswer === option
                                    const isCorrect = option === currentTrivia.correctAnswer

                                    let btnClass = "border-zinc-200/60 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300"

                                    if (gameState === 'answered') {
                                        if (isCorrect) {
                                            btnClass = "border-green-500 bg-green-500 text-white dark:border-green-400 dark:bg-green-500/20 dark:text-green-400"
                                        } else if (isSelected && !isCorrect) {
                                            btnClass = "border-red-500 bg-red-500 text-white dark:border-red-400 dark:bg-red-500/20 dark:text-red-400"
                                        } else {
                                            btnClass = "border-zinc-200/30 dark:border-zinc-800/50 opacity-50"
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(option)}
                                            disabled={gameState === 'answered'}
                                            className={cn(
                                                "relative p-4 rounded-2xl border-2 text-left font-medium text-[15px] transition-all duration-300",
                                                gameState === 'playing' && "hover:-translate-y-1 hover:shadow-md cursor-pointer",
                                                btnClass
                                            )}
                                        >
                                            {option}
                                        </button>
                                    )
                                })}
                            </div>

                            <AnimatePresence>
                                {gameState === 'answered' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        className="mt-auto"
                                    >
                                        <div className="p-4 bg-zinc-100 dark:bg-zinc-950/50 rounded-2xl mb-6">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Brain size={16} className="text-zinc-400" />
                                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Dato Curioso</span>
                                            </div>
                                            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                {currentTrivia.explanation}
                                            </p>
                                        </div>

                                        <button
                                            onClick={fetchTrivia}
                                            className="w-full flex items-center justify-center gap-2 py-4 bg-black text-white dark:bg-white dark:text-black rounded-full font-bold text-sm tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
                                        >
                                            Siguiente Pregunta
                                            <ArrowRight size={18} />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
