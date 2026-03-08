'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createHabit } from '@/app/actions/habits'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/utils'
import { useRouter } from 'next/navigation'

export default function CreateHabitInput({ onHabitCreated }: { onHabitCreated: () => void }) {
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
        <form onSubmit={handleSubmit} className="mb-6">
            <motion.div
                className={cn(
                    "relative overflow-hidden rounded-2xl transition-all duration-300",
                    isFocused ? "shadow-lg shadow-zinc-200 dark:shadow-zinc-900/50" : "shadow-sm"
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
                    placeholder="New habit (e.g. Meditate for 10 mins)"
                    className="w-full bg-transparent px-5 py-4 text-base outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 pr-14"
                    disabled={isSubmitting}
                />
                
                <AnimatePresence>
                    {title.trim() && (
                        <motion.button
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={isSubmitting}
                            className="absolute right-2 top-2 bottom-2 aspect-square rounded-xl flex items-center justify-center text-white transition-opacity disabled:opacity-50"
                            style={{ backgroundColor: 'var(--accent)' }}
                        >
                            <Plus size={20} className={cn(isSubmitting && "animate-spin")} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>
        </form>
    )
}
