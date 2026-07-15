import { useState } from "react"
import { Outlet } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars } from "@fortawesome/free-solid-svg-icons"
import Sidebar from "./Sidebar"

export default function Layout() {
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

            {mobileNavOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-20 md:hidden"
                    onClick={() => setMobileNavOpen(false)}
                ></div>
            )}

            <div className="flex-1 min-w-0 md:ml-48">
                <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
                    <button onClick={() => setMobileNavOpen(true)} style={{ color: '#15435B' }}>
                        <FontAwesomeIcon icon={faBars} className="text-lg" />
                    </button>
                    <span className="font-semibold text-sm" style={{ color: '#15435B' }}>PTS Admin</span>
                </div>

                <div className="p-4 md:p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
