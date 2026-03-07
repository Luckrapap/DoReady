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

    const weekDays = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

    const onDateClick = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        router.push(`/today?date=${dateStr}`)
    }

    return (
        <div className="w-full backdrop-blur-md border rounded-[2rem] p-6 shadow-sm transition-colors duration-500"
            style={{
                backgroundColor: 'color-mix(in srgb, var(--surface) 80%, transparent)',
                borderColor: 'var(--border)'
            }}
        >
            {/* Header */}
            <div className="flex justify-center flex-col md:flex-row items-center mb-6 gap-4">
                <div className="flex justify-between w-full md:w-auto items-center gap-4">
                    <button
                        onClick={prevMonth}
                        className="p-2 md:p-1.5 rounded-full text-zinc-400 transition-colors"
                        style={{ backgroundColor: 'var(--border)' }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-3xl md:text-4xl font-dancing text-zinc-900 dark:text-zinc-50 lowercase transition-all capitalize italic">
                        {format(currentDate, 'MMMM')}
                        <span className="text-xl ml-4 font-sans not-italic font-bold"
                            style={{ color: 'var(--border)' }}
                        >
                            {format(currentDate, 'yyyy')}
                        </span>
                    </h2>
                    <button
                        onClick={nextMonth}
                        className="p-2 md:p-1.5 rounded-full text-zinc-400 transition-colors"
                        style={{ backgroundColor: 'var(--border)' }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto pb-4 -mx-2 px-2 md:mx-0 md:px-0 scrollbar-hide">
                <div className="min-w-[320px]">
                    {/* Days of week */}
                    <div className="grid grid-cols-7 mb-2 border-b border-zinc-100/50 dark:border-zinc-800/50 pb-2">
                        {weekDays.map((day) => (
                            <div key={day} className="text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
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
                                        "group relative h-14 md:h-20 border rounded-xl flex items-center justify-center cursor-pointer transition-all hover:shadow-sm duration-500",
                                        !isCurrentMonth && "opacity-20 pointer-events-none",
                                        isToday(day) && "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)] shadow-sm"
                                    )}
                                    style={{
                                        borderColor: 'color-mix(in srgb, var(--border) 30%, transparent)'
                                    }}
                                >
                                    <span className="absolute top-1.5 left-2 text-[10px] font-bold transition-colors"
                                        style={{ color: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}
                                    >
                                        {format(day, 'd')}
                                    </span>
                                    {hasTasks && (
                                        <div className={cn(
                                            "absolute w-8 h-8 md:w-10 md:h-10 rounded-full shadow-lg border-4 transition-all z-10",
                                            "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                        )}
                                            style={{
                                                backgroundColor: 'var(--surface)',
                                                borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
                                                boxShadow: '0 0 15px var(--border)'
                                            }}
                                        />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
