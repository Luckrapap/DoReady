'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createTask } from '@/app/actions/tasks'
import { motion } from 'framer-motion'
import { cn } from '@/utils/utils'

export default function CreateTaskInput({ dateStr }: { dateStr: string }) {
    const [title, setTitle] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            const result = await createTask(title.trim(), dateStr)
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
        <form onSubmit={handleSubmit} className="mb-4">
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
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Añadir tarea"
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
    )
}
