'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string
    const gender = formData.get('gender') as string
    const birthDate = formData.get('birth_date') as string

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError) {
        redirect(`/login?type=register&error=${encodeURIComponent(authError.message)}`)
    }

    if (authData.user) {
        // Update the profile with the extra info
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: authData.user.id,
                full_name: fullName,
                gender,
                birth_date: birthDate,
                updated_at: new Date().toISOString()
            })

        if (profileError) {
            console.error('Error creating profile details:', profileError)
            // We don't necessarily want to block the whole signup if just the profile metadata fails,
            // but for DoReady's "Radical Focus", we want integrated data.
        }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
