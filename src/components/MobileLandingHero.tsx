import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from './Logo'
import { createClient } from '@/utils/supabase/client'

const phrases = [
    { text: "Califica tu día", weight: 10 },
    { text: "Empieza con algo", weight: 10 },
    { text: "No necesitas estar listo", weight: 10 },
    { text: "Ya estás aquí, haz algo", weight: 10 },
    { text: "Una cosa ya cuenta", weight: 10 },
    { text: "Forget...", weight: 1 },
    { text: "Little Cat", weight: 1 }
]

export default function MobileLandingHero() {
    const [currentPhrase, setCurrentPhrase] = useState(0)

    const handleGoogleLogin = async () => {
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentPhrase((prev) => {
                let next = prev
                while (next === prev) {
                    // Weighted random selection
                    const totalWeight = phrases.reduce((sum, p) => sum + p.weight, 0)
                    let random = Math.random() * totalWeight
                    for (let i = 0; i < phrases.length; i++) {
                        if (random < phrases[i].weight) {
                            next = i
                            break
                        }
                        random -= phrases[i].weight
                    }
                }
                return next
            })
        }, 4000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="flex flex-col h-[100dvh] w-full bg-white dark:bg-zinc-950 font-outfit relative">
            {/* Top Curved Section */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative w-full h-[55%] bg-zinc-200 dark:bg-zinc-900 rounded-b-[3rem] sm:rounded-b-[4rem] overflow-hidden flex items-center justify-center shadow-sm"
            >
                {/* Floating animated phrase - Centered */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={phrases[currentPhrase].text}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.6 }}
                            className="text-zinc-500 dark:text-zinc-400 text-4xl font-black tracking-tighter z-20"
                        >
                            {phrases[currentPhrase].text}
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* Logo as Image Placeholder */}
                <Logo size={150} className="text-zinc-400 dark:text-zinc-600 drop-shadow-sm opacity-5" />
            </motion.div>

            {/* Bottom Content Area - Fixed structure to avoid gaps in APK */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-1 w-full bg-black dark:bg-black px-6 pt-12 pb-safe-bottom rounded-t-[2.5rem] sm:rounded-t-[3rem] flex flex-col gap-3.5 items-center justify-start"
            >
                {/* 1. Continuar con Google */}
                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 py-3.5 rounded-full bg-white hover:bg-zinc-100 text-black font-semibold text-lg transition-all active:scale-[0.98]"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                    </svg>
                    Continuar con Google
                </button>

                {/* 2. Registrarse */}
                <Link
                    href="/login?type=register"
                    className="w-full flex items-center justify-center py-3.5 rounded-full bg-zinc-400 hover:bg-zinc-500 text-black font-semibold text-lg transition-all active:scale-[0.98]"
                >
                    Registrarse
                </Link>

                {/* 3. Iniciar sesión */}
                <Link
                    href="/login?type=login"
                    className="w-full flex items-center justify-center py-3.5 rounded-full bg-white/20 border border-white/40 hover:bg-white/30 text-white font-semibold text-lg transition-all active:scale-[0.98]"
                >
                    Iniciar sesión
                </Link>

                {/* 4. Modo invitado */}
                <Link
                    href="/today" // Or a specific guest entry point
                    className="w-full flex items-center justify-center py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-lg transition-all active:scale-[0.98]"
                >
                    Modo invitado
                </Link>
            </motion.div>
        </div>
    )
}
