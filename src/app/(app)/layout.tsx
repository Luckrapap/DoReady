import AppNavigation from "@/components/AppNavigation";
import AICoach from "@/components/AICoach";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen overflow-hidden transition-colors duration-500" style={{ backgroundColor: 'var(--background)' }}>
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
