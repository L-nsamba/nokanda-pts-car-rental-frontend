import Skeleton from "./Skeleton"

// Loading placeholder for the search-box + dropdown-filter row shown above every table/card list.
export default function FilterBarSkeleton({ filterCount = 2, searchWidthClass = 'sm:w-72' }) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Skeleton className={`h-9 w-full ${searchWidthClass}`} />
            {Array.from({ length: filterCount }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full sm:w-40" />
            ))}
        </div>
    )
}
