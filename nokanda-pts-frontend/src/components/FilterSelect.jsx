// Shared dropdown filter used above every table/card list, with a leading "All X" option.
// `options` accepts either plain strings (value === label, e.g. vehicle types) or
// { value, label } objects (e.g. status codes that need a human-readable label).
export default function FilterSelect({ value, onChange, allLabel, options, widthClass = 'sm:w-auto' }) {
    return (
        <select
            value={value}
            onChange={onChange}
            className={`border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#15435B] w-full ${widthClass}`}
        >
            <option value="">{allLabel}</option>
            {options.map(opt => (
                <option key={opt.value ?? opt} value={opt.value ?? opt}>
                    {opt.label ?? opt}
                </option>
            ))}
        </select>
    )
}
