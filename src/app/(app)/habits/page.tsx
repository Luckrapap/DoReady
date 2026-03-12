import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getHabits } from '@/app/actions/habits'
import HabitsHeader from '@/components/HabitsHeader'
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
  const completedCount = habits.filter(h => h.is_completed).length
  const totalCount = habits.length

  return (
    <main
      className="min-h-screen flex justify-center py-12 px-4 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-500"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="w-full max-w-xl">
        <HabitsHeader 
            isToday={isToday} 
            completedCount={completedCount} 
            totalCount={totalCount} 
        />

        <HabitsContainer initialHabits={habits} dateStr={activeDateStr} />
      </div>
    </main>
  )
}
