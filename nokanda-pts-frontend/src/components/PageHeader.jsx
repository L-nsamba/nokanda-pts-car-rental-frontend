// Shared page title + subtitle row, with an optional action button (e.g. "Add Driver") on the right.
export default function PageHeader({ title, subtitle, action }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: '#15435B' }}>{title}</h1>
                <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
            </div>
            {action && <div className="self-start">{action}</div>}
        </div>
    )
}
