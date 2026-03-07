'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface BrainDumpIdea {
    id: string
    content: string
    created_at: string
}

export async function getIdeas() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('brain_dump')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching ideas:', JSON.stringify(error, null, 2))
        return []
    }

    return data as BrainDumpIdea[]
}

export async function addIdea(content: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('brain_dump')
        .insert([{ user_id: user.id, content }])
        .select()

    if (error) {
        console.error('Error adding idea:', JSON.stringify(error, null, 2))
        throw error
    }

    revalidatePath('/brain-dump')
    revalidatePath('/')
    return data[0] as BrainDumpIdea
}

export async function deleteIdea(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('brain_dump')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting idea:', JSON.stringify(error, null, 2))
        throw error
    }

    revalidatePath('/brain-dump')
    revalidatePath('/')
}
