'use client'

import { useState, useOptimistic, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { Menu, X, Plus, Orbit } from 'lucide-react'
import HabitItem from './HabitItem'
import CreateHabitModal from './CreateHabitModal'
import CreateHabitInput from './CreateHabitInput'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { saveHabitsOrder, reorderHabit } from '@/app/actions/habits'
import { cn } from '@/utils/utils'

type Habit = {
    id: string;
    title: string;
    is_completed: boolean;
    created_at: string;
}

type HabitsContainerProps = {
    initialHabits: Habit[];
    dateStr: string;
    isToday: boolean;
    isReorderMode: boolean;
    setIsReorderMode: (val: boolean) => void;
    onToggle: (id: string, isCompleted: boolean) => void;
    onDelete: (id: string) => void;
    onCreate: (title: string) => void;
    onSaveOrder: (orderedHabits: Habit[]) => void;
}

// Componente interno para manejar el arrastre de forma aislada y eficiente
const ReorderableHabitItem = ({ 
    habit, 
    dateStr, 
    isReorderMode, 
    onToggle, 
    onDelete, 
    onEdit 
}: any) => {
    const controls = useDragControls();

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!isReorderMode) return;
        e.preventDefault();
        controls.start(e.nativeEvent);
    };

    return (
        <Reorder.Item
            value={habit}
            dragListener={false}
            dragControls={controls}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
            style={{ x: 0 }}
        >
            <HabitItem
                habit={habit}
                dateStr={dateStr}
                onStatusChange={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                isReorderMode={isReorderMode}
                onDragHandlePointerDown={handlePointerDown}
            />
        </Reorder.Item>
    );
};

