// Shared list-pagination footer: "Showing X-Y of Z" plus Previous/page-numbers/Next controls.
// Page numbers collapse to first, last, and a window around the current page, with "..." gaps.
export default function Pagination({ currentPage, totalPages, total, limit, onPageChange, itemLabel = 'records' }) {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <p className="text-xs text-gray-400">
                Showing {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, total)} of {total} {itemLabel}
            </p>

            <div className="flex items-center gap-2">
                <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="text-xs px-3 py-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                )
                .reduce((acc, page, idx, arr) => {
                    if (idx > 0 && page - arr[idx - 1] > 1) {
                    acc.push('...')
                    }
                    acc.push(page)
                    return acc
                }, [])
                .map((page, idx) =>
                    page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="text-xs text-gray-400 px-1">...</span>
                    ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                        currentPage === page
                            ? 'text-white border-transparent'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        style={currentPage === page ? { backgroundColor: '#15435B' } : {}}
                    >
                        {page}
                    </button>
                    )
                )
                }
                <button
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="text-xs px-3 py-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                Next
                </button>
            </div>
        </div>
    )
}
