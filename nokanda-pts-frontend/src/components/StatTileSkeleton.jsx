import Skeleton from "./Skeleton"

// Loading placeholder for the simple label+number stat tiles (Drivers/Vehicles summary rows).
export default function StatTileSkeleton() {
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-6 w-10" />
        </div>
    )
}
