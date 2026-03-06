'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function changePassword(formData: FormData) {
    const supabase = await createClient()

    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!newPassword || newPassword.length < 6) {
        return { error: 'La contraseña debe tener al menos 6 caracteres.' }
    }

    if (newPassword !== confirmPassword) {
        return { error: 'Las contraseñas no coinciden.' }
    }

    const { error } = await supabase.auth.updateUser({
        password: newPassword
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/settings/security')
    return { success: true }
}
