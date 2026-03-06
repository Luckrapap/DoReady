'use client'

import { motion } from 'framer-motion'
import { MountainSnow } from 'lucide-react'
import Link from 'next/link'

export default function LandingNavbar() {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-8 pointer-events-none"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4 pointer-events-auto group cursor-pointer">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-2xl bg-black dark:bg-white dark:text-black group-hover:bg-accent transition-all duration-500">
                        <MountainSnow size={22} className="group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                    <span className="font-black text-2xl tracking-tight text-zinc-900 dark:text-zinc-50 uppercase font-outfit">DoReady</span>
                </div>

                <div className="hidden md:flex items-center gap-10 glass-elite px-10 py-4 rounded-full border border-white/20 dark:border-white/10 shadow-2xl pointer-events-auto">
                    <a href="#features" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-accent transition-all duration-300">Funciones</a>
                    <a href="#philosophy" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-accent transition-all duration-300">Filosofía</a>
                    <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white hover:text-accent transition-all duration-300 border-b-2 border-accent">Acceso</Link>
                </div>

                <button className="md:hidden glass-elite px-5 py-2.5 rounded-full border border-white/20 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white pointer-events-auto active:scale-95 transition-transform">
                    Menú
                </button>
            </div>
        </motion.nav>
    )
}
