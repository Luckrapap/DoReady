'use client'

import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface CircularBackButtonProps {
    href: string
    className?: string
}

export default function CircularBackButton({ href, className }: CircularBackButtonProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            className={className}
        >
            <Link
                href={href}
                className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm"
                style={{
                    backgroundColor: 'color-mix(in srgb, var(--surface) 80%, transparent)',
                    borderColor: 'var(--border)',
                    color: 'var(--accent)',
                    backdropFilter: 'blur(8px)'
                }}
                title="Volver"
            >
                <ChevronLeft size={24} strokeWidth={2.5} />
            </Link>
        </motion.div>
    )
}
