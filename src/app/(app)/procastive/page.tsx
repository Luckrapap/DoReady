'use client'

import { useState } from 'react'
import TriviaGame from '@/components/TriviaGame'
import GameSelector from '@/components/GameSelector'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProcastivePage() {
    const [activeGame, setActiveGame] = useState<string | null>(null)

    return (
        <main className="min-h-screen py-2 md:py-6 px-2 md:px-4 flex justify-center selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black relative">
            <div className="w-full max-w-5xl mt-2 md:mt-12 mb-24">
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
                        >
                            {activeGame === 'trivia' && (
                                <TriviaGame onBack={() => setActiveGame(null)} />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    )
}
