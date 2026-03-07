'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

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

    const headersList = await (await import('next/headers')).headers()
    const origin = headersList.get('origin')
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback?next=/login/confirmed`,
            data: {
                full_name: fullName,
                gender: gender,
                birth_date: birthDate,
            },
        },
    })

    if (authError) {
        let errorMessage = authError.message
        if (errorMessage.includes('email rate limit exceeded')) {
            errorMessage = 'Has intentado registrarte demasiadas veces seguidas. Por favor, espera unos minutos antes de intentar de nuevo.'
        }
        return redirect(`/login?type=register&error=${encodeURIComponent(errorMessage)}`)
    }

    // Check if user is created but confirmation is required
    if (authData.user && authData.session === null) {
        return redirect('/login/verify')
    }

    if (authData.user) {
        // Use admin client to bypass RLS as there might not be a session yet (awaiting email confirmation)
        const adminClient = createAdminClient()
        const { error: profileError } = await adminClient
            .from('profiles')
            .upsert({
                id: authData.user.id,
                full_name: fullName,
                gender,
                birth_date: birthDate,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })

        if (profileError) {
            console.error('Error creating profile details:', profileError)
            // If it's a critical error (like table not extended yet), we might want to know
            if (profileError.code !== '23505') { // Ignore unique violation if trigger already ran
                return redirect(`/login?type=register&error=${encodeURIComponent('Se creó la cuenta pero hubo un error al guardar tu perfil: ' + profileError.message)}`)
            }
        }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function deleteAccount() {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: 'No se pudo encontrar el usuario.' }
    }

    const adminClient = createAdminClient()

    // This will delete the user from auth.users AND cascade delete the profile/tasks due to FK constraints
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

    if (deleteError) {
        console.error('Error deleting user:', deleteError)
        return { error: 'Error al eliminar la cuenta del sistema.' }
    }

    // Sign out to clear cookies
    await supabase.auth.signOut()

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signInAsGuest() {
    console.log('--- GUEST LOGIN ACTION CALLED ---')
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInAnonymously()

    if (error) {
        console.error('Guest sign in error:', error)
        redirect(`/login?error=${encodeURIComponent(error.message)}`)
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
    redirect('/today')
}
