'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createTask } from '@/app/actions/tasks'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Magnetic from './Magnetic'

export default function CreateTaskInput({ dateStr }: { dateStr: string }) {
    const [title, setTitle] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || isSubmitting) return

        setIsSubmitting(true)
        const toastId = toast.loading('Creando tarea...')
        try {
            const result = await createTask(title.trim(), dateStr)
            if (result) {
                setTitle('')
                toast.success('Tarea creada correctamente', { id: toastId })
            } else {
                toast.error('No se pudo crear la tarea', { id: toastId })
            }
        } catch (error: any) {
            console.error('Task creation error:', error)
            toast.error(error.message || 'Error al crear la tarea', { id: toastId })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 p-3 md:p-2 border rounded-xl shadow-sm transition-all focus-within:ring-2"
            style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                outlineColor: 'var(--accent)'
            }}
        >
            <Magnetic strength={0.2}>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="submit"
                    disabled={!title.trim() || isSubmitting}
                    className="p-2 ml-1 text-zinc-400 transition-colors rounded-lg group"
                    style={{ color: title.trim() ? 'var(--accent)' : 'var(--border)' }}
                >
                    <Plus size={20} className="transition-transform group-hover:scale-110" />
                </motion.button>
            </Magnetic>
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
