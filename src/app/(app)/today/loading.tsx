import Skeleton from "@/components/Skeleton";

export default function Loading() {
    return (
        <main className="min-h-screen flex justify-center py-12 px-4">
            <div className="w-full max-w-xl">
                {/* Header Skeleton */}
                <header className="mb-12 flex items-start justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-12 w-24 rounded-2xl" />
                </header>

                {/* Progress Skeleton */}
                <div className="mb-10 space-y-4">
                     <div className="flex justify-between items-end">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-12" />
                     </div>
                     <Skeleton className="h-3 w-full rounded-full" />
                </div>

                {/* Tasks Title Skeleton */}
                <div className="mb-6">
                    <Skeleton className="h-4 w-16 mb-3" />
                    <Skeleton className="h-14 w-full rounded-2xl" />
                </div>

                {/* Task Items Skeletons */}
                <div className="space-y-4 mt-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        </main>
    )
}
