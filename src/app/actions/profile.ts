'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return null
    }

    // Smart Sync: If profile exists but full_name is missing, try to sync from auth metadata
    if (data && !data.full_name && user.user_metadata?.full_name) {
        const { error: syncError } = await supabase
            .from('profiles')
            .update({ full_name: user.user_metadata.full_name })
            .eq('id', user.id)

        if (!syncError) {
            data.full_name = user.user_metadata.full_name
        }
    }

    return data
}

export async function updateProfile(data: { full_name?: string, gender?: string, birth_date?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Usuario no autenticado')

    // Guest protection
    if (user.is_anonymous) {
        return { success: false, error: 'Los invitados no pueden modificar su perfil. Crea una cuenta para personalizar tu experiencia.' }
    }

    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            ...data,
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error('Error updating profile:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/profile')
    return { success: true }
}

export async function updateProfileName(fullName: string) {
    return updateProfile({ full_name: fullName })
}

export async function updateAvatarUrl(avatarUrl: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Usuario no autenticado')

    // Guest protection
    if (user.is_anonymous) {
        return { success: false, error: 'Los invitados no pueden modificar su foto. Crea una cuenta para personalizar tu experiencia.' }
    }

    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error('Error updating avatar:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/profile')
    return { success: true }
}
