'use client'

import { motion } from 'framer-motion'
import { FileText, SquarePen } from 'lucide-react'
import { cn } from '@/utils/utils'

interface Note {
    id: string
    title: string
    content: string
    emoji?: string | null
    updated_at?: string | null
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

function getRelativeDate(dateStr?: string | null): string {
    if (!dateStr) return 'Sin fecha'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Editada hoy'
    if (diffDays === 1) return 'Editada ayer'
    if (diffDays === 2) return 'Editada anteayer'
    if (diffDays < 7) return `Editada hace ${diffDays} días`
    if (diffDays < 14) return 'Editada hace una semana'
    if (diffDays < 30) return `Editada hace ${Math.floor(diffDays / 7)} semanas`
    if (diffDays < 60) return 'Editada hace un mes'
    return `Editada hace ${Math.floor(diffDays / 30)} meses`
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
                "group relative flex items-center gap-4 px-4 py-4 rounded-2xl transition-colors duration-200 tap-highlight-transparent",
                isReorderMode 
                    ? "cursor-grab active:cursor-grabbing bg-zinc-200/80 dark:bg-zinc-700/60 shadow-sm z-10" 
                    : "cursor-pointer bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/60"
            )}
        >
            {/* Index Icon */}
            <FileText size={20} strokeWidth={1.5} className="shrink-0 text-zinc-400 dark:text-zinc-500" />

            {/* Title + date */}
            <div className="flex-1 min-w-0">
                <span className={cn(
                    "text-[16px] transition-all duration-300 truncate block font-medium",
                    isReorderMode ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-800 dark:text-zinc-200"
                )}>
                    {note.title || note.content}
                </span>
                <span className="text-[13px] text-zinc-400 dark:text-zinc-500 truncate block mt-0.5">
                    {getRelativeDate(note.updated_at)}
                </span>
            </div>

            {/* Edit Icon */}
            {!isReorderMode && (
                <div className="shrink-0 text-zinc-400 transition-opacity">
                    <SquarePen size={18} strokeWidth={2.5} />
                </div>
            )}

        </motion.div>
    )
}
