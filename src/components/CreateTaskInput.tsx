'use client'

import { useState } from 'react'
import { Plus, X, ListTodo, Pin } from 'lucide-react'
import { createTask } from '@/app/actions/tasks'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/utils'

export default function CreateTaskInput({ dateStr }: { dateStr: string }) {
    const [title, setTitle] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [showOverlay, setShowOverlay] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || isSubmitting) return
        setShowOverlay(true)
    }

    const handleCreate = async (isEvent: boolean) => {
        setIsSubmitting(true)
        setShowOverlay(false)
        try {
            const result = await createTask(title.trim(), dateStr, isEvent)
            if (result) {
                setTitle('') // Clears input silently on success
            }
        } catch (error: any) {
            console.error('Task creation error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="mb-0">
                <motion.div
                    className={cn(
                        "relative overflow-hidden rounded-full transition-all duration-300",
                        isFocused ? "shadow-md shadow-zinc-200 dark:shadow-zinc-900/50" : "shadow-sm"
                    )}
                    animate={{
                        borderColor: isFocused ? 'var(--accent)' : 'var(--border)',
                    }}
                    style={{
                        backgroundColor: 'var(--surface)',
                        borderWidth: '1px',
                    }}
                >
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onFocus={(e) => {
                            setIsFocused(true)
                            setTimeout(() => {
                                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }, 300)
                        }}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Añadir tarea o evento"
                        className="w-full bg-transparent px-6 py-4 text-base font-light outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 pr-16"
                        disabled={isSubmitting}
                    />
                    
                    <button
                        type="submit"
                        disabled={isSubmitting || !title.trim()}
                        className="absolute right-2 top-2 bottom-2 aspect-square rounded-full flex items-center justify-center text-[var(--theme-on-accent)] transition-opacity disabled:opacity-50"
                        style={{ backgroundColor: 'var(--accent)' }}
                    >
                        <Plus size={20} strokeWidth={2} />
                    </button>
                </motion.div>
            </form>

            <AnimatePresence>
                {showOverlay && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ position: 'fixed' }}>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
                            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            onClick={() => setShowOverlay(false)}
                            className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-sm rounded-[32px] p-6 shadow-2xl flex flex-col gap-4 overflow-hidden"
                            style={{
                                backgroundColor: 'var(--surface)',
                                border: '1px solid var(--border)'
                            }}
                        >
                            <button 
                                onClick={() => setShowOverlay(false)}
                                className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors"
                            >
                                <X size={24} />
                            </button>
                            
                            <div className="mb-2">
                                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">¿Qué deseas crear?</h3>
                                <p className="text-sm text-zinc-500 line-clamp-1 mt-1">"{title}"</p>
                            </div>

                            <button
                                onClick={() => handleCreate(false)}
                                className="flex items-center gap-4 w-full p-4 rounded-2xl transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/50 active:scale-[0.98] border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/50 text-left"
                                style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 50%, var(--border))' }}
                            >
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                                    <ListTodo size={24} className="text-[var(--theme-on-accent)]" />
                                </div>
                                <div>
                                    <span className="block text-lg font-medium text-zinc-900 dark:text-zinc-50">Acción</span>
                                    <span className="block text-sm text-zinc-500">Aparecerá en pendientes</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleCreate(true)}
                                className="flex items-center gap-4 w-full p-4 rounded-2xl transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/50 active:scale-[0.98] border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/50 text-left"
                                style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 50%, var(--border))' }}
                            >
                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800">
                                    <Pin size={24} className="text-zinc-700 dark:text-zinc-300" />
                                </div>
                                <div>
                                    <span className="block text-lg font-medium text-zinc-900 dark:text-zinc-50">Evento</span>
                                    <span className="block text-sm text-zinc-500">Con chincheta, sin check</span>
                                </div>
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
