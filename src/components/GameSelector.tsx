'use client'

import { motion } from 'framer-motion'
import { Brain, Gamepad2, Sparkles, Lock, RotateCcw } from 'lucide-react'
import { cn } from '@/utils/utils'

interface GameCardProps {
    title: string
    description: string
    icon: React.ElementType
    onClick?: () => void
    disabled?: boolean
    color: string
}

function GameCard({ title, description, icon: Icon, onClick, disabled, color }: GameCardProps) {
    return (
        <motion.button
            whileHover={!disabled ? { y: -5, scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "relative group w-full text-left p-6 rounded-[2rem] border-2 transition-all overflow-hidden shadow-sm",
                disabled
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:shadow-xl cursor-pointer"
            )}
            style={{
                backgroundColor: 'var(--surface)',
                borderColor: disabled ? 'var(--border)' : 'color-mix(in srgb, var(--border) 60%, transparent)'
            }}
        >
            {/* Background Accent */}
            <div className={cn(
                "absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
                color
            )} />

            <div className="relative z-10 flex flex-col h-full">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm",
                    disabled ? "text-zinc-400" : "text-white"
                )}
                    style={{ backgroundColor: disabled ? 'var(--border)' : 'var(--accent)' }}
                >
                    {disabled ? <Lock size={20} /> : <Icon size={24} />}
                </div>

                <div className="flex-1">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        {title}
                        {disabled && (
                            <span className="ml-2 py-0.5 px-2 text-[10px] uppercase tracking-widest rounded-full font-bold"
                                style={{ backgroundColor: 'var(--border)', color: 'var(--accent)' }}
                            >
                                Pronto
                            </span>
                        )}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                        {description}
                    </p>
                </div>

                {!disabled && (
                    <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                        Jugar Ahora
                        <Sparkles size={14} className="animate-pulse" />
                    </div>
                )}
            </div>
        </motion.button>
    )
}

interface GameSelectorProps {
    onSelectGame: (gameId: string) => void
}

export default function GameSelector({ onSelectGame }: GameSelectorProps) {
    const games = [
        {
            id: 'trivia',
            title: 'Trivia General',
            description: 'Pon a prueba tus conocimientos con preguntas generadas por IA sobre cualquier tema.',
            icon: Brain,
            color: 'bg-blue-500',
            disabled: false
        },
        {
            id: 'recall',
            title: 'Recall',
            description: 'Pon a prueba tu memoria con un desafío visual único.',
            icon: RotateCcw,
            color: 'bg-green-500',
            disabled: false
        }
    ]

    return (
        <div className="w-full">
            <header className="flex flex-col gap-1 px-4 flex-shrink-0 mb-12">
                <div className="flex items-end justify-center">
                    {/* Left phanton box for horizontal balance - ZERO WIDTH */}
                    <div className="opacity-0 w-0 overflow-hidden pointer-events-none bg-zinc-200 dark:bg-zinc-800 rounded-full px-6 py-2.5 mt-2 mb-1 flex items-center justify-center">
                        <span className="text-4xl md:text-5xl font-light">0/0</span>
                    </div>
                    <motion.h1
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0 }}
                        className="font-bold text-6xl md:text-8xl tracking-tighter text-zinc-900 dark:text-zinc-50 relative bottom-1.5 whitespace-nowrap"
                    >
                        Procas<span style={{ color: 'var(--accent)' }}>Tive</span>
                    </motion.h1>
                    {/* Right phanton box for horizontal balance and height match - ZERO WIDTH */}
                    <div className="opacity-0 w-0 overflow-hidden pointer-events-none bg-zinc-200 dark:bg-zinc-800 rounded-full px-6 py-2.5 mt-2 mb-1 flex items-center justify-center">
                        <span className="text-4xl md:text-5xl font-light">0/0</span>
                    </div>
                </div>
                <motion.p 
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="text-base font-medium text-zinc-500 dark:text-zinc-400 text-center select-none mt-2"
                >
                    Siempre hay algo que puedas hacer
                </motion.p>
            </header>

            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {games.map((game) => (
                    <GameCard
                        key={game.id}
                        {...game}
                        onClick={() => onSelectGame(game.id)}
                    />
                ))}
            </motion.div>
        </div>
    )
}
