'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ArrowRight, Gamepad2, Brain, ChevronLeft, Pin, Lightbulb, X, Flame } from 'lucide-react'
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
    const [showContext, setShowContext] = useState(false)
    const [showFact, setShowFact] = useState(false)
    const [gameMode, setGameMode] = useState<'chill' | 'expert' | 'random' | 'focus' | null>(null)
    const [isEnteringTopic, setIsEnteringTopic] = useState(false)
    const [customTopic, setCustomTopic] = useState('')

    const fetchTrivia = useCallback(async (
        isMountedRef?: { current: boolean },
        forcedMode?: string,
        forcedTopic?: string
    ) => {
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
                body: JSON.stringify({
                    mode: forcedMode || gameMode || 'random',
                    topic: forcedTopic || customTopic || null
                })
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
        } catch (error: unknown) {
            if (!isMounted.current) return
            console.error(error)
            const errorMsg = error instanceof Error ? error.message : 'Error al cargar la pregunta.'
            setErrorMessage(errorMsg)
            setGameState('error')
        } finally {
            if (isMounted.current) setIsFetching(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFetching])

    // Pregunta inicial se carga a través de la selección de modo

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

    const handleStartMode = (mode: 'chill' | 'expert' | 'random' | 'focus') => {
        if (mode === 'focus') {
            setIsEnteringTopic(true)
            return
        }
        setGameMode(mode)
        fetchTrivia(undefined, mode)
    }

    const handleConfirmFocus = () => {
        if (!customTopic.trim()) return
        setGameMode('focus')
        setIsEnteringTopic(false)
        fetchTrivia(undefined, 'focus', customTopic)
    }

    const renderHeaderContent = (subtitle: string) => (
        <div className="flex items-center gap-4">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)] to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 border border-white/20"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
                >
                    <Gamepad2 size={24} strokeWidth={2.5} />
                </div>
            </div>
            <div className="flex flex-col items-start justify-center">
                <h2 className="text-2xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-600 dark:from-zinc-50 dark:via-zinc-200 dark:to-zinc-400">
                    {gameMode === 'focus' ? 'Modo Enfoque' : 'Trivia General'}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"></div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 leading-none">
                        {subtitle}
                    </p>
                </div>
            </div>
        </div>
    )

    if (isEnteringTopic) {
        return (
            <div className="w-full max-w-2xl mx-auto h-full flex flex-col">
                <div className="flex items-center justify-between mb-8 px-4 relative shrink-0">
                    <div className="flex items-center gap-4">
                        <motion.button
                            onClick={() => setIsEnteringTopic(false)}
                            whileHover={{ scale: 1.1, x: -2 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                            style={{
                                backgroundColor: 'color-mix(in srgb, var(--surface) 80%, transparent)',
                                borderColor: 'var(--border)',
                                color: 'var(--accent)',
                                backdropFilter: 'blur(8px)'
                            }}
                        >
                            <ChevronLeft size={24} strokeWidth={2.5} />
                        </motion.button>
                        {renderHeaderContent("Personalizado")}
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center px-6 gap-8">
                    <div className="text-center space-y-4">
                        <span className="text-6xl">🎯</span>
                        <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Tú pones las reglas</h3>
                        <p className="text-sm text-zinc-500 font-medium">¿Sobre qué tema quieres que te desafíe hoy?</p>
                    </div>

                    <div className="relative">
                        <input
                            autoFocus
                            type="text"
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmFocus()}
                            placeholder="Ej: Mitología Griega, IA, Formula 1..."
                            className="w-full p-6 rounded-[2rem] border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-lg font-bold focus:border-blue-500 outline-none transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <span className="text-xs font-bold text-zinc-300 dark:text-zinc-700 px-3 uppercase tracking-widest">Tema</span>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!customTopic.trim() || isFetching}
                        onClick={handleConfirmFocus}
                        className={cn(
                            "w-full p-6 rounded-[2rem] font-black text-lg transition-all shadow-xl shadow-blue-500/10",
                            customTopic.trim()
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                        )}
                    >
                        {isFetching ? "Preparando desafío..." : "EMPEZAR DESAFÍO"}
                    </motion.button>
                </div>
            </div>
        )
    }

    if (gameMode === null) {
        return (
            <div className="w-full max-w-lg mx-auto h-full flex flex-col pt-4">
                <div className="flex items-center justify-between mb-6 px-4 relative shrink-0">
                    <div className="flex items-center gap-4">
                        <motion.button
                            onClick={onBack}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 rounded-full flex items-center justify-center border transition-colors duration-200 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400"
                        >
                            <ChevronLeft size={24} strokeWidth={2.5} />
                        </motion.button>
                        {renderHeaderContent("Selecciona un modo")}
                    </div>
                </div>

                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.05,
                                delayChildren: 0.05
                            }
                        }
                    }}
                    className="flex flex-col px-4 gap-3 mt-6 md:mt-10 pb-20"
                >
                    <ModeCard
                        title="Chill"
                        icon="🌿"
                        description="Preguntas fáciles y relajantes."
                        onClick={() => handleStartMode('chill')}
                        colorTheme="green"
                        index={0}
                    />
                    <ModeCard
                        title="Random"
                        icon="🎲"
                        description="Una mezcla de todo."
                        onClick={() => handleStartMode('random')}
                        colorTheme="orange"
                        index={1}
                    />
                    <ModeCard
                        title="Experto"
                        icon="🧠"
                        description="Retos para mentes maestras."
                        onClick={() => handleStartMode('expert')}
                        colorTheme="purple"
                        index={2}
                    />
                    <ModeCard
                        title="Enfoque"
                        icon="🎯"
                        description="Elige el tema que tú quieras."
                        onClick={() => handleStartMode('focus')}
                        colorTheme="blue"
                        index={3}
                    />
                </motion.div>
            </div>
        )
    }

    const currentModeSubtitle =
        gameMode === 'chill' ? 'Chill' :
            gameMode === 'expert' ? 'Experto' :
                gameMode === 'random' ? 'Random' :
                    gameMode === 'focus' ? 'Enfoque' : 'General';

    return (
        <div className="w-full max-w-lg mx-auto h-full flex flex-col">
            <div className="flex items-center justify-between mb-8 px-4 relative shrink-0">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <motion.button
                            onClick={() => {
                                setGameMode(null)
                                setGameState('playing')
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 rounded-full flex items-center justify-center border transition-colors duration-200 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400"
                        >
                            <ChevronLeft size={24} strokeWidth={2.5} />
                        </motion.button>
                    )}
                    {renderHeaderContent(currentModeSubtitle)}
                    <div className="ml-auto">
                        <StreakBadge count={streak} />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-start md:justify-center overflow-y-auto no-scrollbar">
                <AnimatePresence mode="wait">
                    {gameState === 'loading' ? (
                        <motion.div
                            key="loading"
                            className="flex-1 flex flex-col items-center justify-center gap-6 p-6 transition-all duration-300"
                        >
                            <div className="relative w-16 h-16">
                                {[...Array(12)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute left-[30px] top-0 w-[5px] h-[16px] rounded-full bg-zinc-300 dark:bg-zinc-700 animate-pulse"
                                        style={{ 
                                            transformOrigin: '2.5px 32px', 
                                            rotate: `${i * 30}deg`,
                                            animationDelay: `${i * 0.1}s`
                                        }}
                                    />
                                ))}
                            </div>
                            <p className="text-base font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.25em] text-center">
                                Generando pregunta
                            </p>
                        </motion.div>
                    ) : gameState === 'error' ? (
                        <motion.div
                            key="error"
                            className="p-12 border rounded-3xl bg-zinc-900 border-zinc-800"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-red-500 font-medium">{errorMessage}</p>
                                <button
                                    onClick={() => fetchTrivia()}
                                    className="px-6 py-2 rounded-full font-bold text-sm bg-zinc-50 text-black"
                                >
                                    Reintentar
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className="flex flex-col w-full max-h-full p-4 md:p-8 border rounded-3xl bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden"
                        >
                            <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 mb-4 md:mb-6">
                                <h3 className={cn(
                                    "font-bold text-zinc-900 dark:text-zinc-50 leading-tight transition-all text-center md:text-left",
                                    (currentTrivia?.question.length || 0) > 150 ? "text-lg md:text-xl" :
                                        (currentTrivia?.question.length || 0) > 100 ? "text-xl md:text-2xl" :
                                            "text-2xl md:text-3xl"
                                )}>
                                    {currentTrivia?.question}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-2 md:gap-3 shrink-0">
                                {currentTrivia?.options.map((option, idx) => {
                                    const isCorrect = gameState === 'answered' && option === currentTrivia?.correctAnswer
                                    const isWrong = gameState === 'answered' && selectedAnswer === option && option !== currentTrivia?.correctAnswer

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(option)}
                                            disabled={gameState === 'answered'}
                                            className={cn(
                                                "group relative w-full p-4 md:p-5 text-left rounded-2xl font-bold transition-all border-2 overflow-hidden",
                                                gameState === 'playing' ? "hover:border-zinc-900 dark:hover:border-zinc-50" : "cursor-default",
                                                isCorrect ? "bg-green-500/10 border-green-500 text-green-600 dark:text-green-400" :
                                                isWrong ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400" :
                                                "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm tracking-tight">{option}</span>
                                                {gameState === 'playing' && (
                                                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-auto px-4 pt-4 pb-4 grid grid-cols-4 gap-3 shrink-0 w-full transition-opacity"
                style={{ opacity: gameState === 'answered' ? 1 : 0.5 }}
            >
                <motion.button
                    disabled={gameState !== 'answered'}
                    onClick={() => setShowContext(true)}
                    whileTap={{ scale: 0.95 }}
                    className="col-span-1 flex items-center justify-center py-4 rounded-2xl border-2 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400"
                >
                    <Pin size={22} />
                </motion.button>

                <motion.button
                    disabled={gameState !== 'answered'}
                    onClick={() => setShowFact(true)}
                    whileTap={{ scale: 0.95 }}
                    className="col-span-1 flex items-center justify-center py-4 rounded-2xl border-2 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400"
                >
                    <Lightbulb size={22} />
                </motion.button>

                <motion.button
                    disabled={gameState !== 'answered'}
                    onClick={() => fetchTrivia()}
                    whileTap={{ scale: 0.95 }}
                    className="col-span-2 flex items-center justify-center py-4 rounded-2xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black font-bold border-2 border-zinc-900 dark:border-zinc-50"
                >
                    <ArrowRight size={22} />
                </motion.button>
            </div>

            <GameModal
                isOpen={showContext}
                onClose={() => setShowContext(false)}
                title="Contexto"
                icon={<Pin size={20} />}
                content={currentTrivia?.explanation}
            />

            <GameModal
                isOpen={showFact}
                onClose={() => setShowFact(false)}
                title="Dato curioso"
                icon={<Lightbulb size={20} />}
                content={currentTrivia?.funFact}
            />
        </div>
    )
}

function StreakBadge({ count }: { count: number }) {
    if (count === 0) return null;

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={count}
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-orange-500/10 text-orange-500"
        >
            <Flame size={28} fill="currentColor" className="opacity-20 absolute" />
            <span className="relative z-10 text-lg font-black tracking-tighter mt-1">{count}</span>
        </motion.div>
    )
}

function ModeCard({ title, icon, description, onClick, colorTheme, index }: {
    title: string,
    icon: React.ReactNode | string,
    description: string,
    onClick: () => void,
    colorTheme: 'green' | 'purple' | 'orange' | 'blue',
    index: number
}) {
    const themeStyles = {
        green: { accent: "text-emerald-500", border: "group-hover:border-emerald-500/40" },
        purple: { accent: "text-violet-500", border: "group-hover:border-violet-500/40" },
        orange: { accent: "text-amber-500", border: "group-hover:border-amber-500/40" },
        blue: { accent: "text-sky-500", border: "group-hover:border-sky-500/40" }
    }
    const theme = themeStyles[colorTheme]

    return (
        <motion.button
            variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{ willChange: 'transform' }}
            className={cn(
                "group relative w-full p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors duration-200 text-left flex items-center gap-4",
                "shadow-md active:shadow-sm",
                theme.border
            )}
        >
            <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-3xl">
                {icon}
            </div>

            <div className="flex flex-col gap-0.5 flex-1">
                <h3 className={cn("text-lg font-bold tracking-tight", theme.accent)}>
                    {title}
                </h3>
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 leading-tight">
                    {description}
                </p>
            </div>

            <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors">
                <ArrowRight size={16} strokeWidth={2.5} />
            </div>
        </motion.button>
    )
}

function GameModal({ isOpen, onClose, title, icon, content }: {
    isOpen: boolean,
    onClose: () => void,
    title: string,
    icon: React.ReactNode,
    content?: string
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm p-6 rounded-[2rem] border shadow-2xl z-10"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}
                                >
                                    {icon}
                                </div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                style={{ color: 'var(--accent)' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                                {content || "Sin información disponible."}
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="w-full mt-8 py-4 rounded-2xl font-bold transition-all shadow-lg"
                            style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
                        >
                            Entendido
                        </motion.button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
