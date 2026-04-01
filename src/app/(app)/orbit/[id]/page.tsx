import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import OrbitChart from '@/components/OrbitChart'
import { ChevronLeft } from 'lucide-react'

interface OrbitPageProps {
    params: Promise<{ id: string }>
}

export default async function OrbitPage({ params }: OrbitPageProps) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/login')
    }

    const { id } = await params

    // Fetch habit details to make sure it exists and belongs to user
    const { data: habit, error } = await supabase
        .from('habits')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !habit) {
        redirect('/habits')
    }

    return (
        <main
            className="min-h-screen flex justify-center py-6 sm:py-12 px-2 sm:px-4 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-500"
            style={{ backgroundColor: 'var(--background)' }}
        >
            <div className="w-full max-w-5xl">
                {/* Header (Same layout as Habits) */}
                <header className="mb-12 sm:mb-20 flex flex-col items-center justify-center text-center gap-4 relative w-full pt-16 md:pt-0">
                    <Link
                        href="/habits"
                        className="absolute left-2 top-0 md:top-14 inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-medium text-sm"
                    >
                        <ChevronLeft size={20} />
                        Back to Habits
                    </Link>

                    <h1 className="font-playfair font-medium text-6xl md:text-8xl tracking-tight text-zinc-900 dark:text-zinc-50 py-2">
                        Orbit
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">
                        {habit.title}
                    </p>
                </header>

                {/* Content area */}
                <div className="flex-1 flex flex-col items-center justify-center w-full px-0">
                    <OrbitChart />
                </div>
            </div>
        </main>
    )
}
