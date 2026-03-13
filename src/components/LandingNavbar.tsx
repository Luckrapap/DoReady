'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Logo from './Logo'

export default function LandingNavbar() {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-8 pointer-events-none"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-1 pointer-events-auto group cursor-pointer">
                    <Logo size={46} className="bg-zinc-900 dark:bg-zinc-50 transition-transform duration-300" />
                    <span className="font-black text-5xl tracking-tight text-zinc-900 dark:text-zinc-50 uppercase font-outfit">DoReady</span>
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
