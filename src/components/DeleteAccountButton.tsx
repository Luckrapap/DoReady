'use client'

import { Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface DeleteAccountButtonProps {
    onClick: () => void
}

export default function DeleteAccountButton({ onClick }: DeleteAccountButtonProps) {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-2xl font-bold transition-all border border-red-100 dark:border-red-900/30 shadow-sm"
        >
            <Trash2 size={20} />
            Eliminar Cuenta
        </motion.button>
    )
}
