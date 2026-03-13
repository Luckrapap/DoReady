'use client'

import { motion } from 'framer-motion'
import LandingHero from '@/components/LandingHero'
import LandingNavbar from '@/components/LandingNavbar'
import { BrainCircuit, Gamepad2, Layers, Sparkles, Zap } from 'lucide-react'

export default function LandingContent() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1] as any // Casting to avoid strict Easing type issues in some TS configs
            }
        }
    }

    return (
        <main className="min-h-screen bg-white dark:bg-zinc-950 selection:bg-accent/30 font-outfit">
            <LandingNavbar />
            <LandingHero />

            {/* Features Bento Grid Section */}
            <section id="features" className="py-24 lg:py-40 px-6 relative overflow-hidden border-t border-zinc-100 dark:border-zinc-900">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16 lg:mb-32 px-4"
                    >
                        <h2 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-tight sm:leading-[0.9] font-outfit uppercase">
                            Ingeniería de enfoque para <br className="hidden sm:block" />
                            <span className="font-playfair text-accent italic lowercase tracking-tight">mentes de alto rendimiento.</span>
                        </h2>
                        <div className="w-16 h-1 bg-accent mx-auto rounded-full opacity-30" />
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6"
                    >
                        {/* IA Coach - Large */}
                        <motion.div
                            variants={cardVariants}
                            className="md:col-span-6 lg:col-span-8 p-6 sm:p-12 rounded-3xl lg:rounded-[3.5rem] glass-elite border border-zinc-200 dark:border-zinc-800/50 flex flex-col md:flex-row gap-8 lg:gap-10 items-center hover:shadow-[0_0_80px_-15px_rgba(var(--accent-rgb),0.2)] transition-all duration-1000 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 rounded-2xl sm:rounded-3xl bg-accent flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-700">
                                <BrainCircuit size={28} className="sm:w-8 sm:h-8" />
                            </div>
                            <div className="space-y-4 relative z-10 text-center md:text-left">
                                <h3 className="text-xl sm:text-3xl font-black tracking-tight uppercase">IA Focus Coach</h3>
                                <p className="text-sm sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                                    Un centinela algorítmico que cartografía tus picos de energía biológica para indicarte el momento exacto del "Deep Work".
                                </p>
                            </div>
                        </motion.div>

                        {/* ThoughtBoard - Small */}
                        <motion.div
                            variants={cardVariants}
                            className="md:col-span-3 lg:col-span-4 p-6 sm:p-10 rounded-3xl lg:rounded-[3rem] glass-elite border border-zinc-200 dark:border-zinc-800/50 flex flex-col gap-6 hover:shadow-[0_0_60px_-15px_rgba(168,85,247,0.25)] transition-all duration-1000 group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all duration-700 shadow-sm">
                                <Sparkles size={24} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-black tracking-tight uppercase">Tablero de Ideas</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                                    Cero fricción. Captura relámpago. Elimina el ruido mental en milisegundos para que tu atención nunca se rompa.
                                </p>
                            </div>
                        </motion.div>

                        {/* CheckDay - Small */}
                        <motion.div
                            variants={cardVariants}
                            className="md:col-span-3 lg:col-span-4 p-6 sm:p-10 rounded-3xl lg:rounded-[3rem] glass-elite border border-zinc-200 dark:border-zinc-800/50 flex flex-col gap-6 hover:shadow-[0_0_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-1000 group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg group-hover:invert transition-all duration-700">
                                <Layers size={24} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-black tracking-tight uppercase">Matriz CheckDay</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                                    Arquitectura emocional. Un registro de alta fidelidad que conecta tu progreso con tu estado interno real.
                                </p>
                            </div>
                        </motion.div>

                        {/* Insights - Large */}
                        <motion.div
                            variants={cardVariants}
                            className="md:col-span-6 lg:col-span-5 p-6 sm:p-10 rounded-3xl lg:rounded-[3rem] glass-elite border border-zinc-200 dark:border-zinc-800/50 flex flex-col gap-6 hover:shadow-[0_0_60px_-15px_rgba(249,115,22,0.25)] transition-all duration-1000 group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-700">
                                <Zap size={24} />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl font-black tracking-tight uppercase">Motor de Correlación</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                                    Descubre las variables invisibles. Nuestro motor cruza datos ambientales y hábitos para revelar tu fórmula personal del éxito.
                                </p>
                            </div>
                        </motion.div>

                        {/* Themes & Procastive - Medium */}
                        <motion.div
                            variants={cardVariants}
                            id="philosophy"
                            className="md:col-span-6 lg:col-span-3 p-6 sm:p-10 rounded-3xl lg:rounded-[3rem] glass-elite border border-zinc-200 dark:border-zinc-800/50 flex flex-col gap-6 items-center text-center justify-center hover:bg-accent/5 transition-all duration-1000 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <Gamepad2 size={32} className="text-accent mb-2 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-700" />
                            <div className="space-y-1 relative z-10">
                                <h3 className="text-lg font-black tracking-tight uppercase">Bio-Descanso</h3>
                                <p className="text-[10px] text-accent font-black uppercase tracking-[0.2em]">Game Loop Active</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 lg:py-40 px-6 mb-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="max-w-6xl mx-auto rounded-[2rem] sm:rounded-[3rem] lg:rounded-[5rem] bg-zinc-900 dark:bg-zinc-50 p-8 sm:p-20 md:p-32 text-center relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)]"
                >
                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-accent/20 blur-[150px] -z-10" />
                    <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-10">
                        <div className="p-3 sm:p-4 bg-white/10 dark:bg-black/10 rounded-2xl sm:rounded-[2rem] backdrop-blur-xl border border-white/10 dark:border-black/5 animate-bounce-slow">
                            <Sparkles className="text-accent" size={32} />
                        </div>
                        <h2 className="text-3xl sm:text-6xl md:text-7xl lg:text-[8rem] font-black text-white dark:text-black tracking-tight leading-tight sm:leading-[0.8] uppercase font-outfit">
                            ¿Te atreves <br />al cambio <br /><span className="font-playfair italic font-normal lowercase tracking-tight">radical?</span>
                        </h2>
                        <a href="#top" className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 hover:text-accent transition-all hover:tracking-[0.7em] duration-500 mt-4">Volver a la cima</a>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-zinc-100 dark:border-zinc-900 text-center">
                <div className="flex justify-center gap-12 mb-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                    <span className="text-[10px] font-black uppercase tracking-widest">Eficiencia</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Consistencia</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Enfoque</span>
                </div>
                <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.5em] opacity-30">
                    DoReady © 2026 — Protocolo de Alto Rendimiento
                </p>
            </footer>
        </main>
    )
}
