'use client'

import { motion } from 'framer-motion'
import { Check, Trash2 } from 'lucide-react'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { cn } from '@/utils/utils'

interface Task {
    id: string
    title: string
    is_completed: boolean
}

interface TaskItemProps {
    task: Task
    onToggle: () => void
    onDelete: () => void
    onClick?: () => void
}

export default function TaskItem({ task, onToggle, onDelete, onClick }: TaskItemProps) {
    const isCompleted = task.is_completed

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation()
        // Haptic feedback
        if (!isCompleted) {
            Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {})
        } else {
            Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
        }
        onToggle()
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick && onClick()}
            className={cn(
                "group relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 tap-highlight-transparent cursor-pointer",
                isCompleted ? "opacity-50 shadow-none" : "shadow-sm"
            )}
            style={{ 
                backgroundColor: 'var(--surface)', 
                border: '1px solid',
                borderColor: 'var(--border)'
            }}
        >
            {/* Checkbox */}
            <div 
                onClick={handleToggle}
                className={cn(
                    "flex-shrink-0 w-[26px] h-[26px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 relative overflow-hidden cursor-pointer active:scale-90",
                    isCompleted ? "border-transparent" : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500"
                )}
                style={isCompleted ? { backgroundColor: 'var(--accent)' } : {}}
            >
                <motion.div
                    initial={false}
                    animate={{ scale: isCompleted ? 1.1 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <Check size={16} strokeWidth={3} className="text-[var(--theme-on-accent)]" />
                </motion.div>
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0 pr-2">
                <span className={cn(
                    "text-[17px] font-light transition-all duration-300 truncate block",
                    isCompleted ? "text-zinc-500 dark:text-zinc-500 line-through decoration-zinc-400/50" : "text-zinc-800 dark:text-zinc-100"
                )}>
                    {task.title}
                </span>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                }}
                className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all active:scale-90 absolute right-2 opacity-0 group-hover:opacity-100 md:relative md:opacity-100"
                aria-label="Delete task"
            >
                <Trash2 size={16} />
            </button>
        </motion.div>
    )
}
