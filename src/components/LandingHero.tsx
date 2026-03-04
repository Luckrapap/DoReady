'use client'

import { motion } from 'framer-motion'
import { MountainSnow, ArrowRight, Zap, Target, Shield } from 'lucide-react'
import Link from 'next/link'

export default function LandingHero() {
    return (
        <div className="relative overflow-hidden bg-white dark:bg-zinc-950 min-h-screen flex flex-col justify-center px-6">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 45, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -top-24 -left-24 w-96 h-96 bg-zinc-100 dark:bg-zinc-900 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, -45, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute -bottom-24 -right-24 w-96 h-96 bg-zinc-100 dark:bg-zinc-900 rounded-full blur-3xl"
                />
            </div>

            <div className="max-w-7xl mx-auto w-full relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-500 mb-8 border border-zinc-200/50 dark:border-zinc-800/50"
                        >
                            <Zap size={14} className="text-yellow-500" />
                            Domina tu Enfoque Radical
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-8xl font-black text-zinc-950 dark:text-white leading-[0.9] tracking-tighter mb-8"
                        >
                            Haz que cada <br />
                            <span className="font-dancing text-zinc-500 dark:text-zinc-600 lowercase">segundo</span> cuente
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-zinc-600 dark:text-zinc-400 max-w-lg mb-12 leading-relaxed"
                        >
                            DoReady no es solo un gestor de tareas. Es tu centro de alto rendimiento diseñado para eliminar la procrastinación y construir una disciplina inquebrantable.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <Link href="/login">
                                <button className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-zinc-200 dark:shadow-none">
                                    Empezar Ahora
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link href="/login">
                                <button className="w-full sm:w-auto px-8 py-5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-lg hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all">
                                    Iniciar Sesión
                                </button>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-16 flex items-center gap-8 grayscale opacity-50 dark:invert"
                        >
                            <div className="flex items-center gap-2">
                                <Target size={20} />
                                <span className="font-bold text-sm tracking-tight">ENFOQUE N7</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield size={20} />
                                <span className="font-bold text-sm tracking-tight">SIN FILTROS</span>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hidden lg:block relative"
                    >
                        <div className="relative z-10 bg-zinc-100 dark:bg-zinc-900 rounded-[3rem] p-4 shadow-2xl border border-zinc-200 dark:border-zinc-800">
                            <div className="bg-white dark:bg-black rounded-[2rem] overflow-hidden aspect-[4/5] flex flex-col items-center justify-center p-12 text-center">
                                <div className="h-32 w-32 bg-black dark:bg-white rounded-[2rem] flex items-center justify-center text-white dark:text-black mb-8 shadow-2xl">
                                    <MountainSnow size={64} />
                                </div>
                                <h3 className="text-3xl font-black mb-4">DoReady</h3>
                                <div className="space-y-3 w-full">
                                    <div className="h-12 w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
                                    <div className="h-12 w-3/4 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
                                    <div className="h-12 w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl opacity-50" />
                                </div>
                            </div>
                        </div>
                        {/* Decorative floating cards */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-10 -right-10 w-40 h-40 bg-zinc-100 dark:bg-zinc-800 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-xl p-6 flex flex-col justify-end"
                        >
                            <div className="h-2 w-full bg-zinc-300 dark:bg-zinc-600 rounded-full mb-2" />
                            <div className="h-2 w-2/3 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
