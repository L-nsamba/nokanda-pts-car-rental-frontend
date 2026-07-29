import { useEffect, useState } from "react"
import { getDrivers } from "../services/api"
import API from "../services/api"
import { useToast } from "../context/ToastContext"
import Skeleton from "../components/Skeleton"
import StatusBadge from "../components/StatusBadge"
import Modal from "../components/Modal"
import FilterBarSkeleton from "../components/FilterBarSkeleton"
import StatTileSkeleton from "../components/StatTileSkeleton"
import DataTable from "../components/DataTable"
import CardList from "../components/CardList"
import SearchInput from "../components/SearchInput"
import FilterSelect from "../components/FilterSelect"
import StatTile from "../components/StatTile"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"

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
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [createForm, setCreateForm] = useState({
        user_name: '',
        email: '',
        password: '',
        phone_number: '',
        driver_capabilities: 'MANUAL'
    })
    const [creating, setCreating] = useState(false)


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

    const emptyCreateForm = { user_name: '', email: '', password: '', phone_number: '', driver_capabilities: 'MANUAL' }

    const handleCreateSave = async () => {
        if (!createForm.user_name || !createForm.email || !createForm.password || !createForm.phone_number) return
        setCreating(true)
        try {
            const res = await API.post('/drivers/onboard', createForm)
            setDrivers(prev => [res.data, ...prev])
            setShowCreateModal(false)
            setCreateForm(emptyCreateForm)
        } catch (err) {
            console.error('Failed to add driver', err)
            showToast(err.response?.data?.detail || 'Failed to add driver')
        } finally {
            setCreating(false)
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

    const driverColumns = [
        {
            key: 'name',
            header: 'Name',
            cellClassName: 'font-medium',
            render: (driver) => driver.name,
        },
        {
            key: 'capabilities',
            header: 'Capabilities',
            cellClassName: 'text-gray-500',
            render: (driver) => driver.driver_capabilities,
        },
        {
            key: 'status',
            header: 'Status',
            render: (driver) => (
                <StatusBadge status={driver.availability_status} colorMap={STATUS_COLORS} label={STATUS_LABELS[driver.availability_status]} />
            ),
        },
        {
            key: 'completed_trips',
            header: 'Completed Trips',
            cellClassName: 'text-gray-500',
            render: (driver) => driver.completed_trips,
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (driver) => (
                <button
                    onClick={() => handleEditClick(driver)}
                    className="text-xs px-3 py-1 rounded text-white hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: '#15435B' }}
                >
                    Edit
                </button>
            ),
        },
    ]

    if (loading) {
        return (
            <>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold" style={{ color: '#15435B'}}>
                        Drivers Overview
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Manage driver profiles and availability
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <StatTileSkeleton key={i} />
                    ))}
                </div>

                <FilterBarSkeleton filterCount={2} searchWidthClass="sm:w-64" />

                <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
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
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        {Array.from({ length: 5 }).map((__, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <Skeleton className="h-4 w-full max-w-[100px]" />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/** Mobile skeleton cards */}
                <div className="md:hidden flex flex-col gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-6 w-16 flex-shrink-0" />
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                            <Skeleton className="h-8 w-full" />
                        </div>
                    ))}
                </div>
            </>
        )
    }

    return (
        <>
            {/**Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#15435B'}}>
                        Drivers Overview
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Manage driver profiles and availability
                    </p>
                </div>

                <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 text-xs px-4 py-2 rounded text-white hover:opacity-80 transition-opacity self-start"
                style={{ backgroundColor: '#15435B' }}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Driver
                </button>
            </div>

            {/**Summary stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {['AVAILABLE', 'TRAVELLING', 'UNAVAILABLE'].map(status => (
                    <StatTile
                        key={status}
                        label={STATUS_LABELS[status]}
                        value={drivers.filter(d => d.availability_status === status).length}
                        valueStyle={{ color: '#15435B' }}
                    />
                ))}
            </div>

            {/**Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <SearchInput
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name..."
                    widthClass="sm:w-64"
                />

                <FilterSelect
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    allLabel="All Statuses"
                    options={[
                        { value: 'AVAILABLE', label: 'Available' },
                        { value: 'TRAVELLING', label: 'Booked' },
                        { value: 'UNAVAILABLE', label: 'Unavailable' },
                    ]}
                />

                <FilterSelect
                    value={capabilityFilter}
                    onChange={(e) => setCapabilityFilter(e.target.value)}
                    allLabel="All Capabilities"
                    options={[
                        { value: 'MANUAL', label: 'Manual' },
                        { value: 'AUTOMATIC', label: 'Automatic' },
                        { value: 'BOTH', label: 'Both' },
                    ]}
                />
            </div>

            {/* Table (medium screens and up) */}
            <DataTable
                columns={driverColumns}
                data={filteredDrivers}
                getRowKey={(driver) => driver.user_id}
                emptyMessage="No drivers found"
                minWidthClass="min-w-[640px]"
            />

            {/** Cards (below medium screens) */}
            <CardList
                data={filteredDrivers}
                emptyMessage="No drivers found"
                renderCard={(driver) => (
                    <div key={driver.user_id} className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <p className="font-medium text-sm truncate">{driver.name}</p>
                            <StatusBadge status={driver.availability_status} colorMap={STATUS_COLORS} label={STATUS_LABELS[driver.availability_status]} className="flex-shrink-0" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div>
                                <span className="block text-gray-400">Capabilities</span>
                                <span className="text-gray-600">{driver.driver_capabilities}</span>
                            </div>
                            <div>
                                <span className="block text-gray-400">Completed Trips</span>
                                <span className="text-gray-600">{driver.completed_trips}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleEditClick(driver)}
                            className="w-full text-xs px-3 py-1.5 rounded text-white hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: '#15435B' }}
                        >
                            Edit
                        </button>
                    </div>
                )}
            />

            <p className="text-xs  text-gray-400 mt-4">
                Showing {filteredDrivers.length} of {drivers.length} drivers
            </p>

            {/**Edit Modal */}
            {editingDriver && (
                <Modal
                    onClose={() => setEditingDriver(null)}
                    title="Edit Driver"
                    subtitle={editingDriver.name}
                    onConfirm={handleEditSave}
                    confirmDisabled={saving}
                    confirmLabel={saving ? 'Saving...' : 'Save'}
                    widthClass="w-80"
                >
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
                </Modal>
            )}

            {/**Add Driver Modal */}
            {showCreateModal && (
                <Modal
                    onClose={() => {
                        setShowCreateModal(false)
                        setCreateForm(emptyCreateForm)
                    }}
                    title="Add Driver"
                    subtitle="New drivers start out Available"
                    onConfirm={handleCreateSave}
                    confirmDisabled={creating || !createForm.user_name || !createForm.email || !createForm.password || !createForm.phone_number}
                    confirmLabel={creating ? 'Adding...' : 'Add Driver'}
                >
                    <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                        Full Name
                        </label>
                        <input
                        type="text"
                        value={createForm.user_name}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, user_name: e.target.value }))}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#15435B]"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                        Email
                        </label>
                        <input
                        type="email"
                        value={createForm.email}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#15435B]"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                        Password
                        </label>
                        <input
                        type="password"
                        value={createForm.password}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#15435B]"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                        Phone Number
                        </label>
                        <input
                        type="text"
                        value={createForm.phone_number}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, phone_number: e.target.value }))}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#15435B]"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                        Capabilities
                        </label>
                        <select
                        value={createForm.driver_capabilities}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, driver_capabilities: e.target.value }))}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#15435B]"
                        >
                        <option value="MANUAL">Manual</option>
                        <option value="AUTOMATIC">Automatic</option>
                        <option value="BOTH">Both</option>
                        </select>
                    </div>
                </Modal>
            )}
        </>
    )
}