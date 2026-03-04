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

    return data
}

export async function updateProfile(data: { full_name?: string, gender?: string, birth_date?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('No authenticated user')

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

    if (!user) throw new Error('No authenticated user')

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
