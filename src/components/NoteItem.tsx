'use client'

import { motion } from 'framer-motion'
import { Trash2, FileText, GripVertical } from 'lucide-react'
import { cn } from '@/utils/utils'

interface Note {
    id: string
    title: string
    content: string
    emoji?: string | null
}

interface NoteItemProps {
    note: Note
    onClick?: () => void
    isReorderMode?: boolean
}

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

export default function NoteItem({ note, onClick, isReorderMode }: NoteItemProps) {
    return (
        <motion.div
            layout
            variants={wiggleVariants}
            animate={isReorderMode ? "reorder" : "idle"}
            initial="idle"
            whileTap={{ scale: isReorderMode ? 1.02 : 0.98 }}
            onClick={() => !isReorderMode && onClick && onClick()}
            className={cn(
                "group relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 tap-highlight-transparent",
                isReorderMode 
                    ? "cursor-grab active:cursor-grabbing border-[var(--accent)]/30 border bg-[var(--surface)] shadow-lg z-10" 
                    : "cursor-pointer shadow-sm bg-[var(--surface)] border border-[var(--border)] hover:border-zinc-300 dark:hover:border-zinc-700"
            )}
        >
            {/* Index Icon */}
            <div className={cn(
                "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 overflow-hidden shrink-0",
                isReorderMode 
                    ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20" 
                    : "bg-zinc-50 dark:bg-black/20 border border-[var(--border)] text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
            )}>
                {note.emoji ? (
                    <span className="text-xl leading-none select-none">{note.emoji}</span>
                ) : (
                    <FileText size={18} strokeWidth={1.5} />
                )}
            </div>

            {/* Title / Content Preview */}
            <div className="flex-1 min-w-0">
                <span className={cn(
                    "text-[17px] font-medium transition-all duration-300 truncate block",
                    isReorderMode ? "text-zinc-900 dark:text-zinc-50" : "font-light text-zinc-800 dark:text-zinc-100"
                )}>
                    {note.title || note.content}
                </span>
            </div>
        </motion.div>
    )
}
