'use client'

import { ShieldCheck } from 'lucide-react'

export default function PrivacyShield() {
    return (
        <section
            className="rounded-3xl p-6 shadow-sm border transition-colors duration-500"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-2xl text-green-600">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Escudo de Privacidad DoReady</h3>
                    <p className="text-xs text-zinc-500">Protección de datos de grado empresarial activa.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                <div className="space-y-2">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        Row Level Security (RLS)
                    </h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Tus datos están aislados a nivel de base de datos. Solo tu ID de usuario autenticado tiene la "llave" para leer o escribir información.
                    </p>
                </div>
                <div className="space-y-2">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        Cifrado de Extremo a Extremo
                    </h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Utilizamos túneles SSL/TLS para el transporte de datos y cifrado AES-256 para el almacenamiento en reposo.
                    </p>
                </div>
                <div className="space-y-2">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        Anonimización IA
                    </h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Antes de que el Motor de Inteligencia Artificial analice tus patrones, filtramos cualquier dato identificable como correos o números.
                    </p>
                </div>
                <div className="space-y-2">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        Sistema de Conocimiento Cero
                    </h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        DoReady está diseñado para que nosotros no podamos ver tus tareas. La privacidad es el valor predeterminado, no una opción.
                    </p>
                </div>
            </div>
        </section>
    )
}
