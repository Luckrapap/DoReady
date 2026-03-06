'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { MountainSnow, ArrowRight, Zap, CheckCircle2, Star, Sparkles, Play } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'

export default function LandingHero() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    // Magnetic Button Logic
    const buttonRef = useRef<HTMLButtonElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const springConfig = { damping: 15, stiffness: 150 }
    const springX = useSpring(x, springConfig)
    const springY = useSpring(y, springConfig)

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return
        const { clientX, clientY } = e
        const { left, top, width, height } = containerRef.current.getBoundingClientRect()

        // Update global mouse position for reactive background
        setMousePosition({
            x: ((clientX - left) / width) * 100,
            y: ((clientY - top) / height) * 100
        })

        // Magnetic effect for button
        if (buttonRef.current) {
            const btnRect = buttonRef.current.getBoundingClientRect()
            const centerX = btnRect.left + btnRect.width / 2
            const centerY = btnRect.top + btnRect.height / 2

            const distanceX = clientX - centerX
            const distanceY = clientY - centerY

            const radius = 120
            if (Math.abs(distanceX) < radius && Math.abs(distanceY) < radius) {
                x.set(distanceX * 0.4)
                y.set(distanceY * 0.4)
            } else {
                x.set(0)
                y.set(0)
            }
        }
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <div
            id="top"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white dark:bg-zinc-950 transition-colors duration-700 font-outfit"
        >
            {/* 1. LAYER: REACTIVE MESH GRADIENT */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute inset-0 mesh-gradient opacity-40 dark:opacity-30 bounce-slow transition-transform duration-1000 ease-out"
                    style={{
                        transform: `translate(${(mousePosition.x - 50) * 0.05}%, ${(mousePosition.y - 50) * 0.05}%)`,
                    }}
                />
                <div className="absolute inset-0 bg-grain opacity-[0.05] dark:opacity-[0.08] mix-blend-overlay" />
            </div>

            <div className="max-w-7xl mx-auto w-full px-6 py-12 relative z-10 mt-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

                    {/* LEFT CONTENT: Copy & CTA */}
                    <div className="lg:col-span-7 flex flex-col items-start text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-5 py-2 glass-elite rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-10"
                        >
                            <span className="flex h-2.5 w-2.5 rounded-full bg-accent animate-ping opacity-75" />
                            <span className="relative">IA Focus Engineering</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-black tracking-tight leading-[0.95] sm:leading-[0.8] mb-8 lg:mb-12 text-gradient font-outfit"
                        >
                            Domina el <br />
                            caos. Recupera <br />
                            tu <span className="font-playfair text-accent italic font-normal tracking-tight lowercase inline-block">enfoque</span>.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 1 }}
                            className="text-lg sm:text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 max-w-xl mb-10 lg:mb-14 leading-relaxed font-medium tracking-tight"
                        >
                            DoReady es el centro de mando para mentes de alto rendimiento. Un ecosistema radical donde la inteligencia artificial protege tu atención.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 1 }}
                            className="w-full sm:w-auto"
                        >
                            <Link href="/login" onMouseLeave={handleMouseLeave}>
                                <motion.button
                                    ref={buttonRef}
                                    style={{ x: springX, y: springY }}
                                    className="group relative flex items-center justify-center gap-4 px-12 py-6 bg-black dark:bg-white text-white dark:text-black rounded-[2rem] font-black text-xl transition-shadow hover:shadow-[0_30px_60px_-15px_rgba(var(--accent-rgb),0.3)] shadow-2xl active:scale-[0.98]"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                    <span>Empezar Ahora</span>
                                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-500" />
                                </motion.button>
                            </Link>

                            {/* Activity Ticker */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="mt-8 flex items-center gap-4 text-zinc-400"
                            >
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-800" />
                                    ))}
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-widest">+1,240 Sprints hoy</span>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* RIGHT CONTENT: INTERACTIVE MOCKUP */}
                    <div className="lg:col-span-5 relative perspective-1000 hidden lg:block">
                        <motion.div
                            initial={{ opacity: 0, x: 50, rotateY: -10 }}
                            animate={{ opacity: 1, x: 0, rotateY: 0 }}
                            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-10 w-full hover:rotate-y-2 transition-transform duration-700"
                        >
                            {/* App Window Shell */}
                            <div className="glass-elite rounded-[3.5rem] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden">
                                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden aspect-[4/5] flex flex-col border border-zinc-200 dark:border-zinc-800">
                                    {/* App Header Mock */}
                                    <div className="h-16 px-8 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                                            <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                        </div>
                                        <MountainSnow size={20} className="text-accent" />
                                    </div>

                                    {/* App Content Mock */}
                                    <div className="flex-1 p-10 space-y-8">
                                        <div className="space-y-4">
                                            <div className="h-10 w-32 bg-accent/5 dark:bg-accent/10 rounded-xl" />
                                            <div className="h-4 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
                                        </div>

                                        <div className="space-y-5">
                                            {[1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-5 p-5 rounded-2xl border border-zinc-50 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-white/5"
                                                >
                                                    <div className={`w-6 h-6 rounded-full border-2 ${i === 1 ? 'bg-accent border-accent' : 'border-zinc-200 dark:border-zinc-700'}`}>
                                                        {i === 1 && <CheckCircle2 size={16} className="text-white mx-auto mt-0.5" />}
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className={`h-2.5 rounded-full ${i === 1 ? 'bg-zinc-400 dark:bg-zinc-500 w-3/4' : 'bg-zinc-200 dark:bg-zinc-700 w-1/2'}`} />
                                                        <div className={`h-2 rounded-full ${i === 1 ? 'bg-zinc-200 dark:bg-zinc-700 w-1/4' : 'bg-zinc-100 dark:bg-zinc-800 w-1/3'}`} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating decorative elements */}
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-[2rem] blur-2xl -z-10"
                            />
                            <motion.div
                                animate={{ y: [0, 15, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-[3rem] blur-2xl -z-10"
                            />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
            >
                <div className="w-[1px] h-20 bg-gradient-to-b from-accent to-transparent" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 rotate-0">Explorar Sistema</span>
            </motion.div>
        </div>
    )
}
