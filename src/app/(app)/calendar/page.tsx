import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CalendarGrid from '@/components/CalendarGrid'
import TasksContainer from '@/components/TasksContainer'
import { getMonthTaskCounts, getTasks } from '@/app/actions/tasks'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

function getTodayDateStr() {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Lima',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
    return formatter.format(new Date())
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
        const tasks = await getTasks(selectedDateStr)

        const [year, month, day] = selectedDateStr.split('-').map(Number)
        const dateObj = new Date(Date.UTC(year, month - 1, day))
        const displayDate = dateObj.toLocaleDateString('es-ES', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        })

        return (
            <main
                className="h-[100dvh] flex justify-center pt-safe-top pb-12 px-1 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black overflow-hidden font-outfit transition-colors duration-500"
                style={{ backgroundColor: 'var(--background)' }}
            >
                <div className="w-full max-w-xl h-full flex flex-col pt-8">
                    <section className="flex flex-col h-full min-h-0">
                        <TasksContainer 
                            initialTasks={tasks} 
                            dateStr={selectedDateStr} 
                            title="Agenda" 
                            displayDate={displayDate} 
                        />
                    </section>
                </div>
            </main>
        )
    }

    // Default: Show the Calendar Grid
    const taskCounts = await getMonthTaskCounts()

    return (
        <main className="h-[100dvh] flex justify-center pt-safe-top pb-12 px-4 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black overflow-hidden relative touch-none overscroll-none">
            <div className="w-full max-w-xl h-full flex flex-col pt-8">
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
                    <section className="-mt-20 md:-mt-14 flex-1 flex flex-col items-center justify-center">
                        <CalendarGrid taskCounts={taskCounts} />
                    </section>
                </section>
            </div>
        </main>
    )
}
