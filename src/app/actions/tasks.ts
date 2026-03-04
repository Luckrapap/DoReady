'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTasks(dateStr: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
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
        throw new Error('Not authenticated')
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

export async function getCurrentStreak() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    // Fetch unique dates where tasks were completed
    const { data, error } = await supabase
        .from('tasks')
        .select('date')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('date', { ascending: false })

    if (error) {
        console.error('Error fetching streak data:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        })
        return 0
    }
    if (!data || data.length === 0) return 0

    // Deduplicate dates
    const uniqueDates = Array.from(new Set(data.map(t => t.date)))

    let streak = 0

    // Calculate today's date in YYYY-MM-DD using UTC to avoid timezone issues
    const d = new Date()
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    const dYes = new Date()
    dYes.setDate(dYes.getDate() - 1)
    const yesterdayStr = `${dYes.getFullYear()}-${String(dYes.getMonth() + 1).padStart(2, '0')}-${String(dYes.getDate()).padStart(2, '0')}`

    // If the most recent completed task is not today or yesterday, streak is broken
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
        return 0
    }

    // Calculate consecutive days
    let currentDateObj = new Date(uniqueDates[0])

    for (let i = 0; i < uniqueDates.length; i++) {
        const loopDateStr = uniqueDates[i]

        // Check if loopDateStr matches expected current date down the streak
        const expectedDateStr = `${currentDateObj.getFullYear()}-${String(currentDateObj.getMonth() + 1).padStart(2, '0')}-${String(currentDateObj.getDate()).padStart(2, '0')}`

        if (loopDateStr === expectedDateStr) {
            streak++
            // Move backwards 1 day
            currentDateObj.setDate(currentDateObj.getDate() - 1)
        } else {
            break // Streak broken
        }
    }

    return streak
}

export async function createTask(title: string, dateStr: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
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
