import CheckDayCalendar from '@/components/CheckDayCalendar'

export default function CheckDayPage() {
    return (
        <main 
            className="min-h-screen py-4 px-4 flex items-center justify-center selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-500"
            style={{ backgroundColor: 'var(--background)' }}
        >
            <div className="w-full max-w-4xl mx-auto">
                <header className="mb-12 flex flex-col items-center justify-center text-center gap-10">
                    <div className="flex flex-col items-center">
                        <h1 className="font-playfair font-medium text-6xl md:text-8xl tracking-tight text-zinc-900 dark:text-zinc-50 py-2">
                            CheckDay
                        </h1>
                    </div>
                </header>

                <CheckDayCalendar />
            </div>
        </main>
    )
}
