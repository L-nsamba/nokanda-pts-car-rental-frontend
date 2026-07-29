// Shared mobile card-list wrapper (below md). Handles the empty state and the flex column
// layout; each card's markup stays page-specific via `renderCard(row)` (include the `key` prop
// on whatever element you return, same as before this was extracted).
export default function CardList({ data, emptyMessage = 'No records found', renderCard, className = '' }) {
    return (
        <div className={`md:hidden flex flex-col gap-3 ${className}`}>
            {data.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-400">
                    {emptyMessage}
                </div>
            ) : (
                data.map(renderCard)
            )}
        </div>
    )
}
