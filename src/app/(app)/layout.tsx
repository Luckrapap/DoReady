import AppNavigation from "@/components/AppNavigation";
import AICoach from "@/components/AICoach";
import PageTransition from "@/components/PageTransition";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col-reverse md:flex-row h-[100dvh] overflow-hidden transition-colors duration-500" style={{ backgroundColor: 'var(--background)' }}>
            {/* Navigation: Sidebar on desktop, Bottom Bar on mobile */}
            <AppNavigation />

            {/* Main content area */}
            <main className="flex-1 relative overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto">
                    <PageTransition>
                        {children}
                    </PageTransition>
                </div>
                
                {/* AI Assistant: Now absolute inside the content area */}
                <AICoach />
            </main>
        </div>
    );
}
