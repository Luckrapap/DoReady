import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    console.log('--- API GUEST LOGIN CALLED ---')
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInAnonymously()

    if (error) {
        console.error('--- SUPABASE ERROR ---', error)
        const projectRef = 'scehxjtcfejrzedebnfq'
        const errorMessage = error.message.includes('not enabled') || error.message.includes('disabled')
            ? `El modo Invitado no está habilitado en el proyecto [${projectRef}]. Ve a Auth > Sign In / Providers > Anonymous, actívalo y dale a SAVE CHANGES.`
            : error.message

        // Use relative redirect to avoid port issues
        const targetUrl = new URL('/login', request.url)
        targetUrl.searchParams.set('error', errorMessage)
        return NextResponse.redirect(targetUrl)
    }

    if (data.user) {
        // Create/Update guest profile
        await supabase
            .from('profiles')
            .upsert({
                id: data.user.id,
                full_name: 'Guest',
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })
    }

    revalidatePath('/', 'layout')

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/today', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
}
