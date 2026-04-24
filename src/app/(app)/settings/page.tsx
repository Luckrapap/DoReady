import Link from 'next/link'
import { ShieldCheck, ChevronRight, Palette } from 'lucide-react'
export default function SettingsPage() {
    return (
        <main className="h-[100dvh] flex justify-center pt-safe-top pb-12 px-4 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black overflow-hidden">
            <div className="w-full max-w-xl h-full flex flex-col pt-8">
                <section className="flex flex-col h-full overflow-y-auto no-scrollbar pb-20">
                    <header className="flex flex-col gap-1 px-4 flex-shrink-0 mb-12">
                        <div className="flex items-end justify-center">
                            {/* Left phantom box for horizontal balance - ZERO WIDTH */}
                            <div className="opacity-0 w-0 overflow-hidden pointer-events-none bg-zinc-200 dark:bg-zinc-800 rounded-full px-6 py-2.5 mt-2 mb-1 flex items-center justify-center">
                                <span className="text-4xl md:text-5xl font-light">0/0</span>
                            </div>
                            <h1 className="font-bold text-5xl md:text-7xl tracking-tighter text-zinc-900 dark:text-zinc-50 relative bottom-1.5 whitespace-nowrap">
                                Configuración
                            </h1>
                            {/* Right phantom box for horizontal balance and height match - ZERO WIDTH */}
                            <div className="opacity-0 w-0 overflow-hidden pointer-events-none bg-zinc-200 dark:bg-zinc-800 rounded-full px-6 py-2.5 mt-2 mb-1 flex items-center justify-center">
                                <span className="text-4xl md:text-5xl font-light">0/0</span>
                            </div>
                        </div>
                    </header>

                    <div className="space-y-4 px-2">
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

                        <Link
                            href="/settings/customize"
                            className="group flex items-center justify-between rounded-3xl p-6 shadow-sm border hover:shadow-md transition-shadow"
                            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}>
                                    <Palette size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--accent)' }}>Personalizar</h3>
                                    <p className="text-sm font-medium text-zinc-500/80 dark:text-zinc-400/80 tracking-wide">Apariencia, temas y diseño de navegación.</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    )
}
