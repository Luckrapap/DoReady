'use client'

import { useState } from 'react'
import GameInterface from '@/components/GameInterface'
import RecallInterface from '@/components/RecallInterface'
import GameSelector from '@/components/GameSelector'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/utils'

export default function ProcastivePage() {
    const [activeGame, setActiveGame] = useState<string | null>(null)

    return (
        <main className={cn(
            "w-full h-[100dvh] px-2 md:px-4 flex flex-col items-center selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black relative justify-start pt-safe-top",
            !activeGame ? "overflow-y-auto" : "overflow-hidden"
        )}>
            <div className={cn(
                "w-full max-w-5xl flex flex-col transition-all duration-500 h-full mb-0 pt-2",
                !activeGame ? "pb-12" : ""
            )}>
                <AnimatePresence mode="wait">
                    {!activeGame ? (
                        <motion.div
                            key="selector"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <GameSelector onSelectGame={setActiveGame} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="game"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="h-full w-full"
                        >
                            {activeGame === 'trivia' && (
                                <GameInterface onBack={() => setActiveGame(null)} />
                            )}
                            {activeGame === 'recall' && (
                                <RecallInterface onBack={() => setActiveGame(null)} />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    )
}
