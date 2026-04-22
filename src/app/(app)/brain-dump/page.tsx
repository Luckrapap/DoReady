'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, FileText, Lightbulb, Menu, X, Settings } from 'lucide-react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { cn } from '@/utils/utils'
import NoteModal from '@/components/NoteModal'
import NoteItem from '@/components/NoteItem'
import SectionLoader from '@/components/SectionLoader'
import { getNotes, createNote, updateNote, deleteNote, swapNotePositions, saveNotesOrder } from '@/app/actions/notes'

export default function BrainDumpPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingNote, setEditingNote] = useState<any>(null)
    const [notes, setNotes] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isReorderMode, setIsReorderMode] = useState(false)
    const hasFetched = useRef(false)

    useEffect(() => {
        const fetchNotes = async () => {
            if (hasFetched.current) return
            hasFetched.current = true
            setIsLoading(true)
            try {
                const fetchedNotes = await getNotes()
                setNotes(fetchedNotes)
            } catch (error) {
                console.error("Error cargando notas:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchNotes()
    }, [])

    const handleSaveNote = async (id: string | undefined, title: string, content: string, emoji: string | null) => {
        if (id) {
            // Update on server
            const success = await updateNote(id, title, content, emoji)
            if (success) {
                setNotes(notes.map(n => n.id === id ? { ...n, title, content, emoji } : n))
            }
        } else {
            // Create on server
            const newNote = await createNote(title, content, emoji)
            if (newNote) {
                setNotes([newNote, ...notes])
            }
        }
        setIsModalOpen(false)
        setEditingNote(null)
    }

    const handleDeleteNote = async (id: string) => {
        const success = await deleteNote(id)
        if (success) {
            setNotes(notes.filter(n => n.id !== id))
            setIsModalOpen(false)
            setEditingNote(null)
        }
    }

    const handleMoveUp = async (id: string) => {
        const idx = notes.findIndex(n => n.id === id)
        if (idx <= 0) return
        const prev = notes[idx - 1]
        const newNotes = [...notes]
        newNotes[idx] = prev
        newNotes[idx - 1] = notes[idx]
        setNotes(newNotes)
        await swapNotePositions(id, prev.id)
    }

    const handleMoveDown = async (id: string) => {
        const idx = notes.findIndex(n => n.id === id)
        if (idx === -1 || idx >= notes.length - 1) return
        const next = notes[idx + 1]
        const newNotes = [...notes]
        newNotes[idx] = next
        newNotes[idx + 1] = notes[idx]
        setNotes(newNotes)
        await swapNotePositions(id, next.id)
    }

    return (
        <main className={cn(
            "h-[100dvh] flex justify-center pt-safe-top pb-12 px-1 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black overflow-hidden font-outfit transition-colors duration-300",
            isReorderMode && "bg-black/5 dark:bg-black/40"
        )}>
            <div className="w-full max-w-xl h-full flex flex-col pt-8">
                <section className="flex flex-col h-full">
                    <header className={cn(
                        "flex flex-col gap-1 px-3 flex-shrink-0 transition-all duration-300",
                        isReorderMode && "opacity-30 scale-[0.98] pointer-events-none grayscale"
                    )}>
                        <div className="flex items-end justify-between">
                            <h1 className="font-bold text-6xl md:text-8xl tracking-tighter text-zinc-900 dark:text-zinc-50 relative bottom-1.5 whitespace-nowrap">
                                IdeaBox
                            </h1>
                            <div className="bg-zinc-200 dark:bg-zinc-800 rounded-full px-6 py-2.5 mt-2 mb-1 flex items-center justify-center">
                                <span className="text-4xl md:text-5xl font-light text-zinc-600 dark:text-zinc-300">
                                    {notes.length}
                                </span>
                            </div>
                        </div>
                        <p className="text-base font-medium text-zinc-400 capitalize">Escribe lo que piensas</p>
                    </header>

                    <motion.div 
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                            type: "spring",
                            damping: 25,
                            stiffness: 200,
                            delay: 0
                        }}
                        className="flex items-center justify-between gap-1.5 px-3 mt-6 mb-8 relative z-[60]"
                    >
                        {/* Left Title Label */}
                        <div className={cn(
                            "flex items-center transition-all duration-300",
                            isReorderMode && "opacity-30 scale-[0.98] pointer-events-none grayscale"
                        )}>
                            <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tighter">Notas:</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {/* Left Plus Button */}
                            <motion.button 
                                onClick={() => { setEditingNote(null); setIsModalOpen(true); }}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                className={cn(
                                    "bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-full w-[54px] h-[54px] flex items-center justify-center hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-all duration-300 cursor-pointer flex-shrink-0",
                                    isReorderMode && "opacity-30 scale-[0.95] pointer-events-none grayscale"
                                )}
                                title="Añadir Nota"
                            >
                                <Plus size={24} className="text-zinc-900 dark:text-zinc-50 group-hover:text-inherit" strokeWidth={3} />
                            </motion.button>

                            {/* Middle Reorder Button (Menu/X) */}
                            <motion.button 
                                onClick={async () => {
                                    if (isReorderMode) {
                                        await saveNotesOrder(notes)
                                    }
                                    setIsReorderMode(!isReorderMode)
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={cn(
                                    "border-2 rounded-full w-[54px] h-[54px] flex items-center justify-center transition-all duration-300 cursor-pointer flex-shrink-0 shadow-lg",
                                    isReorderMode 
                                        ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-950 scale-110" 
                                        : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-200"
                                )}
                                title={isReorderMode ? "Guardar orden" : "Reordenar notas"}
                                style={{ pointerEvents: 'auto' }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={isReorderMode ? 'x' : 'menu'}
                                        initial={{ opacity: 0, scale: 0.3 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.3 }}
                                        transition={{ 
                                            type: "spring",
                                            stiffness: 700,
                                            damping: 35,
                                            mass: 0.5
                                        }}
                                    >
                                        {isReorderMode ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
                                    </motion.div>
                                </AnimatePresence>
                            </motion.button>

                            {/* Right Settings Button (Gear) */}
                            <motion.button
                                onClick={() => {}} // Dummy for now
                                whileHover={{ scale: 1.1, rotate: 45 }}
                                whileTap={{ scale: 0.9 }}
                                className={cn(
                                    "bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-full w-[54px] h-[54px] flex items-center justify-center hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-all duration-300 cursor-pointer flex-shrink-0",
                                    isReorderMode && "opacity-30 scale-[0.95] pointer-events-none grayscale"
                                )}
                                title="Ajustes (Próximamente)"
                            >
                                <Settings size={24} className="text-zinc-900 dark:text-zinc-50 group-hover:text-inherit" strokeWidth={2} />
                            </motion.button>
                        </div>
                    </motion.div>

                    <NoteModal 
                        isOpen={isModalOpen || !!editingNote}
                        note={editingNote}
                        onClose={() => { setIsModalOpen(false); setEditingNote(null); }}
                        onSave={handleSaveNote}
                        onDelete={handleDeleteNote}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        notes={notes}
                    />

                    <div className="flex-1 px-3 overflow-y-auto">
                        {isLoading ? (
                            <SectionLoader />
                        ) : (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.4 }}
                                className="h-full w-full bg-[var(--background)]"
                            >
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {notes.length === 0 ? (
                                        <motion.div
                                            key="empty-state"
                                            initial={{ opacity: 1, scale: 1 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="flex flex-col items-center justify-center py-20 rounded-[32px] gap-6"
                                            style={{
                                                backgroundColor: 'color-mix(in srgb, var(--surface) 20%, transparent)'
                                            }}
                                        >
                                            <div className="w-20 h-20 flex items-center justify-center rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
                                                <Lightbulb className="text-zinc-800 dark:text-zinc-200" size={40} strokeWidth={1.5} />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xl tracking-tight">Tu espacio está vacío.</p>
                                                <p className="text-base text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-[260px]">Empieza a escribir aquí</p>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <Reorder.Group 
                                            axis="y" 
                                            values={notes} 
                                            onReorder={setNotes}
                                            className="flex flex-col gap-2.5 pb-20"
                                        >
                                            {notes.map((note) => (
                                                <Reorder.Item 
                                                    key={note.id} 
                                                    value={note}
                                                    dragListener={isReorderMode}
                                                >
                                                    <NoteItem 
                                                        note={note}
                                                        onClick={() => !isReorderMode && setEditingNote(note)}
                                                        isReorderMode={isReorderMode}
                                                    />
                                                </Reorder.Item>
                                            ))}
                                        </Reorder.Group>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    )
}
