import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTasks, getCurrentStreak } from '@/app/actions/tasks'
import TasksContainer from '@/components/TasksContainer'
import StreakCounter from '@/components/StreakCounter'

// Basic helper to get today's date in YYYY-MM-DD format based on local server time
function getTodayDateStr() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default async function Home({
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

  // Use date from URL or default to today
  const activeDateStr = typeof date === 'string' ? date : getTodayDateStr()
  const isToday = activeDateStr === getTodayDateStr()

  const [tasks, streak] = await Promise.all([
    getTasks(activeDateStr),
    getCurrentStreak()
  ])

  // Parse the active date string (YYYY-MM-DD) for display
  // Using UTC to avoid timezone shifts when parsing YYYY-MM-DD strings
  const [year, month, day] = activeDateStr.split('-').map(Number)
  const dateObj = new Date(Date.UTC(year, month - 1, day))

  const displayDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC' // Force UTC so it displays exactly the date we parsed
  })

  return (
    <main
      className="min-h-screen flex justify-center py-12 px-4 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-500"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="w-full max-w-xl">
        {/* Header (Simplified compared to Sprint 2 since Sidebar exists) */}
        <header className="mb-12 flex items-start justify-between">
          <div>
            <h1 className="font-bold text-2xl tracking-tight text-zinc-900 dark:text-zinc-50">
              {isToday ? "Today" : "Daily Focus"}
            </h1>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">{displayDate}</p>
          </div>
          <StreakCounter streak={streak} />
        </header>

        <TasksContainer initialTasks={tasks} dateStr={activeDateStr} />
      </div>
    </main>
  )
}
