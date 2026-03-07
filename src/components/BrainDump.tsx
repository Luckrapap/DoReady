'use client'

import { useState, useRef, useOptimistic, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, CornerDownLeft, Brain } from 'lucide-react'
import { addIdea, deleteIdea, type BrainDumpIdea } from '@/app/actions/braindump'
import { cn } from '@/utils/utils'
import { toast } from 'sonner'

interface Props {
    initialIdeas: BrainDumpIdea[]
}

export default function BrainDump({ initialIdeas }: Props) {
    const [optimisticIdeas, updateOptimisticIdeas] = useOptimistic(
        initialIdeas,
        (state, action: { type: 'add' | 'delete', payload: any }) => {
            if (action.type === 'add') {
                return [action.payload, ...state]
            }
            if (action.type === 'delete') {
                return state.filter(i => i.id !== action.payload)
            }
            return state
        }
    )

    const [isPending, startTransition] = useTransition()
    const [input, setInput] = useState('')
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const handleAddIdea = async () => {
        if (!input.trim() || isPending) return

        const content = input.trim()
        setInput('')

        startTransition(async () => {
            updateOptimisticIdeas({
                type: 'add',
                payload: {
                    id: Math.random().toString(),
                    content,
                    created_at: new Date().toISOString()
                }
            })

            try {
                await addIdea(content)
            } catch (error) {
                toast.error('Error al guardar la idea. Inténtalo de nuevo.')
                setInput(content)
            }
        })
    }

    const handleDelete = async (id: string) => {
        startTransition(async () => {
            updateOptimisticIdeas({ type: 'delete', payload: id })
            try {
                await deleteIdea(id)
            } catch (error) {
                toast.error('Error al eliminar la idea.')
            }
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleAddIdea()
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-8 pb-28">
            {/* Header */}
            <div className="flex flex-col items-center mb-12 text-center">
                <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm transition-colors duration-500"
                    style={{ backgroundColor: 'var(--border)' }}
                >
                    <Brain size={32} style={{ color: 'var(--accent)' }} className="opacity-60" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    El Cementerio de Ideas
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm text-sm">
                    Sácalo de tu mente. Entiérralo aquí. Recupera tu enfoque.
                </p>
            </div>

            {/* Main Input Area */}
            <div className="relative mb-12 group">
                <div className="absolute inset-0 bg-zinc-900/5 dark:bg-white/5 blur-xl group-hover:blur-2xl transition-all duration-500 rounded-[2rem]" />
                <div className="relative backdrop-blur-xl border rounded-[2rem] p-6 shadow-xl transition-colors duration-500"
                    style={{
                        backgroundColor: 'color-mix(in srgb, var(--surface) 80%, transparent)',
                        borderColor: 'var(--border)'
                    }}
                >
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="¿Qué te distrae ahora mismo? Suéltalo..."
                        className="w-full bg-transparent border-none outline-none resize-none text-lg md:text-xl text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 min-h-[100px]"
                    />
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                            <CornerDownLeft size={10} /> Enter para enterrar
                        </span>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAddIdea}
                            disabled={!input.trim() || isPending}
                            className="flex items-center gap-2 px-6 py-2 text-white rounded-full text-xs font-bold hover:shadow-lg transition-all disabled:opacity-30 shadow-md"
                            style={{ backgroundColor: 'var(--accent)' }}
                        >
                            <Plus size={14} />
                            Capturar
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Ideas List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout" initial={false}>
                    {optimisticIdeas.map((idea) => (
                        <motion.div
                            key={idea.id}
                            layout
                            initial={{ opacity: 0, y: 15, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className="group relative border rounded-2xl p-5 transition-all hover:shadow-md duration-500"
                            style={{
                                backgroundColor: 'color-mix(in srgb, var(--surface) 40%, transparent)',
                                borderColor: 'var(--border)'
                            }}
                        >
                            <div className="flex justify-between gap-4">
                                <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed text-[15px]">
                                    {idea.content}
                                </p>
                                <button
                                    onClick={() => handleDelete(idea.id)}
                                    className="p-2 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all flex-shrink-0"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="mt-4 text-[10px] font-medium text-zinc-400 dark:text-zinc-600 tracking-wide">
                                {new Date(idea.created_at).toLocaleDateString()} • {new Date(idea.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

                {optimisticIdeas.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-zinc-300 dark:text-zinc-800 text-sm font-medium italic">
                            El cementerio está vacío. Tu mente debería estarlo también.
                        </div>
                    </div>
                )}
        </div>
    )
}
