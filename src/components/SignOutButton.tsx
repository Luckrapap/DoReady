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
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-2xl font-bold transition-all border border-red-100 dark:border-red-900/30 shadow-sm disabled:opacity-50"
        >
            <LogOut size={20} className={isLoading ? "animate-pulse" : ""} />
            {isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
        </motion.button>
    )
}
