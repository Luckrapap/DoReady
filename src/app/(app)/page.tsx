import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTasks } from '@/app/actions/tasks'
import TasksContainer from '@/components/TasksContainer'

// Helper robusto para obtener la fecha de hoy forzando la zona horaria de Perú
function getTodayDateStr() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  return formatter.format(new Date())
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

  const tasks = await getTasks(activeDateStr)

  // Parse the active date string (YYYY-MM-DD) for display
  // Using UTC to avoid timezone shifts when parsing YYYY-MM-DD strings
  const [year, month, day] = activeDateStr.split('-').map(Number)
  const dateObj = new Date(Date.UTC(year, month - 1, day))

  const displayDate = dateObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC' // Force UTC so it displays exactly the date we parsed
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
            dateStr={activeDateStr} 
            title={isToday ? "Hoy" : "Enfoque Diario"}
            displayDate={displayDate}
          />
        </section>
      </div>
    </main>
  )
}
