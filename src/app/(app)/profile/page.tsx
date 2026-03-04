import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from '@/components/SignOutButton'
import ProfileHeader from '@/components/ProfileHeader'
import { getProfile } from '@/app/actions/profile'
import { Settings, ShieldCheck, Zap } from 'lucide-react'

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const profile = await getProfile()

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <header className="mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2 font-dancing lowercase">
                    mi cuenta
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">Personaliza tu perfil y gestiona tu sesión.</p>
            </header>

            <div className="space-y-8">
                {/* Interactive Profile Header */}
                <ProfileHeader profile={profile} email={user.email!} />

                {/* Additional Settings Card */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-500">
                            <Settings size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Seguridad y Estado</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-5 bg-zinc-50/50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 transition-all hover:border-zinc-200 dark:hover:border-zinc-700">
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={20} className="text-green-500" />
                                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Protección del Perfil</span>
                            </div>
                            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Activa</span>
                        </div>

                        <div className="flex items-center justify-between p-5 bg-zinc-50/50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 transition-all hover:border-zinc-200 dark:hover:border-zinc-700">
                            <div className="flex items-center gap-3">
                                <Zap size={20} className="text-yellow-500" />
                                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Nivel de Jugador</span>
                            </div>
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest">N7</span>
                        </div>
                    </div>
                </div>

                {/* Logout Section */}
                <div className="pt-4 max-w-sm mx-auto">
                    <SignOutButton />
                </div>
            </div>
        </div>
    )
}
