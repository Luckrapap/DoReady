'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react'

export default function AICoach() {
    const [isOpen, setIsOpen] = useState(false)
    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
        api: '/api/chat',
        onError: (e) => console.error("Chat Error:", e)
    })

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-20 right-4 md:bottom-6 md:right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? <X size={24} /> : <Bot size={24} />}
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-36 right-4 md:bottom-24 md:right-8 z-40 w-[calc(100vw-32px)] max-w-[380px] h-[500px] max-h-[70vh] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black">
                                <Sparkles size={16} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">Do IA</h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Focus Coach</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 gap-3 px-4">
                                    <Bot size={40} className="text-zinc-300 dark:text-zinc-700" />
                                    <p className="text-sm font-medium">¿Procrastinando un poco?</p>
                                    <p className="text-xs">Cuéntame en qué estás atascado y te ayudaré a dar el primer paso.</p>
                                </div>
                            ) : (
                                messages.map((m) => (
                                    <div
                                        key={m.id}
                                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm ${m.role === 'user'
                                                ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-sm'
                                                : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-tl-sm'
                                                }`}
                                        >
                                            <div className="whitespace-pre-wrap break-words prose dark:prose-invert prose-sm prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0">
                                                <ReactMarkdown>
                                                    {m.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 rounded-tl-sm">
                                        <Loader2 size={16} className="animate-spin text-zinc-500" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Error Tooltip */}
                        {error && (
                            <div className="px-4 py-2 bg-red-100 dark:bg-red-950 border-t border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs text-center font-medium">
                                Error de conexión: {error.message}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                            <form
                                onSubmit={handleSubmit}
                                className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full pl-4 pr-1.5 py-1.5"
                            >
                                <input
                                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                                    value={input || ''}
                                    onChange={handleInputChange}
                                    placeholder="Necesito ayuda para empezar..."
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !(input || '').trim()}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black disabled:opacity-50 transition-opacity"
                                >
                                    <Send size={14} className={(input || '').trim() ? "translate-x-px" : ""} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
