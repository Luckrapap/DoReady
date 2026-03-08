'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getHabits(dateStr: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    // Get all habits for the user
    const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

    if (habitsError) {
        console.error('Error fetching habits:', habitsError)
        return []
    }

    // Get habit logs for the specific date
    const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('habit_id')
        .eq('user_id', user.id)
        .eq('date', dateStr)

    if (logsError) {
        console.error('Error fetching habit logs:', logsError)
        return habits.map(h => ({ ...h, is_completed: false }))
    }

    const completedHabitIds = new Set(logs.map(log => log.habit_id))

    // Map completed status to habits
    return habits.map(habit => ({
        ...habit,
        is_completed: completedHabitIds.has(habit.id)
    }))
}

export async function createHabit(title: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
        .from('habits')
        .insert([
            { title, user_id: user.id }
        ])
        .select()

    if (error) {
        console.error('Error creating habit:', error)
        return null
    }

    revalidatePath('/habits')
    return data[0]
}

export async function deleteHabit(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting habit:', error)
        return false
    }

    revalidatePath('/habits')
    return true
}

export async function toggleHabitLog(habitId: string, dateStr: string, isCompleted: boolean) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    if (isCompleted) {
        // Insert log
        const { error } = await supabase
            .from('habit_logs')
            .insert({
                habit_id: habitId,
                user_id: user.id,
                date: dateStr
            })

        if (error && error.code !== '23505') { // 23505 is the PostgreSQL error code for unique_violation
            console.error('Error logging habit completion:', error)
            return false
        }
    } else {
        // Delete log
        const { error } = await supabase
            .from('habit_logs')
            .delete()
            .eq('habit_id', habitId)
            .eq('user_id', user.id)
            .eq('date', dateStr)

        if (error) {
            console.error('Error removing habit completion log:', error)
            return false
        }
    }

    revalidatePath('/habits')
    return true
}
