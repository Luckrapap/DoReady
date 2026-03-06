'use client'

import { motion } from 'framer-motion'
import { Brain, Gamepad2, Sparkles, Lock } from 'lucide-react'
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
                "relative group w-full text-left p-6 rounded-[2rem] border-2 transition-all duration-500 overflow-hidden shadow-sm",
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
            id: 'zen-flow',
            title: 'Zen Flow',
            description: 'Un rompecabezas relajante para despejar la mente antes de volver al trabajo.',
            icon: Sparkles,
            color: 'bg-purple-500',
            disabled: true
        },
        {
            id: 'logic-dash',
            title: 'Logic Dash',
            description: 'Desafíos de lógica rápidos para despertar tu pensamiento crítico.',
            icon: Gamepad2,
            color: 'bg-orange-500',
            disabled: true
        }
    ]

    return (
        <div className="w-full">
            <header className="mb-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 transition-colors duration-500"
                    style={{
                        backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                        color: 'var(--accent)'
                    }}
                >
                    <Sparkles size={12} />
                    Pausa Productiva
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-4"
                >
                    Procas<span style={{ color: 'var(--accent)' }}>Tive</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto"
                >
                    Elige un micro-desafío para recargar energías y volver al trabajo con más enfoque.
                </motion.p>
            </header>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
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