export default function HabitsContainer({ 
    initialHabits, 
    dateStr, 
    isToday,
    isReorderMode,
    setIsReorderMode,
    onToggle,
    onDelete,
    onCreate,
    onSaveOrder
}: HabitsContainerProps) {
    const router = useRouter()
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [localHabitsOrder, setLocalHabitsOrder] = useState<Habit[]>(initialHabits)
    const [showMainMoreMenu, setShowMainMoreMenu] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Sync local order when initialHabits change (from parent state)
    useEffect(() => {
        setLocalHabitsOrder(initialHabits)
    }, [initialHabits])

    // Open Modal when "+" is clicked
    const handlePlusClick = () => {
        setIsModalOpen(true)
    }

    // Automatic Midnight Reset
    useEffect(() => {
        if (!isToday) return

        const calculateTimeUntilMidnight = () => {
            const now = new Date()
            const midnight = new Date(now)
            midnight.setHours(24, 0, 0, 0)
            return midnight.getTime() - now.getTime()
        }

        const handleMidnightReset = () => {
            router.refresh()
            // Recalculate for next midnight if the tab stays open
            setupTimer()
        }

        let timer: NodeJS.Timeout;

        const setupTimer = () => {
            const ms = calculateTimeUntilMidnight()
            timer = setTimeout(handleMidnightReset, ms + 1000) // +1s buffer
        }

        setupTimer()
        return () => clearTimeout(timer)
    }, [isToday, router])

    const handleStatusChange = (habitId: string, isCompleted: boolean) => {
        onToggle(habitId, isCompleted)
    }

    const handleHabitDelete = (habitId: string) => {
        onDelete(habitId)
    }
    
    const sortedHabits = [...initialHabits].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const handleMoveUp = async (habitId: string) => {
        const index = sortedHabits.findIndex(h => h.id === habitId)
        if (index <= 0) return
        
        let newTime: number;
        if (index === 1) {
            newTime = new Date(sortedHabits[0].created_at).getTime() - 60000;
        } else {
            newTime = (new Date(sortedHabits[index - 1].created_at).getTime() + new Date(sortedHabits[index - 2].created_at).getTime()) / 2;
        }
        
        const newCreatedAt = new Date(newTime).toISOString()
        
        startTransition(() => {
            addOptimisticHabit({ type: 'reorder', id: habitId, created_at: newCreatedAt })
            setEditingHabit(prev => prev ? { ...prev, created_at: newCreatedAt } : null)
        })
        await reorderHabit(habitId, newCreatedAt)
    }

    const handleMoveDown = async (habitId: string) => {
        const index = sortedHabits.findIndex(h => h.id === habitId)
        if (index === -1 || index === sortedHabits.length - 1) return
        
        let newTime: number;
        if (index === sortedHabits.length - 2) {
            newTime = new Date(sortedHabits[sortedHabits.length - 1].created_at).getTime() + 60000;
        } else {
            newTime = (new Date(sortedHabits[index + 1].created_at).getTime() + new Date(sortedHabits[index + 2].created_at).getTime()) / 2;
        }
        
        const newCreatedAt = new Date(newTime).toISOString()
        
        startTransition(() => {
            addOptimisticHabit({ type: 'reorder', id: habitId, created_at: newCreatedAt })
            setEditingHabit(prev => prev ? { ...prev, created_at: newCreatedAt } : null)
        })
        await reorderHabit(habitId, newCreatedAt)
    }

    const completedCount = initialHabits.filter(h => h.is_completed).length;
    const totalCount = initialHabits.length;

    return (
        <div className="flex flex-col gap-2 h-full min-h-0">
            {/* Main Header - Dims and scales in reorder mode */}
            <header className={cn(
                "flex flex-col gap-1 px-3 flex-shrink-0 transition-all duration-300",
                isReorderMode && "opacity-30 scale-[0.98] pointer-events-none grayscale"
            )}>
                <div className="flex items-end justify-between">
                    <h1 className="font-bold text-6xl md:text-8xl tracking-tighter text-zinc-900 dark:text-zinc-50 relative bottom-1.5 whitespace-nowrap">
                        {isToday ? "Habits" : "Historial"}
                    </h1>
                    <div className="bg-zinc-200 dark:bg-zinc-800 rounded-full px-6 py-1.5 mt-1 mb-2 flex items-center justify-center">
                        <span className="text-4xl md:text-5xl font-light text-zinc-600 dark:text-zinc-300">
                            {completedCount}/{totalCount}
                        </span>
                    </div>
                </div>

            </header>
            
            <motion.div 
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                    type: "spring",
                    damping: 25,
                    stiffness: 200,
                    delay: 0.1
                }}
                className="flex items-center justify-between gap-1.5 px-3 mt-0 mb-[4px] relative z-[60]"
            >
                <div className={cn(
                    "flex items-center transition-all duration-300",
                    isReorderMode && "opacity-30 scale-[0.98] pointer-events-none grayscale"
                )}>
                    <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tighter">Hábitos:</span>
                </div>

                <div className="flex items-center gap-1.5">
                    {/* Left Plus Button */}
                    <motion.button
                        onClick={handlePlusClick}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        className={cn(
                            "bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-full w-[54px] h-[54px] flex items-center justify-center hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-all duration-300 cursor-pointer flex-shrink-0",
                            isReorderMode && "opacity-30 scale-[0.95] pointer-events-none grayscale"
                        )}
                        title="Añadir Hábito"
                    >
                        <Plus size={24} className="text-zinc-900 dark:text-zinc-50 group-hover:text-inherit" strokeWidth={3} />
                    </motion.button>

                    {/* Middle Reorder Button (Matching NoteBox) */}
                    <div className="relative">
                        <motion.button
                            onClick={async () => {
                                if (isReorderMode) {
                                    await onSaveOrder(localHabitsOrder)
                                    setIsReorderMode(false)
                                } else {
                                    setShowMainMoreMenu(!showMainMoreMenu)
                                }
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={cn(
                                "border-2 rounded-full w-[54px] h-[54px] flex items-center justify-center transition-all duration-300 cursor-pointer flex-shrink-0 shadow-lg",
                                isReorderMode 
                                    ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-950 scale-110" 
                                    : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-200"
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
                                    transition={{ type: "spring", stiffness: 700, damping: 35, mass: 0.5 }}
                                >
                                    {isReorderMode ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
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
                                        className="absolute right-0 top-16 w-48 bg-zinc-900 dark:bg-[#1c1c1e] rounded-[24px] shadow-2xl z-50 overflow-hidden py-2"
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
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>


                </div>
            </motion.div>


            <div className="flex flex-col gap-2.5 pb-20 overflow-y-auto flex-1 min-h-0 px-3">
                <AnimatePresence mode="popLayout">
                    {localHabitsOrder.length > 0 ? (
                        <Reorder.Group 
                            axis="y" 
                            values={localHabitsOrder} 
                            onReorder={setLocalHabitsOrder}
                            className="flex flex-col gap-2.5"
                        >
                            {localHabitsOrder.map((habit) => (
                                <ReorderableHabitItem
                                    key={habit.id}
                                    habit={habit}
                                    dateStr={dateStr}
                                    isReorderMode={isReorderMode}
                                    onToggle={handleStatusChange}
                                    onDelete={handleHabitDelete}
                                    onEdit={() => { setEditingHabit(habit); setIsModalOpen(true) }}
                                />
                            ))}
                        </Reorder.Group>
                    ) : (
                        <motion.div
                            key="empty-state"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-20 rounded-[32px] gap-6"
                            style={{
                                backgroundColor: 'color-mix(in srgb, var(--surface) 20%, transparent)'
                            }}
                        >
                            <div className="w-20 h-20 flex items-center justify-center rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
                                <Orbit className="text-zinc-800 dark:text-zinc-200" size={40} strokeWidth={1.5} />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xl tracking-tight">Sin hábitos hoy.</p>
                                <p className="text-base text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-[260px]">Empieza a cultivar mejores rutinas</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


            <CreateHabitModal 
                isOpen={isModalOpen || !!editingHabit} 
                onClose={() => { setIsModalOpen(false); setEditingHabit(null) }}
                onHabitCreated={onCreate}
                habit={editingHabit}
                onHabitDeleted={(id) => {
                    handleHabitDelete(id)
                    setEditingHabit(null)
                }}
                onHabitUpdated={async (id, newTitle) => {
                    setLocalHabitsOrder(prev => prev.map(h => h.id === id ? { ...h, title: newTitle } : h))
                    setEditingHabit(null)
                    setIsModalOpen(false)
                    const { updateHabit } = await import('@/app/actions/habits')
                    await updateHabit(id, newTitle)
                }}
            />
        </div>
    )

}
