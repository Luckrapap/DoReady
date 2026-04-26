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
        .or('is_trash.eq.false,is_trash.is.null')
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

    if (error || !data || data.length === 0) {
        console.error('Error creating folder:', error || 'No data returned')
        return null
    }

    return data[0] as Folder
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
export async function moveFoldersToTrash(ids: string[]) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'No autenticado' }

        const { error } = await supabase
            .from('folders')
            .update({ is_trash: true })
            .in('id', ids)
            .eq('user_id', user.id)

        if (error) throw error

        revalidatePath('/brain-dump')
        return { success: true }
    } catch (error) {
        console.error('Error moving folders to trash:', error)
        return { success: false, error: 'Error en el servidor' }
    }
}

export async function getTrashFolders() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_trash', true)
        .order('created_at', { ascending: false })

    if (error) return []
    return data
}
export async function restoreFolders(ids: string[]) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'No autenticado' }

        const { error } = await supabase
            .from('folders')
            .update({ is_trash: false })
            .in('id', ids)
            .eq('user_id', user.id)

        if (error) throw error
        revalidatePath('/brain-dump')
        return { success: true }
    } catch (error) {
        console.error('Error restoring folders:', error)
        return { success: false, error: 'Error en el servidor' }
    }
}

export async function saveFoldersOrder(orderedFolders: any[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const now = new Date()
    
    const updates = orderedFolders.map((folder, index) => {
        const timestamp = new Date(now.getTime() - index * 1000).toISOString()
        return supabase
            .from('folders')
            .update({ created_at: timestamp })
            .eq('id', folder.id)
            .eq('user_id', user.id)
    })

    await Promise.all(updates)
    
    revalidatePath('/brain-dump')
    return true
}
