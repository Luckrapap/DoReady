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
    startOfWeek,
    endOfWeek
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/utils'

interface CalendarGridProps {
    taskCounts: Record<string, number>
}

export default function CalendarGrid({ taskCounts }: CalendarGridProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const router = useRouter()

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Start week on Monday as requested
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days = eachDayOfInterval({ start: startDate, end: endDate })

    const weekDays = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM']

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

    const onDateClick = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        if (isToday(day)) {
            router.push('/today')
        } else {
            router.push(`/calendar?date=${dateStr}`)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto p-4 md:p-8 bg-white dark:bg-black rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800/50 shadow-sm">
            {/* Minimalist Header */}
            <div className="flex items-center justify-between mb-10 px-2">
                <button
                    onClick={prevMonth}
                    className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-400 dark:text-zinc-500"
                >
                    <ChevronLeft size={24} strokeWidth={1.5} />
                </button>
                
                <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight capitalize">
                    {format(currentDate, 'MMMM yyyy', { locale: es })}
                </h2>

                <button
                    onClick={nextMonth}
                    className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-400 dark:text-zinc-500"
                >
                    <ChevronRight size={24} strokeWidth={1.5} />
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

            {/* Day Grid */}
            <div className="grid grid-cols-7 gap-y-2 md:gap-y-4">
                {days.map((day, idx) => {
                    const isCurrentMonth = format(day, 'MM') === format(monthStart, 'MM')
                    const isTodayDate = isToday(day)

                    return (
                        <div key={idx} className="aspect-square flex items-center justify-center">
                            <button
                                onClick={() => onDateClick(day)}
                                disabled={!isCurrentMonth}
                                className={cn(
                                    "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-base rounded-full transition-all relative",
                                    !isCurrentMonth ? "opacity-0 pointer-events-none" : "hover:bg-zinc-100 dark:hover:bg-zinc-900",
                                    isTodayDate 
                                        ? "bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950 font-bold shadow-lg shadow-zinc-200 dark:shadow-none" 
                                        : "text-zinc-800 dark:text-zinc-200 font-medium"
                                )}
                            >
                                {format(day, 'd')}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
