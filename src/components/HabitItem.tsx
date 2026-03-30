'use client'

import { useState, useTransition } from 'react'
import { Check, Repeat, Pencil, Orbit } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { cn } from '@/utils/utils'
import { toggleHabitLog, deleteHabit } from '@/app/actions/habits'

type HabitItemProps = {
    habit: { id: string, title: string, is_completed: boolean };
    dateStr: string;
    onStatusChange: (habitId: string, isCompleted: boolean) => void;
    onDelete: (habitId: string) => void;
    onEdit: () => void;
}

export default function HabitItem({ habit, dateStr, onStatusChange, onDelete, onEdit }: HabitItemProps) {
    const [isPending, startTransition] = useTransition()
    const [isHovered, setIsHovered] = useState(false)

    // Using an optimistic toggle locally for immediate feedback
    const handleToggle = () => {
        const newStatus = !habit.is_completed;
        
        // Haptic feedback
        if (newStatus) {
            Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {})
        } else {
            Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
        }

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



    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "group relative flex items-center gap-5 p-5 rounded-3xl transition-all duration-300 tap-highlight-transparent",
                habit.is_completed ? "bg-opacity-50" : "bg-opacity-100"
            )}
            style={{ 
                backgroundColor: 'var(--surface)', 
                border: '1px solid',
                borderColor: habit.is_completed ? 'var(--accent)' : 'var(--border)'
            }}
        >
            {/* Minimalist Checkbox - Increased touch target for mobile (44px) */}
            <div 
                onClick={handleToggle}
                className={cn(
                    "flex-shrink-0 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden cursor-pointer active:scale-90",
                    habit.is_completed ? "border-transparent" : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
                )}
                style={habit.is_completed ? { backgroundColor: 'var(--accent)' } : {}}
            >
                <motion.div
                    initial={false}
                    animate={{ scale: habit.is_completed ? 1.1 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <Check size={22} strokeWidth={3} className="text-white" />
                </motion.div>
            </div>

            {/* Title */}
            <div className="flex-1 flex flex-col justify-center min-w-0">
                <span className={cn(
                    "text-xl font-medium transition-all duration-300 truncate",
                    habit.is_completed ? "text-zinc-500 dark:text-zinc-400 line-through decoration-zinc-400/50" : "text-zinc-900 dark:text-zinc-100"
                )}>
                    {habit.title}
                </span>
            </div>

            <div className="flex items-center gap-1">
                {/* Orbit Icon */}
                <Link
                    href={`/orbit/${habit.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-3 text-zinc-400 hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-xl transition-all active:scale-90"
                >
                    <Orbit size={20} />
                </Link>

                {/* Edit Icon */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                }}
                className="p-3 text-zinc-400 hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-xl transition-all active:scale-90"
            >
                <Pencil size={20} />
                </button>
            </div>

            
            {/* Subtle background glow when completed */}
            {habit.is_completed && (
                <div 
                    className="absolute inset-0 rounded-3xl opacity-5 pointer-events-none"
                    style={{ backgroundColor: 'var(--accent)' }}
                />
            )}
        </motion.div>
    )
}
