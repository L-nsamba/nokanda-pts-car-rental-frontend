// Shared chart panel wrapper (Dashboard's 2x2 chart grid) — title bar + white card shell,
// the chart itself is passed in as children so this stays agnostic of which chart.js type it is.
export default function ChartCard({ title, children }) {
    return (
        <div className="bg-white rounded-lg p-5 shadow-sm">
            <h2 className="text-xs text-center font-semibold mb-4" style={{ color: '#15435B' }}>
                {title}
            </h2>
            {children}
        </div>
    )
}
