import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LandingHero from '@/components/LandingHero'

export default async function LandingPage() {
    const supabase = await createClient()

    // Check session
    const { data: { user } } = await supabase.auth.getUser()

    // If already logged in, go to the dashboard
    if (user) {
        redirect('/today')
    }

    return (
        <main className="min-h-screen">
            <LandingHero />

            {/* Features Preview */}
            <section className="bg-zinc-50 dark:bg-zinc-900/40 py-24 px-6 border-t border-zinc-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
                        <div>
                            <h4 className="text-2xl font-bold mb-4">Núcleo Diario</h4>
                            <p className="text-zinc-500">Un sistema de enfoque radical que te obliga a decidir qué importa hoy.</p>
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold mb-4">Consistencia Visual</h4>
                            <p className="text-zinc-500">Rastrea tus rachas y marcas diarias con un calendario de alto impacto.</p>
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold mb-4">Coach IA</h4>
                            <p className="text-zinc-500">Tu mentor personal de productividad integrado directamente en tu flujo de trabajo.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
