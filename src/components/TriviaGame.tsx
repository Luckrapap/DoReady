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
            <div className="w-full max-w-2xl mx-auto h-full flex flex-col">
                <div className="flex items-center justify-between mb-8 px-4 relative shrink-0">
                    <div className="flex items-center gap-4">
                        <motion.button
                            onClick={onBack}
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
                                staggerChildren: 0.12,
                                delayChildren: 0.2
                            }
                        }
                    }}
                    className="flex flex-col px-4 gap-4 mt-12 md:mt-20 pb-20"
                >
                    <ModeCard
                        title="Chill"
                        icon="🌿"
                        description="Preguntas fáciles y relajantes para pasar el rato."
                        onClick={() => handleStartMode('chill')}
                        colorTheme="green"
                        index={0}
                    />
                    <ModeCard
                        title="Random"
                        icon="🎲"
                        description="Una mezcla de todo; nunca sabes qué vendrá."
                        onClick={() => handleStartMode('random')}
                        colorTheme="orange"
                        index={1}
                    />
                    <ModeCard
                        title="Experto"
                        icon="🧠"
                        description="Retos difíciles solo para mentes maestras."
                        onClick={() => handleStartMode('expert')}
                        colorTheme="purple"
                        index={2}
                    />
                    <ModeCard
                        title="Enfoque"
                        icon="🎯"
                        description="Elige el tema que tú quieras y yo te pregunto."
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
        <div className="w-full max-w-2xl mx-auto h-full flex flex-col">
            {/* Header & Streak */}
            <div className="flex items-center justify-between mb-8 px-4 relative shrink-0">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <motion.button
                            onClick={() => {
                                setGameMode(null)
                                setGameState('playing') // Reset gameState to ensure clean return
                            }}
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
                    )}
                    {renderHeaderContent(currentModeSubtitle)}

                    <div className="ml-auto">
                        <StreakBadge count={streak} />
                    </div>
                </div>

            </div>

            {/* Game Content Area */}
            <div className="flex-1 flex flex-col justify-start md:justify-center overflow-y-auto no-scrollbar">
                <AnimatePresence mode="wait">
                    {gameState === 'loading' ? (
                        <motion.div
                            key="loading"
                            className="flex-1 flex flex-col items-center justify-center gap-6 p-6 transition-all duration-500"
                        >
                            <div className="relative w-16 h-16">
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute left-[30px] top-0 w-[5px] h-[16px] rounded-full bg-zinc-400 dark:bg-zinc-500"
                                        style={{ transformOrigin: '2.5px 32px', rotate: i * 30 }}
                                        animate={{ opacity: [0.15, 1, 0.15] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1.2,
                                            delay: i * 0.1,
                                            ease: "linear"
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
                            className="flex flex-col w-full max-h-full p-4 md:p-8 border rounded-[2rem] md:rounded-[2.5rem] shadow-xl md:shadow-2xl transition-colors duration-500 overflow-hidden"
                            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                        >
                            {/* Question with dynamic font size */}
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
                                    const isSelected = selectedAnswer === option
                                    const isCorrect = gameState === 'answered' && option === currentTrivia?.correctAnswer
                                    const isWrong = gameState === 'answered' && isSelected && option !== currentTrivia?.correctAnswer

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(option)}
                                            disabled={gameState === 'answered'}
                                            className={cn(
                                                "group relative w-full p-4 md:p-5 text-left rounded-2xl font-bold transition-all border-2 overflow-hidden",
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Selector de Acción Inferior (Independiente y Permanente) */}
            <div className="mt-auto px-4 pt-0 pb-4 grid grid-cols-4 gap-3 shrink-0 w-full transition-opacity"
                style={{ opacity: gameState === 'answered' ? 1 : 0.5 }}
            >
                <motion.button
                    disabled={gameState !== 'answered'}
                    onClick={() => setShowContext(true)}
                    whileHover={{ scale: gameState === 'answered' ? 1.05 : 1 }}
                    whileTap={{ scale: gameState === 'answered' ? 0.95 : 1 }}
                    className="col-span-1 flex items-center justify-center py-4 rounded-2xl transition-all border-2 shadow-sm"
                    style={{
                        backgroundColor: 'color-mix(in srgb, var(--surface) 95%, var(--accent))',
                        borderColor: 'var(--border)',
                        color: 'var(--accent)'
                    }}
                >
                    <Pin size={22} />
                </motion.button>

                <motion.button
                    disabled={gameState !== 'answered'}
                    onClick={() => setShowFact(true)}
                    whileHover={{ scale: gameState === 'answered' ? 1.05 : 1 }}
                    whileTap={{ scale: gameState === 'answered' ? 0.95 : 1 }}
                    className="col-span-1 flex items-center justify-center py-4 rounded-2xl transition-all border-2 shadow-sm"
                    style={{
                        backgroundColor: 'color-mix(in srgb, var(--surface) 95%, var(--accent))',
                        borderColor: 'var(--border)',
                        color: 'var(--accent)'
                    }}
                >
                    <Lightbulb size={22} />
                </motion.button>

                <motion.button
                    disabled={gameState !== 'answered'}
                    onClick={() => fetchTrivia()}
                    whileHover={{ scale: gameState === 'answered' ? 1.02 : 1 }}
                    whileTap={{ scale: gameState === 'answered' ? 0.98 : 1 }}
                    className="col-span-2 flex items-center justify-center py-4 rounded-2xl transition-all border-2 shadow-sm"
                    style={{
                        backgroundColor: 'color-mix(in srgb, var(--surface) 95%, var(--accent))',
                        borderColor: 'var(--border)',
                        color: 'var(--accent)'
                    }}
                >
                    <ArrowRight size={22} />
                </motion.button>
            </div>

            {/* Modales de Información */}
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

// Sub-componente para la Racha (Fuego)
function StreakBadge({ count }: { count: number }) {
    if (count === 0) return null;

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={count}
            className="relative flex items-center justify-center w-14 h-14 rounded-full transition-transform active:scale-95"
            style={{
                backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                color: 'var(--accent)'
            }}
        >
            <Flame size={28} fill="currentColor" className="opacity-20 absolute" />
            <span className="relative z-10 text-lg font-black tracking-tighter leading-none mt-1">
                {count}
            </span>
        </motion.div>
    )
}

// Sub-componente para las tarjetas de modo
// Sub-componente para las tarjetas de modo
function ModeCard({ title, icon, description, onClick, colorTheme }: {
    title: string,
    icon: React.ReactNode | string,
    description: string,
    onClick: () => void,
    colorTheme: 'green' | 'purple' | 'orange' | 'blue'
}) {
    const themeStyles = {
        green: { 
            accent: "text-emerald-400", 
            glow: "bg-emerald-500/10",
            leftBorder: "border-l-emerald-500"
        },
        purple: { 
            accent: "text-violet-400", 
            glow: "bg-violet-500/10",
            leftBorder: "border-l-violet-500"
        },
        orange: { 
            accent: "text-amber-400", 
            glow: "bg-orange-500/10",
            leftBorder: "border-l-orange-500"
        },
        blue: { 
            accent: "text-sky-400", 
            glow: "bg-sky-500/10",
            leftBorder: "border-l-sky-500"
        }
    }
    const theme = themeStyles[colorTheme]

    return (
        <motion.button
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "group relative w-full p-6 rounded-[1.5rem] bg-zinc-900 transition-all duration-200 text-left flex items-center gap-6 overflow-hidden",
                "border border-zinc-700 shadow-2xl",
                "border-l-[8px]",
                theme.leftBorder,
                "active:bg-zinc-800 hover:border-zinc-500"
            )}
        >
            {/* Left Icon (Solid container) */}
            <div className="relative shrink-0 flex items-center justify-center w-14 h-14 bg-zinc-800 rounded-2xl border border-zinc-700 group-hover:border-zinc-500 transition-all">
                <span className="relative z-10 text-4xl drop-shadow-lg scale-100 group-hover:scale-110 transition-transform">
                    {icon}
                </span>
            </div>

            {/* Solid Text Hierarchy */}
            <div className="relative z-10 flex flex-col items-start gap-1 flex-1">
                <h3 className={cn("text-xl font-black uppercase tracking-wider transition-colors", theme.accent)}>
                    {title}
                </h3>
                <p className="text-sm font-bold text-zinc-400 leading-tight tracking-wide max-w-[95%]">
                    {description}
                </p>
            </div>

            {/* Permanent Action Indicator */}
            <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center bg-zinc-800 border border-zinc-700 text-zinc-400 group-hover:text-white group-hover:border-zinc-500 transition-all">
                <ArrowRight size={20} strokeWidth={3} />
            </div>
        </motion.button>
    )
}

// Sub-componente para Modales de Información
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
