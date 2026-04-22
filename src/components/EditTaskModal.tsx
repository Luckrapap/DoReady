import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical, Save, ChevronUp, ChevronDown, Trash2, X } from 'lucide-react'
import { cn } from '@/utils/utils'

interface Task {
    id: string
    title: string
    is_completed: boolean
    is_event?: boolean
}

interface EditTaskModalProps {
    task: Task | null
    isOpen: boolean
    onClose: () => void
    onSave: (id: string, newTitle: string) => Promise<void>
    onDelete: (id: string) => Promise<void>
    onMoveUp: (id: string) => Promise<void>
    onMoveDown: (id: string) => Promise<void>
}

export default function EditTaskModal({ 
    task, isOpen, onClose, onSave, onDelete, onMoveUp, onMoveDown 
}: EditTaskModalProps) {
    const [title, setTitle] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Sync task title when modal opens
    useEffect(() => {
        if (task && isOpen) {
            setTitle(task.title)
            setIsMenuOpen(false)
        }
    }, [task, isOpen])

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!task || !title.trim() || isSaving) return

        setIsSaving(true)
        try {
            await onSave(task.id, title.trim())
            onClose()
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!task || isSaving) return
        setIsSaving(true)
        try {
            await onDelete(task.id)
            onClose()
        } finally {
            setIsSaving(false)
            setIsMenuOpen(false)
        }
    }

    const handleMoveUp = async () => {
        if (!task || isSaving) return
        await onMoveUp(task.id)
    }

    const handleMoveDown = async () => {
        if (!task || isSaving) return
        await onMoveDown(task.id)
    }

    return (
        <AnimatePresence>
            {isOpen && task && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-[24px] shadow-2xl overflow-hidden pointer-events-auto"
                        >
                            <div className="p-6 flex flex-col">
                                <div className="relative flex justify-center items-center mb-8">
                                    <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                                        {task.is_event ? 'Editar Evento' : 'Editar Tarea'}
                                    </h3>
                                    <div className="absolute right-0">
                                        <button 
                                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                                            className={cn(
                                                "p-2 rounded-full transition-colors",
                                                isMenuOpen ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
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
                                                        className="w-full px-4 py-3 flex items-center justify-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                        <span className="text-sm font-bold">Eliminar</span>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <form onSubmit={handleSave} className="flex flex-col gap-6">
                                    <div className="space-y-2">
                                        <textarea
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            onFocus={(e) => {
                                                setTimeout(() => {
                                                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                                }, 300)
                                            }}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[28px] px-6 py-6 text-lg text-zinc-900 dark:text-zinc-50 outline-none focus:border-[var(--accent)] transition-colors min-h-[160px] resize-none"
                                            placeholder={task.is_event ? "Descripción del evento..." : "Descripción de la tarea..."}
                                            disabled={isSaving}
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2 w-full">
                                        <div className="grid grid-cols-2 gap-3 w-1/2">
                                            <button
                                                type="button"
                                                onClick={handleMoveUp}
                                                disabled={isSaving}
                                                className="h-[58px] flex items-center justify-center rounded-[22px] bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors active:scale-95 disabled:opacity-50"
                                                title="Mover arriba"
                                            >
                                                <ChevronUp size={24} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleMoveDown}
                                                disabled={isSaving}
                                                className="h-[58px] flex items-center justify-center rounded-[22px] bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors active:scale-95 disabled:opacity-50"
                                                title="Mover abajo"
                                            >
                                                <ChevronDown size={24} />
                                            </button>
                                        </div>

                                        <button
                                            type="submit"
                                            onClick={handleSave}
                                            disabled={isSaving || !title.trim() || title.trim() === task.title}
                                            className="flex-1 h-[58px] flex items-center justify-center gap-2 rounded-[22px] bg-[var(--accent)] text-[var(--theme-on-accent)] hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 font-bold"
                                            title="Guardar cambios"
                                        >
                                            <Save size={20} />
                                            <span>Guardar</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
