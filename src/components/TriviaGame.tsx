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
                <div className="absolute -inset-2 bg-blue-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border border-white/10 overflow-hidden bg-zinc-900/80 backdrop-blur-sm text-zinc-100">
                    <Gamepad2 size={24} strokeWidth={2.5} />
                </div>
            </div>
            <div className="flex flex-col items-start justify-center">
                <h2 className="text-2xl font-black tracking-tight text-white leading-none">
                    {gameMode === 'focus' ? 'Modo Enfoque' : 'Trivia General'}
                </h2>
                <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 leading-none">
                        {subtitle}
                    </p>
                </div>
            </div>
        </div>
    )

    if (isEnteringTopic) {
        return (
            <div className="w-full max-w-2xl mx-auto h-full flex flex-col pt-12">
                <div className="flex items-center justify-between mb-10 px-6 relative shrink-0">
                    <div className="flex items-center gap-4">
                        <motion.button
                            onClick={() => setIsEnteringTopic(false)}
                            whileHover={{ scale: 1.1, x: -2 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-zinc-200 dark:border-zinc-800 bg-white/5 dark:bg-black/20 text-zinc-900 dark:text-zinc-50 backdrop-blur-md"
                        >
                            <ChevronLeft size={24} strokeWidth={2.5} />
                        </motion.button>
                        {renderHeaderContent("Personalizado")}
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center px-8 gap-8">
                    <div className="text-center space-y-4">
                        <span className="text-6xl drop-shadow-2xl flex justify-center">🎯</span>
                        <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Tú pones las reglas</h3>
                        <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">¿Sobre qué desafío quieres hoy?</p>
                    </div>

                    <div className="relative">
                        <input
                            autoFocus
                            type="text"
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmFocus()}
                            placeholder="Ej: Mitología Griega, IA, Formula 1..."
                            className="w-full p-8 rounded-[3rem] border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xl font-bold focus:border-blue-500 outline-none transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-800 shadow-inner"
                        />
                        <div className="absolute right-8 top-1/2 -translate-y-1/2">
                            <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.3em]">Tema</span>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!customTopic.trim() || isFetching}
                        onClick={handleConfirmFocus}
                        className={cn(
                            "w-full p-8 rounded-[3rem] font-black text-xl transition-all shadow-2xl overflow-hidden relative",
                            customTopic.trim()
                                ? "bg-zinc-950 text-white shadow-blue-500/20"
                                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed"
                        )}
                    >
                        {isFetching ? "Preparando..." : "COMENZAR"}
                    </motion.button>
                </div>
            </div>
        )
    }

    if (gameMode === null) {
        return (
            <div className="w-full max-w-2xl mx-auto h-full flex flex-col pt-12 md:pt-16 pb-12">
                <div className="flex items-center justify-between mb-10 px-6 relative shrink-0">
                    <div className="flex items-center gap-4">
                        <motion.button
                            onClick={onBack}
                            whileHover={{ scale: 1.1, x: -2 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-zinc-200 dark:border-zinc-800 bg-white/5 dark:bg-black/20 text-zinc-900 dark:text-zinc-50 backdrop-blur-md"
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
                        hidden: { opacity: 0, y: 30 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                staggerChildren: 0.1,
                                delayChildren: 0.3
                            }
                        }
                    }}
                    className="flex flex-col px-4 gap-4 overflow-y-auto no-scrollbar"
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
        <div className="w-full max-w-2xl mx-auto h-full flex flex-col pt-12 md:pt-16">
            {/* Header & Streak */}
            <div className="flex items-center justify-between mb-8 px-6 relative shrink-0">
                <div className="flex items-center gap-4 w-full">
                    {onBack && (
                        <motion.button
                            onClick={() => {
                                setGameMode(null)
                                setGameState('playing')
                            }}
                            whileHover={{ scale: 1.1, x: -2 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-zinc-200 dark:border-zinc-800 bg-white/5 dark:bg-black/20 text-zinc-900 dark:text-zinc-50 backdrop-blur-md"
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
            <div className="flex-1 flex flex-col justify-start md:justify-center overflow-y-auto no-scrollbar px-4">
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
                                        className="absolute left-[30px] top-0 w-[5px] h-[16px] rounded-full bg-zinc-400 dark:bg-zinc-600"
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
                            <p className="text-base font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.25em] text-center">
                                Generando pregunta
                            </p>
                        </motion.div>
                    ) : gameState === 'error' ? (
                        <motion.div
                            key="error"
                            className="p-12 border-2 rounded-[3.5rem] transition-colors duration-500 bg-zinc-950/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="flex flex-col items-center gap-6">
                                <span className="text-4xl text-red-500">❌</span>
                                <p className="text-red-500 font-bold text-center">{errorMessage}</p>
                                <button
                                    onClick={() => fetchTrivia()}
                                    className="px-8 py-3 rounded-2xl font-black text-sm bg-zinc-950 text-white hover:scale-105 transition-all"
                                >
                                    REINTENTAR
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col w-full max-h-full p-8 md:p-10 border-2 rounded-[3.5rem] shadow-2xl transition-colors duration-500 overflow-hidden bg-zinc-950/50 dark:bg-zinc-950/50 border-white/5"
                        >
                            {/* Question with dynamic font size */}
                            <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 mb-8 md:mb-10">
                                <h3 className={cn(
                                    "font-black text-zinc-900 dark:text-zinc-100 leading-tight transition-all text-center md:text-left",
                                    (currentTrivia?.question.length || 0) > 150 ? "text-xl md:text-2xl" :
                                        (currentTrivia?.question.length || 0) > 100 ? "text-2xl md:text-3xl" :
                                            "text-3xl md:text-4xl"
                                )}>
                                    {currentTrivia?.question}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-3 shrink-0">
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
                                                "group relative w-full p-5 md:p-6 text-left rounded-[2rem] font-bold transition-all border-2 overflow-hidden",
                                                gameState === 'playing'
                                                    ? "hover:border-zinc-900 dark:hover:border-zinc-100 hover:scale-[1.02]"
                                                    : "cursor-default"
                                            )}
                                            style={{
                                                backgroundColor: isCorrect
                                                    ? 'rgba(16, 185, 129, 0.1)'
                                                    : isWrong
                                                        ? 'rgba(239, 68, 68, 0.1)'
                                                        : 'rgba(255, 255, 255, 0.02)',
                                                borderColor: isCorrect
                                                    ? '#10b981'
                                                    : isWrong
                                                        ? '#ef4444'
                                                        : 'rgba(255, 255, 255, 0.05)'
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={cn(
                                                    "text-base md:text-lg tracking-tight transition-colors",
                                                    isCorrect ? "text-emerald-400" :
                                                        isWrong ? "text-red-400" :
                                                            "text-zinc-300"
                                                )}>
                                                    {option}
                                                </span>
                                                <ArrowRight
                                                    size={18}
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

            {/* Selector de Acción Inferior */}
            <div className="mt-auto px-4 pt-4 pb-8 grid grid-cols-4 gap-3 shrink-0 w-full transition-opacity"
                style={{ opacity: gameState === 'answered' ? 1 : 0.5 }}
            >
                <motion.button
                    disabled={gameState !== 'answered'}
                    onClick={() => setShowContext(true)}
                    whileHover={{ scale: gameState === 'answered' ? 1.05 : 1 }}
                    whileTap={{ scale: gameState === 'answered' ? 0.95 : 1 }}
                    className="col-span-1 flex items-center justify-center py-5 rounded-[2rem] transition-all border-2 border-white/5 bg-zinc-900/50 text-zinc-300"
                >
                    <Pin size={22} />
                </motion.button>

                <motion.button
                    disabled={gameState !== 'answered'}
                    onClick={() => setShowFact(true)}
                    whileHover={{ scale: gameState === 'answered' ? 1.05 : 1 }}
                    whileTap={{ scale: gameState === 'answered' ? 0.95 : 1 }}
                    className="col-span-1 flex items-center justify-center py-5 rounded-[2rem] transition-all border-2 border-white/5 bg-zinc-900/50 text-zinc-300"
                >
                    <Lightbulb size={22} />
                </motion.button>

                <motion.button
                    disabled={gameState !== 'answered'}
                    onClick={() => fetchTrivia()}
                    whileHover={{ scale: gameState === 'answered' ? 1.02 : 1 }}
                    whileTap={{ scale: gameState === 'answered' ? 0.98 : 1 }}
                    className="col-span-2 flex items-center justify-center py-5 rounded-[2rem] transition-all border-2 border-zinc-100 bg-white dark:bg-zinc-50 dark:border-zinc-50 text-zinc-950 font-black"
                >
                    SIGUIENTE
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
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20"
        >
            <Flame size={20} fill="currentColor" />
            <span className="text-sm font-black italic">
                {count}
            </span>
        </motion.div>
    )
}

// Sub-componente para las tarjetas de modo
function ModeCard({ title, icon, description, onClick, colorTheme, index }: {
    title: string,
    icon: React.ReactNode | string,
    description: string,
    onClick: () => void,
    colorTheme: 'green' | 'purple' | 'orange' | 'blue',
    index?: number
}) {
    return (
        <motion.button
            variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
            }}
            whileHover={{ y: -4, scale: 1.005 }}
            whileTap={{ scale: 0.985 }}
            onClick={onClick}
            className={cn(
                "relative group w-full text-left p-8 transition-all duration-500",
                "rounded-[3.2rem] border-2 border-white/5 bg-zinc-950 shadow-2xl"
            )}
        >
            <div className="relative z-10 flex items-center gap-8">
                {/* Large Icon Container */}
                <div className="w-16 h-16 shrink-0 flex items-center justify-center text-5xl drop-shadow-xl group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>

                {/* Text Content */}
                <div className="flex-1">
                    <h3 className={cn(
                        "text-3xl font-black mb-2 transition-all duration-500 tracking-tight",
                        colorTheme === 'green' ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                        colorTheme === 'orange' ? 'text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.3)]' :
                        colorTheme === 'purple' ? 'text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 
                        'text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    )}>
                        {title}
                    </h3>
                    <p className="text-base text-zinc-500 dark:text-zinc-500 font-medium leading-tight max-w-[200px]">
                        {description}
                    </p>
                </div>

                {/* Primary Action Button (The Circle in the image) */}
                <div className="w-14 h-14 rounded-full bg-zinc-900/80 border border-white/10 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:border-white/20 transition-all duration-300 shadow-xl">
                    <ArrowRight size={24} />
                </div>
            </div>
            
            {/* Subtle Inner Glow */}
            <div className="absolute inset-x-12 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
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
                        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        className="relative w-full max-w-sm p-8 rounded-[3.5rem] border-2 border-white/10 shadow-2xl z-10 bg-zinc-950"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-[1.5rem] flex items-center justify-center bg-zinc-900 text-white border border-white/10"
                                >
                                    {icon}
                                </div>
                                <h2 className="text-2xl font-black text-white">{title}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-zinc-800 text-zinc-500"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-zinc-400 text-lg leading-relaxed font-bold">
                                {content || "Sin información disponible."}
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="w-full mt-10 py-5 rounded-[2rem] font-black text-lg bg-white text-zinc-950 shadow-xl"
                        >
                            ENTENDIDO
                        </motion.button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
