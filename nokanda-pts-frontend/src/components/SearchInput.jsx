// Shared free-text search box used above every table/card list.
export default function SearchInput({ value, onChange, placeholder, widthClass = 'sm:w-72' }) {
    return (
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`border border-gray-200 rounded px-3 py-2 text-sm w-full ${widthClass} outline-none focus:border-[#15435B]`}
        />
    )
}
