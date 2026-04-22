import AppNavigation from "@/components/AppNavigation";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import PageTransition from "@/components/PageTransition";
import NavigationLoader from "@/components/NavigationLoader";
import { Suspense } from "react";
import { LoadingProvider } from "@/components/LoadingProvider";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <LoadingProvider>
            <div className="flex flex-col-reverse md:flex-row h-[100dvh] overflow-hidden bg-[var(--background)]">
                {/* Signaler for Route Changes - No longer renders UI itself */}
                <Suspense fallback={null}>
                    <NavigationLoader />
                </Suspense>

                {/* Navigation: Sidebar on desktop, Absolute Background on mobile */}
                <AppNavigation />

                {/* Main content area wrapped in ResponsiveLayout for the Reveal gesture */}
                <ResponsiveLayout>
                    <main className="flex-1 relative overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                            <PageTransition>
                                {children}
                            </PageTransition>
                        </div>
                    </main>
                </ResponsiveLayout>
            </div>
        </LoadingProvider>
    );
}
