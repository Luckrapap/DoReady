import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getHabits } from '@/app/actions/habits'
import HabitsContainer from '@/components/HabitsContainer'

// Helper to get today's date in YYYY-MM-DD
function getTodayDateStr() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default async function HabitsPage({
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

  const habits = await getHabits(activeDateStr)

  // Parse the active date string (YYYY-MM-DD) for display
  const [year, month, day] = activeDateStr.split('-').map(Number)
  const dateObj = new Date(Date.UTC(year, month - 1, day))

  const displayDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  })

  return (
    <main
      className="min-h-screen flex justify-center py-12 px-4 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-500"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="w-full max-w-xl">
        <header className="mb-12 flex items-start justify-between">
          <div>
            <h1 className="font-bold text-2xl tracking-tight text-zinc-900 dark:text-zinc-50">
              {isToday ? "Daily Habits" : "Habits History"}
            </h1>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">{displayDate}</p>
          </div>
          <div className="h-10 px-4 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-md" style={{ backgroundColor: 'var(--accent)' }}>
            {habits.filter(h => h.is_completed).length} / {habits.length}
          </div>
        </header>

        <HabitsContainer initialHabits={habits} dateStr={activeDateStr} />
      </div>
    </main>
  )
}
