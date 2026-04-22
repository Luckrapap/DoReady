'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical, Save, ChevronUp, ChevronDown, Trash2, Pencil, X, Settings, Check, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/utils/utils'

interface Note {
    id: string
    title: string
    content: string
    emoji?: string | null
}

interface NoteModalProps {
    note?: Note | null
    isOpen: boolean
    onClose: () => void
    onSave: (id: string | undefined, title: string, content: string, emoji: string | null) => Promise<void>
    onDelete?: (id: string) => Promise<void>
    onMoveUp?: (id: string) => Promise<void>
    onMoveDown?: (id: string) => Promise<void>
    notes?: Note[]
}

export default function NoteModal({
    note, isOpen, onClose, onSave, onDelete, onMoveUp, onMoveDown, notes = []
}: NoteModalProps) {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [emoji, setEmoji] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [modalScreen, setModalScreen] = useState<'view' | 'edit' | 'delete' | 'customize'>(
        note ? 'view' : 'edit'
    )
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
    const [prevNoteId, setPrevNoteId] = useState<string | undefined>(note?.id)

    const isEditing = !!note

    // Sync state synchronously during render to prevent UI flashes or unwanted transitions
    if (isOpen !== prevIsOpen || note?.id !== prevNoteId) {
        setPrevIsOpen(isOpen)
        setPrevNoteId(note?.id)
        if (isOpen) {
            setTitle(note?.title || '')
            setContent(note?.content || '')
            setEmoji(note?.emoji || '')
            setModalScreen(note ? 'view' : 'edit')
            setIsMenuOpen(false)
            setIsExpanded(false)
        }
    }

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!content.trim() || isSaving) return

        setIsSaving(true)
        try {
            await onSave(note?.id, title.trim(), content.trim(), emoji.trim() || null)
            onClose()
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!note || !onDelete || isSaving) return
        setIsSaving(true)
        try {
            await onDelete(note.id)
            onClose()
        } finally {
            setIsSaving(false)
            setIsMenuOpen(false)
            setModalScreen('view')
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 pointer-events-none transition-all duration-300 ease-out">
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ 
                                type: "spring", 
                                damping: 30, 
                                stiffness: 400,
                                mass: 0.8,
                                layout: { duration: 0.4, type: "spring", bounce: 0 }
                            }}
                            className={cn(
                                "w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-[24px] shadow-2xl overflow-hidden pointer-events-auto flex flex-col",
                                isExpanded ? "h-[calc(var(--vh,1vh)*85)]" : "min-h-[500px] max-h-[calc(var(--vh,1vh)*85)]"
                            )}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {modalScreen === 'view' ? (
                                    <motion.div
                                        key="view-screen"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className={cn(
                                            "p-6 flex flex-col flex-1 min-h-0",
                                            isExpanded ? "pb-4" : "pb-6"
                                        )}
                                    >
                                        <div className="relative flex justify-center items-center mb-8">
                                            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                                                Registro
                                            </h3>

                                            <div className="absolute right-0">
                                                <button
                                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                                    className={cn(
                                                        "p-2 rounded-full transition-colors",
                                                        isMenuOpen ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                                                    )}
                                                >
                                                    <MoreVertical size={24} />
                                                </button>

                                                <AnimatePresence>
                                                    {isMenuOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                                            className="absolute top-12 right-0 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xl py-2 min-w-[140px] overflow-hidden z-[60]"
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    setModalScreen('edit');
                                                                    setIsMenuOpen(false);
                                                                }}
                                                                className="w-full px-4 py-3 flex items-center justify-between gap-4 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <Pencil size={18} />
                                                                    <span className="text-sm font-bold">Editar</span>
                                                                </div>
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setIsExpanded(!isExpanded);
                                                                    setIsMenuOpen(false);
                                                                }}
                                                                className="w-full px-4 py-3 flex items-center justify-between gap-4 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-t border-zinc-100 dark:border-zinc-800"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                                                    <span className="text-sm font-bold">{isExpanded ? 'Reducir' : 'Expandir'}</span>
                                                                </div>
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <motion.div 
                                            layout="position"
                                            className={cn(
                                                "flex flex-col flex-1 min-h-0",
                                                isExpanded ? "gap-4" : "gap-4",
                                                "overflow-y-auto no-scrollbar"
                                            )}
                                        >
                                            <motion.div layout="position" className="space-y-2">
                                                <h4 className="text-[15px] font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider ml-4">
                                                    Título
                                                </h4>
                                                <div className="w-full bg-zinc-50 dark:bg-black/20 border border-[var(--border)] rounded-[22px] px-6 py-4 text-lg text-zinc-900 dark:text-zinc-50 opacity-80">
                                                    {title || "Sin título"}
                                                </div>
                                            </motion.div>

                                            <motion.div layout="position" className="flex flex-col min-h-0 flex-1 pb-2 space-y-2">
                                                <h4 className="text-[15px] font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider ml-4">
                                                    Contenido
                                                </h4>
                                                <div className={cn(
                                                    "w-full bg-zinc-50 dark:bg-black/20 border border-[var(--border)] rounded-[28px] px-6 py-6 text-lg text-zinc-900 dark:text-zinc-50 opacity-80 overflow-y-auto break-words no-scrollbar whitespace-pre-wrap transition-colors flex-grow min-h-0 h-full"
                                                )}>
                                                    {content}
                                                </div>
                                            </motion.div>
                                        </motion.div>


                                    </motion.div>
                                ) : modalScreen === 'edit' ? (
                                    <motion.div
                                        key="edit-screen"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className={cn(
                                            "p-6 flex flex-col flex-1 min-h-0",
                                            isExpanded ? "pb-4" : "pb-6"
                                        )}
                                    >
                                        <div className="relative flex justify-center items-center mb-8">
                                            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                                                {isEditing ? 'Editar entrada' : 'Nueva entrada'}
                                            </h3>

                                            <div className="absolute right-0">
                                                <button
                                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                                    className={cn(
                                                        "p-2 rounded-full transition-colors",
                                                        isMenuOpen ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                                                    )}
                                                >
                                                    <MoreVertical size={24} />
                                                </button>

                                                <AnimatePresence>
                                                    {isMenuOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                                            className="absolute top-12 right-0 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xl py-2 min-w-[140px] overflow-hidden z-[60]"
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    setIsExpanded(!isExpanded);
                                                                    setIsMenuOpen(false);
                                                                }}
                                                                className="w-full px-4 py-3 flex items-center justify-between gap-4 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                                                    <span className="text-sm font-bold">{isExpanded ? 'Reducir' : 'Expandir'}</span>
                                                                </div>
                                                            </button>

                                                            {isEditing && (
                                                                <button
                                                                    onClick={() => { setIsMenuOpen(false); setModalScreen('delete'); }}
                                                                    className="w-full px-4 py-3 flex items-center justify-center gap-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border-t border-zinc-100 dark:border-zinc-800"
                                                                >
                                                                    <Trash2 size={18} />
                                                                    <span className="text-sm font-bold">Eliminar</span>
                                                                </button>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <motion.form 
                                            layout="position"
                                            onSubmit={handleSave} 
                                                className={cn(
                                                "flex flex-col flex-1 min-h-0",
                                                isExpanded ? "gap-4" : "gap-4",
                                                "overflow-y-auto"
                                            )}
                                        >
                                            <motion.div layout="position" className="space-y-2">
                                                <h4 className="text-[15px] font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider ml-4">
                                                    Título
                                                </h4>
                                                <input
                                                    type="text"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    className="w-full bg-zinc-50 dark:bg-black/20 border border-[var(--border)] rounded-[22px] px-6 py-4 text-lg text-zinc-900 dark:text-zinc-50 outline-none focus:border-[var(--accent)] transition-colors"
                                                    placeholder="Nombre de la nota..."
                                                    disabled={isSaving}
                                                />
                                            </motion.div>

                                            <motion.div layout="position" className={cn("flex flex-col min-h-0", isExpanded ? "flex-1 pb-2" : "space-y-2 pb-0")}>
                                                <h4 className="text-[15px] font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider ml-4">
                                                    Contenido
                                                </h4>
                                                <textarea
                                                    value={content}
                                                    onChange={(e) => setContent(e.target.value)}
                                                    className={cn(
                                                        "w-full bg-zinc-50 dark:bg-black/20 border border-[var(--border)] rounded-[28px] px-6 py-6 text-lg text-zinc-900 dark:text-zinc-50 outline-none focus:border-[var(--accent)] transition-colors resize-none break-words leading-relaxed",
                                                        isExpanded ? "flex-grow min-h-0 h-full" : "min-h-[200px]"
                                                    )}
                                                    placeholder="Escribe lo que piensas..."
                                                    disabled={isSaving}
                                                />
                                            </motion.div>
                                        </motion.form>

                                        <AnimatePresence initial={false}>
                                            {!isExpanded && (
                                                <motion.div
                                                    layout="position"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden flex-shrink-0"
                                                >
                                                    <div className="pt-6 w-full">
                                                        <button
                                                            type="submit"
                                                            onClick={handleSave}
                                                            disabled={isSaving || !content.trim()}
                                                            className="h-[58px] w-full flex items-center justify-center gap-4 rounded-[22px] bg-[var(--accent)] text-[var(--theme-on-accent)] hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 font-bold"
                                                            title="Guardar entrada"
                                                        >
                                                            <Save size={20} />
                                                            <span>Guardar</span>
                                                        </button>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => setModalScreen('customize')}
                                                        className="w-full h-[58px] flex items-center justify-center gap-4 rounded-[22px] bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95 font-bold mt-3"
                                                    >
                                                        <Settings size={20} />
                                                        <span>Más opciones</span>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ) : modalScreen === 'customize' ? (
                                    <motion.div
                                        key="customize-screen"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="p-6 flex flex-col flex-1"
                                    >
                                        <div className="relative flex justify-center items-center mb-8">
                                            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                                                Personalizar
                                            </h3>
                                        </div>

                                        <div className="flex-1 flex flex-col gap-6">
                                            <div className="space-y-4">
                                                <div className="flex flex-col gap-1.5 ml-1">
                                                    <h4 className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                                        Etiqueta
                                                    </h4>
                                                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400 font-medium">
                                                        Personaliza el icono de esta nota
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="relative group">
                                                        <input
                                                            type="text"
                                                            value={emoji}
                                                            onChange={(e) => {
                                                                const val = e.target.value
                                                                if (!val) {
                                                                    setEmoji('')
                                                                    return
                                                                }
                                                                // Always take ONLY the last visual character (supports complex emojis)
                                                                const chars = Array.from(val)
                                                                setEmoji(chars[chars.length - 1])
                                                            }}
                                                            placeholder="📄"
                                                            className="w-20 h-20 bg-zinc-50 dark:bg-black/20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[22px] text-3xl flex items-center justify-center text-center outline-none focus:border-[var(--accent)] focus:bg-white dark:focus:bg-zinc-900 transition-all"
                                                            maxLength={4}
                                                        />
                                                    </div>
                                                    <div className="flex-1 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-[var(--border)] border-dashed">
                                                        <p className="text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500 font-medium">
                                                            Escribe un emoji o un carácter único. Si lo dejas vacío, usaremos el icono por defecto.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setModalScreen('edit')}
                                                className="flex-1 h-[58px] flex items-center justify-center gap-4 rounded-[22px] bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold transition-all hover:bg-zinc-300 dark:hover:bg-zinc-700 active:scale-95"
                                            >
                                                <X size={20} />
                                                <span>Volver</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setModalScreen('edit')}
                                                className="flex-1 h-[58px] flex items-center justify-center gap-4 rounded-[22px] bg-[var(--accent)] text-[var(--theme-on-accent)] font-bold transition-all hover:opacity-90 active:scale-95"
                                            >
                                                <Check size={20} />
                                                <span>Aceptar</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="delete-screen"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="p-6 pt-20 flex flex-col items-center text-center flex-1"
                                    >
                                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-sm">
                                            <Trash2 size={36} />
                                        </div>
                                        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">
                                            ¿Estás seguro?
                                        </h2>
                                        <p className="text-zinc-500 dark:text-zinc-400 mb-auto px-4 text-center max-w-[280px]">
                                            Esta nota se eliminará permanentemente.
                                        </p>

                                        <div className="flex gap-4 h-[58px] w-full mt-12">
                                            <button
                                                onClick={() => setModalScreen('edit')}
                                                className="flex-1 rounded-[22px] bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center gap-4 text-zinc-900 dark:text-white font-bold transition-all hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                            >
                                                <span>No</span>
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                disabled={isSaving}
                                                className="flex-1 rounded-[22px] bg-red-500 text-white flex items-center justify-center gap-4 font-bold shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 active:scale-95 disabled:opacity-50"
                                            >
                                                <span>Sí</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
