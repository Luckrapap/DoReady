import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CalendarGrid from '@/components/CalendarGrid'
import { getMonthTaskCounts } from '@/app/actions/tasks'
import { MountainSnow, LogOut } from 'lucide-react'

export default async function CalendarPage() {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
        redirect('/login')
    }

    // We could get counts for multiple months, but for simplicity let's fetch a wide range
    // or rely on a generic function that fetches the current and next/prev months
    const taskCounts = await getMonthTaskCounts()

    return (
        <main className="min-h-screen py-4 px-4 flex items-center justify-center selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
            <div className="w-full max-w-xl">
                <header className="mb-6 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-1">
                        Calendar
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Review your plan</p>
                </header>

                <section>
                    <CalendarGrid taskCounts={taskCounts} />
                </section>
            </div>
        </main>
    )
}
