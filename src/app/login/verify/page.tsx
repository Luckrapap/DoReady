'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Logo from '@/components/Logo'

export default function VerifyPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-white dark:bg-zinc-950 px-4 py-12 font-outfit overflow-hidden relative">
            {/* Background decorative elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />

            <div className="w-full max-w-md flex flex-col items-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center text-center gap-8"
                >
                    {/* Logo & Status Icon */}
                    <div className="relative">
                    <Link href="/login" className="flex flex-col items-center gap-1 hover:scale-110 transition-transform mb-4">
                        <Logo size={36} style={{ color: 'var(--accent)' }} />
                        <h1 className="text-4xl font-bold tracking-tight leading-none" style={{ color: 'var(--accent)' }}>DoReady</h1>
                    </Link>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                            className="absolute -right-2 -bottom-2 h-8 w-8 bg-accent rounded-full border-4 border-white dark:border-zinc-950 flex items-center justify-center text-white"
                        >
                            <Mail size={16} />
                        </motion.div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 uppercase leading-none">
                            Verifica tu correo
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-[280px] mx-auto leading-relaxed">
                            Hemos enviado un enlace mágico a tu bandeja de entrada. Púlsalo para activar tu enfoque radical.
                        </p>
                    </div>

                    {/* Instruction Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="w-full bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 space-y-6 shadow-sm"
                    >
                        <div className="flex items-start gap-4 text-left">
                            <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center text-accent mt-1 flex-shrink-0">
                                <CheckCircle2 size={14} />
                            </div>
                            <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">Busca el correo de <span className="text-black dark:text-white">DoReady</span></p>
                        </div>
                        <div className="flex items-start gap-4 text-left">
                            <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center text-accent mt-1 flex-shrink-0">
                                <CheckCircle2 size={14} />
                            </div>
                            <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">Haz clic en el botón de confirmación</p>
                        </div>

                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-loose">
                                ¿No lo ves? Revisa tu carpeta de spam o promociones.
                            </p>
                        </div>
                    </motion.div>

                    {/* Primary Action */}
                    <Link
                        href="/login"
                        className="flex items-center gap-2 group text-zinc-400 hover:text-black dark:hover:text-white transition-all text-xs font-black uppercase tracking-[0.3em] mt-4"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Volver al inicio
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}
