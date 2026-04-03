'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react'
import PasswordInput from './PasswordInput'
import { changePassword } from '@/app/actions/auth'

interface PasswordModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function PasswordModal({ isOpen, onClose }: PasswordModalProps) {
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setStatus(null)

        const result = await changePassword(formData)

        setIsLoading(false)
        if (result.error) {
            setStatus({ type: 'error', message: result.error })
        } else {
            setStatus({ type: 'success', message: '¡Contraseña actualizada con éxito!' })
            setTimeout(() => {
                onClose()
                setStatus(null)
            }, 2000)
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

                    {/* Modal (Bottom Sheet style but centered as requested) */}
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
                                    <div className="p-2.5 rounded-2xl"
                                        style={{ backgroundColor: 'var(--border)', color: 'var(--accent)' }}
                                    >
                                        <KeyRound size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Cambiar Contraseña</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full transition-colors text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                                    style={{ backgroundColor: 'transparent' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form action={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2 px-1">Nueva Contraseña</label>
                                    <PasswordInput
                                        name="newPassword"
                                        required
                                        minLength={6}
                                        showIcon={false}
                                        className="w-full p-4 rounded-2xl border-none transition-all text-sm text-zinc-900 dark:text-zinc-50 outline-none"
                                        style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 90%, var(--accent))' }}
                                        placeholder="Min. 6 caracteres"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2 px-1">Confirmar Nueva Contraseña</label>
                                    <PasswordInput
                                        name="confirmPassword"
                                        required
                                        minLength={6}
                                        showIcon={false}
                                        className="w-full p-4 rounded-2xl border-none transition-all text-sm text-zinc-900 dark:text-zinc-50 outline-none"
                                        style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 90%, var(--accent))' }}
                                        placeholder="Repite la contraseña"
                                    />
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

                                <div className="pt-4">
                                    <button
                                        disabled={isLoading}
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 py-4 text-white rounded-full font-bold text-sm tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg"
                                        style={{ backgroundColor: 'var(--accent)' }}
                                    >
                                        {isLoading ? 'Guardando...' : 'Confirmar Cambio'}
                                        {!isLoading && <KeyRound size={18} />}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
