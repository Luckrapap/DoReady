'use client'

import { useState } from 'react'
import GameInterface from '@/components/GameInterface'
import GameSelector from '@/components/GameSelector'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/utils'

export default function ProcastivePage() {
    const [activeGame, setActiveGame] = useState<string | null>(null)

    return (
        <main className={cn(
            "w-full h-full px-2 md:px-4 flex flex-col items-center selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black relative justify-start",
            !activeGame ? "overflow-y-auto pt-6 md:pt-12 pb-24" : "overflow-hidden pt-6"
        )}>
            <div className={cn(
                "w-full max-w-5xl flex flex-col transition-all duration-500 h-full mb-0",
                !activeGame ? "mt-4" : ""
            )}>
                <AnimatePresence mode="wait">
                    {!activeGame ? (
                        <motion.div
                            key="selector"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <GameSelector onSelectGame={setActiveGame} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="game"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="h-full w-full"
                        >
                            {activeGame === 'trivia' && (
                                <GameInterface onBack={() => setActiveGame(null)} />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    )
}
