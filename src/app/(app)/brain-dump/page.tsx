'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, Lightbulb, Menu, X, Settings, Search, LayoutGrid, List, Plus, ChevronLeft, MoreVertical, Folder } from 'lucide-react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { cn } from '@/utils/utils'
import NoteItem from '@/components/NoteItem'
import FolderItem from '@/components/FolderItem'
import SectionLoader from '@/components/SectionLoader'
import { getNotes, createNote, updateNote, deleteNote, swapNotePositions, saveNotesOrder } from '@/app/actions/notes'
import { getFolders, createFolder, updateFolder, deleteFolder } from '@/app/actions/folders'

export default function BrainDumpPage() {
    const [view, setView] = useState<'list' | 'create'>('list')
    const [direction, setDirection] = useState(0)
    const [notes, setNotes] = useState<any[]>([])
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
    const [viewportHeight, setViewportHeight] = useState('100vh')
    const [showMoreMenu, setShowMoreMenu] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showFolderModal, setShowFolderModal] = useState(false)
    const [createModalStep, setCreateModalStep] = useState<'options' | 'folder'>('options')
    const [folders, setFolders] = useState<any[]>([])
    const [newFolderName, setNewFolderName] = useState('')
    const [newFolderEmoji, setNewFolderEmoji] = useState<string | null>(null)
    const [newNoteTitle, setNewNoteTitle] = useState('')
    const [newNoteContent, setNewNoteContent] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isReorderMode, setIsReorderMode] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentFolder, setCurrentFolder] = useState<{id: string | null, name: string}>({ id: null, name: 'Repositorio' })
    const [navigationStack, setNavigationStack] = useState<{id: string | null, name: string}[]>([{ id: null, name: 'Repositorio' }])
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (window.visualViewport) {
            const handleResize = () => {
                setViewportHeight(`${window.visualViewport.height}px`);
            };
            window.visualViewport.addEventListener('resize', handleResize);
            handleResize();
            return () => window.visualViewport.removeEventListener('resize', handleResize);
        }
    }, []);

    const hasFetched = useRef(false)

    useEffect(() => {
        const fetchData = async () => {
            if (hasFetched.current) return
            hasFetched.current = true
            setIsLoading(true)
            try {
                const [fetchedNotes, fetchedFolders] = await Promise.all([
                    getNotes(),
                    getFolders()
                ])
                setNotes(fetchedNotes)
                setFolders(fetchedFolders)
            } catch (error) {
                console.error("Error cargando datos:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

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

    const handleEnterFolder = (folder: any) => {
        const newEntry = { id: folder.id, name: folder.name }
        setCurrentFolder(newEntry)
        setNavigationStack(prev => [...prev, newEntry])
    }

    const handleGoBack = () => {
        if (navigationStack.length > 1) {
            const newStack = navigationStack.slice(0, -1)
            const lastEntry = newStack[newStack.length - 1]
            setNavigationStack(newStack)
            setCurrentFolder(lastEntry)
        }
    }

    const handleJumpToPath = (index: number) => {
        const newStack = navigationStack.slice(0, index + 1)
        setNavigationStack(newStack)
        setCurrentFolder(newStack[newStack.length - 1])
    }

    const filteredFolders = folders.filter(f => 
        (f.parent_id === currentFolder.id || (!f.parent_id && !currentFolder.id)) &&
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const folderAwareNotes = notes.filter(n => 
        (n.folder_id === currentFolder.id || (!n.folder_id && !currentFolder.id)) &&
        (n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || n.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    )

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

    const handleEditNote = (note: any) => {
        setEditingNoteId(note.id)
        setNewNoteTitle(note.title)
        setNewNoteContent(note.content)
        setDirection(1)
        setView('create')
    }

    const saveNewNote = async () => {
        const title = newNoteTitle.trim()
        const content = newNoteContent.trim()
        
        if (!title && !content) {
            setDirection(-1)
            setView('list')
            return
        }

        setIsLoading(true)
        try {
            if (editingNoteId) {
                // Update existing note
                const success = await updateNote(editingNoteId, title, content, null, currentFolder.id)
                if (success) {
                    setNotes(prev => prev.map(n => n.id === editingNoteId 
                        ? { ...n, title, content, folder_id: currentFolder.id, updated_at: new Date().toISOString() } 
                        : n
                    ))
                }
            } else {
                // Create new note
                const savedNote = await createNote(title, content, null, currentFolder.id)
                if (savedNote) {
                    setNotes(prev => [savedNote, ...prev])
                }
            }
        } catch (error) {
            console.error("Error al guardar la nota:", error)
        } finally {
            setIsLoading(false)
            setDirection(-1)
            setView('list')
            setNewNoteTitle('')
            setNewNoteContent('')
            setEditingNoteId(null)
            setShowMoreMenu(false)
        }
    }

    const deleteNote = () => {
        if (!editingNoteId) {
            // If creating a new note, just go back
            setDirection(-1)
            setView('list')
            setNewNoteTitle('')
            setNewNoteContent('')
            setShowMoreMenu(false)
            return
        }

        // Transition back
        setDirection(-1)
        setView('list')
        setShowMoreMenu(false)

        // Remove note after transition
        setTimeout(() => {
            setNotes(prev => prev.filter(n => n.id !== editingNoteId))
            setNewNoteTitle('')
            setNewNoteContent('')
            setEditingNoteId(null)
        }, 450)
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0
        })
    }

    return (
        <main className={cn(
            "h-[100dvh] flex justify-center pt-safe-top pb-12 px-1 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black overflow-hidden font-outfit transition-colors duration-300",
            "bg-[#fcfcfc] dark:bg-[#09090b]"
        )}>
            <div className="w-full max-w-2xl h-full flex flex-col relative overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                    {view === 'list' ? (
                        <motion.div
                            key="list-view"
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 100, damping: 20 },
                                opacity: { duration: 0.4 }
                            }}
                            style={{ height: viewportHeight }}
                            className="absolute top-0 left-0 right-0 flex flex-col pt-8"
                        >
                            <header className={cn(
                                "flex flex-col gap-1 px-3 flex-shrink-0 transition-all duration-300",
                                isReorderMode && "opacity-30 scale-[0.98] pointer-events-none grayscale"
                            )}>
                                <div className="flex items-end justify-between">
                                    <h1 className="font-bold text-6xl md:text-8xl tracking-tighter text-zinc-900 dark:text-zinc-50 relative bottom-1.5 whitespace-nowrap">
                                        NoteBox
                                    </h1>
                                    <div className="bg-zinc-200 dark:bg-zinc-800 rounded-full px-6 py-1.5 mt-1 mb-2 flex items-center justify-center">
                                        <span className="text-4xl md:text-5xl font-light text-zinc-600 dark:text-zinc-300">
                                            {notes.length}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-1.5 relative group top-[-2px]">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <Search size={18} className="text-zinc-500 transition-colors group-focus-within:text-zinc-900 dark:text-[#8e8e93] dark:group-focus-within:text-zinc-100" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar notas"
                                        className="w-full h-[52px] pl-12 pr-6 rounded-full bg-zinc-100 dark:bg-[#1c1c1e] border-2 border-transparent focus:border-zinc-200 dark:focus:border-[#2c2c2e] outline-none text-zinc-900 dark:text-zinc-100 text-base font-medium placeholder:text-zinc-400 dark:placeholder:text-[#8e8e93] transition-all shadow-sm focus:shadow-md"
                                    />
                                </div>
                            </header>

                            <div className="flex items-center justify-between gap-1.5 px-3 mt-3.5 mb-8 relative z-[60]">
                                <div className={cn(
                                    "flex-1 flex items-center gap-1.5 transition-all duration-300",
                                    isReorderMode && "opacity-30 scale-[0.98] pointer-events-none grayscale"
                                )}>
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 h-[50px] rounded-2xl bg-zinc-100 dark:bg-[#1c1c1e] border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all shadow-sm"
                                    >
                                        <LayoutGrid size={20} strokeWidth={2.5} />
                                    </motion.button>
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 h-[50px] rounded-2xl bg-zinc-100 dark:bg-[#1c1c1e] border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all shadow-sm"
                                    >
                                        <List size={20} strokeWidth={2.5} />
                                    </motion.button>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <motion.button 
                                        onClick={() => {
                                            setCreateModalStep('options')
                                            setShowCreateModal(true)
                                        }}
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={cn(
                                            "bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-full w-[50px] h-[50px] flex items-center justify-center hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-all duration-300 cursor-pointer flex-shrink-0",
                                            isReorderMode && "opacity-30 scale-[0.95] pointer-events-none grayscale"
                                        )}
                                        title="Añadir Nota"
                                    >
                                        <Plus size={22} className="text-zinc-900 dark:text-zinc-50 group-hover:text-inherit" strokeWidth={3} />
                                    </motion.button>

                                    <motion.button 
                                        onClick={async () => {
                                            if (isReorderMode) {
                                                await saveNotesOrder(notes.map(n => n.id))
                                            }
                                            setIsReorderMode(!isReorderMode)
                                        }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={cn(
                                            "border-2 rounded-full w-[50px] h-[50px] flex items-center justify-center transition-all duration-300 cursor-pointer flex-shrink-0 shadow-lg",
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
                                                {isReorderMode ? <X size={22} strokeWidth={3} /> : <Menu size={22} strokeWidth={3} />}
                                            </motion.div>
                                        </AnimatePresence>
                                    </motion.button>
                                </div>
                            </div>

                            {/* Barra de Navegación (Ruta / Breadcrumbs) */}
                            <div className={cn(
                                "px-3 -mt-4 mb-6 flex items-center gap-2 transition-all duration-300",
                                isReorderMode && "opacity-30 pointer-events-none grayscale"
                            )}>
                                <motion.button
                                    whileHover={{ scale: navigationStack.length > 1 ? 1.05 : 1 }}
                                    whileTap={{ scale: navigationStack.length > 1 ? 0.95 : 1 }}
                                    onClick={handleGoBack}
                                    className={cn(
                                        "w-11 h-11 rounded-2xl bg-zinc-50 dark:bg-zinc-500 flex items-center justify-center text-zinc-900 dark:text-white shadow-sm flex-shrink-0 border-2 border-zinc-200 dark:border-zinc-400 transition-all",
                                        navigationStack.length <= 1 && "opacity-20 grayscale pointer-events-none border-transparent shadow-none"
                                    )}
                                >
                                    <ChevronLeft size={24} strokeWidth={3.5} />
                                </motion.button>
                                <div className="flex-1 h-11 rounded-2xl bg-zinc-100/50 dark:bg-[#1c1c1e] border-2 border-zinc-200/60 dark:border-zinc-800/80 flex items-center px-4 overflow-hidden shadow-sm">
                                    <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-400 dark:text-zinc-500 overflow-x-auto whitespace-nowrap no-scrollbar">
                                        {navigationStack.map((step, index) => (
                                            <div key={step.id || 'root'} className="flex items-center gap-1.5">
                                                {index > 0 && <span className="text-zinc-300 dark:text-zinc-700 font-bold">/</span>}
                                                <button 
                                                    onClick={() => handleJumpToPath(index)}
                                                    className={cn(
                                                        "hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors py-1",
                                                        index === navigationStack.length - 1 && "text-zinc-900 dark:text-zinc-100 font-bold"
                                                    )}
                                                >
                                                    {step.name}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

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
                                            {folderAwareNotes.length === 0 && searchQuery ? (
                                                <div className="text-center py-20">
                                                    <p className="text-zinc-500">No se encontraron notas que coincidan con "{searchQuery}"</p>
                                                </div>
                                            ) : (folderAwareNotes.length === 0 && filteredFolders.length === 0) ? (
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
                                                        <Folder className="text-zinc-800 dark:text-zinc-200" size={40} strokeWidth={1.5} />
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
                                                    className="flex flex-col gap-3.5 pb-20 px-2"
                                                >
                                                    {/* Folders rendered above notes */}
                                                    <AnimatePresence>
                                                        {filteredFolders.map((folder) => (
                                                            <motion.div
                                                                key={folder.id}
                                                                layout
                                                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                            >
                                                                <FolderItem
                                                                    folder={folder}
                                                                    onClick={() => handleEnterFolder(folder)}
                                                                    isReorderMode={isReorderMode && !searchQuery}
                                                                    noteCount={notes.filter(n => n.folder_id === folder.id).length}
                                                                />
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>

                                                    {folderAwareNotes.map((note) => (
                                                        <motion.div 
                                                            key={note.id} 
                                                            layout
                                                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                                            transition={{ 
                                                                type: "spring",
                                                                stiffness: 400,
                                                                damping: 30
                                                            }}
                                                        >
                                                            <Reorder.Item 
                                                                key={note.id} 
                                                                value={note}
                                                                dragListener={isReorderMode && !searchQuery}
                                                            >
                                                                <NoteItem 
                                                                    note={note}
                                                                    onClick={() => handleEditNote(note)}
                                                                    isReorderMode={isReorderMode && !searchQuery}
                                                                />
                                                            </Reorder.Item>
                                                        </motion.div>
                                                    ))}
                                                </Reorder.Group>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="create-view"
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 100, damping: 20 },
                                opacity: { duration: 0.4 }
                            }}
                            style={{ height: viewportHeight }}
                            className="absolute top-0 left-0 right-0 flex flex-col px-6 pt-8 bg-zinc-50 dark:bg-zinc-950"
                        >
                            <header className="relative flex items-center justify-center pt-0 pb-4 min-h-[48px]">
                                <motion.button 
                                    onClick={saveNewNote}
                                    whileHover={{ x: -4 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute left-[-10px] top-0 w-12 h-10 flex items-center justify-center text-zinc-900 dark:text-zinc-50"
                                >
                                    <svg 
                                        width="28" 
                                        height="24" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="1.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    >
                                        <path d="M21 12H3M3 12L9 6M3 12L9 18" />
                                    </svg>
                                </motion.button>
                                
                                <div className="absolute right-0 top-0">
                                    <motion.button 
                                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={cn(
                                            "w-10 h-10 flex items-center justify-center transition-colors",
                                            showMoreMenu ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                                        )}
                                    >
                                        <MoreVertical size={20} />
                                    </motion.button>

                                    <AnimatePresence>
                                        {showMoreMenu && (
                                            <>
                                                {/* Backdrop to close menu */}
                                                <div 
                                                    className="fixed inset-0 z-40" 
                                                    onClick={() => setShowMoreMenu(false)}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
                                                    className="absolute right-0 top-12 w-72 bg-zinc-900 dark:bg-[#1c1c1e] rounded-[24px] shadow-2xl z-50 overflow-hidden py-2"
                                                >
                                                    <div className="flex flex-col">
                                                        <button className="w-full px-6 py-4 text-left text-zinc-300 hover:bg-white/5 transition-colors text-[17px] font-medium">
                                                            Recordatorio
                                                        </button>
                                                        <button className="w-full px-6 py-4 text-left text-zinc-300 hover:bg-white/5 transition-colors text-[17px] font-medium">
                                                            Ocultar
                                                        </button>
                                                        <button className="w-full px-6 py-4 text-left text-zinc-300 hover:bg-white/5 transition-colors text-[17px] font-medium leading-tight">
                                                            Colocar en la pantalla de inicio
                                                        </button>
                                                        <button className="w-full px-6 py-4 text-left text-zinc-300 hover:bg-white/5 transition-colors text-[17px] font-medium">
                                                            Mover a
                                                        </button>
                                                        <button 
                                                            onClick={deleteNote}
                                                            className="w-full px-6 py-4 text-left text-zinc-300 hover:bg-white/5 transition-colors text-[17px] font-medium"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </header>

                            <div 
                                ref={scrollContainerRef}
                                className="flex-1 overflow-y-auto mt-2 pr-2 custom-scrollbar pb-60"
                            >
                                <input
                                    type="text"
                                    value={newNoteTitle}
                                    onChange={(e) => setNewNoteTitle(e.target.value)}
                                    placeholder="Título"
                                    className="w-full text-[30px] font-bold bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-800 tracking-tight"
                                />
                                
                                <div className="flex items-center gap-2 mt-4 text-zinc-400 dark:text-zinc-600 font-medium text-sm">
                                    <span>{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
                                    <span>{new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()}</span>
                                    <span className="opacity-50">|</span>
                                    <span>{newNoteContent.length} caracteres</span>
                                </div>

                                <textarea
                                    ref={(el) => {
                                        if (el) {
                                            el.style.height = 'auto';
                                            el.style.height = el.scrollHeight + 'px';
                                        }
                                    }}
                                    value={newNoteContent}
                                    onFocus={() => {
                                        setTimeout(() => {
                                            if (scrollContainerRef.current) {
                                                scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                                            }
                                        }, 300);
                                    }}
                                    onChange={(e) => {
                                        setNewNoteContent(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                        
                                        // Auto-scroll to follow cursor
                                        if (scrollContainerRef.current) {
                                            const isAtEnd = e.target.selectionStart === e.target.value.length;
                                            if (isAtEnd) {
                                                scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                                            }
                                        }
                                    }}
                                    placeholder="Empiece a escribir"
                                    className="w-full mt-6 bg-transparent border-none outline-none resize-none text-xl text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-300 dark:placeholder:text-zinc-800 leading-relaxed overflow-hidden"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                            {/* Backdrop with strong blur */}
                            <motion.div
                                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                                animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                                exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                                onClick={() => setShowCreateModal(false)}
                                className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60"
                            />

                            {/* Modal Container Inspired by Today View */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-full max-w-[320px] h-[396px] bg-white dark:bg-[#1c1c1e] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800"
                                style={{ backgroundColor: 'var(--surface)' }}
                            >
                                <AnimatePresence mode="wait">
                                    {createModalStep === 'options' ? (
                                        <motion.div
                                            key="options"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex flex-col gap-6 p-8 h-full"
                                        >
                                            <div className="text-center">
                                                <h3 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tighter">Crear</h3>
                                            </div>
                                            
                                            <div className="flex flex-col gap-3">
                                                <button 
                                                    onClick={() => {
                                                        setShowCreateModal(false)
                                                        setDirection(1)
                                                        setView('create')
                                                    }}
                                                    className="flex items-center gap-5 w-full p-6 rounded-[24px] transition-all active:scale-[0.97] text-left border border-zinc-200 dark:border-zinc-700/70 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/80"
                                                >
                                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex-shrink-0">
                                                        <FileText size={26} />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="block text-[18px] font-bold text-zinc-900 dark:text-zinc-50 leading-tight">Nota</span>
                                                        <span className="block text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-snug">Escribe una idea, reflexión o apunte rápido</span>
                                                    </div>
                                                </button>
                                                
                                                <button 
                                                    onClick={() => {
                                                        setCreateModalStep('folder')
                                                    }}
                                                    className="flex items-center gap-5 w-full p-6 rounded-[24px] transition-all active:scale-[0.97] text-left border border-zinc-200 dark:border-zinc-700/70 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/80"
                                                >
                                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex-shrink-0">
                                                        <Folder size={26} />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="block text-[18px] font-bold text-zinc-900 dark:text-zinc-50 leading-tight">Carpeta</span>
                                                        <span className="block text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-snug">Agrupa y organiza tus notas en un lugar</span>
                                                    </div>
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="folder"
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 50 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex flex-col gap-4 p-8 h-full relative"
                                        >
                                            <div className="relative flex items-center justify-start gap-4 mb-1 -ml-3">
                                                <button 
                                                    onClick={() => setCreateModalStep('options')}
                                                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors shadow-sm"
                                                >
                                                    <ChevronLeft size={22} strokeWidth={2.5} className="mr-0.5" />
                                                </button>
                                                <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tighter">Nueva carpeta</h3>
                                            </div>
                                            {/* Folder Form */}
                                            <div className="flex flex-col gap-3">
                                                <input
                                                    type="text"
                                                    value={newFolderName}
                                                    onChange={(e) => setNewFolderName(e.target.value)}
                                                    placeholder="Nombre de la carpeta"
                                                    className="w-full px-4 py-3.5 rounded-[18px] bg-zinc-100 dark:bg-[#2c2c2e] border-2 border-transparent focus:border-zinc-200 dark:focus:border-zinc-700 outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 font-medium transition-all text-base"
                                                />
                                                
                                                <div className="flex items-stretch gap-3">
                                                    <div className="relative aspect-square h-full flex-shrink-0 max-h-[96px]">
                                                        <input
                                                            type="text"
                                                            value={newFolderEmoji || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                const chars = Array.from(val);
                                                                if (chars.length > 0) {
                                                                    setNewFolderEmoji(chars[chars.length - 1]);
                                                                } else {
                                                                    setNewFolderEmoji(null);
                                                                }
                                                            }}
                                                            onFocus={(e) => e.target.select()}
                                                            className="absolute inset-0 w-full h-full rounded-[22px] bg-transparent transition-colors border-2 border-dashed border-zinc-300 dark:border-zinc-700/80 text-center text-4xl outline-none focus:border-solid focus:border-zinc-400 dark:focus:border-zinc-500 cursor-text caret-transparent"
                                                        />
                                                        {!newFolderEmoji && (
                                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                <Folder size={30} className="text-zinc-500 dark:text-zinc-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 rounded-[22px] border-2 border-dashed border-zinc-300 dark:border-zinc-700/80 p-3.5 flex flex-col justify-center bg-transparent">
                                                        <p className="text-[12px] sm:text-[13px] text-zinc-500 font-medium leading-snug">
                                                            Escribe un emoji o un carácter único.
                                                            Si lo dejas vacío, usaremos el icono
                                                            por defecto.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 mt-auto">
                                                <button
                                                    onClick={() => {
                                                        setCreateModalStep('options')
                                                        setNewFolderName('')
                                                        setNewFolderEmoji(null)
                                                    }}
                                                    className="flex-1 py-3.5 rounded-[18px] bg-zinc-100 dark:bg-[#2c2c2e] text-zinc-600 dark:text-zinc-300 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const name = newFolderName.trim();
                                                        if (!name) return;

                                                        setIsLoading(true);
                                                        try {
                                                            // Pasamos el currentFolder.id como parent_id si existe
                                                            const folder = await createFolder(name, newFolderEmoji, currentFolder.id);
                                                            if (folder) {
                                                                // Aseguramos que el parent_id esté presente localmente
                                                                setFolders(prev => [folder, ...prev]);
                                                            }
                                                            setShowCreateModal(false);
                                                            setCreateModalStep('options');
                                                            setNewFolderName('');
                                                            setNewFolderEmoji(null);
                                                        } catch (error) {
                                                            console.error("Error al crear carpeta:", error);
                                                        } finally {
                                                            setIsLoading(false);
                                                        }
                                                    }}
                                                    disabled={!newFolderName.trim() || isLoading}
                                                    className="flex-1 py-3.5 rounded-[18px] bg-[var(--accent)] text-white font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                                                >
                                                    {isLoading ? (
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : "Crear"}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    )
}
