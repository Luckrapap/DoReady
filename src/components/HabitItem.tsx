'use client'

import { useState, useTransition } from 'react'
import { Check, Repeat, Pencil, Orbit, GripVertical } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { cn } from '@/utils/utils'
import { toggleHabitLog, deleteHabit } from '@/app/actions/habits'

const wiggleVariants: any = {
    reorder: {
        rotate: [0, -0.4, 0.4, -0.4, 0.4, 0],
        transition: {
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut"
        }
    },
    idle: {
        rotate: 0
    }
}

type HabitItemProps = {
    habit: { id: string, title: string, is_completed: boolean };
    dateStr: string;
    onStatusChange: (habitId: string, isCompleted: boolean) => void;
    onDelete: (habitId: string) => void;
    onEdit: () => void;
    isReorderMode?: boolean;
    onDragHandlePointerDown?: (e: React.PointerEvent) => void;
}

export default function HabitItem({ habit, dateStr, onStatusChange, onDelete, onEdit, isReorderMode, onDragHandlePointerDown }: HabitItemProps) {
    const [isPending, startTransition] = useTransition()
    const [isHovered, setIsHovered] = useState(false)

    // Using an optimistic toggle locally for immediate feedback
    const handleToggle = () => {
        if (isReorderMode) return
        const newStatus = !habit.is_completed;
        
        // Haptic feedback
        if (newStatus) {
            Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {})
        } else {
            Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
        }

        // Optimistic UI update - BEFORE the transition to ensure instant feedback
        onStatusChange(habit.id, newStatus);

        startTransition(async () => {
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
            variants={wiggleVariants}
            animate="idle"
            initial="idle"
            className="flex items-center gap-2 w-full"
        >
            <motion.div
                whileTap={{ scale: isReorderMode ? 1.05 : 0.98 }}
                onClick={() => { if (!isReorderMode) onEdit() }}
                className={cn(
                    "flex-1 min-w-0 group relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 tap-highlight-transparent cursor-pointer",
                    isReorderMode 
                        ? "cursor-grab active:cursor-grabbing border-[var(--accent)]/30 border bg-[var(--surface)] shadow-lg z-10" 
                        : habit.is_completed 
                            ? "shadow-none bg-[var(--surface)] border border-[var(--border)]" 
                            : "shadow-sm bg-[var(--surface)] border border-[var(--border)]"
                )}
            >
            <div 
                onClick={(e) => { e.stopPropagation(); handleToggle() }}
                className={cn(
                    "flex-shrink-0 w-[26px] h-[26px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 relative overflow-hidden active:scale-90",
                    isReorderMode
                        ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
                        : habit.is_completed 
                            ? "border-transparent cursor-pointer" 
                            : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 cursor-pointer"
                )}
                style={!isReorderMode && habit.is_completed ? { backgroundColor: 'var(--accent)' } : {}}
            >
                <motion.div
                    initial={false}
                    animate={{ scale: habit.is_completed ? 1.1 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <Check size={16} strokeWidth={3} className="text-[var(--theme-on-accent)]" />
                </motion.div>
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0 pr-2">
                <span className={cn(
                    "text-[17px] transition-all duration-300 truncate block",
                    isReorderMode 
                        ? "text-zinc-900 dark:text-zinc-50 font-medium" 
                        : "font-light " + (habit.is_completed ? "text-zinc-400 dark:text-zinc-500 line-through decoration-zinc-400/50" : "text-zinc-800 dark:text-zinc-100")
                )}>
                    {habit.title}
                </span>
            </div>





            
            </motion.div>

            {isReorderMode ? (
                <div
                    className="shrink-0 text-zinc-400 dark:text-zinc-500 cursor-grab active:cursor-grabbing touch-none px-1 py-2"
                    onPointerDown={onDragHandlePointerDown}
                >
                    <GripVertical size={20} strokeWidth={2} />
                </div>
            ) : (
                <motion.button
                    whileTap={!isReorderMode ? { scale: 0.92 } : undefined}
                    className={cn(
                        "flex-shrink-0 w-[58px] h-[58px] rounded-2xl border flex items-center justify-center transition-all duration-300 group/orbit tap-highlight-transparent",
                        "bg-[var(--surface)] border-[var(--border)] text-zinc-400 hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 shadow-sm"
                    )}
                    title="Ver órbita"
                >
                    <Orbit className="transition-transform duration-700 ease-in-out group-hover/orbit:rotate-180" size={24} strokeWidth={2} />
                </motion.button>
            )}
        </motion.div>
    )
}
