'use client'

import { Folder, ChevronRight, ListChecks, GripVertical } from 'lucide-react'
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
    isSelected?: boolean
    isSelectionMode?: boolean
    onLongPress?: () => void
    onSelect?: () => void
    onDragHandlePointerDown?: (e: React.PointerEvent) => void
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

export default function FolderItem({ folder, onClick, isReorderMode, noteCount = 0, folderCount = 0, isSelected, isSelectionMode, onLongPress, onSelect, onDragHandlePointerDown }: FolderItemProps) {
    return (
        <motion.div
            initial="idle"
            animate="idle"
            whileTap={{ scale: (isReorderMode || isSelectionMode) ? 1.02 : 0.98 }}
            onClick={() => {
                if (isSelectionMode && onSelect) {
                    onSelect();
                } else if (!isReorderMode && onClick) {
                    onClick();
                }
            }}
            onContextMenu={(e) => {
                if (!isSelectionMode && onLongPress) {
                    e.preventDefault();
                    onLongPress();
                }
            }}
            className={cn(
                "group relative flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 tap-highlight-transparent",
                isSelectionMode 
                    ? isSelected 
                        ? "bg-zinc-200 dark:bg-zinc-700 shadow-sm z-10" 
                        : "bg-white dark:bg-zinc-800/60"
                    : isReorderMode 
                        ? "cursor-grab active:cursor-grabbing bg-white dark:bg-zinc-800 shadow-md z-10" 
                        : "cursor-pointer bg-white dark:bg-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-700/60"
            )}
        >
            {/* Folder Icon */}
            <Folder size={22} strokeWidth={0} className="shrink-0 fill-yellow-400" />

            {/* Name + subtitle */}
            <div className="flex-1 min-w-0">
                <span className={cn(
                    "text-[16px] transition-all duration-300 truncate block font-medium",
                    (isReorderMode || isSelected)
                        ? "text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-800 dark:text-zinc-200"
                )}>
                    {folder.name || 'Sin nombre'}
                </span>
                <span className="text-[13px] text-zinc-400 dark:text-zinc-500 truncate block mt-0.5">
                    {[folderCount > 0 ? `${folderCount} carpeta${folderCount !== 1 ? 's' : ''}` : null, noteCount > 0 ? `${noteCount} nota${noteCount !== 1 ? 's' : ''}` : null].filter(Boolean).join(' · ') || 'Vacía'}
                </span>
            </div>

            {/* Selection Circle / Right Arrow / Drag Handle */}
            {isSelectionMode ? (
                <div className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center flex-shrink-0",
                    isSelected 
                        ? "bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900" 
                        : "bg-zinc-200/50 dark:bg-zinc-700/50 border-transparent"
                )}>
                    {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </div>
            ) : isReorderMode ? (
                <div
                    className="shrink-0 text-zinc-400 dark:text-zinc-500 cursor-grab active:cursor-grabbing touch-none px-1 py-2"
                    onPointerDown={onDragHandlePointerDown}
                >
                    <GripVertical size={20} strokeWidth={2} />
                </div>
            ) : (
                <div className="shrink-0 text-zinc-400 transition-opacity">
                    <ChevronRight size={20} strokeWidth={2.5} />
                </div>
            )}

        </motion.div>
    )
}
