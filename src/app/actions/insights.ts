'use server'

import { createClient } from '@/utils/supabase/server'

export interface DayInsightData {
    performance: string | null;
    mood: string | null;
    tasksCompleted: number;
}

export type InsightsPayload = Record<string, DayInsightData>;

export async function getUserAnalyticsData(): Promise<InsightsPayload> {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    // Fetch Tasks
    const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('date, is_completed')
        .eq('user_id', user.id)
        .eq('is_completed', true)

    // Fetch CheckDay records
    const { data: checkData, error: checkError } = await supabase
        .from('check_days')
        .select('date, layer_type, status')
        .eq('user_id', user.id)

    if (tasksError || checkError) {
        console.error('Error fetching analytics data')
        return {}
    }

    const payload: InsightsPayload = {}

    // Process check days
    if (checkData) {
        checkData.forEach(item => {
            if (!payload[item.date]) {
                payload[item.date] = { performance: null, mood: null, tasksCompleted: 0 }
            }
            if (item.layer_type === 'performance') {
                payload[item.date].performance = item.status
            } else if (item.layer_type === 'mood') {
                payload[item.date].mood = item.status
            }
        })
    }

    // Process tasks
    if (tasksData) {
        tasksData.forEach(task => {
            if (!payload[task.date]) {
                payload[task.date] = { performance: null, mood: null, tasksCompleted: 0 }
            }
            if (task.is_completed) {
                payload[task.date].tasksCompleted += 1
            }
        })
    }

    return payload
}
