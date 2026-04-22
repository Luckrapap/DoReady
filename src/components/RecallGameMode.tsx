'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ArrowRight, X, Gamepad2 } from 'lucide-react'
import { cn } from '@/utils/utils'

interface CardData {
    id: number
    icon: string
    isFlipped: boolean
    isMatched: boolean
    hasExclamation: boolean // '!' marker
}

interface RecallGameProps {
    mode: 'classic' | 'chill'
    onBack?: () => void
}

const EMOJIS = ['🍎', '🍌', '🍇', '🍊', '🍓', '🔑', '⚡']

function getRoundConfig(round: number, mode: 'classic' | 'chill') {
    const pairsCount = round <= 4 ? 3 : round <= 8 ? 4 : round <= 12 ? 5 : round <= 16 ? 6 : 7
    const grid = round <= 4 ? [3, 3] : round <= 8 ? [2, 4, 2] : round <= 12 ? [3, 4, 3] : round <= 16 ? [2, 4, 4, 2] : [3, 4, 4, 3]
    
    // Time logic
    // Classic: 15, 20, 25, 30, 35
    // Chill: 20, 25, 30, 35, 40
    const baseTime = mode === 'chill' ? 20 : 15
    const time = baseTime + (Math.floor((round - 1) / 4) * 5)
    
    return { time, pairs: pairsCount, grid }
}

function generateDeck(pairsCount: number): CardData[] {
    const activeEmojis = EMOJIS.slice(0, pairsCount)
    let deck = [...activeEmojis, ...activeEmojis]
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }
    
    return deck.map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false,
        hasExclamation: false
    }))
}

