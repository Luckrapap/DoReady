import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CalendarGrid from '@/components/CalendarGrid'
import TasksContainer from '@/components/TasksContainer'
import StreakCounter from '@/components/StreakCounter'
import { getMonthTaskCounts, getTasks, getCurrentStreak } from '@/app/actions/tasks'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

function getTodayDateStr() {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export default async function CalendarPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
        redirect('/login')
    }

    const { date } = await searchParams
    const selectedDateStr = typeof date === 'string' ? date : null

    // If a date is selected, we show the Agenda for that day
    if (selectedDateStr) {
        const [tasks, streak] = await Promise.all([
            getTasks(selectedDateStr),
            getCurrentStreak()
        ])

        const [year, month, day] = selectedDateStr.split('-').map(Number)
        const dateObj = new Date(Date.UTC(year, month - 1, day))
        const displayDate = dateObj.toLocaleDateString('es-ES', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        })

        return (
            <main className="min-h-screen flex justify-center pt-16 pb-12 px-4 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black overflow-x-hidden">
                <div className="w-full max-w-xl mx-auto space-y-12">
                    <TasksContainer 
                        initialTasks={tasks} 
                        dateStr={selectedDateStr} 
                        title="Agenda" 
                        displayDate={displayDate} 
                    />

                    <div className="mt-12 flex justify-center pb-8">
                        <StreakCounter streak={streak} />
                    </div>
                </div>
            </main>
        )
    }

    // Default: Show the Calendar Grid
    const taskCounts = await getMonthTaskCounts()

    return (
        <main className="h-[100dvh] flex justify-center pt-16 pb-12 px-4 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black overflow-hidden relative">
            <div className="w-full max-w-xl h-full flex flex-col">
                <section className="flex flex-col h-full">
                    <header className="flex flex-col gap-1 px-4 flex-shrink-0">
                        <div className="flex items-end justify-center">
                            {/* Left phanton box for horizontal balance - ZERO WIDTH */}
                            <div className="opacity-0 w-0 overflow-hidden pointer-events-none bg-zinc-200 dark:bg-zinc-800 rounded-full py-2.5 mt-2 mb-1 flex items-center justify-center">
                                <span className="text-4xl md:text-5xl font-light">0/0</span>
                            </div>
                            <h1 className="font-bold text-6xl md:text-8xl tracking-tighter text-zinc-900 dark:text-zinc-50 relative bottom-1.5 whitespace-nowrap">
                                Calendario
                            </h1>
                            {/* Right phanton box for horizontal balance and height match - ZERO WIDTH */}
                            <div className="opacity-0 w-0 overflow-hidden pointer-events-none bg-zinc-200 dark:bg-zinc-800 rounded-full py-2.5 mt-2 mb-1 flex items-center justify-center">
                                <span className="text-4xl md:text-5xl font-light">0/0</span>
                            </div>
                        </div>
                        {/* Placeholder for date line to match header height */}
                        <p className="text-base font-medium text-transparent select-none">Agenda</p>
                    </header>
                    <section className="-mt-10 flex-1 flex flex-col items-center justify-center">
                        <CalendarGrid taskCounts={taskCounts} />
                    </section>
                </section>
            </div>
        </main>
    )
}
