import Link from 'next/link'
import { login, signup, signInAsGuest } from './actions'
import { MountainSnow, User, Mail, Lock, Calendar, ClipboardList, Sparkles, Zap, ArrowRight, LogIn, ArrowLeft } from 'lucide-react'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string, type?: string }> }) {
    const searchParams = await props.searchParams
    const errorMessage = searchParams?.error
    const type = searchParams?.type
    const showChoice = !type // Show choice if no type is selected
    const isRegistering = type === 'register'

    if (showChoice) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-white dark:bg-zinc-950 px-4 py-12 font-outfit">
                <div className="w-full max-w-4xl flex flex-col items-center">
                    <div className="flex flex-col items-center mb-16 gap-4">
                        <div className="h-16 w-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-black shadow-2xl animate-in zoom-in duration-700">
                            <MountainSnow size={36} />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 uppercase">DoReady</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium tracking-tight">Selecciona tu puerta de entrada al enfoque radical</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4 max-w-4xl">
                        <SelectionCard
                            href="/login?type=login"
                            title="Login"
                            description="Bienvenido de nuevo"
                            icon={<LogIn size={32} />}
                            delay={0}
                        />
                        <SelectionCard
                            href="/login?type=register"
                            title="Register"
                            description="Empezar ahora"
                            icon={<Sparkles size={32} />}
                            delay={0.1}
                            highlight
                        />
                        <SelectionCard
                            action={signInAsGuest}
                            title="Guest"
                            description="Invitado Especial"
                            icon={<Zap size={32} />}
                            delay={0.2}
                        />
                    </div>

                    <Link href="/" className="mt-16 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 text-xs font-black uppercase tracking-[0.4em] transition-all">
                        ← Volver al inicio
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
            <div className="w-full max-w-md flex flex-col items-center">
                <div className="flex flex-col items-center mb-8 gap-2 relative w-full">
                    <Link
                        href="/login"
                        className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group"
                        title="Volver a la selección"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Volver</span>
                    </Link>

                    <Link href="/login" className="h-12 w-12 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black shadow-lg hover:scale-110 transition-transform">
                        <MountainSnow size={28} />
                    </Link>
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

                </form>
            </div>
        </div>
    )
}

function SelectionCard({ href, action, title, description, icon, delay, disabled = false, highlight = false }: {
    href?: string,
    action?: any,
    title: string,
    description: string,
    icon: React.ReactNode,
    delay: number,
    disabled?: boolean,
    highlight?: boolean
}) {
    const cardContent = (
        <div className={`p-10 rounded-[3rem] border flex flex-col items-center gap-6 transition-all duration-500 text-center relative overflow-hidden group h-full w-full
            ${disabled
                ? 'bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 opacity-60 cursor-not-allowed'
                : highlight
                    ? 'bg-black dark:bg-white border-transparent text-white dark:text-black shadow-2xl hover:scale-105 active:scale-95'
                    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-black dark:hover:border-white shadow-xl hover:scale-105 active:scale-95'
            }`}
        >
            <div className={`p-6 rounded-2xl transition-all duration-500 ${highlight
                ? 'bg-white/10 text-white dark:bg-black/10 dark:text-black'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black'
                }`}>
                {icon}
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-widest">{title}</h3>
                <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${highlight ? 'text-zinc-400' : 'text-zinc-500'}`}>{description}</p>
            </div>
            {!disabled && (
                <div className={`absolute top-6 right-6 p-2 rounded-full border transition-all ${highlight ? 'border-white/20' : 'border-zinc-200 opacity-0 group-hover:opacity-100'}`}>
                    <ArrowRight size={16} />
                </div>
            )}
        </div>
    )

    const animationClasses = "animate-in fade-in slide-in-from-bottom-4 duration-700 h-full w-full block"
    const animationStyle = { animationDelay: `${delay}s` }

    if (disabled) return <div className={animationClasses} style={animationStyle}>{cardContent}</div>

    if (action) {
        return (
            <form action={action} className={animationClasses} style={animationStyle}>
                <button type="submit" className="w-full h-full text-left outline-none block">
                    {cardContent}
                </button>
            </form>
        )
    }

    return (
        <Link href={href!} className={animationClasses} style={animationStyle}>
            {cardContent}
        </Link>
    )
}

function AnimateIn({ children }: { children: React.ReactNode }) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
        </div>
    )
}
