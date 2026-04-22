'use client'

import { useState, useEffect } from 'react'
import { KeyRound, Lock, ArrowLeft, ChevronRight, Fingerprint, Trash2 } from 'lucide-react'
import SectionLoader from '@/components/SectionLoader'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import PasswordModal from '@/components/PasswordModal'
import DeleteAccountButton from '@/components/DeleteAccountButton'
import DeleteAccountModal from '@/components/DeleteAccountModal'
import PrivacyShield from '@/components/PrivacyShield'
import { createClient } from '@/utils/supabase/client'

export default function SecurityPage() {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isGuest, setIsGuest] = useState<boolean | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function checkUser() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setIsGuest(user?.is_anonymous ?? false)
            setIsLoading(false)
        }
        checkUser()
    }, [])

    if (isLoading) {
        return <SectionLoader />
    }

    return (
        <div className="max-w-xl mx-auto py-12 px-6 relative">
            <Link
                href="/settings"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors mb-8 text-sm font-medium"
            >
                <ArrowLeft size={16} />
                Volver a Configuración
            </Link>

            <header className="mb-12 text-center md:text-left">
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2 font-dancing lowercase">
                    seguridad
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">Gestiona la protección de tu cuenta.</p>
            </header>

            <div className="space-y-4">
                <PrivacyShield />

                {/* Visual Password Display Card */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex items-center justify-between opacity-80">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-400">
                            <Fingerprint size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Estado</h3>
                            <p className="text-sm font-mono tracking-widest text-zinc-400">••••••••</p>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">Protegido</span>
                </div>

                {!isGuest && (
                    <>
                        {/* Change Password Action Card */}
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="w-full group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-colors">
                                    <KeyRound size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Cambiar Contraseña</h3>
                                    <p className="text-sm text-zinc-500">Actualiza tus credenciales de acceso.</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                        </button>

                        {/* Logout Section */}
                        <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2 px-2 text-center">Gestión de Cuenta</h3>
                            <div className="max-w-sm mx-auto space-y-3 px-4">
                                <DeleteAccountButton onClick={() => setIsDeleteModalOpen(true)} />
                                <SignOutButton />
                            </div>
                        </div>
                    </>
                )}

                {isGuest && (
                    <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-3xl text-center">
                        <p className="text-sm text-amber-700 dark:text-amber-400 font-medium italic">
                            Estás en modo Invitado. Los datos son temporales y las opciones de cuenta están restringidas.
                        </p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <PasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            />
        </div>
    )
}
