import AppNavigation from "@/components/AppNavigation";
import AICoach from "@/components/AICoach";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
            {/* Sidebar will be hidden on mobile */}
            <AppNavigation />

            {/* Main content area */}
            <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
                {children}
            </div>

            {/* AI Assistant FAB and Chat */}
            <AICoach />
        </div>
    );
}
