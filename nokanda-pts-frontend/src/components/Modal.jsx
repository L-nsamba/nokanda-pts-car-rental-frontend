// Shared modal shell: backdrop + centered card + title/subtitle + Cancel/Confirm footer.
// Rendering is controlled by the caller (`{condition && <Modal>...</Modal>}`) — this component has no open/closed state of its own.
// Form fields go in `children`, laid out with the standard vertical field spacing.
export default function Modal({
    onClose,
    title,
    subtitle,
    children,
    onConfirm,
    confirmLabel = 'Save',
    confirmDisabled = false,
    cancelLabel = 'Cancel',
    widthClass = 'w-96',
}) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className={`bg-white rounded-lg p-6 ${widthClass} max-w-[90vw] shadow-xl`}
                onClick={(e) => e.stopPropagation()}
            >

                <h2 className="text-lg font-bold mb-1" style={{ color: '#15435B' }}>
                    {title}
                </h2>
                {subtitle && <p className="text-sm text-gray-400 mb-5">{subtitle}</p>}

                <div className="flex flex-col gap-4">
                    {children}
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded text-sm border border-gray-200 text-gray-500 hover:bg-gray-50"
                    >
                        {cancelLabel}
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={confirmDisabled}
                        className="flex-1 py-2 rounded text-sm text-white disabled:opacity-50"
                        style={{ backgroundColor: '#15435B' }}
                    >
                        {confirmLabel}
                    </button>
                </div>

            </div>
        </div>
    )
}
