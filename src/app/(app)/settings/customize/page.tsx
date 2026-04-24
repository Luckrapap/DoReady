'use client'

import { ArrowLeft, Palette } from 'lucide-react'
import Link from 'next/link'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import LayoutSwitcher from '@/components/LayoutSwitcher'

import CircularBackButton from '@/components/CircularBackButton'

export default function CustomizePage() {
    return (
        <div className="max-w-xl mx-auto py-12 px-6 relative">
            <header className="mb-12 relative text-center md:text-left">
                <div className="absolute left-0 top-0 md:top-1">
                    <CircularBackButton href="/settings" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2 font-dancing lowercase">
                    personalizar
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">Ajusta la apariencia y el diseño de tu aplicación.</p>
            </header>

            <div className="space-y-12">
                <ThemeSwitcher />
                <LayoutSwitcher />
            </div>
        </div>
    )
}
