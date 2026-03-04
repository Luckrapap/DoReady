'use client'

import { useState, useEffect } from 'react'
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isToday,
    startOfWeek,
    endOfWeek,
    isSameMonth
} from 'date-fns'
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/utils'
import { CheckDayLayer, CheckDayStatus, toggleCheckDay, getCheckDays } from '@/app/actions/checkday'

export default function CheckDayCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [activeLayer, setActiveLayer] = useState<CheckDayLayer>('performance')
    const [checkMap, setCheckMap] = useState<Record<string, CheckDayStatus>>({})
    const [isLoading, setIsLoading] = useState(true)

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const weekDays = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

    useEffect(() => {
        fetchData()
    }, [currentDate, activeLayer])

    async function fetchData() {
        setIsLoading(true)
        const data = await getCheckDays(currentDate.getFullYear(), currentDate.getMonth() + 1, activeLayer)
        setCheckMap(data)
        setIsLoading(false)
    }

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

    const toggleLayer = () => {
        setActiveLayer(prev => prev === 'performance' ? 'mood' : 'performance')
    }

    const handleDayInteraction = async (day: Date, isLeftClick: boolean, event: React.MouseEvent) => {
        event.preventDefault()

        const dateStr = format(day, 'yyyy-MM-dd')
        const currentStatus = checkMap[dateStr] || null

        let newStatus: CheckDayStatus = null

        if (isLeftClick) {
            if (activeLayer === 'performance') {
                // Cycle: null -> check -> x -> check...
                if (currentStatus === null) newStatus = 'check'
                else if (currentStatus === 'check') newStatus = 'x'
                else newStatus = 'check'
            } else {
                // Mood Cycle: null -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 1...
                if (currentStatus === null) {
                    newStatus = '1'
                } else {
                    const currentNum = parseInt(currentStatus as string)
                    if (isNaN(currentNum)) {
                        newStatus = '1'
                    } else {
                        newStatus = currentNum >= 8 ? '1' : (currentNum + 1).toString() as CheckDayStatus
                    }
                }
            }
        } else {
            // Right click: always clear to null
            newStatus = null
        }

        // Optimistic update
        setCheckMap(prev => ({ ...prev, [dateStr]: newStatus }))

        const result = await toggleCheckDay(dateStr, newStatus, activeLayer)
        if (!result.success) {
            console.error("Failed to save check day:", result.error)
            alert(`Error al guardar: ${result.error}`)
            // Revert on failure
            setCheckMap(prev => ({ ...prev, [dateStr]: currentStatus }))
        }
    }

    // Minimalist Mood Face Component
    const MoodIcon = ({ level }: { level: string }) => {
        const colors: Record<string, string> = {
            '1': '#FFEB3B', // Extasis - Amarillo brillante
            '2': '#FDD835', // Alegría - Amarillo
            '3': '#CDDC39', // Satisfacción - Verde lima
            '4': '#FFFFFF', // Neutro - Blanco
            '5': '#81D4FA', // Cansancio - Azul claro
            '6': '#2196F3', // Tristeza - Azul
            '7': '#F57C00', // Frustración - Naranja oscuro
            '8': '#F44336', // Ira - Rojo
        }

        const color = colors[level] || '#FFFFFF'

        return (
            <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-sm"
            >
                <circle cx="12" cy="12" r="10" />
                {/* Eyes */}
                {level === '1' && ( // Extasis: ^^
                    <g>
                        <path d="M8 10l2-1 2 1" />
                        <path d="M12 10l2-1 2 1" />
                    </g>
                )}
                {level === '2' && ( // Alegría: ..
                    <g>
                        <circle cx="9" cy="10" r="0.5" fill={color} />
                        <circle cx="15" cy="10" r="0.5" fill={color} />
                    </g>
                )}
                {level === '3' && ( // Satisfacción: ..
                    <g>
                        <circle cx="9" cy="10" r="0.5" fill={color} />
                        <circle cx="15" cy="10" r="0.5" fill={color} />
                    </g>
                )}
                {level === '4' && ( // Neutro: ..
                    <g>
                        <circle cx="9" cy="10" r="0.5" fill={color} />
                        <circle cx="15" cy="10" r="0.5" fill={color} />
                    </g>
                )}
                {level === '5' && ( // Cansancio: ..
                    <g>
                        <circle cx="9" cy="10" r="0.5" fill={color} />
                        <circle cx="15" cy="10" r="0.5" fill={color} />
                    </g>
                )}
                {level === '6' && ( // Tristeza: ..
                    <g>
                        <circle cx="9" cy="10" r="0.5" fill={color} />
                        <circle cx="15" cy="10" r="0.5" fill={color} />
                    </g>
                )}
                {level === '7' && ( // Frustración: --
                    <g>
                        <line x1="8" y1="10" x2="10" y2="10" />
                        <line x1="14" y1="10" x2="16" y2="10" />
                    </g>
                )}
                {level === '8' && ( // Ira: \ /
                    <g>
                        <path d="M8 9l2 1" />
                        <path d="M14 10l2-1" />
                        <circle cx="9" cy="12" r="0.5" fill={color} />
                        <circle cx="15" cy="12" r="0.5" fill={color} />
                    </g>
                )}

                {/* Mouths */}
                {level === '1' && <path d="M8 15s1.5 2 4 2 4-2 4-2" />}
                {level === '2' && <path d="M8 15s1.5 2 4 2 4-2 4-2" />}
                {level === '3' && <path d="M9 16s1 1 3 1 3-1 3-1" />}
                {level === '4' && <line x1="9" y1="16" x2="15" y2="16" />}
                {level === '5' && <path d="M9 17s1-1 3-1 3 1 3 1" />}
                {level === '6' && <path d="M8 18s1.5-2 4-2 4 2 4 2" />}
                {level === '7' && <line x1="9" y1="17" x2="15" y2="17" />}
                {level === '8' && <path d="M9 18s1-1.5 3-1.5 3 1.5 3 1.5" />}
            </motion.svg>
        )
    }

    return (
        <div className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2rem] p-6 shadow-sm">
            {/* Layer Toggler & Month Header */}
            <div className="flex flex-col items-center mb-6 gap-4">
                <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                    <button
                        onClick={toggleLayer}
                        className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-zinc-500 hover:text-black dark:hover:text-white"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-xs font-black uppercase tracking-widest px-4 min-w-[140px] text-center">
                        {activeLayer === 'performance' ? 'Productividad' : 'Estado de Ánimo'}
                    </span>
                    <button
                        onClick={toggleLayer}
                        className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-zinc-500 hover:text-black dark:hover:text-white"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-6">
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
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 mb-2 border-b border-zinc-100/50 dark:border-zinc-800/50 pb-2">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className={`grid grid-cols-7 gap-2 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                {days.map((day, idx) => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const status = checkMap[dateStr]
                    const inCurrentMonth = isSameMonth(day, monthStart)

                    return (
                        <div
                            key={idx}
                            onContextMenu={(e) => handleDayInteraction(day, false, e)}
                            onClick={(e) => handleDayInteraction(day, true, e)}
                            className={cn(
                                "group relative h-14 md:h-20 border border-zinc-100/50 dark:border-zinc-800/30 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-sm",
                                !inCurrentMonth && "opacity-20 pointer-events-none",
                                isToday(day) && "ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-2 ring-offset-white/80 dark:ring-offset-zinc-900/80 shadow-sm"
                            )}
                        >
                            <span className="absolute top-1.5 left-2 text-[10px] font-bold text-zinc-300 dark:text-zinc-700">
                                {format(day, 'd')}
                            </span>

                            {activeLayer === 'performance' ? (
                                <>
                                    {status === 'check' && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -20 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            className="text-green-500 dark:text-green-400"
                                        >
                                            <Check size={28} strokeWidth={3} />
                                        </motion.div>
                                    )}

                                    {status === 'x' && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: 20 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            className="text-red-500 dark:text-red-400"
                                        >
                                            <X size={28} strokeWidth={3} />
                                        </motion.div>
                                    )}
                                </>
                            ) : (
                                status && <MoodIcon level={status as string} />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Helper text */}
            <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                <div className="flex items-center gap-2">
                    {activeLayer === 'performance' ? (
                        <>
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 border border-white dark:border-zinc-900" />
                            <span>Click: Check / X</span>
                        </>
                    ) : (
                        <>
                            <div className="flex -space-x-1">
                                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                <div className="w-2 h-2 rounded-full bg-white border border-zinc-200" />
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                            </div>
                            <span>Click: Cambiar Emoción</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-1 border border-zinc-300 dark:border-zinc-700 rounded">Derecho</span>
                    <span>Eliminar</span>
                </div>
            </div>
        </div >
    )
}
