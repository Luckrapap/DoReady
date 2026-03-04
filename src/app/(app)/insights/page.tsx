import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getUserAnalyticsData } from '@/app/actions/insights'
import InsightsDashboard from '@/components/InsightsDashboard'

export default async function InsightsPage() {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
        redirect('/login')
    }

    const analyticsData = await getUserAnalyticsData()

    return (
        <main className="min-h-screen py-6 px-4 flex justify-center selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black relative">
            <div className="w-full max-w-3xl mt-12 md:mt-20 mb-24">
                <InsightsDashboard analyticsData={analyticsData} />
            </div>
        </main>
    )
}
