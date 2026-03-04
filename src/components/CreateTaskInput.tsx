'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createTask } from '@/app/actions/tasks'

export default function CreateTaskInput({ dateStr }: { dateStr: string }) {
    const [title, setTitle] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || isSubmitting) return

        setIsSubmitting(true)
        const success = await createTask(title.trim(), dateStr)
        if (success) {
            setTitle('')
        }
        setIsSubmitting(false)
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white focus-within:border-transparent transition-all"
        >
            <button
                type="submit"
                disabled={!title.trim() || isSubmitting}
                className="p-2 ml-1 text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-50 transition-colors rounded-lg"
            >
                <Plus size={20} />
            </button>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 bg-transparent border-none outline-none text-base text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400"
                autoFocus
            />
        </form>
    )
}
