'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Menu } from 'lucide-react'
import { format, startOfWeek, addWeeks, subWeeks, addDays, getDay, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/utils/utils'

export default function CheckDayInterface() {
    // We start on the current week.
    const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
    
    // We focus on today's day index (0 for Monday, 6 for Sunday) initially if it's the current week, otherwise 0
    const [focusedIndex, setFocusedIndex] = useState(() => {
        const todayDay = getDay(new Date())
        // date-fns getDay: 0 is Sunday, 1 is Monday.
        // We want 0 for Monday, 6 for Sunday.
        return todayDay === 0 ? 6 : todayDay - 1
    })

    // Navigation handlers
    const nextWeek = () => {
        setCurrentWeekStart(prev => addWeeks(prev, 1))
        setFocusedIndex(0) // Default to Monday when switching weeks
    }
    
    const prevWeek = () => {
        setCurrentWeekStart(prev => subWeeks(prev, 1))
        setFocusedIndex(0)
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
        if (diff > 50 && focusedIndex < 6) {
            // Swipe left (next day)
            setFocusedIndex(prev => prev + 1)
        } else if (diff < -50 && focusedIndex > 0) {
            // Swipe right (prev day)
            setFocusedIndex(prev => prev - 1)
        }
        setDragStart(null)
    }

    const focusedDate = addDays(currentWeekStart, focusedIndex)
    const monthName = format(focusedDate, 'MMMM', { locale: es })
    
    const weekDaysShort = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
    const weekDaysFull = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

    // Mock data for which days have marks (0-6)
    const markedDays = [0, 4, 5, 6] // L, V, S, D have marks in the mockup sketch roughly

    return (
        <div className="flex flex-col w-full flex-1">
            {/* Header: Month Navigator */}
            <div className="flex items-center justify-center gap-6 mt-4 mb-10">
                <button onClick={prevWeek} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ChevronLeft size={32} strokeWidth={1.5} />
                </button>
                <div className="px-6 py-2 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <span className="text-2xl font-medium text-zinc-900 dark:text-zinc-50 capitalize tracking-wide">
                        {monthName}
                    </span>
                </div>
                <button onClick={nextWeek} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ChevronRight size={32} strokeWidth={1.5} />
                </button>
            </div>

            {/* 3-Day Carousel */}
            <div 
                className="w-full flex items-end justify-center gap-4 mb-10 relative touch-pan-y"
                data-no-swipe="true"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* We map relative to the focused index: -1, 0, 1 */}
                {[-1, 0, 1].map((offset) => {
                    const actualIndex = focusedIndex + offset
                    const isOutOfBounds = actualIndex < 0 || actualIndex > 6
                    
                    if (isOutOfBounds) {
                        return <div key={offset} className="w-24 md:w-32 aspect-square invisible" />
                    }

                    const isFocused = offset === 0

                    return (
                        <div key={actualIndex} className={cn(
                            "flex flex-col items-center gap-3 transition-opacity duration-300",
                            isFocused ? "opacity-100" : "opacity-30"
                        )}>
                            <span className="text-zinc-400 text-sm font-medium">
                                {weekDaysFull[actualIndex]}
                            </span>
                            <div className={cn(
                                "flex flex-col items-center justify-center border-2 rounded-3xl transition-all duration-300",
                                isFocused 
                                    ? "w-28 h-28 md:w-36 md:h-36 border-zinc-300 dark:border-zinc-600 shadow-md" 
                                    : "w-24 h-24 md:w-32 md:h-32 border-zinc-200 dark:border-zinc-800"
                            )}>
                                {/* Placeholder for empty state */}
                                <Plus size={isFocused ? 48 : 36} className="text-zinc-300 dark:text-zinc-700 stroke-[1.5]" />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Week Line Progress (L M M J V S D) */}
            <div className="flex justify-center gap-4 md:gap-6 mb-12">
                {weekDaysShort.map((letter, idx) => {
                    const hasMark = markedDays.includes(idx)
                    return (
                        <div key={idx} className="flex flex-col items-center gap-2">
                            <span className="text-xl font-medium text-zinc-900 dark:text-zinc-50">{letter}</span>
                            <div className={cn(
                                "w-2 h-2 rounded-full border-2",
                                hasMark ? "border-zinc-900 dark:border-white bg-transparent" : "border-transparent"
                            )} />
                        </div>
                    )
                })}
            </div>

            {/* Checkdays Management */}
            <div className="flex flex-col px-4 md:px-8 gap-6 max-w-sm mx-auto w-full mb-auto pb-8">
                <div className="flex items-center gap-4">
                    <span className="text-3xl font-medium text-zinc-900 dark:text-zinc-50 tracking-tight">Checkdays</span>
                    <button className="p-1 rounded-full border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white">
                        <Plus size={18} strokeWidth={2.5} />
                    </button>
                </div>
                
                <div className="flex items-center gap-4">
                    <span className="text-3xl font-medium text-zinc-900 dark:text-zinc-50 tracking-tight">Productividad</span>
                    <button className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white transition-colors">
                        <Menu size={24} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Bottom Placeholders (4 boxes) */}
            <div className="flex justify-center gap-4 pb-8 pt-4">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800" />
                ))}
            </div>
        </div>
    )
}
