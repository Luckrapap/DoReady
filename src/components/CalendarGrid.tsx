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
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Start week on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days = eachDayOfInterval({ start: startDate, end: endDate })

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

    const onDateClick = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        router.push(`/?date=${dateStr}`)
    }

    return (
        <div className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2rem] p-6 shadow-sm">
            {/* Header */}
            <div className="flex justify-center items-center mb-6 gap-4">
                <button
                    onClick={prevMonth}
                    className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <h2 className="text-3xl md:text-4xl font-dancing text-zinc-900 dark:text-zinc-50 lowercase transition-all capitalize italic">
                    {format(currentDate, 'MMMM')}
                    <span className="text-xl ml-4 font-sans not-italic text-zinc-300 dark:text-zinc-700 font-bold">
                        {format(currentDate, 'yyyy')}
                    </span>
                </h2>
                <button
                    onClick={nextMonth}
                    className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 mb-2 border-b border-zinc-100/50 dark:border-zinc-800/50 pb-2">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-xs font-bold text-zinc-400 uppercase tracking-widest py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {days.map((day, idx) => {
                    const formattedDate = format(day, 'yyyy-MM-dd')
                    const hasTasks = taskCounts[formattedDate] > 0
                    const isCurrentMonth = format(day, 'MM') === format(monthStart, 'MM')

                    return (
                        <button
                            key={idx}
                            onClick={() => onDateClick(day)}
                            className={cn(
                                "group relative flex flex-col items-center justify-center p-2 h-14 md:h-20 border border-zinc-100/50 dark:border-zinc-800/30 rounded-xl transition-all hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-sm cursor-pointer",
                                !isCurrentMonth && "opacity-20 pointer-events-none",
                                isToday(day) && "ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-2 ring-offset-white/80 dark:ring-offset-zinc-900/80 shadow-sm"
                            )}
                        >
                            <span className="absolute top-1.5 left-2 text-[10px] font-bold text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors">
                                {format(day, 'd')}
                            </span>
                            {hasTasks && (
                                <div className={cn(
                                    "absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mt-2",
                                    isToday(day) ? "bg-black dark:bg-zinc-100" : "bg-black dark:bg-white"
                                )} />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
