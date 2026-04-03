'use client'

import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { BrainCircuit, Loader2, Sparkles } from 'lucide-react'
import { InsightsPayload } from '@/app/actions/insights'
import { useCompletion } from 'ai/react'

interface Props {
    analyticsData: InsightsPayload
}

export default function InsightsDashboard({ analyticsData }: Props) {
    const { completion, complete, isLoading, error } = useCompletion({
        api: '/api/insights',
        onError: (e) => console.error("Insight Error:", e)
    })

    const handleGenerate = () => {
        complete('', { body: { analyticsData } })
    }

    return (
        <div className="w-full">
            <div className="flex flex-col items-center justify-center text-center mb-8">
                <div className="w-16 h-16 rounded-[1.25rem] text-white flex items-center justify-center mb-6 shadow-xl relative overflow-hidden"
                    style={{ backgroundColor: 'var(--accent)' }}
                >
                    <div className="absolute inset-0 bg-white/20 dark:bg-black/20 animate-pulse" />
                    <BrainCircuit size={32} />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Motor de Correlaciones
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 mt-3 max-w-sm text-sm">
                    Descubre patrones ocultos entre tu estado emocional y tu productividad.
                </p>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="mt-8 flex items-center gap-2 px-8 py-4 text-white text-sm rounded-full font-semibold hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:hover:scale-100"
                    style={{ backgroundColor: 'var(--accent)' }}
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {completion ? "Regenerar Análisis" : "Ejecutar Análisis Profundo"}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl mb-6 text-center text-sm font-medium">
                    Error conectando con el Motor: {error.message}
                </div>
            )}

            {(completion || isLoading) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full backdrop-blur-md border rounded-[2rem] p-6 md:p-10 shadow-sm"
                    style={{
                        backgroundColor: 'color-mix(in srgb, var(--surface) 80%, transparent)',
                        borderColor: 'var(--border)'
                    }}
                >
                    {isLoading && !completion ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-4">
                            <Loader2 size={32} className="animate-spin text-zinc-400" />
                            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest animate-pulse">
                                Analizando tu progreso...
                            </p>
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none prose-h3:text-xl prose-h3:font-bold prose-h3:mb-3 prose-p:text-[15px] prose-p:leading-relaxed prose-li:text-[15px] prose-strong:text-zinc-900 dark:prose-strong:text-white">
                            <ReactMarkdown>{completion}</ReactMarkdown>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    )
}
