'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles } from 'lucide-react'
import Logo from '@/components/Logo'

export default function ConfirmedPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirigir al inicio después de 4 segundos para que lean el mensaje
        const timer = setTimeout(() => {
            router.push('/today')
        }, 4000)
        return () => clearTimeout(timer)
    }, [router])

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-white dark:bg-zinc-950 px-4 py-12 font-outfit overflow-hidden relative">
            {/* Background decorative elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[130px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[130px] rounded-full" />

            <div className="w-full max-w-md flex flex-col items-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center text-center gap-10"
                >
                    {/* Success Animation */}
                    <div className="relative">
                        <motion.div
                            initial={{ rotate: -10, y: 10 }}
                            animate={{ rotate: 0, y: 0 }}
                            transition={{ duration: 1, type: 'spring' }}
                        >
                            <Logo size={72} style={{ color: 'var(--accent)' }} className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.1)]" />
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="absolute -top-4 -right-4 h-12 w-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white dark:border-zinc-950"
                        >
                            <CheckCircle2 size={24} />
                        </motion.div>

                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -bottom-6 -left-6 text-accent"
                        >
                            <Sparkles size={32} />
                        </motion.div>
                    </div>

                    {/* Confirmed Message */}
                    <div className="space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 uppercase leading-tight"
                        >
                            ¡Gracias por <br /> verificarte!
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-zinc-500 dark:text-zinc-400 font-medium max-w-[280px] mx-auto text-lg"
                        >
                            Tu cuenta está lista. Preparando tu espacio de enfoque...
                        </motion.p>
                    </div>

                    {/* Progress Loader */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3.5, ease: "easeInOut" }}
                        className="h-1 bg-black dark:bg-white rounded-full mt-4"
                    />

                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Serás redirigido automáticamente
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
