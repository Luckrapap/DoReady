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
        <div className="flex items-center gap-5">
            <div className="relative">
                {/* External soft blue glow behind the icon */}
                <div className="absolute -inset-2 bg-blue-500/20 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 bg-[#e2e8f0] text-zinc-900 shadow-2xl">
                    <Gamepad2 size={28} strokeWidth={2.5} />
                </div>
            </div>
            <div className="flex flex-col items-start justify-center">
                <h2 className="text-3xl font-black tracking-tight text-white leading-none">
                    {gameMode === 'focus' ? 'Modo Enfoque' : 'Trivia General'}
                </h2>
                <div className="flex items-center gap-1.5 mt-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 leading-none">
                        {subtitle}
                    </p>
                </div>
            </div>
        </div>
    )

    if (isEnteringTopic) {
        return (
            <div className="w-full max-w-2xl mx-auto h-full flex flex-col pt-16">
                <div className="flex items-center justify-between mb-12 px-8 relative shrink-0">
                    <div className="flex items-center gap-5">
                        <motion.button
                            onClick={() => setIsEnteringTopic(false)}
                            whileHover={{ scale: 1.1, x: -2 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-12 h-12 rounded-full flex items-center justify-center border border-white/5 bg-[#18181b] text-zinc-400"
                        >
                            <ChevronLeft size={28} strokeWidth={2.5} />
                        </motion.button>
                        {renderHeaderContent("Personalizado")}
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center px-10 gap-10">
                    <div className="text-center space-y-6">
                        <span className="text-8xl flex justify-center">🎯</span>
                        <h3 className="text-3xl font-black tracking-tight text-white">Tú pones las reglas</h3>
                        <p className="text-sm text-zinc-500 font-black uppercase tracking-[0.4em]">¿Qué tema desafiamos hoy?</p>
                    </div>

                    <div className="relative">
                        <input
                            autoFocus
                            type="text"
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmFocus()}
                            placeholder="Ej: Mitología Griega, IA, Formula 1..."
                            className="w-full p-10 rounded-[3.5rem] border border-white/5 bg-[#111114] text-2xl font-bold focus:border-white/20 outline-none transition-all placeholder:text-zinc-800 text-white shadow-2xl"
                        />
                        <div className="absolute right-10 top-1/2 -translate-y-1/2">
                            <span className="text-xs font-black text-zinc-800 uppercase tracking-[0.4em]">Tema</span>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!customTopic.trim() || isFetching}
                        onClick={handleConfirmFocus}
                        className={cn(
                            "w-full p-8 rounded-[3.5rem] font-black text-xl transition-all",
                            customTopic.trim()
                                ? "bg-white text-zinc-950"
                                : "bg-zinc-900 text-zinc-700 cursor-not-allowed"
                        )}
                    >
                        {isFetching ? "PREPARANDO..." : "EMPEZAR"}
                    </motion.button>
                </div>
            </div>
        )
    }

    if (gameMode === null) {
        return (
            <div className="w-full max-w-2xl mx-auto h-full flex flex-col pt-16 pb-12 overflow-hidden">
                <div className="flex items-center justify-between mb-12 px-8 relative shrink-0">
                    <div className="flex items-center gap-5">
                        <motion.button
                            onClick={onBack}
                            whileHover={{ scale: 1.1, x: -2 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-12 h-12 rounded-full flex items-center justify-center border border-white/5 bg-[#18181b] text-zinc-400 shadow-xl"
                        >
                            <ChevronLeft size={28} strokeWidth={2.5} />
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
                                staggerChildren: 0.1,
                                delayChildren: 0.2
                            }
                        }
                    }}
                    className="flex-1 flex flex-col px-4 gap-5 overflow-hidden"
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
        <div className="w-full max-w-2xl mx-auto h-full flex flex-col pt-16">
            {/* Header & Streak */}
            <div className="flex items-center justify-between mb-10 px-8 relative shrink-0">
                <div className="flex items-center gap-5 w-full">
                    {onBack && (
                        <motion.button
                            onClick={() => {
                                setGameMode(null)
                                setGameState('playing')
                            }}
                            whileHover={{ scale: 1.1, x: -2 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-12 h-12 rounded-full flex items-center justify-center border border-white/5 bg-[#18181b] text-zinc-400"
                        >
                            <ChevronLeft size={28} strokeWidth={2.5} />
                        </motion.button>
                    )}
                    {renderHeaderContent(currentModeSubtitle)}

                    <div className="ml-auto">
                        <StreakBadge count={streak} />
                    </div>
                </div>

            </div>

            {/* Game Content Area */}
            <div className="flex-1 flex flex-col justify-start md:justify-center overflow-y-auto no-scrollbar px-5">
                <AnimatePresence mode="wait">
                    {gameState === 'loading' ? (
                        <motion.div
                            key="loading"
                            className="flex-1 flex flex-col items-center justify-center gap-8 p-10 transition-all duration-500"
                        >
                            <div className="relative w-20 h-20">
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute left-[38px] top-0 w-[4px] h-[20px] rounded-full bg-zinc-700"
                                        style={{ transformOrigin: '2px 40px', rotate: i * 30 }}
                                        animate={{ opacity: [0.1, 1, 0.1] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1.2,
                                            delay: i * 0.1,
                                            ease: "linear"
                                        }}
                                    />
                                ))}
                            </div>
                            <p className="text-sm font-black text-zinc-600 uppercase tracking-[0.4em] text-center">
                                Generando pregunta
                            </p>
                        </motion.div>
                    ) : gameState === 'error' ? (
                        <motion.div
                            key="error"
                            className="p-16 border border-white/5 rounded-[4rem] bg-[#111114]"
                        >
                            <div className="flex flex-col items-center gap-8">
                                <span className="text-6xl flex justify-center">❌</span>
                                <p className="text-red-500 font-black text-center text-xl">{errorMessage}</p>
                                <button
                                    onClick={() => fetchTrivia()}
                                    className="px-10 py-4 rounded-[2rem] font-black text-base bg-white text-zinc-950 hover:scale-105 transition-all"
                                >
                                    REINTENTAR
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col w-full max-h-full p-10 border border-white/5 rounded-[3.5rem] bg-[#111114] shadow-2xl overflow-hidden"
                        >
                            {/* Question with dynamic font size */}
                            <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 mb-10">
                                <h3 className={cn(
                                    "font-black text-white leading-tight transition-all text-center md:text-left",
                                    (currentTrivia?.question.length || 0) > 150 ? "text-2xl" :
                                        (currentTrivia?.question.length || 0) > 100 ? "text-3xl" :
                                            "text-4xl"
                                )}>
                                    {currentTrivia?.question}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4 shrink-0">
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
                                                "group relative w-full p-6 text-left rounded-[2.5rem] font-black transition-all border border-white/5 overflow-hidden",
                                                gameState === 'playing'
                                                    ? "hover:bg-white/5 hover:scale-[1.02]"
                                                    : "cursor-default"
                                            )}
                                            style={{
                                                backgroundColor: isCorrect
                                                    ? 'rgba(16, 185, 129, 0.15)'
                                                    : isWrong
                                                        ? 'rgba(239, 68, 68, 0.15)'
                                                        : 'rgba(255, 255, 255, 0.02)',
                                                borderColor: isCorrect
                                                    ? '#10b981'
                                                    : isWrong
                                                        ? '#ef4444'
                                                        : 'rgba(255, 255, 255, 0.05)'
                                            }}
                                        >
                                            <div className="flex items-center justify-between px-2">
                                                <span className={cn(
                                                    "text-lg transition-colors",
                                                    isCorrect ? "text-emerald-400" :
                                                        isWrong ? "text-red-400" :
                                                            "text-zinc-400"
                                                )}>
                                                    {option}
                                                </span>
                                                <ArrowRight
                                                    size={22}
                                                    className={cn(
                                                        "transition-all text-zinc-700",
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
            <div className="mt-auto px-6 pt-6 pb-12 grid grid-cols-4 gap-4 shrink-0 w-full transition-opacity"
                style={{ opacity: gameState === 'answered' ? 1 : 0.5 }}
            >
                <motion.button
                    disabled={gameState !== 'answered'}
                    onClick={() => setShowContext(true)}
                    whileHover={{ scale: gameState === 'answered' ? 1.05 : 1 }}
                    whileTap={{ scale: gameState === 'answered' ? 0.95 : 1 }}
                    className="col-span-1 flex items-center justify-center py-6 rounded-[2.5rem] border border-white/5 bg-[#111114] text-zinc-500"
                >
                    <Pin size={28} />
                </motion.button>

                <motion.button
                    disabled={gameState !== 'answered'}
                    onClick={() => setShowFact(true)}
                    whileHover={{ scale: gameState === 'answered' ? 1.05 : 1 }}
                    whileTap={{ scale: gameState === 'answered' ? 0.95 : 1 }}
                    className="col-span-1 flex items-center justify-center py-6 rounded-[2.5rem] border border-white/5 bg-[#111114] text-zinc-500"
                >
                    <Lightbulb size={28} />
                </motion.button>

                <motion.button
                    disabled={gameState !== 'answered'}
                    onClick={() => fetchTrivia()}
                    whileHover={{ scale: gameState === 'answered' ? 1.02 : 1 }}
                    whileTap={{ scale: gameState === 'answered' ? 0.98 : 1 }}
                    className="col-span-2 flex items-center justify-center py-6 rounded-[2.5rem] bg-white text-zinc-950 font-black text-xl"
                >
                    SIGUIENTE
                </motion.button>
            </div>

            {/* Modales de Información */}
            <GameModal
                isOpen={showContext}
                onClose={() => setShowContext(false)}
                title="Contexto"
                icon={<Pin size={24} />}
                content={currentTrivia?.explanation}
            />

            <GameModal
                isOpen={showFact}
                onClose={() => setShowFact(false)}
                title="Dato curioso"
                icon={<Lightbulb size={24} />}
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
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20 shadow-xl"
        >
            <Flame size={24} fill="currentColor" />
            <span className="text-base font-black italic">
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
                hidden: { opacity: 0, x: -10 },
                visible: { opacity: 1, x: 0 }
            }}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onClick={onClick}
            className={cn(
                "relative group w-full text-left p-9 transition-all duration-300",
                "rounded-[3.5rem] border border-white/5 bg-[#111114]"
            )}
        >
            <div className="relative z-10 flex items-center gap-10">
                {/* Large Icon Box - Flat as requested */}
                <div className="w-20 h-20 shrink-0 flex items-center justify-center text-7xl drop-shadow-md select-none">
                    {icon}
                </div>

                {/* Text Content */}
                <div className="flex-1 flex flex-col justify-center">
                    <h3 className={cn(
                        "text-2xl font-black mb-1.5 transition-colors tracking-tight",
                        colorTheme === 'green' ? 'text-emerald-400' :
                        colorTheme === 'orange' ? 'text-orange-400' :
                        colorTheme === 'purple' ? 'text-purple-400' : 
                        'text-blue-400'
                    )}>
                        {title}
                    </h3>
                    <p className="text-sm text-zinc-500 font-bold leading-tight max-w-[220px]">
                        {description}
                    </p>
                </div>

                {/* Circular Arrow Button on the right - Solid as requested */}
                <div className="w-16 h-16 rounded-full bg-[#1c1c1e] border border-white/5 flex items-center justify-center text-zinc-600 transition-all duration-300 group-hover:text-zinc-100 shadow-xl">
                    <ArrowRight size={28} />
                </div>
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
                        className="absolute inset-0 bg-black/70 backdrop-blur-3xl"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 40 }}
                        className="relative w-full max-w-md p-10 rounded-[4rem] border border-white/10 shadow-2xl z-10 bg-[#0c0c0e]"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-3xl flex items-center justify-center bg-[#111114] text-white border border-white/5 shadow-xl"
                                >
                                    {icon}
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tight">{title}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 rounded-full flex items-center justify-center transition-colors hover:bg-zinc-900 text-zinc-600"
                            >
                                <X size={28} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <p className="text-zinc-400 text-xl leading-relaxed font-bold">
                                {content || "Sin información disponible."}
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="w-full mt-12 py-6 rounded-[2.5rem] font-black text-xl bg-white text-zinc-950 shadow-2xl"
                        >
                            ENTENDIDO
                        </motion.button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
