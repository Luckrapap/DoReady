'use client'

import { useState, useTransition } from 'react'
import { Check, Repeat, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/utils'
import { toggleHabitLog, deleteHabit } from '@/app/actions/habits'

type HabitItemProps = {
    habit: { id: string, title: string, is_completed: boolean };
    dateStr: string;
    onStatusChange: (habitId: string, isCompleted: boolean) => void;
    onDelete: (habitId: string) => void;
}

export default function HabitItem({ habit, dateStr, onStatusChange, onDelete }: HabitItemProps) {
    const [isPending, startTransition] = useTransition()
    const [isHovered, setIsHovered] = useState(false)

    // Using an optimistic toggle locally for immediate feedback
    const handleToggle = () => {
        const newStatus = !habit.is_completed;
        
        startTransition(async () => {
            // Optimistic UI update
            onStatusChange(habit.id, newStatus);
            
            const success = await toggleHabitLog(habit.id, dateStr, newStatus);
            if (!success) {
                // Revert if failed
                onStatusChange(habit.id, !newStatus);
            }
        });
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation()
        startTransition(async () => {
            onDelete(habit.id)
            const success = await deleteHabit(habit.id)
            // Ideally handle revert if !success
        })
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.01 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={handleToggle}
            className={cn(
                "group relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300",
                habit.is_completed ? "bg-opacity-50" : "bg-opacity-100"
            )}
            style={{ 
                backgroundColor: 'var(--surface)', 
                border: '1px solid',
                borderColor: habit.is_completed ? 'var(--accent)' : 'var(--border)'
            }}
        >
            {/* Minimalist Checkbox */}
            <div 
                className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden",
                    habit.is_completed ? "border-transparent" : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
                )}
                style={habit.is_completed ? { backgroundColor: 'var(--accent)' } : {}}
            >
                <motion.div
                    initial={false}
                    animate={{ scale: habit.is_completed ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <Check size={14} strokeWidth={3} className="text-white" />
                </motion.div>
            </div>

            {/* Title */}
            <div className="flex-1 flex flex-col justify-center min-w-0">
                <span className={cn(
                    "text-[15px] font-medium transition-all duration-300 truncate",
                    habit.is_completed ? "text-zinc-500 dark:text-zinc-400 line-through decoration-zinc-400/50" : "text-zinc-900 dark:text-zinc-100"
                )}>
                    {habit.title}
                </span>
            </div>

            {/* Hover Actions */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                onClick={handleDelete}
                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                disabled={isPending}
            >
                <Trash2 size={16} />
            </motion.button>
            
            {/* Subtle background glow when completed */}
            {habit.is_completed && (
                <div 
                    className="absolute inset-0 rounded-2xl opacity-5 pointer-events-none"
                    style={{ backgroundColor: 'var(--accent)' }}
                />
            )}
        </motion.div>
    )
}
