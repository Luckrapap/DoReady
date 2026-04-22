import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getHabits } from '@/app/actions/habits'
import HabitsPageClient from '@/components/HabitsPageClient'

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

    return (
        <HabitsPageClient 
            initialHabits={habits} 
            dateStr={activeDateStr} 
            isToday={isToday} 
        />
    )
}
