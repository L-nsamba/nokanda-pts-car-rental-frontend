import { Fragment } from "react"

// Shared desktop table (md and up). Columns are config-driven so each page controls what's
// rendered per cell; state/handlers stay on the page and are simply closed over in `column.render`.
// `renderExpanded(row)` is optional — return JSX to inject an extra full-width row right under
// a given row (used by Bookings for its inline driver-assignment panel), or null/undefined to skip it.
export default function DataTable({
    columns,
    data,
    getRowKey,
    emptyMessage = 'No records found',
    minWidthClass = 'min-w-[560px]',
    tableClassName = '',
    className = '',
    renderExpanded,
}) {
    return (
        <div className={`hidden md:block bg-white rounded-lg shadow-sm overflow-hidden transition-opacity ${className}`}>
            <div className="overflow-x-auto">
                <table className={`w-full ${minWidthClass} text-sm ${tableClassName}`}>
                    <thead>
                        <tr style={{ backgroundColor: '#15435B' }} className="text-white">
                            {columns.map(col => (
                                <th key={col.key} className={`text-left px-4 py-3 font-medium ${col.headerClassName || ''}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => {
                                const expanded = renderExpanded?.(row)
                                return (
                                    <Fragment key={getRowKey(row)}>
                                        <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            {columns.map(col => (
                                                <td key={col.key} className={`px-4 py-3 ${col.cellClassName || ''}`}>
                                                    {col.render(row)}
                                                </td>
                                            ))}
                                        </tr>
                                        {expanded && (
                                            <tr className="bg-blue-50">
                                                <td colSpan={columns.length} className="px-4 py-3">
                                                    {expanded}
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
