import AppNavigation from "@/components/AppNavigation";
import DraggableLayout from "@/components/DraggableLayout";
import PageTransition from "@/components/PageTransition";
import NavigationLoader from "@/components/NavigationLoader";
import { Suspense } from "react";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col-reverse md:flex-row h-[100dvh] overflow-hidden transition-colors duration-500 bg-white dark:bg-[#0a0a0a]">
            {/* Loading Indicator for Route Changes */}
            <Suspense fallback={null}>
                <NavigationLoader />
            </Suspense>

            {/* Navigation: Sidebar on desktop, Absolute Background on mobile */}
            <AppNavigation />

            {/* Main content area wrapped in DraggableLayout for the Reveal gesture */}
            <DraggableLayout>
                <main className="flex-1 relative overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                        <PageTransition>
                            {children}
                        </PageTransition>
                    </div>
                </main>
            </DraggableLayout>
        </div>
    );
}
