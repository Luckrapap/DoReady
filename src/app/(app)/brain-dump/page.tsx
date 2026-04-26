'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { FileText, Lightbulb, Menu, X, Settings, Search, LayoutGrid, List, Plus, ChevronLeft, MoreVertical, Folder, Trash2, RotateCcw, Check, ListChecks } from 'lucide-react'
import { motion, AnimatePresence, Reorder, useDragControls, useMotionValue } from 'framer-motion'
import { cn } from '@/utils/utils'
import NoteItem from '@/components/NoteItem'
import FolderItem from '@/components/FolderItem'
import SectionLoader from '@/components/SectionLoader'
import { getNotes, createNote, updateNote, deleteNote, swapNotePositions, saveNotesOrder, moveToTrash, getTrashNotes, restoreNotes, saveCombinedOrder } from '@/app/actions/notes'
import { getFolders, createFolder, updateFolder, deleteFolder, moveFoldersToTrash, getTrashFolders, restoreFolders, saveFoldersOrder } from '@/app/actions/folders'

// Estilos globales para forzar el orden de apilamiento durante el arrastre
const dragStyles = `
  .reorder-group-dragging > li {
    z-index: 0 !important;
  }
  .reorder-group-dragging > li.is-dragging {
    z-index: 9999 !important;
    position: relative !important;
  }
`;


// Componente interno para manejar el arrastre de forma aislada y eficiente
const ReorderableItem = ({ 
    item, 
    isReorderMode, 
    onEnterFolder, 
    onEditNote, 
    isSelectionMode, 
    isSelected, 
    onSelect, 
    onLongPress,
    noteCount,
    folderCount,
    isDraggingGlobal,
    onDragStart,
    onDragEnd
}: any) => {
    const controls = useDragControls();

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!isReorderMode) return;
        e.preventDefault();
        onDragStart(item.id);
        controls.start(e.nativeEvent);
    };

    return (
        <Reorder.Item
            value={item}
            dragListener={false}
            dragControls={controls}
            onDragEnd={onDragEnd}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                "relative",
                isDraggingGlobal && "z-[9999]"
            )}
            style={{ x: 0 }}
        >
            {item.type === 'folder' ? (
                <FolderItem
                    folder={item}
                    onClick={onEnterFolder}
                    isReorderMode={isReorderMode}
                    isSelectionMode={isSelectionMode}
                    isSelected={isSelected}
                    onDragHandlePointerDown={handlePointerDown}
                    onSelect={onSelect}
                    onLongPress={onLongPress}
                    noteCount={noteCount}
                    folderCount={folderCount}
                />
            ) : (
                <NoteItem 
                    note={item}
                    onClick={onEditNote}
                    isReorderMode={isReorderMode}
                    isSelectionMode={isSelectionMode}
                    isSelected={isSelected}
                    onDragHandlePointerDown={handlePointerDown}
                    onSelect={onSelect}
                    onLongPress={onLongPress}
                />
            )}
        </Reorder.Item>
    );
};


