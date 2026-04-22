'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createHabit } from '@/app/actions/habits'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/utils'
import { useRouter } from 'next/navigation'

export default function CreateHabitInput({ onHabitCreated, inputRef }: { onHabitCreated: () => void, inputRef?: React.RefObject<HTMLInputElement | null> }) {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || isSubmitting) return

        setIsSubmitting(true)
        const newHabit = await createHabit(title.trim())
        if (newHabit) {
            setTitle('')
            onHabitCreated()
            router.refresh()
        }
        setIsSubmitting(false)
    }

    return (
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
                    borderStyle: 'solid'
                }}
            >
                <input
                    ref={inputRef}
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
                    placeholder="Nuevo hábito (ej. Meditar 10 min)"
                    className="w-full bg-transparent px-6 py-4 text-base font-light outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 pr-16"
                    disabled={isSubmitting}
                />
                
                <button
                    type="submit"
                    disabled={isSubmitting || !title.trim()}
                    className="absolute right-2 top-2 bottom-2 aspect-square rounded-full flex items-center justify-center text-[var(--theme-on-accent)] transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: 'var(--accent)' }}
                >
                    <Plus size={20} className={cn(isSubmitting && "animate-spin")} strokeWidth={2} />
                </button>
            </motion.div>
        </form>
    )
}
