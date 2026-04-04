'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type CheckDayLayer = 'performance' | 'mood'
export type CheckDayStatus = 'check' | 'x' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | null

export interface CheckDayRecord {
    status: CheckDayStatus
    color?: string
    notes?: string
}

export async function getCheckDays(year: number, month: number, layer: CheckDayLayer = 'performance') {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user) {
        console.error('Auth check failed in getCheckDays:', authError)
        throw new Error(authError ? `Auth Error: ${authError.message}` : 'Not authenticated')
    }

    // Fetch with a buffer to handle weeks spanning multiple months
    const startDate = new Date(year, month - 1, -7).toISOString().split('T')[0]
    const endDate = new Date(year, month, 7).toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('check_days')
        .select('date, status, color, notes')
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

    const checkMap: Record<string, CheckDayRecord> = {}
    data.forEach(item => {
        checkMap[item.date] = { 
            status: item.status as CheckDayStatus,
            color: item.color || undefined,
            notes: item.notes || undefined
        }
    })

    return checkMap
}

export async function toggleCheckDay(dateStr: string, status: CheckDayStatus, color?: string, notes?: string, layer: CheckDayLayer = 'performance') {
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
                    color: color,
                    notes: notes,
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
