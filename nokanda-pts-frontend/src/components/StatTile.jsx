// Shared label+number stat tile (Drivers/Vehicles summary rows). Pass `valueStyle` for an inline
// color (e.g. the brand color) or `valueClassName` to add a Tailwind color class instead.
export default function StatTile({ label, value, valueClassName = '', valueStyle }) {
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${valueClassName}`} style={valueStyle}>
                {value}
            </p>
        </div>
    )
}
