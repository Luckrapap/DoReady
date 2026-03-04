import Link from 'next/link'
import { login, signup } from './actions'
import { MountainSnow, User, Mail, Lock, Calendar, ClipboardList } from 'lucide-react'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string, type?: string }> }) {
    const searchParams = await props.searchParams
    const errorMessage = searchParams?.error
    const isRegistering = searchParams?.type === 'register'

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
            <div className="w-full max-w-md flex flex-col items-center">
                <div className="flex flex-col items-center mb-8 gap-2">
                    <div className="h-12 w-12 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black shadow-lg">
                        <MountainSnow size={28} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">DoReady</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {isRegistering ? "Empieza tu camino al enfoque radical." : "Bienvenido de nuevo. Hagamos que suceda."}
                    </p>
                </div>

                <form className="w-full flex flex-col gap-4 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl border border-zinc-200 dark:border-zinc-800">
                    {errorMessage && (
                        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm mb-2 text-center border border-red-200 dark:border-red-900 animate-pulse">
                            {errorMessage}
                        </div>
                    )}

                    <AnimateIn>
                        {isRegistering && (
                            <div className="space-y-4 mb-4">
                                {/* Name Field */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1" htmlFor="full_name">Nombre</label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={16} />
                                        <input
                                            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                                            id="full_name"
                                            name="full_name"
                                            type="text"
                                            placeholder="Tu nombre aquí"
                                            required={isRegistering}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Gender Field */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1" htmlFor="gender">Género</label>
                                        <div className="relative group">
                                            <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={16} />
                                            <select
                                                id="gender"
                                                name="gender"
                                                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all appearance-none text-zinc-900 dark:text-zinc-50 invalid:text-zinc-400 dark:invalid:text-zinc-600"
                                                required={isRegistering}
                                                defaultValue=""
                                            >
                                                <option value="" disabled hidden>Seleccionar</option>
                                                <option value="male" className="text-zinc-900 dark:text-zinc-50">Hombre</option>
                                                <option value="female" className="text-zinc-900 dark:text-zinc-50">Mujer</option>
                                                <option value="other" className="text-zinc-900 dark:text-zinc-50">Otro</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Birth Date Field */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1" htmlFor="birth_date">Nacimiento</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={16} />
                                            <input
                                                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                                                id="birth_date"
                                                name="birth_date"
                                                type="date"
                                                required={isRegistering}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Standard Auth Fields */}
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1" htmlFor="email">Correo Electrónico</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={16} />
                                    <input
                                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="tu@ejemplo.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 mb-2">
                                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1" htmlFor="password">Contraseña</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={16} />
                                    <input
                                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </AnimateIn>

                    <button
                        formAction={isRegistering ? signup : login}
                        className="w-full mt-4 py-3.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    >
                        {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
                    </button>

                    <div className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-500">
                        {isRegistering ? (
                            <p>
                                ¿Ya tienes cuenta?{' '}
                                <Link href="/login" className="font-bold text-black dark:text-white hover:underline">
                                    Inicia sesión aquí
                                </Link>
                            </p>
                        ) : (
                            <p>
                                ¿No tienes cuenta?{' '}
                                <Link href="/login?type=register" className="font-bold text-black dark:text-white hover:underline">
                                    Regístrate gratis
                                </Link>
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

function AnimateIn({ children }: { children: React.ReactNode }) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
        </div>
    )
}
