'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTasks(dateStr: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('No autenticado')
    }

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching tasks:', JSON.stringify(error, null, 2))
        return []
    }

    console.log(`Successfully fetched ${data.length} tasks for ${dateStr}`)
    return data
}

export async function getMonthTaskCounts() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('No autenticado')
    }

    // Fetch all incomplete tasks or you could group by in SQL. 
    // For MVP: Fetch all tasks and reduce in JS. 
    // For production: Create an RPC or use Supabase Count
    const { data, error } = await supabase
        .from('tasks')
        .select('date')
        .eq('user_id', user.id)

    if (error) {
        console.error('Error fetching task counts:', error)
        return {}
    }

    const counts: Record<string, number> = {}
    data.forEach(task => {
        counts[task.date] = (counts[task.date] || 0) + 1
    })

    return counts
}


export async function createTask(title: string, dateStr: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('No autenticado')
    }

    const { data, error } = await supabase
        .from('tasks')
        .insert([
            { title, user_id: user.id, date: dateStr }
        ])
        .select()

    if (error) {
        console.error('Error creating task:', error)
        return null
    }

    revalidatePath('/')
    return data[0]
}

export async function updateTaskTitle(id: string, title: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const { error } = await supabase
        .from('tasks')
        .update({ title })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating task title:', error)
        return false
    }

    revalidatePath('/')
    return true
}

export async function swapTaskPositions(id1: string, id2: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // Bring both tasks to get their created_at
    const { data, error } = await supabase
        .from('tasks')
        .select('id, created_at')
        .in('id', [id1, id2])
        .eq('user_id', user.id)

    if (error || !data || data.length !== 2) {
        return false
    }

    const [tA, tB] = data

    // Execute swap independently
    await Promise.all([
        supabase.from('tasks').update({ created_at: tB.created_at }).eq('id', tA.id),
        supabase.from('tasks').update({ created_at: tA.created_at }).eq('id', tB.id)
    ])

    revalidatePath('/')
    return true
}

export async function updateTaskStatus(id: string, is_completed: boolean) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const { error } = await supabase
        .from('tasks')
        .update({ is_completed })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating task:', error)
        return false
    }

    revalidatePath('/')
    return true
}

export async function deleteTask(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting task:', error)
        return false
    }

    revalidatePath('/')
    return true
}
