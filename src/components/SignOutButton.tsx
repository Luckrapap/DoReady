'use client'

import { LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function SignOutButton() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSignOut = async () => {
        setIsLoading(true)
        try {
            await fetch('/auth/signout', {
                method: 'POST',
            })
            window.location.href = '/login'
        } catch (error) {
            console.error('Error signing out:', error)
            setIsLoading(false)
        }
    }

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-900 dark:text-zinc-50 hover:text-red-600 dark:hover:text-red-400 rounded-2xl font-bold transition-all border border-zinc-200 dark:border-zinc-700 hover:border-red-200 dark:hover:border-red-900/50 shadow-sm disabled:opacity-50"
        >
            <LogOut size={20} className={isLoading ? "animate-pulse" : ""} />
            {isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
        </motion.button>
    )
}
