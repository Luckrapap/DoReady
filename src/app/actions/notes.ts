'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getNotes() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('No autenticado')
    }

    const { data, error } = await supabase
        .from('brain_dump')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching notes:', error)
        return []
    }

    return data
}

export async function createNote(title: string, content: string, emoji: string | null = null) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('No autenticado')
    }

    const { data, error } = await supabase
        .from('brain_dump')
        .insert([
            { title, content, emoji, user_id: user.id }
        ])
        .select()

    if (error) {
        console.error('Error creating note:', error)
        return null
    }

    revalidatePath('/brain-dump')
    return data[0]
}

export async function updateNote(id: string, title: string, content: string, emoji: string | null = null) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('No autenticado')
    }

    const { error } = await supabase
        .from('brain_dump')
        .update({ title, content, emoji })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating note:', error)
        return false
    }

    revalidatePath('/brain-dump')
    return true
}

export async function deleteNote(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('No autenticado')
    }

    const { error } = await supabase
        .from('brain_dump')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting note:', error)
        return false
    }

    revalidatePath('/brain-dump')
    return true
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

    // We use a trick: update created_at to preserve order based on current "descending" sort
    // The first item in the list will have the "newest" timestamp
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
