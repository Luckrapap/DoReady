'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type CheckDayLayer = 'performance' | 'mood'
export type CheckDayStatus = 'check' | 'x' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | null

export async function getCheckDays(year: number, month: number, layer: CheckDayLayer = 'performance') {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user) {
        console.error('Auth check failed in getCheckDays:', authError)
        throw new Error(authError ? `Auth Error: ${authError.message}` : 'Not authenticated')
    }

    // Format start and end of month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    const { data, error } = await supabase
        .from('check_days')
        .select('date, status')
        .eq('user_id', user.id)
        .eq('layer_type', layer)
        .gte('date', startDate)
        .lte('date', endDate)

    if (error) {
        console.error('Error fetching check days:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        })
        return {}
    }

    const checkMap: Record<string, CheckDayStatus> = {}
    data.forEach(item => {
        checkMap[item.date] = item.status as CheckDayStatus
    })

    return checkMap
}

export async function toggleCheckDay(dateStr: string, status: CheckDayStatus, layer: CheckDayLayer = 'performance') {
    const supabase = await createClient()

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (!user) {
            console.error('Auth check failed in toggleCheckDay:', authError)
            return {
                success: false,
                error: authError ? `Auth Error: ${authError.message}` : 'Not authenticated'
            }
        }

        if (status === null) {
            const { error } = await supabase
                .from('check_days')
                .delete()
                .eq('user_id', user.id)
                .eq('date', dateStr)
                .eq('layer_type', layer)

            if (error) throw error
        } else {
            const { error } = await supabase
                .from('check_days')
                .upsert({
                    user_id: user.id,
                    date: dateStr,
                    status: status,
                    layer_type: layer
                }, {
                    onConflict: 'user_id, date, layer_type'
                })

            if (error) throw error
        }

        revalidatePath('/check-day')
        return { success: true }
    } catch (error: any) {
        console.error('Error in toggleCheckDay:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        })
        return { success: false, error: error.message || 'Unknown error' }
    }
}
