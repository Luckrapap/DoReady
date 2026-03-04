import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getIdeas } from '@/app/actions/braindump'
import BrainDump from '@/components/BrainDump'

export default async function BrainDumpPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const ideas = await getIdeas()

    return (
        <main className="min-h-screen pb-20 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
            <BrainDump initialIdeas={ideas} />
        </main>
    )
}
