// Shared list wrapper. Defaults to the "mobile card companion to a desktop table" shape
// (hidden md:block table pairs), but `wrapperClassName`/`emptyClassName` can be overridden
// for a plain always-visible grid (e.g. Vehicles, which has no separate desktop table).
// Each card's markup stays page-specific via `renderCard(row)` (include the `key` prop
// on whatever element you return, same as before this was extracted).
export default function CardList({
    data,
    emptyMessage = 'No records found',
    renderCard,
    className = '',
    wrapperClassName = 'md:hidden flex flex-col gap-3',
    emptyClassName = 'bg-white rounded-lg shadow-sm p-8 text-center text-gray-400',
}) {
    return (
        <div className={`${wrapperClassName} ${className}`}>
            {data.length === 0 ? (
                <div className={emptyClassName}>
                    {emptyMessage}
                </div>
            ) : (
                data.map(renderCard)
            )}
        </div>
    )
}
