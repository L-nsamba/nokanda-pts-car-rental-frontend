import { useEffect, useState } from "react"
import { getDrivers } from "../services/api"
import API from "../services/api"
import { useToast } from "../context/ToastContext"

const STATUS_COLORS = {
  AVAILABLE: 'bg-green-100 text-green-700',
  UNAVAILABLE: 'bg-red-100 text-red-700',
  TRAVELLING: 'bg-blue-100 text-blue-700',
}

// Display-only labels — TRAVELLING is the backend/enum value, "Booked" is just how it reads to the admin
const STATUS_LABELS = {
  AVAILABLE: 'Available',
  UNAVAILABLE: 'Unavailable',
  TRAVELLING: 'Booked',
}

export default function Drivers() {
    const { showToast } = useToast()
    const [drivers, setDrivers] =  useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('')
    const [capabilityFilter, setCapabilityFilter] = useState('')
    const [search, setSearch] = useState('')
    const [editingDriver, setEditingDriver] = useState(null)
    const [editForm, setEditForm] = useState({availability_status: '', driver_capabilities: ''})
    const [saving, setSaving] = useState(false)


useEffect(() => {
    fetchDrivers()
}, [])

    const fetchDrivers = async () => {
        try {
            const res = await getDrivers()
            setDrivers(res.data)
        } catch (err) {
            console.error('Failed to fetch drivers', err)
        } finally {
            setLoading(false)
        }
    }

    const handleEditClick = (driver)  => {
        setEditingDriver(driver)
        setEditForm({
            availability_status: driver.availability_status,
            driver_capabilities: driver.driver_capabilities
        })
    }

    const handleEditSave = async () => {
        setSaving(true)
            try {
                await API.put(`/drivers/${editingDriver.user_id}`, editForm)
                setDrivers(prev =>
                    prev.map(d =>
                        d.user_id === editingDriver.user_id
                        ? {...d, ...editForm}
                        : d
                    )
                )
                setEditingDriver(null)
            } catch(err) {
                console.error('Failed to update driver', err)
                showToast(err.response?.data?.detail || 'Failed to update driver')
            } finally {
                setSaving(false)
        }
    }

    const filteredDrivers = drivers.filter(d => {
        const matchesStatus = statusFilter ? d.availability_status === statusFilter : true
        const matchesCapability = capabilityFilter ? d.driver_capabilities === capabilityFilter : true
        const matchesSearch = search 
            ? d.name?.toLowerCase().includes(search.toLowerCase())
            : true
            return matchesStatus && matchesCapability && matchesSearch
    })

    if (loading) {
        return <p className="text-gray-400">Loading drivers...</p>
    }

    return (
        <>
            {/**Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: '#15435B'}}>
                    Drivers Overview
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                    Manage driver profiles and availability
                </p>
            </div>

            {/**Summary stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {['AVAILABLE', 'TRAVELLING', 'UNAVAILABLE'].map(status => (
                    <div key={status} className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">{STATUS_LABELS[status]}</p>
                        <p className="text-2xl font-bold mt-1" style={{ color: '#15435B'}}>
                            {drivers.filter(d => d.availability_status === status).length}
                        </p>
                    </div>
                ))}
            </div>

            {/**Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-200 rounded px-3 py-2 text-sm w-full sm:w-64 outline-none focus:border-[#15435B]">
                </input>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-200 rounded px-3 py-2 text-sm outline-none w-full sm:w-auto">
                    <option value="">All Statuses</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="TRAVELLING">Booked</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                </select>

                <select
                    value={capabilityFilter}
                    onChange={(e) => setCapabilityFilter(e.target.value)}
                    className="border border-gray-200 rounded px-3 py-2 text-sm outline-none w-full sm:w-auto">
                    <option value="">All Capabilities</option>
                    <option value="MANUAL">Manual</option>
                    <option value="AUTOMATIC">Automatic</option>
                    <option value="BOTH">Both</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
                <thead>
                <tr style={{ backgroundColor: '#15435B' }} className="text-white">
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium">Capabilities</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Completed Trips</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredDrivers.length === 0 ? (
                    <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                        No drivers found
                    </td>
                    </tr>
                ) : (
                    filteredDrivers.map((driver, index) => (
                    <tr
                        key={driver.user_id}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                        <td className="px-4 py-3 font-medium">{driver.name}</td>
                        <td className="px-4 py-3 text-gray-500">{driver.driver_capabilities}</td>
                        <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_COLORS[driver.availability_status]}`}>
                            {STATUS_LABELS[driver.availability_status]}
                        </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                        {driver.completed_trips}
                        </td>
                        <td className="px-4 py-3">
                        <button
                            onClick={() => handleEditClick(driver)}
                            className="text-xs px-3 py-1 rounded text-white hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: '#15435B' }}
                        >
                            Edit
                        </button>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>
            </div>

            <p className="text-xs  text-gray-400 mt-4">
                Showing {filteredDrivers.length} of {drivers.length} drivers
            </p>

            {/**Edit Modal */}
            {editingDriver && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-80 max-w-[90vw] shadow-xl">

                        <h2 className="text-lg font-bold mb-1" style={{ color: '#15435B'}}>
                            Edit Driver
                        </h2>
                        <p className="text-sm text-gray-400 mb-5">{editingDriver.name}</p>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                                    Status
                                </label>
                                <select
                                value={editForm.availability_status}
                                onChange={(e) => setEditForm(prev => ({ ...prev, availability_status: e.target.value}))}
                                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#15435B]">

                                <option value="AVAILABLE">Available</option>
                                <option value="TRAVELLING">Booked</option>
                                <option value="UNAVAILABLE">Unavailable</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                                    Capabilities
                                </label>

                                <select
                                value={editForm.driver_capabilities}
                                onChange={(e) => setEditForm(prev => ({ ...prev, driver_capabilities: e.target.value }))}
                                className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#15435B]"
                                >
                                <option value="MANUAL">Manual</option>
                                <option value="AUTOMATIC">Automatic</option>
                                <option value="BOTH">Both</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                            onClick={() => setEditingDriver(null)}
                            className="flex-1 py-2 rounded text-sm border-gray-200 text-gray-500 hover:bg-gray-50">
                                Cancel
                            </button>

                            <button
                            onClick={handleEditSave}
                            disabled={saving}
                            className="flex-1 py-2 rounded text-sm text-white disabled:opacity-50"
                            style={{ backgroundColor: '#15435B' }}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>

                        </div>

                    </div>

                </div>
            )}
        </>
    )
}