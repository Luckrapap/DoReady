'use client'

import { useState, useEffect } from 'react'
import { Save, MoreVertical, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/utils'
import { useRouter } from 'next/navigation'

interface CreateHabitModalProps {
    isOpen: boolean
    onClose: () => void
    onHabitCreated: (title: string) => void
    onHabitUpdated?: (id: string, title: string) => void
    onHabitDeleted?: (id: string) => void
    habit?: { id: string; title: string } | null
}

export default function CreateHabitModal({ isOpen, onClose, onHabitCreated, onHabitUpdated, onHabitDeleted, habit }: CreateHabitModalProps) {
    const router = useRouter()
    const isEditMode = !!habit
    const [title, setTitle] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Sync state when opening — pre-fill title in edit mode
    useEffect(() => {
        if (isOpen) {
            setTitle(habit?.title ?? '')
            setIsSubmitting(false)
            setIsMenuOpen(false)
        }
    }, [isOpen, habit])

    // Handle escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isMenuOpen) setIsMenuOpen(false)
                else onClose()
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose, isMenuOpen])

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!title.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            if (isEditMode && habit && onHabitUpdated) {
                await onHabitUpdated(habit.id, title.trim())
            } else {
                await onHabitCreated(title.trim())
            }
            setTitle('')
            onClose()
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!habit || !onHabitDeleted) return
        setIsMenuOpen(false)
        onClose()
        onHabitDeleted(habit.id)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { if (isMenuOpen) setIsMenuOpen(false); else onClose() }}
                        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 pointer-events-none transition-all duration-300 ease-out">
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ 
                                type: "spring", 
                                damping: 30, 
                                stiffness: 400,
                                mass: 0.8,
                                layout: { duration: 0.4, type: "spring", bounce: 0 }
                            }}
                            className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-[24px] shadow-2xl overflow-hidden pointer-events-auto flex flex-col p-6 pb-6"
                        >
                            {/* Header */}
                            <div className="relative flex justify-center items-center mb-8">
                                <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                                    {isEditMode ? 'Editar hábito' : 'Nuevo Hábito'}
                                </h3>

                                {/* Three-dot menu — only in edit mode */}
                                {isEditMode && (
                                    <div className="absolute right-0">
                                        <button
                                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                                            className={cn(
                                                "p-2 rounded-full transition-colors",
                                                isMenuOpen
                                                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                                                    : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                                            )}
                                        >
                                            <MoreVertical size={24} />
                                        </button>

                                        <AnimatePresence>
                                            {isMenuOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                                    className="absolute top-12 right-0 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xl py-2 min-w-[140px] overflow-hidden z-[60]"
                                                >
                                                    <button
                                                        onClick={handleDelete}
                                                        className="w-full px-4 py-3 flex items-center justify-center gap-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                        <span className="text-sm font-bold">Eliminar</span>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <motion.div layout="position" className="space-y-2">
                                    <h4 className="text-[15px] font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider ml-4">
                                        Nombre del hábito
                                    </h4>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ej. Meditar cada mañana..."
                                        className="w-full bg-zinc-50 dark:bg-black/20 border border-[var(--border)] rounded-[22px] px-6 py-4 text-lg text-zinc-900 dark:text-zinc-50 outline-none focus:border-[var(--accent)] transition-colors"
                                        disabled={isSubmitting}
                                    />
                                </motion.div>

                                <div className="overflow-hidden flex-shrink-0">
                                    <div className="pt-6 w-full">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !title.trim()}
                                            className="h-[58px] w-full flex items-center justify-center gap-4 rounded-[22px] bg-[var(--accent)] text-[var(--theme-on-accent)] hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 font-bold"
                                            title="Guardar hábito"
                                        >
                                            <Save size={20} />
                                            <span>Guardar</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
