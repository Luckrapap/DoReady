'use client'

import { Folder, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/utils'

interface FolderData {
    id: string
    name: string
    emoji?: string | null
    color?: string | null
}

interface FolderItemProps {
    folder: FolderData
    onClick?: () => void
    isReorderMode?: boolean
    noteCount?: number
    folderCount?: number
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

export default function FolderItem({ folder, onClick, isReorderMode, noteCount = 0, folderCount = 0 }: FolderItemProps) {
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
                    ? "cursor-grab active:cursor-grabbing bg-yellow-500/10 shadow-sm z-10"
                    : "cursor-pointer bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/60"
            )}
        >
            {/* Folder Icon */}
            <Folder size={22} strokeWidth={0} className="shrink-0 fill-yellow-400" />

            {/* Name + subtitle */}
            <div className="flex-1 min-w-0">
                <span className={cn(
                    "text-[16px] transition-all duration-300 truncate block font-medium",
                    isReorderMode
                        ? "text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-800 dark:text-zinc-200"
                )}>
                    {folder.name || 'Sin nombre'}
                </span>
                <span className="text-[13px] text-zinc-400 dark:text-zinc-500 truncate block mt-0.5">
                    {[folderCount > 0 ? `${folderCount} carpeta${folderCount !== 1 ? 's' : ''}` : null, noteCount > 0 ? `${noteCount} nota${noteCount !== 1 ? 's' : ''}` : null].filter(Boolean).join(' · ') || 'Vacía'}
                </span>
            </div>

            {/* Right Arrow */}
            {!isReorderMode && (
                <div className="shrink-0 text-zinc-400 transition-opacity">
                    <ChevronRight size={20} strokeWidth={2.5} />
                </div>
            )}

        </motion.div>
    )
}