export default function RecallGameMode({ mode, onBack }: RecallGameProps) {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'round_completed' | 'game_over' | 'victory'>('idle')
    const [round, setRound] = useState(1)
    const [timeLeft, setTimeLeft] = useState(0)
    const [cards, setCards] = useState<CardData[]>([])
    const [flippedIndices, setFlippedIndices] = useState<number[]>([])

    // Config derived from mode
    const penaltySeconds = mode === 'chill' ? 3 : 5
    const modeTitle = mode === 'chill' ? 'Chill' : 'Clásico'
    const accentColor = mode === 'chill' ? 'var(--green-500, #22c55e)' : 'var(--accent)'

    // Initialize round
    const startRound = useCallback((r: number) => {
        const config = getRoundConfig(r, mode)
        setTimeLeft(config.time)
        setCards(generateDeck(config.pairs))
        setFlippedIndices([])
        setRound(r)
        setGameState('playing')
    }, [mode])

    const audioRefs = React.useRef<HTMLAudioElement[]>([])
    const correctAudioRef = React.useRef<HTMLAudioElement | null>(null)
    const incorrectAudioRef = React.useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        // Preload sounds for instant playback without network/decoding delay
        audioRefs.current = [1, 2, 3, 4].map(idx => {
            const a = new Audio(`/card-place-${idx}.ogg`)
            a.volume = 0.6
            a.preload = 'auto'
            return a
        })

        const correctAudio = new Audio('/correct.mp3')
        correctAudio.volume = 0.6
        correctAudio.preload = 'auto'
        correctAudioRef.current = correctAudio

        const incorrectAudio = new Audio('/incorrect.mp3')
        incorrectAudio.volume = 0.6
        incorrectAudio.preload = 'auto'
        incorrectAudioRef.current = incorrectAudio
    }, [])

    const playCardFlipSound = useCallback(() => {
        if (audioRefs.current.length === 0) return
        const index = Math.floor(Math.random() * 4)
        const audio = audioRefs.current[index]
        audio.currentTime = 0 
        audio.play().catch(e => console.error("Audio playback failed:", e))
    }, [])

    const playCorrectSound = useCallback(() => {
        if (!correctAudioRef.current) return
        correctAudioRef.current.currentTime = 0
        correctAudioRef.current.play().catch(e => console.error("Audio playback failed:", e))
    }, [])

    const playIncorrectSound = useCallback(() => {
        if (!incorrectAudioRef.current) return
        incorrectAudioRef.current.currentTime = 0
        incorrectAudioRef.current.play().catch(e => console.error("Audio playback failed:", e))
    }, [])

    useEffect(() => {
        if (gameState === 'idle') {
            startRound(1)
        }
    }, [gameState, startRound])

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    setGameState('game_over')
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [gameState])

    // Handle Card Click
    const handleCardClick = (index: number) => {
        if (gameState !== 'playing') return
        if (cards[index].isMatched || cards[index].isFlipped) return

        if (flippedIndices.length === 1) {
            const firstIdx = flippedIndices[0]
            const secondIdx = index
            const isMatch = cards[firstIdx].icon === cards[secondIdx].icon
            
            if (isMatch) {
                playCorrectSound()
            } else {
                const hasPenalty = cards[firstIdx].hasExclamation || cards[secondIdx].hasExclamation
                if (hasPenalty) {
                    playIncorrectSound()
                    setTimeLeft(t => Math.max(0, t - penaltySeconds))
                }
            }
        }

        setCards(prevCards => {
            const newCards = [...prevCards]
            if (flippedIndices.length === 2) {
                const [firstIdx, secondIdx] = flippedIndices
                newCards[firstIdx] = { ...newCards[firstIdx], isFlipped: false, hasExclamation: true }
                newCards[secondIdx] = { ...newCards[secondIdx], isFlipped: false, hasExclamation: true }
                newCards[index] = { ...newCards[index], isFlipped: true }
                setFlippedIndices([index])
                return newCards
            }

            newCards[index] = { ...newCards[index], isFlipped: true }
            const newFlipped = [...flippedIndices, index]
            setFlippedIndices(newFlipped)

            if (newFlipped.length === 2) {
                const [firstIdx, secondIdx] = newFlipped
                const match = newCards[firstIdx].icon === newCards[secondIdx].icon
                if (match) {
                    newCards[firstIdx].isMatched = true
                    newCards[secondIdx].isMatched = true
                    setFlippedIndices([])
                }
            }
            return newCards
        })
    }

    useEffect(() => {
        if (gameState === 'playing' && cards.length > 0) {
            if (cards.every(c => c.isMatched)) {
                setGameState('round_completed')
            }
            if (timeLeft <= 0) {
                setGameState('game_over')
            }
        }
    }, [cards, gameState, timeLeft])

    const renderGrid = () => {
        const config = getRoundConfig(round, mode)
        const rows = config.grid
        let cardIndex = 0

        return (
            <div className="flex flex-col items-center justify-center gap-3 md:gap-4 my-auto w-full">
                {rows.map((count, rIdx) => (
                    <div key={rIdx} className="flex justify-center gap-3 md:gap-4 w-full">
                        {Array.from({ length: count }).map((_, cIdx) => {
                            const idx = cardIndex++
                            const card = cards[idx]
                            return (
                                <div key={card.id} className="relative w-16 h-24 sm:w-20 sm:h-28 shrink-0" style={{ perspective: '1000px' }}>
                                    <motion.button
                                        whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
                                        whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
                                        animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                                        transition={{ duration: 0.5 }}
                                        onPointerDown={() => {
                                            if (gameState === 'playing' && !card.isMatched && !card.isFlipped) {
                                                playCardFlipSound()
                                            }
                                        }}
                                        onClick={() => handleCardClick(idx)}
                                        className="w-full h-full rounded-xl cursor-pointer shadow-sm relative block"
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        <div className={cn(
                                            "absolute inset-0 w-full h-full rounded-xl border-2 flex items-center justify-center pointer-events-none overflow-hidden",
                                            card.hasExclamation ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "border-white/10 shadow-md",
                                            "dark:border-white/5"
                                        )}
                                        style={{ 
                                            backfaceVisibility: 'hidden', 
                                            WebkitBackfaceVisibility: 'hidden',
                                            background: card.hasExclamation 
                                                ? 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)'
                                                : 'linear-gradient(135deg, var(--surface) 0%, color-mix(in srgb, var(--surface) 90%, black) 100%)'
                                        }}
                                        >
                                            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, currentColor 4px, currentColor 5px)' }}></div>
                                            <span className={cn(
                                                "relative z-10 text-3xl sm:text-4xl font-black transition-colors duration-300",
                                                card.hasExclamation ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-zinc-400/50 dark:text-zinc-600/50"
                                            )}>
                                                {card.hasExclamation ? "!" : "?"}
                                            </span>
                                        </div>
                                        
                                        <div className={cn(
                                            "absolute inset-0 w-full h-full rounded-xl border-2 flex items-center justify-center pointer-events-none overflow-hidden transition-all duration-500",
                                            card.isMatched 
                                                ? mode === 'chill' ? "border-green-400/80 shadow-[0_0_20px_rgba(74,222,128,0.4)]" : "border-green-400/80 shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                                                : "border-accent/30 shadow-xl"
                                        )}
                                        style={{ 
                                            backfaceVisibility: 'hidden',
                                            WebkitBackfaceVisibility: 'hidden', 
                                            transform: 'rotateY(180deg)',
                                            background: card.isMatched 
                                                ? 'linear-gradient(135deg, var(--surface) 0%, rgba(74,222,128,0.1) 100%)'
                                                : 'linear-gradient(135deg, var(--surface) 0%, color-mix(in srgb, var(--surface) 95%, var(--accent)) 100%)',
                                        }}
                                        >
                                            <AnimatePresence>
                                                {card.isMatched && (
                                                    <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1.5 }} className="absolute inset-0 bg-green-400/20 blur-xl rounded-full" />
                                                )}
                                            </AnimatePresence>
                                            <motion.span 
                                                initial={false}
                                                animate={{ scale: card.isFlipped || card.isMatched ? 1 : 0.5 }}
                                                transition={{ type: 'spring', bounce: 0.6, duration: 0.6 }}
                                                className="relative z-10 text-4xl sm:text-5xl"
                                                style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.25))' }}
                                            >
                                                {card.icon}
                                            </motion.span>
                                        </div>
                                    </motion.button>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={`${mode}-mode`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-3xl mx-auto h-full flex flex-col pt-4 md:pt-2"
            >
                <div className="flex items-center justify-between mb-8 px-4 relative shrink-0 h-16">
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
                        
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)] to-green-500 rounded-2xl blur opacity-25 transition duration-1000"></div>
                                <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all border border-white/20"
                                    style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
                                >
                                    <Gamepad2 size={24} strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="flex flex-col items-start justify-center">
                                <h2 className="text-2xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-600 dark:from-zinc-50 dark:via-zinc-200 dark:to-zinc-400">
                                    {modeTitle}
                                </h2>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }}></div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 leading-none">
                                        Ronda {round}/20
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className={cn(
                            "px-4 py-2 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center min-w-[100px]",
                            timeLeft <= 5 
                                ? "bg-red-50/50 border-red-500/50 dark:bg-red-500/10 dark:border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]" 
                                : "bg-zinc-100/50 border-zinc-200/50 dark:bg-zinc-800/50 dark:border-zinc-700/50"
                        )}>
                            <span className={cn(
                                "text-2xl font-black tabular-nums tracking-tighter transition-colors duration-300",
                                timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-zinc-900 dark:text-zinc-50"
                            )}>
                                00:{timeLeft.toString().padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col relative px-4 w-full">
                    {gameState === 'playing' || gameState === 'round_completed' ? (
                        <AnimatePresence mode="wait">
                            <motion.div key={`round-${round}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full flex-1 flex">
                                {renderGrid()}
                            </motion.div>
                        </AnimatePresence>
                    ) : gameState === 'game_over' ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-red-50/50 dark:bg-red-500/10 rounded-3xl border-2 border-red-100 dark:border-red-500/20">
                            <X className="w-20 h-20 text-red-500 mb-6" />
                            <h2 className="text-4xl font-black text-red-600 dark:text-red-400 mb-2">Game Over</h2>
                            <p className="text-zinc-600 dark:text-zinc-400 font-medium mb-8">El tiempo se agoto en la ronda {round}.</p>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => startRound(1)} className="px-8 py-4 bg-red-500 text-white rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-red-500/30">Volver a Intentar</motion.button>
                        </div>
                    ) : gameState === 'victory' ? (
                         <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-green-50/50 dark:bg-green-500/10 rounded-3xl border-2 border-green-100 dark:border-green-500/20">
                            <span className="text-6xl mb-6">🏆</span>
                            <h2 className="text-4xl font-black text-green-600 dark:text-green-400 mb-2">¡Victoria!</h2>
                            <p className="text-zinc-600 dark:text-zinc-400 font-medium mb-8">Has completado las 20 rondas con éxito.</p>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => startRound(1)} className="px-8 py-4 bg-green-500 text-white rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-green-500/30">Jugar de Nuevo</motion.button>
                        </div>
                    ) : null}
                </div>

                <div className="mt-8 mb-6 px-4 shrink-0 transition-all duration-300">
                    <motion.button
                        disabled={gameState !== 'round_completed'}
                        onClick={() => {
                            if (round === 20) {
                                setGameState('victory')
                            } else {
                                startRound(round + 1)
                            }
                        }}
                        whileHover={gameState === 'round_completed' ? { scale: 1.02 } : {}}
                        whileTap={gameState === 'round_completed' ? { scale: 0.98 } : {}}
                        className={cn(
                            "w-full flex items-center justify-center py-5 rounded-2xl transition-all border-2 group shadow-sm",
                            gameState === 'round_completed' ? "opacity-100" : "opacity-50 grayscale"
                        )}
                        style={{
                            backgroundColor: gameState === 'round_completed' ? 'var(--accent)' : 'var(--surface)',
                            borderColor: gameState === 'round_completed' ? 'var(--accent)' : 'var(--border)',
                            color: gameState === 'round_completed' ? 'var(--theme-on-accent, #ffffff)' : 'rgb(113 113 122)'
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-bold uppercase tracking-widest text-sm">
                                {round === 20 ? "Finalizar" : "Siguiente Ronda"}
                            </span>
                            <ArrowRight size={20} strokeWidth={2.5} className={cn("transition-transform duration-300", gameState === 'round_completed' ? "group-hover:translate-x-2" : "")} />
                        </div>
                    </motion.button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
