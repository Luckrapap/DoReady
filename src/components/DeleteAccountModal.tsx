'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react'
import { deleteAccount } from '@/app/login/actions'

interface DeleteAccountModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    async function handleDelete() {
        setIsLoading(true)
        setStatus(null)

        try {
            const result = await deleteAccount()

            if (result && result.error) {
                setStatus({ type: 'error', message: result.error })
                setIsLoading(false)
            } else {
                // If it redirects, the browser will handle it. 
                // In case it doesn't redirect immediately:
                setStatus({ type: 'success', message: 'Cuenta eliminada. Redirigiendo...' })
            }
        } catch (err) {
            console.error(err)
            setStatus({ type: 'error', message: 'Ocurrió un error inesperado al eliminar la cuenta.' })
            setIsLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal (Bottom Sheet style but centered) */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed inset-0 m-auto w-full max-w-lg h-fit border rounded-[2.5rem] shadow-2xl z-[70] overflow-hidden"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-2xl flex items-center justify-center"
                                        style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 90%, #ef4444)', color: '#ef4444' }}
                                    >
                                        <Trash2 size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Eliminar Cuenta</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full transition-colors text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                                    style={{ backgroundColor: 'transparent' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 rounded-3xl border flex gap-4"
                                    style={{
                                        backgroundColor: 'color-mix(in srgb, var(--surface) 95%, #ef4444)',
                                        borderColor: 'color-mix(in srgb, var(--border) 50%, #ef4444)'
                                    }}
                                >
                                    <AlertTriangle className="text-red-600 shrink-0" size={24} />
                                    <div>
                                        <p className="text-red-700 dark:text-red-400 font-bold mb-1">¿Estás completamente seguro?</p>
                                        <p className="text-sm text-black leading-relaxed font-bold">
                                            Esta acción es irreversible. Perderás todos tus datos, progreso y configuraciones de DoReady permanentemente.
                                        </p>
                                    </div>
                                </div>

                                {status && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${status.type === 'success'
                                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                                            }`}>
                                        {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                        {status.message}
                                    </motion.div>
                                )}

                                <div className="flex flex-col gap-3 pt-4">
                                    <button
                                        disabled={isLoading}
                                        onClick={handleDelete}
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-red-600 text-white rounded-full font-bold text-sm tracking-wide hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-red-500/20"
                                    >
                                        {isLoading ? 'Eliminando...' : 'Sí, eliminar cuenta permanentemente'}
                                    </button>
                                    <button
                                        disabled={isLoading}
                                        onClick={onClose}
                                        className="w-full py-4 rounded-full font-bold text-sm tracking-wide transition-all disabled:opacity-50"
                                        style={{ backgroundColor: 'var(--border)', color: 'var(--foreground)' }}
                                    >
                                        Mejor no, mantener mi cuenta
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
