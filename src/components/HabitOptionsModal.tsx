'use client'

import { useState, useEffect } from 'react'
import { Pencil, Trash2, X, CheckCircle2, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/utils'
import { updateHabit, deleteHabit } from '@/app/actions/habits'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface HabitOptionsModalProps {
    isOpen: boolean
    onClose: () => void
    habitId: string
    initialTitle: string
    onHabitUpdated: () => void
    onHabitDeleted: (id: string) => void
    onMoveUp?: () => void
    onMoveDown?: () => void
}

export default function HabitOptionsModal({
    isOpen,
    onClose,
    habitId,
    initialTitle,
    onHabitUpdated,
    onHabitDeleted,
    onMoveUp,
    onMoveDown
}: HabitOptionsModalProps) {
    const router = useRouter()
    const [title, setTitle] = useState(initialTitle)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setTitle(initialTitle)
            setIsSubmitting(false)
        }
    }, [isOpen, initialTitle])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || isSubmitting) return

        setIsSubmitting(true)
        const updated = await updateHabit(habitId, title.trim())
        
        setIsSubmitting(false)
        if (updated) {
            onHabitUpdated()
            router.refresh()
            setTimeout(() => {
                onClose()
            }, 500)
        } else {
            toast.error('Error al actualizar el hábito')
        }
    }

    const handleDelete = async () => {
        if (isSubmitting) return
        
        setIsSubmitting(true)
        const success = await deleteHabit(habitId)
        
        setIsSubmitting(false)
        if (success) {
            onHabitDeleted(habitId)
            router.refresh()
            setTimeout(() => {
                onClose()
            }, 500)
        } else {
            toast.error('Error al eliminar')
        }
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
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
                    />

                    {/* Modal (Identical to PasswordModal) */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed inset-0 m-auto w-full max-w-lg h-fit border rounded-[2.5rem] shadow-2xl z-[111] overflow-hidden"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-2xl"
                                        style={{ backgroundColor: 'var(--border)', color: 'var(--accent)' }}
                                    >
                                        <Pencil size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Editar Hábito</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full transition-colors text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                                    style={{ backgroundColor: 'transparent' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2 px-1">Nombre del Hábito</label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full p-4 rounded-2xl border-none transition-all text-sm text-zinc-900 dark:text-zinc-50 outline-none"
                                        style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 90%, var(--accent))' }}
                                        placeholder="Nombre de tu hábito"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="pt-4 flex justify-center gap-3 w-full">
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={isSubmitting}
                                        className="w-[140px] flex items-center justify-center gap-2 py-4 text-red-600 dark:text-red-400 rounded-[2rem] font-bold text-sm tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                        style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 95%, #ef4444)' }}
                                    >
                                        Eliminar
                                        <Trash2 size={18} />
                                    </button>
                                    <button
                                        disabled={isSubmitting || !title.trim()}
                                        type="submit"
                                        className="w-[140px] flex items-center justify-center gap-2 py-4 text-white rounded-[2rem] font-bold text-sm tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg"
                                        style={{ backgroundColor: 'var(--accent)' }}
                                    >
                                        Guardar
                                        <Pencil size={18} />
                                    </button>
                                    
                                    <div className="flex gap-2 ml-2">
                                        <button
                                            type="button"
                                            onClick={onMoveUp}
                                            disabled={isSubmitting}
                                            className="w-14 h-[52px] flex items-center justify-center text-zinc-600 dark:text-zinc-400 rounded-2xl border-2 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50"
                                            style={{ borderColor: 'var(--border)' }}
                                        >
                                            <ChevronUp size={24} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onMoveDown}
                                            disabled={isSubmitting}
                                            className="w-14 h-[52px] flex items-center justify-center text-zinc-600 dark:text-zinc-400 rounded-2xl border-2 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50"
                                            style={{ borderColor: 'var(--border)' }}
                                        >
                                            <ChevronDown size={24} />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
