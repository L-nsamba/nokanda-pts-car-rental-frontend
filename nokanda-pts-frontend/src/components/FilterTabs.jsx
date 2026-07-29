// Shared pill-toggle filter bar (as opposed to FilterSelect's dropdown) — a row of buttons
// where one is active at a time. `options` is [{ label, value }].
export default function FilterTabs({ value, onChange, options }) {
    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {options.map(tab => (
                <button
                    key={tab.value}
                    onClick={() => onChange(tab.value)}
                    className={`text-xs px-4 py-2 rounded transition-colors ${
                        value === tab.value
                        ? 'text-white'
                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                    style={value === tab.value ? { backgroundColor: '#15435B' } : {}}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}
