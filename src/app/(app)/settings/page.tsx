import Link from 'next/link'
import { ShieldCheck, ChevronRight, Palette } from 'lucide-react'
import ThemeSwitcher from '@/components/ThemeSwitcher'

export default function SettingsPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <header className="mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2 font-dancing lowercase">
                    configuración
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">Gestiona los ajustes de tu cuenta y privacidad.</p>
            </header>

            <div className="space-y-12">
                {/* Account Section */}
                <section className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 px-2 flex items-center gap-2">
                        Mi Cuenta
                    </h2>
                    <Link
                        href="/settings/security"
                        className="group flex items-center justify-between rounded-3xl p-6 shadow-sm border hover:shadow-md transition-shadow"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}>
                                <ShieldCheck size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--accent)' }}>Seguridad</h3>
                                <p className="text-sm font-medium text-zinc-500/80 dark:text-zinc-400/80 tracking-wide">Contraseña, sesiones y protección de cuenta.</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                    </Link>
                </section>

                {/* Experience Section */}
                <section className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 px-2 flex items-center gap-2">
                        Experiencia Visual
                    </h2>
                    <ThemeSwitcher />
                </section>
            </div>
        </div>
    )
}
