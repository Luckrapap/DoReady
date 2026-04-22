import CheckDayInterface from '@/components/CheckDayInterface'

export default function CheckDayPage() {
    return (
        <main className="h-[100dvh] flex justify-center pt-safe-top pb-12 px-4 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black overflow-hidden">
            <div className="w-full max-w-xl h-full flex flex-col pt-8">
                <section className="flex flex-col h-full">
                    <header className="flex flex-col gap-1 px-4 flex-shrink-0">
                        <div className="flex items-end justify-center">
                            {/* Left phanton box for horizontal balance - ZERO WIDTH */}
                            <div className="opacity-0 w-0 overflow-hidden pointer-events-none bg-zinc-200 dark:bg-zinc-800 rounded-full px-6 py-2.5 mt-2 mb-1 flex items-center justify-center">
                                <span className="text-4xl md:text-5xl font-light">0/0</span>
                            </div>
                            <h1 className="font-bold text-6xl md:text-8xl tracking-tighter text-zinc-900 dark:text-zinc-50 relative bottom-1.5 whitespace-nowrap">
                                CheckDay
                            </h1>
                            {/* Right phanton box for horizontal balance and height match - ZERO WIDTH */}
                            <div className="opacity-0 w-0 overflow-hidden pointer-events-none bg-zinc-200 dark:bg-zinc-800 rounded-full px-6 py-2.5 mt-2 mb-1 flex items-center justify-center">
                                <span className="text-4xl md:text-5xl font-light">0/0</span>
                            </div>
                        </div>
                        {/* Placeholder for date line to match header height */}
                        <p className="text-base font-medium text-transparent select-none">Agenda</p>
                    </header>
                    <CheckDayInterface />
                </section>
            </div>
        </main>
    )
}
