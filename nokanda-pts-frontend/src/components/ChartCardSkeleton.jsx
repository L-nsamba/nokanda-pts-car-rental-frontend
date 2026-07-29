import Skeleton from "./Skeleton"

// Loading placeholder matching ChartCard's shape (Dashboard's 2x2 chart grid).
export default function ChartCardSkeleton() {
    return (
        <div className="bg-white rounded-lg p-5 shadow-sm">
            <Skeleton className="h-3 w-32 mx-auto mb-4" />
            <Skeleton className="h-56 w-full" />
        </div>
    )
}
