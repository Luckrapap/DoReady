import CheckDayCalendar from '@/components/CheckDayCalendar'

export default function CheckDayPage() {
    return (
        <main className="min-h-screen py-4 px-4 bg-zinc-50 dark:bg-zinc-950/30 flex items-center justify-center">
            <div className="w-full max-w-4xl mx-auto">
                <header className="mb-4 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-1">
                        CheckDay
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md mx-auto">
                        Track your daily consistency. Click to check, right-click to mark with an X.
                    </p>
                </header>

                <CheckDayCalendar />
            </div>
        </main>
    )
}
