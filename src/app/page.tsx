import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LandingContent from '@/components/LandingContent'

export default async function LandingPage() {
    const supabase = await createClient()

    // Check session
    const { data: { user } } = await supabase.auth.getUser()

    // If already logged in, regular users go to dashboard
    if (user && !user.is_anonymous) {
        redirect('/today')
    }

    return <LandingContent />
}
