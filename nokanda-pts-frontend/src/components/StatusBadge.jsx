// Shared read-only status pill. `colorMap` is the page's own enum->Tailwind-class map;
// `label` defaults to the raw status value — pass an explicit label to reformat/rename it for display.
export default function StatusBadge({ status, colorMap, label, size = 'md', className = '' }) {
    const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2 py-1'
    return (
        <span className={`text-xs ${padding} rounded font-medium ${colorMap[status] || ''} ${className}`}>
            {label ?? status}
        </span>
    )
}