export default function BrainDumpPage() {
    const [view, setView] = useState<'list' | 'create' | 'trash'>('list')
    const [direction, setDirection] = useState(0)
    const [notes, setNotes] = useState<any[]>([])
    const [trashNotes, setTrashNotes] = useState<any[]>([])
    const [folders, setFolders] = useState<any[]>([])
    const [trashFolders, setTrashFolders] = useState<any[]>([])
    
    // Cargar papelera fusionando con lo que ya tenemos localmente
    useEffect(() => {
        if (view === 'trash') {
            const loadTrash = async () => {
                const [tNotes, tFolders] = await Promise.all([
                    getTrashNotes(),
                    getTrashFolders()
                ])
                
                setTrashNotes(prev => {
                    // Combinar: lo que ya tenemos (recién movido) + lo que viene de la DB (evitando duplicados)
                    const existingIds = new Set(prev.map(n => n.id))
                    const newNotes = tNotes.filter(n => !existingIds.has(n.id))
                    return [...prev, ...newNotes]
                })

                setTrashFolders(prev => {
                    const existingIds = new Set(prev.map(f => f.id))
                    const newFolders = tFolders.filter(f => !existingIds.has(f.id))
                    return [...prev, ...newFolders]
                })
            }
            loadTrash()
        }
    }, [view])

    const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
    const [viewportHeight, setViewportHeight] = useState('100vh')
    const [showMoreMenu, setShowMoreMenu] = useState(false)
    const [showMainMoreMenu, setShowMainMoreMenu] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showFolderModal, setShowFolderModal] = useState(false)
    const [createModalStep, setCreateModalStep] = useState<'options' | 'folder'>('options')
    const [newFolderName, setNewFolderName] = useState('')
    const [newFolderEmoji, setNewFolderEmoji] = useState<string | null>(null)
    const [newNoteTitle, setNewNoteTitle] = useState('')
    const [newNoteContent, setNewNoteContent] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isReorderMode, setIsReorderMode] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'notes' | 'folders'>('all')
    const [currentFolder, setCurrentFolder] = useState<{id: string | null, name: string}>({ id: null, name: 'Repositorio' })
    const [navigationStack, setNavigationStack] = useState<{id: string | null, name: string}[]>([{ id: null, name: 'Repositorio' }])
    const [selectedItems, setSelectedItems] = useState<string[]>([])
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [draggingItemId, setDraggingItemId] = useState<string | null>(null)
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
        setDirection(1)
        const newEntry = { id: folder.id, name: folder.name }
        setCurrentFolder(newEntry)
        setNavigationStack(prev => {
            // Evitar duplicar la ruta si se hace doble clic rápido
            if (prev.length > 0 && prev[prev.length - 1].id === folder.id) return prev;
            return [...prev, newEntry];
        })
    }

    const handleGoBack = () => {
        if (navigationStack.length > 1) {
            setDirection(-1)
            const newStack = navigationStack.slice(0, -1)
            const lastEntry = newStack[newStack.length - 1]
            setNavigationStack(newStack)
            setCurrentFolder(lastEntry)
        }
    }

    const handleJumpToPath = (index: number) => {
        if (index < navigationStack.length - 1) {
            setDirection(-1)
        } else if (index > navigationStack.length - 1) {
            setDirection(1)
        }
        const newStack = navigationStack.slice(0, index + 1)
        setNavigationStack(newStack)
        setCurrentFolder(newStack[newStack.length - 1])
    }

    const filteredFolders = folders.filter(f => {
        if (filterType === 'notes') return false;
        return (f.parent_id === currentFolder.id || (!f.parent_id && !currentFolder.id)) &&
               f.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const folderAwareNotes = notes.filter(n => {
        if (filterType === 'folders') return false;
        return (n.folder_id === currentFolder.id || (!n.folder_id && !currentFolder.id)) &&
               (n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || n.content?.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    const combinedItems = useMemo(() => {
        const mappedFolders = filteredFolders.map(f => ({ ...f, type: 'folder' as const }));
        const mappedNotes = folderAwareNotes.map(n => ({ ...n, type: 'note' as const }));
        return [...mappedFolders, ...mappedNotes].sort((a, b) => {
            const timeA = new Date(a.created_at || 0).getTime();
            const timeB = new Date(b.created_at || 0).getTime();
            return timeB - timeA;
        });
    }, [filteredFolders, folderAwareNotes, filterType]);

    const handleReorder = (newCombined: any[]) => {
        const now = new Date();
        const updatedNewCombined = newCombined.map((item, index) => ({
            ...item,
            created_at: new Date(now.getTime() - index * 1000).toISOString()
        }));

        setFolders(prev => {
            const newFolders = [...prev];
            const foldersInOrder = updatedNewCombined.filter(i => i.type === 'folder');
            const filteredIds = new Set(foldersInOrder.map(f => f.id));
            let idx = 0;
            for (let i = 0; i < newFolders.length; i++) {
                if (filteredIds.has(newFolders[i].id)) {
                    newFolders[i] = foldersInOrder[idx++];
                }
            }
            return newFolders;
        });

        setNotes(prev => {
            const newNotes = [...prev];
            const notesInOrder = updatedNewCombined.filter(i => i.type === 'note');
            const filteredIds = new Set(notesInOrder.map(n => n.id));
            let idx = 0;
            for (let i = 0; i < newNotes.length; i++) {
                if (filteredIds.has(newNotes[i].id)) {
                    newNotes[i] = notesInOrder[idx++];
                }
            }
            return newNotes;
        });
    };

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

    const handleCloseNoteEditor = () => {
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

        // Remove note state after transition
        setTimeout(() => {
            setNewNoteTitle('')
            setNewNoteContent('')
            setEditingNoteId(null)
        }, 450)
    }

    const handleMoveToTrash = async () => {
        if (selectedItems.length === 0) return

        const selectedNotes = notes.filter(n => selectedItems.includes(n.id))
        const selectedFolders = folders.filter(f => selectedItems.includes(f.id))
        const noteIds = selectedNotes.map(n => n.id)
        const folderIds = selectedFolders.map(f => f.id)

        // 1. Guardar copia de seguridad en localStorage por si acaso
        const backupTrash = JSON.parse(localStorage.getItem('dump_trash_backup') || '{"notes":[],"folders":[]}')
        backupTrash.notes = [...backupTrash.notes, ...selectedNotes]
        backupTrash.folders = [...backupTrash.folders, ...selectedFolders]
        localStorage.setItem('dump_trash_backup', JSON.stringify(backupTrash))

        try {
            // 2. Sincronizar con el servidor y esperar confirmación
            const [noteRes, folderRes]: any = await Promise.all([
                noteIds.length > 0 ? moveToTrash(noteIds) : Promise.resolve({ success: true }),
                folderIds.length > 0 ? moveFoldersToTrash(folderIds) : Promise.resolve({ success: true })
            ])

            if (noteRes.success && folderRes.success) {
                // 3. Solo si el servidor confirmó, actualizamos la vista
                setTrashNotes(prev => [...selectedNotes, ...prev])
                setTrashFolders(prev => [...selectedFolders, ...prev])
                setNotes(prev => prev.filter(n => !selectedItems.includes(n.id)))
                setFolders(prev => prev.filter(f => !selectedItems.includes(f.id)))
                setSelectedItems([])
                setIsSelectionMode(false)
                console.log("✅ Sincronización con papelera exitosa")
            } else {
                console.error("❌ Fallo en el servidor:", noteRes.error || folderRes.error)
                alert("Hubo un problema al guardar en la papelera. Por favor, verifica tu conexión o que las columnas SQL existan.")
            }
        } catch (error) {
            console.error("❌ Error crítico:", error)
            alert("Error al conectar con el servidor.")
        }
    }
    const handleRestore = async () => {
        if (selectedItems.length === 0) return

        const selectedNotes = trashNotes.filter(n => selectedItems.includes(n.id))
        const selectedFolders = trashFolders.filter(f => selectedItems.includes(f.id))
        const noteIds = selectedNotes.map(n => n.id)
        const folderIds = selectedFolders.map(f => f.id)

        try {
            // Actualizar localmente de inmediato
            setNotes(prev => [...selectedNotes, ...prev])
            setFolders(prev => [...selectedFolders, ...prev])
            setTrashNotes(prev => prev.filter(n => !selectedItems.includes(n.id)))
            setTrashFolders(prev => prev.filter(f => !selectedItems.includes(f.id)))
            setSelectedItems([])
            setIsSelectionMode(false)

            // Sincronizar con el servidor
            await Promise.all([
                noteIds.length > 0 ? restoreNotes(noteIds) : Promise.resolve({ success: true }),
                folderIds.length > 0 ? restoreFolders(folderIds) : Promise.resolve({ success: true })
            ])
        } catch (error) {
            console.error("Error al restaurar:", error)
        }
    }

    const handlePermanentDelete = async () => {
        if (selectedItems.length === 0) return
        if (!confirm("¿Estás seguro de que quieres eliminar estos elementos permanentemente?")) return

        const noteIds = trashNotes.filter(n => selectedItems.includes(n.id)).map(n => n.id)
        const folderIds = trashFolders.filter(f => selectedItems.includes(f.id)).map(f => f.id)

        try {
            // Actualizar localmente
            setTrashNotes(prev => prev.filter(n => !selectedItems.includes(n.id)))
            setTrashFolders(prev => prev.filter(f => !selectedItems.includes(f.id)))
            setSelectedItems([])
            setIsSelectionMode(false)

            // Sincronizar con el servidor
            await Promise.all([
                ...noteIds.map(id => deleteNote(id)),
                ...folderIds.map(id => deleteFolder(id))
            ])
        } catch (error) {
            console.error("Error al eliminar permanentemente:", error)
        }
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
            "h-[100dvh] flex justify-center pt-safe-top px-1 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black overflow-hidden font-outfit transition-colors duration-300",
            "bg-zinc-50 dark:bg-[#09090b]"
        )}>
            <div className="w-full max-w-2xl h-full flex flex-col relative overflow-hidden">
                {/* Cabecera de Selección (Solo visible en modo selección) */}
                <AnimatePresence>
                    {isSelectionMode && (
                        <motion.div 
                            initial={{ y: -100 }}
                            animate={{ y: 0 }}
                            exit={{ y: -100 }}
                            className="fixed top-[34px] left-0 right-0 z-[110] bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between shadow-xl"
                        >
                            <div className="flex items-center gap-6">
                                <button onClick={() => { setSelectedItems([]); setIsSelectionMode(false); }} className="text-zinc-900 dark:text-zinc-100">
                                    <X size={24} />
                                </button>
                                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                    {selectedItems.length} {selectedItems.length === 1 ? 'elemento seleccionado' : 'elementos seleccionados'}
                                </span>
                            </div>
                            <button 
                                onClick={() => {
                                    let allIds: string[] = [];
                                    if (view === 'trash') {
                                        allIds = [...trashFolders.map(f => f.id), ...trashNotes.map(n => n.id)];
                                    } else {
                                        allIds = [...filteredFolders.map(f => f.id), ...folderAwareNotes.map(n => n.id)];
                                    }
                                    
                                    if (selectedItems.length === allIds.length && allIds.length > 0) {
                                        setSelectedItems([]);
                                    } else {
                                        setSelectedItems(allIds);
                                    }
                                }}
                                className="text-zinc-900 dark:text-zinc-100"
                            >
                                <ListChecks size={24} strokeWidth={2.5} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                             className="absolute top-0 left-0 right-0 flex flex-col pt-4"
                        >
                            <header className={cn(
                                "flex flex-col gap-1 px-3 flex-shrink-0 transition-all duration-300",
                                 (isReorderMode || isSelectionMode) && "opacity-30 scale-[0.98] pointer-events-none grayscale"
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

                            <div className="flex items-center justify-between gap-1.5 px-3 mt-3 mb-8 relative z-[60]">
                                <div className={cn(
                                    "flex-1 flex items-center gap-1.5 transition-all duration-300",
                                    (isReorderMode || isSelectionMode) && "opacity-30 scale-[0.98] pointer-events-none grayscale"
                                )}>
                                    <div className="flex-1 h-[42px] rounded-2xl bg-zinc-100 dark:bg-[#1c1c1e] border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-around px-2 transition-all shadow-sm overflow-hidden">
                                        <button 
                                            onClick={() => setFilterType('all')}
                                            className={cn(
                                                "flex-1 text-[13px] font-bold transition-all h-full flex items-center justify-center",
                                                filterType === 'all' ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-600"
                                            )}
                                        >
                                            Todo
                                        </button>
                                        <div className="w-[1.5px] h-4 bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
                                        <button 
                                            onClick={() => setFilterType('notes')}
                                            className={cn(
                                                "flex-1 text-[13px] font-bold transition-all h-full flex items-center justify-center",
                                                filterType === 'notes' ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-600"
                                            )}
                                        >
                                            Notas
                                        </button>
                                        <div className="w-[1.5px] h-4 bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
                                        <button 
                                            onClick={() => setFilterType('folders')}
                                            className={cn(
                                                "flex-1 text-[13px] font-bold transition-all h-full flex items-center justify-center",
                                                filterType === 'folders' ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-600"
                                            )}
                                        >
                                            Carpetas
                                        </button>
                                    </div>
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
                                            "bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-full w-[42px] h-[42px] flex items-center justify-center hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-all duration-300 cursor-pointer flex-shrink-0",
                                            (isReorderMode || isSelectionMode) && "opacity-30 scale-[0.95] pointer-events-none grayscale"
                                        )}
                                        title="Añadir Nota"
                                    >
                                        <Plus size={20} className="text-zinc-900 dark:text-zinc-50 group-hover:text-inherit" strokeWidth={3} />
                                    </motion.button>

                                    <div className="relative">
                                        <motion.button 
                                            onClick={async () => {
                                                if (isReorderMode) {
                                                    await saveCombinedOrder(combinedItems)
                                                    setIsReorderMode(false)
                                                } else {
                                                    setShowMainMoreMenu(!showMainMoreMenu)
                                                }
                                            }}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className={cn(
                                                "border-2 rounded-full w-[42px] h-[42px] flex items-center justify-center transition-all duration-300 cursor-pointer flex-shrink-0 shadow-lg",
                                                isReorderMode 
                                                    ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-950 scale-110" 
                                                    : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-200",
                                                isSelectionMode && "opacity-30 scale-[0.95] pointer-events-none grayscale"
                                            )}
                                            title={isReorderMode ? "Guardar orden" : "Menú"}
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

                                        <AnimatePresence>
                                            {showMainMoreMenu && (
                                                <>
                                                    <div 
                                                        className="fixed inset-0 z-40" 
                                                        onClick={() => setShowMainMoreMenu(false)}
                                                    />
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                                        exit={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
                                                        className="absolute right-0 top-12 w-48 bg-zinc-900 dark:bg-[#1c1c1e] rounded-[24px] shadow-2xl z-50 overflow-hidden py-2"
                                                    >
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setIsReorderMode(true)
                                                                setShowMainMoreMenu(false)
                                                            }}
                                                            className="w-full px-6 py-4 text-left text-zinc-300 hover:bg-white/5 transition-colors text-[17px] font-medium"
                                                        >
                                                            Mover
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setDirection(1)
                                                                setView('trash')
                                                                setShowMainMoreMenu(false)
                                                            }}
                                                            className="w-full px-6 py-4 text-left text-zinc-300 hover:bg-white/5 transition-colors text-[17px] font-medium"
                                                        >
                                                            Papelera
                                                        </button>
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            <div className={cn(
                                "mx-3 mt-[4px] mb-[14px] flex items-center h-9 rounded-lg bg-zinc-100/50 dark:bg-[#1c1c1e] border-2 border-zinc-200/60 dark:border-zinc-800/80 shadow-sm overflow-hidden transition-all duration-300",
                                (isReorderMode || isSelectionMode) && "opacity-30 pointer-events-none grayscale"
                            )}>
                                <button
                                    onClick={handleGoBack}
                                    className={cn(
                                        "h-full pl-3 pr-1 flex items-center justify-center transition-all flex-shrink-0",
                                        navigationStack.length <= 1 && "pointer-events-none"
                                    )}
                                >
                                    <ChevronLeft size={17} strokeWidth={2.5} className="text-white opacity-100" />
                                </button>
                                
                                <div className="flex-1 pl-1.5 pr-4 overflow-hidden">
                                    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-zinc-400 dark:text-zinc-500 overflow-x-auto whitespace-nowrap no-scrollbar">
                                        {navigationStack.map((step, index) => (
                                            <div key={`${step.id || 'root'}-${index}`} className="flex items-center gap-1.5">
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

                            <div className="flex-1 relative overflow-hidden">
                                {isLoading ? (
                                    <SectionLoader />
                                ) : (
                                    <AnimatePresence initial={false} custom={direction}>
                                        <motion.div
                                            key={currentFolder.id || 'root'}
                                            custom={direction}
                                            variants={variants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            transition={{
                                                x: { type: "spring", stiffness: 100, damping: 20 },
                                                opacity: { duration: 0.4 }
                                            }}
                                            className="absolute inset-0 px-3 pt-0.5 overflow-y-auto no-scrollbar bg-zinc-50 dark:bg-[#09090b]"
                                        >
                                        <AnimatePresence mode="wait" initial={false}>
                                            {folderAwareNotes.length === 0 && searchQuery ? (
                                                <div className="text-center py-20">
                                                    <p className="text-zinc-500">No se encontraron notas que coincidan con "{searchQuery}"</p>
                                                </div>
                                            ) : (!isLoading && folderAwareNotes.length === 0 && filteredFolders.length === 0) ? (
                                                <motion.div
                                                    key="empty-state-actual"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="flex flex-col items-center justify-center py-20 rounded-[32px] gap-6"
                                                >
                                                    <div className="w-20 h-20 flex items-center justify-center rounded-3xl bg-zinc-100 dark:bg-[#1c1c1e] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                                        <Folder className="text-zinc-400 dark:text-zinc-600" size={40} strokeWidth={1.5} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xl tracking-tight">Tu espacio está vacío.</p>
                                                        <p className="text-base text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-[260px]">Empieza a escribir aquí</p>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <div key="list-container" className="flex flex-col gap-3.5 pb-20 px-2 min-h-full">
                                                    <style>{dragStyles}</style>
                                                    <Reorder.Group 
                                                        axis="y" 
                                                        values={combinedItems} 
                                                        onReorder={handleReorder}
                                                        className={cn(
                                                            "flex flex-col gap-3.5",
                                                            draggingItemId && "reorder-group-dragging"
                                                        )}
                                                    >
                                                        {combinedItems.map((item) => (
                                                            <ReorderableItem
                                                                key={item.id}
                                                                item={item}
                                                                isReorderMode={isReorderMode && !searchQuery}
                                                                isSelectionMode={isSelectionMode}
                                                                isSelected={selectedItems.includes(item.id)}
                                                                isDraggingGlobal={draggingItemId === item.id}
                                                                onDragStart={setDraggingItemId}
                                                                onDragEnd={() => setDraggingItemId(null)}
                                                                onEnterFolder={() => handleEnterFolder(item)}
                                                                onEditNote={() => handleEditNote(item)}
                                                                onSelect={() => {
                                                                    const id = item.id;
                                                                    setSelectedItems(prev => 
                                                                        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                                                                    );
                                                                }}
                                                                onLongPress={() => {
                                                                    setIsSelectionMode(true);
                                                                    setSelectedItems([item.id]);
                                                                }}
                                                                noteCount={notes.filter(n => n.folder_id === item.id).length}
                                                                folderCount={folders.filter(f => f.parent_id === item.id).length}
                                                            />
                                                        ))}
                                                    </Reorder.Group>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                        </motion.div>
                                    </AnimatePresence>
                                )}
                            </div>
                        </motion.div>
                    ) : view === 'create' ? (
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
                            className="absolute top-0 left-0 right-0 flex flex-col px-6 pt-4 bg-zinc-50 dark:bg-zinc-950"
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
                                                            Añadir etiquetas
                                                        </button>
                                                        <div className="h-px bg-white/5 my-2 mx-4" />
                                                        <button className="w-full px-6 py-4 text-left text-red-400 hover:bg-red-400/10 transition-colors text-[17px] font-medium">
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
                                className="flex-1 overflow-y-auto mt-2 pr-2 no-scrollbar pb-60"
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
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.ctrlKey) {
                                            saveNewNote();
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
                    ) : view === 'trash' ? (
                        <motion.div
                            key="trash-view"
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
                            className="absolute top-0 left-0 right-0 flex flex-col pt-8 bg-zinc-50 dark:bg-zinc-950"
                        >
                            <header className={cn(
                                "flex flex-col gap-1 px-3 flex-shrink-0 transition-all duration-300",
                                isSelectionMode && "opacity-30 grayscale pointer-events-none scale-[0.98]"
                            )}>
                                <div className="flex items-end justify-center relative">
                                    <motion.button 
                                        onClick={() => {
                                            setDirection(-1)
                                            setView('list')
                                        }}
                                        whileHover={{ scale: 1.1, x: -2 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="absolute left-[8px] top-[calc(50%-4px)] -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm z-10"
                                        style={{
                                            backgroundColor: 'color-mix(in srgb, var(--surface) 80%, transparent)',
                                            borderColor: 'var(--border)',
                                            color: 'var(--accent)',
                                            backdropFilter: 'blur(8px)'
                                        }}
                                    >
                                        <ChevronLeft size={24} strokeWidth={2.5} />
                                    </motion.button>

                                    {/* Fantasma Izquierdo para equilibrio y altura */}
                                    <div className="opacity-0 bg-zinc-200 dark:bg-zinc-800 rounded-full px-6 py-1.5 mt-1 mb-2 flex items-center justify-center pointer-events-none">
                                        <span className="text-4xl md:text-5xl font-light">0</span>
                                    </div>
                                    
                                    <h1 className="font-bold text-6xl md:text-8xl tracking-tighter text-zinc-900 dark:text-zinc-50 relative bottom-1.5 whitespace-nowrap text-center">
                                        Papelera
                                    </h1>

                                    {/* Fantasma Derecho para equilibrio y altura */}
                                    <div className="opacity-0 bg-zinc-200 dark:bg-zinc-800 rounded-full px-6 py-1.5 mt-1 mb-2 flex items-center justify-center pointer-events-none">
                                        <span className="text-4xl md:text-5xl font-light">0</span>
                                    </div>
                                </div>
                            </header>

                            {trashNotes.length === 0 && trashFolders.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center px-6">
                                    <div className="w-20 h-20 flex items-center justify-center rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm opacity-30">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800 dark:text-zinc-200"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                    </div>
                                    <p className="text-zinc-400 dark:text-zinc-500 mt-6 font-medium">La papelera está vacía</p>
                                </div>
                            ) : (
                                <div className="flex-1 px-3 overflow-y-auto no-scrollbar">
                                    <div className="flex flex-col gap-3.5 pt-4 pb-20 px-2">
                                        {trashFolders.map((folder) => (
                                            <div key={folder.id}>
                                                <FolderItem 
                                                    folder={folder}
                                                    onClick={() => {}}
                                                    onLongPress={() => { setIsSelectionMode(true); setSelectedItems([folder.id]); }}
                                                    isSelectionMode={isSelectionMode}
                                                    isSelected={selectedItems.includes(folder.id)}
                                                    onSelect={() => {
                                                        const id = folder.id;
                                                        setSelectedItems(prev => 
                                                            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                                                        );
                                                    }}
                                                />
                                            </div>
                                        ))}
                                        {trashNotes.map((note) => (
                                            <div key={note.id}>
                                                <NoteItem 
                                                    note={note}
                                                    onClick={() => {}}
                                                    onLongPress={() => { setIsSelectionMode(true); setSelectedItems([note.id]); }}
                                                    isSelectionMode={isSelectionMode}
                                                    isSelected={selectedItems.includes(note.id)}
                                                    onSelect={() => {
                                                        const id = note.id;
                                                        setSelectedItems(prev => 
                                                            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                                                        );
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : null}
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
                                className="relative w-full max-w-[320px] h-fit bg-white dark:bg-[#1c1c1e] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800"
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
                                            className="flex flex-col gap-5 p-7 relative"
                                        >
                                            <div className="relative flex items-center justify-start gap-4 mb-2 -ml-1">
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
                                                

                                            </div>

                                            <div className="flex items-center gap-3 mt-4">
                                                <button
                                                    onClick={() => {
                                                        setCreateModalStep('options')
                                                        setNewFolderName('')
                                                    }}
                                                    className="flex-1 py-3.5 rounded-[18px] bg-zinc-100 dark:bg-[#2c2c2e] text-zinc-600 dark:text-zinc-300 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const name = newFolderName.trim();
                                                        if (!name) return;

                                                        const tempId = Math.random().toString();
                                                        const tempFolder = {
                                                            id: tempId,
                                                            name,
                                                            parent_id: currentFolder.id,
                                                            user_id: '',
                                                            created_at: new Date().toISOString(),
                                                            is_trash: false
                                                        };

                                                        setFolders(prev => [tempFolder, ...prev]);
                                                        setShowCreateModal(false);
                                                        setCreateModalStep('options');
                                                        setNewFolderName('');

                                                        try {
                                                            const folder = await createFolder(name, null, currentFolder.id);
                                                            if (folder) {
                                                                setFolders(prev => prev.map(f => f.id === tempId ? { ...folder, id: folder.id } : f));
                                                            }
                                                        } catch (error) {
                                                            console.error("Error al crear carpeta:", error);
                                                            setFolders(prev => prev.filter(f => f.id !== tempId));
                                                        }
                                                    }}
                                                    className="flex-1 py-3.5 rounded-[18px] bg-[var(--accent)] text-white font-bold hover:brightness-110 transition-all shadow-md flex items-center justify-center gap-2"
                                                >
                                                    Crear
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Barra Inferior de Selección */}
                <AnimatePresence>
                    {isSelectionMode && (
                        <motion.div 
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            className="fixed bottom-0 left-0 right-0 z-[110] bg-white dark:bg-[#1c1c1e] border-t border-zinc-200 dark:border-zinc-800 pb-safe-bottom pt-3 px-8 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
                        >
                            {view === 'trash' ? (
                                <>
                                    <div className="flex-1 flex justify-around items-center">
                                        <button 
                                            onClick={handleRestore}
                                            className="flex flex-col items-center gap-0.5 -translate-y-2 active:scale-90 transition-transform hover:opacity-80"
                                        >
                                            <div className="w-9 h-9 flex items-center justify-center rounded-full">
                                                <RotateCcw size={20} className="text-zinc-950 dark:text-white" />
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-950 dark:text-white">Restaurar</span>
                                        </button>
                                        <button 
                                            onClick={handlePermanentDelete}
                                            className="flex flex-col items-center gap-0.5 -translate-y-2 active:scale-90 transition-transform hover:opacity-80"
                                        >
                                            <div className="w-9 h-9 flex items-center justify-center rounded-full">
                                                <Trash2 size={20} className="text-zinc-950 dark:text-white" />
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-950 dark:text-white">Eliminar</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-col items-center gap-0.5 opacity-50 -translate-y-2">
                                        <div className="w-9 h-9 flex items-center justify-center rounded-full">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                        </div>
                                        <span className="text-[10px] font-bold">Ocultar</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-0.5 opacity-50 -translate-y-2">
                                        <div className="w-9 h-9 flex items-center justify-center rounded-full">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M19 13H5l7-7 7 7Z"/></svg>
                                        </div>
                                        <span className="text-[10px] font-bold">Anclar</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-0.5 opacity-50 -translate-y-2">
                                        <div className="w-9 h-9 flex items-center justify-center rounded-full">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8"/><path d="M12 20h8"/><path d="m16 16 4 4-4 4"/></svg>
                                        </div>
                                        <span className="text-[10px] font-bold">Mover a</span>
                                    </div>
                                    <button 
                                        onClick={handleMoveToTrash}
                                        className="flex flex-col items-center gap-0.5 -translate-y-2 active:scale-90 transition-transform"
                                    >
                                        <div className="w-9 h-9 flex items-center justify-center rounded-full">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100">A papelera</span>
                                    </button>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    )
}
