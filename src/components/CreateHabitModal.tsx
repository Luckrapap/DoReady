'use client'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { createHabit } from '@/app/actions/habits'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/utils'
import { useRouter } from 'next/navigation'

interface CreateHabitModalProps {
    isOpen: boolean
    onClose: () => void
    onHabitCreated: () => void
}

export default function CreateHabitModal({ isOpen, onClose, onHabitCreated }: CreateHabitModalProps) {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Handle escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || isSubmitting) return

        setIsSubmitting(true)
        const newHabit = await createHabit(title.trim())
        if (newHabit) {
            setTitle('')
            onHabitCreated()
            router.refresh()
            onClose()
        }
        setIsSubmitting(false)
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
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-colors"
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[101] p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl pointer-events-auto overflow-hidden border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="px-8 py-10 relative">
                                <button
                                    onClick={onClose}
                                    className="absolute right-6 top-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                >
                                    <X size={24} />
                                </button>

                                <div className="mb-8">
                                    <h2 className="text-3xl font-playfair font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                                        New Habit
                                    </h2>
                                    <p className="text-zinc-500 dark:text-zinc-400 font-medium italic">
                                        "Small steps lead to great revolutions."
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                    <div className="relative group">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="What's your next orbit?"
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-5 text-lg outline-none focus:border-[var(--accent)] transition-all text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!title.trim() || isSubmitting}
                                        className="w-full py-5 rounded-2xl bg-[var(--accent)] text-white font-bold text-lg shadow-xl shadow-[var(--accent)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                                    >
                                        <Plus size={24} strokeWidth={3} />
                                        <span>Create Habit</span>
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
