'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Menu, Check, X, Palette, FileText, Save, Pencil, MoreVertical, Trash2 } from 'lucide-react'
import { format, startOfWeek, addWeeks, subWeeks, addDays, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/utils/utils'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { getCheckDays, toggleCheckDay, CheckDayStatus, CheckDayRecord } from '@/app/actions/checkday'

export default function CheckDayInterface() {
    // We start on the current week.
    const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
    
    // We focus on today's day index (0 for Monday, 6 for Sunday) initially
    const [focusedIndex, setFocusedIndex] = useState(() => {
        const todayDay = getDay(new Date())
        return todayDay === 0 ? 6 : todayDay - 1
    })

    const [direction, setDirection] = useState(0)
    
    // Database data mapping: "YYYY-MM-DD" -> record
    const [dbCheckDays, setDbCheckDays] = useState<Record<string, CheckDayRecord>>({})
    const [isLoading, setIsLoading] = useState(true)

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalScreen, setModalScreen] = useState<'main' | 'color' | 'notes' | 'view' | 'confirmDelete'>('main')
    const [modalDate, setModalDate] = useState<Date | null>(null)
    const [modalSelectedOption, setModalSelectedOption] = useState<CheckDayStatus>(null)
    const [modalSelectedColor, setModalSelectedColor] = useState<string>('zinc')
    const [modalNote, setModalNote] = useState<string>('')
    const [initialColorInScreen, setInitialColorInScreen] = useState<string>('zinc')
    const [initialNoteInScreen, setInitialNoteInScreen] = useState<string>('')
    const [isEditing, setIsEditing] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Initial Fetch
    useEffect(() => {
        const loadData = async () => {
            try {
                const year = currentWeekStart.getFullYear()
                const month = currentWeekStart.getMonth() + 1
                const data = await getCheckDays(year, month)
                setDbCheckDays(data)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [currentWeekStart])

    // Navigation handlers
    const nextWeek = () => {
        setDirection(1)
        setCurrentWeekStart(prev => addWeeks(prev, 1))
        setFocusedIndex(0)
    }
    
    const prevWeek = () => {
        setDirection(-1)
        setCurrentWeekStart(prev => subWeeks(prev, 1))
        setFocusedIndex(0)
    }

    const handleOpenModal = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const record = dbCheckDays[dateStr]
        setModalDate(date)
        setModalSelectedOption(record?.status || null)
        const activeColor = record?.color || 'zinc'
        const activeNote = record?.notes || ''
        setModalSelectedColor(activeColor)
        setModalNote(activeNote)
        setInitialColorInScreen(activeColor)
        setInitialNoteInScreen(activeNote)
        setIsMenuOpen(false)
        
        const hasRecord = !!record?.status
        setIsEditing(hasRecord)
        
        if (hasRecord) {
            setModalScreen('view')
        } else {
            setModalScreen('main')
        }
        
        setIsModalOpen(true)
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
    }

    const handleSave = async () => {
        if (!modalDate || !modalSelectedOption) return
        
        const dateStr = format(modalDate, 'yyyy-MM-dd')
        const result = await toggleCheckDay(dateStr, modalSelectedOption, modalSelectedColor, modalNote)
        
        if (result.success) {
            setDbCheckDays(prev => ({ 
                ...prev, 
                [dateStr]: { status: modalSelectedOption, color: modalSelectedColor, notes: modalNote } 
            }))
            setIsModalOpen(false)
            Haptics.notification({ type: NotificationType.Success }).catch(() => {})
        }
    }

    const handleDelete = async () => {
        if (!modalDate) return
        const dateStr = format(modalDate, 'yyyy-MM-dd')
        const result = await toggleCheckDay(dateStr, null)
        
        if (result.success) {
            setDbCheckDays(prev => {
                const next = { ...prev }
                delete next[dateStr]
                return next
            })
            setIsModalOpen(false)
            setIsMenuOpen(false)
            Haptics.notification({ type: NotificationType.Warning }).catch(() => {})
        }
    }

    const colors = [
        { name: 'zinc', class: 'bg-zinc-500' },
        { name: 'blue', class: 'bg-blue-500' },
        { name: 'red', class: 'bg-red-500' },
        { name: 'green', class: 'bg-emerald-500' },
        { name: 'yellow', class: 'bg-yellow-400' },
        { name: 'purple', class: 'bg-purple-500' },
        { name: 'orange', class: 'bg-orange-500' },
        { name: 'pink', class: 'bg-pink-500' },
    ]

    const getColorClass = (colorName?: string) => {
        switch (colorName) {
            case 'blue': return 'text-blue-500'
            case 'red': return 'text-red-500'
            case 'green': return 'text-emerald-500'
            case 'yellow': return 'text-yellow-500 font-bold dark:text-yellow-400'
            case 'purple': return 'text-purple-500'
            case 'orange': return 'text-orange-500'
            case 'pink': return 'text-pink-500'
            default: return 'text-zinc-900 dark:text-zinc-50'
        }
    }

    const getBgColorClass = (colorName?: string) => {
        switch (colorName) {
            case 'blue': return 'bg-blue-500'
            case 'red': return 'bg-red-500'
            case 'green': return 'bg-emerald-500'
            case 'yellow': return 'bg-yellow-400'
            case 'purple': return 'bg-purple-500'
            case 'orange': return 'bg-orange-500'
            case 'pink': return 'bg-pink-500'
            default: return 'bg-zinc-900 dark:bg-zinc-50'
        }
    }

    // Swipe handlers
    const [dragStart, setDragStart] = useState<number | null>(null)

    const handleTouchStart = (e: React.TouchEvent) => {
        e.stopPropagation()
        setDragStart(e.touches[0].clientX)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        e.stopPropagation()
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        e.stopPropagation()
        if (dragStart === null) return
        const dragEnd = e.changedTouches[0].clientX
        const diff = dragStart - dragEnd

        // Threshold for swipe
        if (Math.abs(diff) > 50) {
            if (diff > 0 && focusedIndex < 6) {
                setDirection(1)
                setFocusedIndex(prev => prev + 1)
                try { Haptics.selectionChanged().catch(() => {}) } catch(e) {}
            } else if (diff < 0 && focusedIndex > 0) {
                setDirection(-1)
                setFocusedIndex(prev => prev - 1)
                try { Haptics.selectionChanged().catch(() => {}) } catch(e) {}
            }
        }
        setDragStart(null)
    }

    const focusedDate = addDays(currentWeekStart, focusedIndex)
    const monthName = format(focusedDate, 'MMMM', { locale: es })
    
    const weekDaysShort = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
    const weekDaysFull = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <div className="flex flex-col w-full flex-1 relative">
            {/* Header: Month Navigator */}
            <div className="flex items-center justify-center gap-6 mt-4 mb-10">
                <button onClick={prevWeek} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ChevronLeft size={32} strokeWidth={1.5} />
                </button>
                <div className="px-6 py-2 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl min-w-[140px] flex justify-center overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span 
                            key={monthName}
                            initial={{ opacity: 0, x: direction * 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -direction * 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="text-2xl font-medium text-zinc-900 dark:text-zinc-50 capitalize tracking-wide block"
                        >
                            {monthName}
                        </motion.span>
                    </AnimatePresence>
                </div>
                <button onClick={nextWeek} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ChevronRight size={32} strokeWidth={1.5} />
                </button>
            </div>

            {/* 3-Day Carousel */}
            <div 
                className="w-full h-48 flex items-center justify-center gap-4 mb-6 relative touch-pan-y overflow-hidden select-none"
                data-no-swipe="true"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    {[-1, 0, 1].map((offset) => {
                        const actualIndex = focusedIndex + offset
                        const isOutOfBounds = actualIndex < 0 || actualIndex > 6
                        
                        if (isOutOfBounds) {
                            return <div key={offset} className="w-24 md:w-32 flex-shrink-0 invisible" />
                        }

                        const dayDate = addDays(currentWeekStart, actualIndex)
                        const dateKey = format(dayDate, 'yyyy-MM-dd')
                        const record = dbCheckDays[dateKey]
                        const isFocused = offset === 0

                        return (
                            <motion.div
                                key={`${currentWeekStart.toISOString()}-${actualIndex}`}
                                initial={{ opacity: 0, scale: 0.8, x: offset * 30 }}
                                animate={{ opacity: isFocused ? 1 : 0.3, scale: isFocused ? 1 : 0.85, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: -offset * 30 }}
                                transition={{ type: 'spring', stiffness: 150, damping: 18, mass: 0.8 }}
                                className="flex flex-col items-center gap-3 flex-shrink-0"
                                style={{ width: '110px' }}
                                onClick={() => isFocused && handleOpenModal(dayDate)}
                            >
                                <span className={cn(
                                    "text-sm font-medium transition-colors duration-300 whitespace-nowrap",
                                    isFocused ? "text-zinc-900 dark:text-zinc-50 font-bold" : "text-zinc-400"
                                )}>
                                    {weekDaysFull[actualIndex]}
                                </span>
                                <div className={cn(
                                    "w-28 h-28 md:w-32 md:h-32 flex flex-col items-center justify-center border-2 rounded-3xl transition-colors duration-300 relative overflow-hidden",
                                    isFocused 
                                        ? "border-[var(--border)] shadow-lg bg-[var(--surface)]" 
                                        : "border-transparent"
                                )}>
                                    {record?.status === 'check' ? (
                                        <Check size={isFocused ? 72 : 54} className={getColorClass(record?.color)} strokeWidth={3} />
                                    ) : record?.status === 'x' ? (
                                        <X size={isFocused ? 72 : 54} className={getColorClass(record?.color)} strokeWidth={3} />
                                    ) : (
                                        <Plus size={isFocused ? 48 : 36} className="text-zinc-300 dark:text-zinc-700 stroke-[1.5]" />
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Week Line Progress */}
            <div className="flex justify-center mb-12 overflow-hidden px-4">
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div 
                        key={currentWeekStart.toISOString()}
                        variants={containerVariants}
                        initial={false}
                        animate="visible"
                        exit="hidden"
                        className="flex justify-center gap-4 md:gap-6 w-full relative"
                    >
                        {weekDaysShort.map((letter, idx) => {
                            const dayDate = addDays(currentWeekStart, idx)
                            const dateKey = format(dayDate, 'yyyy-MM-dd')
                            const record = dbCheckDays[dateKey]
                            const isActive = focusedIndex === idx
                            return (
                                <motion.div key={idx} variants={itemVariants} className="flex flex-col items-center gap-2 relative z-10">
                                    <span className={cn(
                                        "text-xl font-medium transition-colors duration-300",
                                        isActive ? "text-zinc-950 dark:text-zinc-50" : "text-zinc-400 group-hover:text-zinc-600"
                                    )}>
                                        {letter}
                                    </span>
                                    <div className={cn(
                                        "w-2 h-2 rounded-full border-2 transition-all duration-300",
                                        record 
                                            ? (isActive ? cn("border-transparent", getBgColorClass(record?.color)) : "border-zinc-400 dark:border-zinc-600") 
                                            : "border-transparent"
                                    )} />

                                    {isActive && (
                                        <motion.div 
                                            layoutId="activeDayPill"
                                            className="absolute inset-x-[-8px] inset-y-[-4px] bg-zinc-100 dark:bg-zinc-800/50 rounded-xl -z-10"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </motion.div>
                            )
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Checkdays Management */}
            <div className="flex flex-col px-4 md:px-8 gap-6 max-sm mx-auto w-full mb-auto pb-8">
                <div className="flex items-center gap-4">
                    <span className="text-3xl font-medium text-zinc-900 dark:text-zinc-50 tracking-tight">Checkdays</span>
                    <div className="flex items-center gap-2">
                        <button className="p-1 rounded-full border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            <Plus size={18} strokeWidth={2.5} />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white transition-colors">
                            <Menu size={24} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <span className="text-3xl font-medium text-zinc-900 dark:text-zinc-50 tracking-tight">Productividad</span>
                </div>
            </div>

            {/* Bottom Placeholders */}
            <div className="flex justify-center gap-4 pb-8 pt-4">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800" />
                ))}
            </div>

            {/* Cuadro Frontal (Modal) */}
            <AnimatePresence>
                {isModalOpen && modalDate && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Overlay Blur */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-md"
                        />
                        
                        {/* Modal Content */}
                        <motion.div 
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="w-full max-w-sm overflow-hidden bg-[var(--surface)] border-2 border-[var(--border)] rounded-[2.5rem] shadow-2xl min-h-[480px] relative z-[101]"
                        >
                            <AnimatePresence mode="popLayout" initial={false}>
                                {modalScreen === 'view' ? (
                                    <motion.div 
                                        key="view"
                                        initial={{ x: -100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -100, opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        className="px-6 py-8 flex flex-col items-center text-center h-full min-h-[480px] relative"
                                    >
                                        <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-1">
                                            Tu día
                                        </h2>
                                        <p className="text-lg font-medium text-zinc-400 capitalize mb-6">
                                            {format(modalDate, "EEEE, d 'de' MMMM", { locale: es })}
                                        </p>

                                        <textarea 
                                            readOnly
                                            value={modalNote}
                                            placeholder="Sin nota para este día."
                                            className="w-full flex-1 bg-[var(--surface)] border-2 border-[var(--border)] rounded-[2rem] p-6 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 outline-none transition-all resize-none text-lg cursor-default text-center"
                                        />

                                        <div className="flex gap-4 h-16 mt-8 w-full">
                                            <button 
                                                onClick={() => { setModalScreen('main'); setDirection(1); Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {}) }}
                                                className={cn(
                                                    "flex-1 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all duration-300",
                                                    "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 shadow-md scale-[1.02]" 
                                                )}
                                            >
                                                <Pencil size={20} />
                                                <span className="tracking-tight">Editar</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : modalScreen === 'main' ? (
                                    <motion.div 
                                        key="main"
                                        initial={{ x: direction === -1 ? -100 : 100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: direction === 1 ? -100 : 100, opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        className="px-6 py-8 flex flex-col items-center text-center h-full min-h-[480px] relative"
                                    >
                                        {isEditing && (
                                            <div className="absolute top-8 right-6 z-20">
                                                <button 
                                                    onClick={() => { setIsMenuOpen(!isMenuOpen); Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}) }}
                                                    className={cn(
                                                        "p-2 rounded-full transition-colors",
                                                        isMenuOpen ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white" : "text-zinc-400"
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
                                                            className="absolute top-12 right-0 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl shadow-xl py-2 min-w-[140px] overflow-hidden"
                                                        >
                                                            <button 
                                                                onClick={() => { setModalScreen('confirmDelete'); setIsMenuOpen(false); Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {}) }}
                                                                className="w-full px-4 py-3 flex items-center justify-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                                            >
                                                                <Trash2 size={18} />
                                                                <span className="text-sm font-bold">Eliminar</span>
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-1">
                                            {isEditing ? 'Editar día' : 'Registrar día'}
                                        </h2>
                                        <p className="text-lg font-medium text-zinc-400 capitalize mb-10">
                                            {format(modalDate, "EEEE, d 'de' MMMM", { locale: es })}
                                        </p>

                                        <div className="flex justify-center gap-8 mb-auto pt-8 pb-4">
                                            <button 
                                                onClick={() => { setModalSelectedOption('check'); Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}) }}
                                                className={cn(
                                                    "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-300",
                                                    modalSelectedOption === 'check' 
                                                        ? cn("text-white dark:text-zinc-950 scale-110 shadow-lg", getBgColorClass(modalSelectedColor)) 
                                                        : "border-2 border-[var(--border)] text-zinc-300 dark:text-zinc-600"
                                                )}
                                            >
                                                <Check size={40} strokeWidth={3} />
                                            </button>
                                            <button 
                                                onClick={() => { setModalSelectedOption('x'); Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}) }}
                                                className={cn(
                                                    "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-300",
                                                    modalSelectedOption === 'x' 
                                                        ? cn("text-white dark:text-zinc-950 scale-110 shadow-lg", getBgColorClass(modalSelectedColor)) 
                                                        : "border-2 border-[var(--border)] text-zinc-300 dark:text-zinc-600"
                                                )}
                                            >
                                                <X size={40} strokeWidth={3} />
                                            </button>
                                        </div>

                                        <div className="flex gap-4 h-16 mt-8 w-full">
                                            <div className="flex flex-1 gap-2">
                                                <button 
                                                    onClick={() => { setModalScreen('color'); setInitialColorInScreen(modalSelectedColor); Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {}) }}
                                                    className="flex-1 rounded-2xl bg-[var(--surface)] border-2 border-[var(--border)] flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                                                >
                                                    <Palette size={24} />
                                                </button>
                                                <button 
                                                    onClick={() => { setModalScreen('notes'); setInitialNoteInScreen(modalNote); Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {}) }}
                                                    className="flex-1 rounded-2xl bg-[var(--surface)] border-2 border-[var(--border)] flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                                                >
                                                    <FileText size={24} />
                                                </button>
                                            </div>

                                            <button 
                                                onClick={handleSave}
                                                disabled={!modalSelectedOption}
                                                className={cn(
                                                    "flex-1 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all duration-300",
                                                    modalSelectedOption 
                                                        ? cn("text-white dark:text-zinc-950 shadow-md opacity-100 scale-[1.02]", getBgColorClass(modalSelectedColor)) 
                                                        : "bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-500 opacity-80 cursor-not-allowed"
                                                )}
                                            >
                                                <Save size={20} />
                                                <span className="text-sm tracking-tight">Guardar</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : modalScreen === 'color' ? (
                                    <motion.div 
                                        key="color"
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -20, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="px-6 py-8 flex flex-col items-center text-center h-full min-h-[480px]"
                                    >
                                        <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-1">
                                            Elegir color
                                        </h2>
                                        <p className="text-lg font-medium text-zinc-400 capitalize mb-10">
                                            Estilo de marca
                                        </p>

                                        <div className="grid grid-cols-4 gap-4 mb-auto py-2 w-full max-w-[280px]">
                                            {colors.map((c) => (
                                                <button
                                                    key={c.name}
                                                    onClick={() => { setModalSelectedColor(c.name); Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}) }}
                                                    className={cn(
                                                        "aspect-square rounded-2xl transition-all duration-300 flex items-center justify-center",
                                                        c.class,
                                                        modalSelectedColor === c.name 
                                                            ? "scale-110 ring-4 ring-zinc-200 dark:ring-zinc-800 shadow-lg" 
                                                            : "opacity-80 hover:opacity-100"
                                                    )}
                                                >
                                                    {modalSelectedColor === c.name && <Check size={24} className="text-white" strokeWidth={3} />}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex gap-4 h-16 mt-8 w-full">
                                            <button 
                                                onClick={() => { 
                                                    setModalSelectedColor(initialColorInScreen);
                                                    setModalScreen('main'); 
                                                    Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {}) 
                                                }}
                                                className="flex-1 rounded-2xl bg-[var(--surface)] border-2 border-[var(--border)] flex items-center justify-center gap-2 text-zinc-900 dark:text-white font-bold transition-all"
                                            >
                                                <X size={20} />
                                                <span>Volver</span>
                                            </button>
                                            <button 
                                                onClick={() => { setModalScreen('main'); Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {}) }}
                                                disabled={!modalSelectedColor}
                                                className={cn(
                                                    "flex-1 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all duration-300",
                                                    modalSelectedColor 
                                                        ? cn("text-white dark:text-zinc-950 shadow-md opacity-100 scale-[1.02]", getBgColorClass(modalSelectedColor)) 
                                                        : "bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-500 opacity-80 cursor-not-allowed"
                                                )}
                                            >
                                                <Check size={20} />
                                                <span>Aceptar</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : modalScreen === 'notes' ? (
                                    <motion.div 
                                        key="notes"
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -20, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="px-6 py-8 flex flex-col items-center text-center h-full min-h-[480px]"
                                    >
                                        <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-1">
                                            Registro
                                        </h2>
                                        <p className="text-lg font-medium text-zinc-400 capitalize mb-6">
                                            Añadir nota
                                        </p>

                                        <textarea 
                                            value={modalNote}
                                            onChange={(e) => setModalNote(e.target.value)}
                                            placeholder="Escribe algo sobre tu día..."
                                            className="w-full flex-1 bg-[var(--surface)] border-2 border-[var(--border)] rounded-[2rem] p-6 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 outline-none focus:border-zinc-300 dark:focus:border-zinc-600 transition-all resize-none text-lg text-center"
                                        />

                                        <div className="flex gap-4 h-16 mt-8 w-full">
                                            <button 
                                                onClick={() => { 
                                                    setModalNote(initialNoteInScreen);
                                                    setModalScreen('main'); 
                                                    Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {}) 
                                                }}
                                                className="flex-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center gap-2 text-zinc-900 dark:text-white font-bold transition-all"
                                            >
                                                <X size={20} />
                                                <span>Volver</span>
                                            </button>
                                            <button 
                                                onClick={() => { setModalScreen('main'); Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {}) }}
                                                className={cn(
                                                    "flex-1 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all duration-300",
                                                    modalNote.trim().length > 0
                                                        ? cn("text-white dark:text-zinc-950 shadow-md opacity-100 scale-[1.02]", getBgColorClass(modalSelectedColor)) 
                                                        : "bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-500 opacity-80 cursor-not-allowed"
                                                )}
                                            >
                                                <Check size={20} />
                                                <span>Aceptar</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
