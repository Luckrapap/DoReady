'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isToday,
    isBefore,
    startOfDay,
    startOfWeek,
    endOfWeek
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface CalendarGridProps {
    taskCounts: Record<string, { hasAction: boolean, hasEvent: boolean }>
}

export default function CalendarGrid({ taskCounts }: CalendarGridProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [[month, year], setMonthYear] = useState([currentDate.getMonth(), currentDate.getFullYear()])
    const [direction, setDirection] = useState(0)
    const router = useRouter()

    const monthStart = startOfMonth(new Date(year, month))
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const weekDays = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM']

    const nextMonth = () => {
        setDirection(1)
        if (month === 11) {
            setMonthYear([0, year + 1])
        } else {
            setMonthYear([month + 1, year])
        }
    }

    const prevMonth = () => {
        setDirection(-1)
        if (month === 0) {
            setMonthYear([11, year - 1])
        } else {
            setMonthYear([month - 1, year])
        }
    }

    const onDateClick = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        if (isToday(day)) {
            router.push('/today')
        } else {
            router.push(`/calendar?date=${dateStr}`)
        }
    }

    const headerVariants = {
        initial: { opacity: 0, scale: 0.96, filter: 'blur(4px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 1.04, filter: 'blur(4px)' }
    }

    const gridVariants = {
        enter: (direction: number) => ({
            scale: 0.94,
            opacity: 0,
            filter: 'blur(6px)',
        }),
        center: {
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            transition: {
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1]
            }
        },
        exit: (direction: number) => ({
            scale: 1.06,
            opacity: 0,
            filter: 'blur(6px)',
            transition: {
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1]
            }
        })
    }

    return (
        <div className="w-full max-w-md mx-auto p-4 md:p-8 bg-white dark:bg-[#111113] rounded-[2.5rem] border-[3px] border-zinc-200 dark:border-zinc-800/80 shadow-sm relative overflow-hidden">
            {/* Minimalist Header */}
            <div className="flex items-center justify-center gap-0 mb-10 px-2">
                <button
                    onClick={prevMonth}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-200/40 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 transition-all hover:scale-110 active:scale-95 text-zinc-700 dark:text-zinc-300 relative z-10"
                >
                    <ChevronLeft size={20} strokeWidth={2.5} />
                </button>
                
                <div className="min-w-[170px] h-9 relative flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.h2 
                            key={`${month}-${year}`}
                            variants={headerVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tighter capitalize px-0 text-center"
                        >
                            {format(new Date(year, month), 'MMMM yyyy', { locale: es })}
                        </motion.h2>
                    </AnimatePresence>
                </div>

                <button
                    onClick={nextMonth}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-200/40 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 transition-all hover:scale-110 active:scale-95 text-zinc-700 dark:text-zinc-300 relative z-10"
                >
                    <ChevronRight size={20} strokeWidth={2.5} />
                </button>
            </div>

            {/* Weekdays Labels */}
            <div className="grid grid-cols-7 mb-6">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-[10px] md:text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Day Grid with Animation Container */}
            <div className="relative overflow-hidden min-h-[280px]">
                <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                    <motion.div
                        key={`${month}-${year}`}
                        custom={direction}
                        variants={gridVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 250, damping: 25 }}
                        className="grid grid-cols-7 gap-y-2 md:gap-y-4"
                    >
                        {days.map((day, idx) => {
                            const isCurrentMonth = day.getMonth() === month
                            const isTodayDate = isToday(day)
                            const currentDayStart = startOfDay(new Date())
                            const isPast = !isTodayDate && isBefore(day, currentDayStart)
                            const dateStr = format(day, 'yyyy-MM-dd')
                            const summary = taskCounts[dateStr]

                            return (
                                <div key={idx} className="aspect-square flex items-center justify-center">
                                    <button
                                        onClick={() => onDateClick(day)}
                                        disabled={!isCurrentMonth}
                                        className={cn(
                                            "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-base rounded-full transition-all relative",
                                            !isCurrentMonth ? "opacity-0 pointer-events-none" : isTodayDate ? "" : "hover:bg-zinc-100 dark:hover:bg-zinc-900",
                                            isTodayDate 
                                                ? "text-zinc-50 dark:text-zinc-950 font-bold" 
                                                : isPast
                                                    ? "text-zinc-400 dark:text-zinc-600 font-medium opacity-50"
                                                    : "text-zinc-800 dark:text-zinc-200 font-medium"
                                        )}
                                    >
                                        {isTodayDate && (
                                            <div className="absolute inset-0 bg-zinc-950 dark:bg-zinc-50 rounded-full shadow-lg shadow-zinc-200 dark:shadow-none scale-[0.91]" />
                                        )}
                                        <span className="relative z-10">{format(day, 'd')}</span>

                                        {summary && isCurrentMonth && (
                                            <div className="absolute -bottom-[12px] md:-bottom-[14px] left-1/2 -translate-x-1/2 flex items-center justify-center gap-[3px] pointer-events-none h-[12px]">
                                                {summary.hasEvent && (
                                                    <div className={cn(
                                                        "w-[8px] h-[8px] md:w-[10px] md:h-[10px] rounded-full flex-shrink-0",
                                                        isTodayDate 
                                                            ? "bg-zinc-300 dark:bg-zinc-400" 
                                                            : isPast 
                                                                ? "bg-zinc-100 dark:bg-zinc-600" 
                                                                : "bg-zinc-200 dark:bg-zinc-500"
                                                    )} />
                                                )}
                                                {summary.hasAction && (
                                                    <div className={cn(
                                                        "w-[5px] h-[5px] md:w-[6px] md:h-[6px] rounded-full flex-shrink-0",
                                                        isTodayDate 
                                                            ? "bg-zinc-300 dark:bg-zinc-400" 
                                                            : isPast 
                                                                ? "bg-zinc-100 dark:bg-zinc-600" 
                                                                : "bg-zinc-200 dark:bg-zinc-500"
                                                    )} />
                                                )}
                                            </div>
                                        )}
                                    </button>
                                </div>
                            )
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
