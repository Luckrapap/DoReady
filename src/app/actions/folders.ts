'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getFolders() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('No autenticado')
    }

    const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching folders:', error)
        return []
    }

    return data
}

export async function createFolder(name: string, emoji: string | null = null, parentId: string | null = null) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('No autenticado')
    }

    const { data, error } = await supabase
        .from('folders')
        .insert([
            { name, emoji, user_id: user.id, parent_id: parentId }
        ])
        .select()

    if (error) {
        console.error('Error creating folder:', error)
        return null
    }

    revalidatePath('/brain-dump')
    return data[0]
}

export async function updateFolder(id: string, name: string, emoji: string | null = null) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('No autenticado')
    }

    const { error } = await supabase
        .from('folders')
        .update({ name, emoji })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating folder:', error)
        return false
    }

    revalidatePath('/brain-dump')
    return true
}

export async function deleteFolder(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('No autenticado')
    }

    const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting folder:', error)
        return false
    }

    revalidatePath('/brain-dump')
    return true
}
