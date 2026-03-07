'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton({ isRegistering }: { isRegistering: boolean }) {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full mt-4 py-3.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:backdrop-blur-sm disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {pending && (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black animate-spin" />
            )}
            {pending ? (isRegistering ? 'Creando cuenta...' : 'Iniciando sesión...') : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')}
        </button>
    )
}
