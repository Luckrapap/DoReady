'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getNotes() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('No autenticado')
    }

    // Buscamos notas que NO estén en la papelera (false o null)
    const { data, error } = await supabase
        .from('brain_dump')
        .select('*')
        .eq('user_id', user.id)
        .or('is_trash.eq.false,is_trash.is.null')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching notes:', error)
        return []
    }

    return data
}

export async function createNote(title: string, content: string, emoji: string | null = null, folderId: string | null = null) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('No autenticado')
    }

    const { data, error } = await supabase
        .from('brain_dump')
        .insert([
            { title, content, emoji, user_id: user.id, folder_id: folderId }
        ])
        .select()

    if (error) {
        console.error('Error creating note:', error)
        return null
    }

    revalidatePath('/brain-dump')
    return data[0]
}

export async function updateNote(id: string, title: string, content: string, emoji: string | null = null, folderId: string | null = null) {
    console.log('📝 Intentando actualizar nota:', { id, title, content, folderId });
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.error('❌ Error: Usuario no autenticado');
        return false
    }

    const { error } = await supabase
        .from('brain_dump')
        .update({ title, content, emoji, folder_id: folderId, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('❌ Error de Supabase al actualizar:', error)
        return false
    }

    console.log('✅ Nota actualizada correctamente en DB');
    revalidatePath('/brain-dump')
    return true
}

export async function moveNotes(ids: string[], folderId: string | null) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('No autenticado')
    }

    const now = new Date().toISOString()
    const { error } = await supabase
        .from('brain_dump')
        .update({ folder_id: folderId, updated_at: now, created_at: now })
        .in('id', ids)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error moving notes:', error)
        return false
    }

    revalidatePath('/brain-dump')
    return true
}

export async function deleteNote(id: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'No autenticado' }

        const { error } = await supabase
            .from('brain_dump')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw error
        
        revalidatePath('/brain-dump')
        return { success: true }
    } catch (error) {
        console.error('Error deleting note:', error)
        return { success: false, error: 'Error en el servidor' }
    }
}

export async function swapNotePositions(id1: string, id2: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // Fetch both to get their created_at
    const { data, error } = await supabase
        .from('brain_dump')
        .select('id, created_at')
        .in('id', [id1, id2])
        .eq('user_id', user.id)

    if (error || !data || data.length !== 2) return false

    const [nA, nB] = data

    // Swap created_at
    await Promise.all([
        supabase.from('brain_dump').update({ created_at: nB.created_at }).eq('id', nA.id),
        supabase.from('brain_dump').update({ created_at: nA.created_at }).eq('id', nB.id)
    ])

    revalidatePath('/brain-dump')
    return true
}

export async function saveNotesOrder(orderedNotes: any[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const now = new Date()
    
    const updates = orderedNotes.map((note, index) => {
        const timestamp = new Date(now.getTime() - index * 1000).toISOString()
        return supabase
            .from('brain_dump')
            .update({ created_at: timestamp })
            .eq('id', note.id)
            .eq('user_id', user.id)
    })

    await Promise.all(updates)
    
    revalidatePath('/brain-dump')
    return true
}

export async function moveToTrash(ids: string[]) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'No autenticado' }

        const { error } = await supabase
            .from('brain_dump')
            .update({ is_trash: true })
            .in('id', ids)
            .eq('user_id', user.id)

        if (error) throw error

        revalidatePath('/brain-dump')
        return { success: true }
    } catch (error) {
        console.error('Error moving notes to trash:', error)
        return { success: false, error: 'Error en el servidor' }
    }
}

export async function getTrashNotes() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('brain_dump')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_trash', true)
        .order('created_at', { ascending: false })

    if (error || !data) {
        console.error('Error fetching trash notes:', error)
        return []
    }
    return data
}

export async function restoreNotes(ids: string[]) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'No autenticado' }

        const { error } = await supabase
            .from('brain_dump')
            .update({ is_trash: false })
            .in('id', ids)
            .eq('user_id', user.id)

        if (error) throw error
        
        revalidatePath('/brain-dump')
        return { success: true }
    } catch (error) {
        console.error('Error restoring notes:', error)
        return { success: false, error: 'Error en el servidor' }
    }
}

export async function saveCombinedOrder(items: {id: string, type: 'note'|'folder'}[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const now = new Date()
    const updates = items.map((item, index) => {
        const timestamp = new Date(now.getTime() - index * 1000).toISOString()
        const table = item.type === 'note' ? 'brain_dump' : 'folders'
        return supabase
            .from(table)
            .update({ created_at: timestamp })
            .eq('id', item.id)
            .eq('user_id', user.id)
    })

    await Promise.all(updates)
    revalidatePath('/brain-dump')
    return true
}
