import { useEffect, useState } from "react"
import { getAvailableDrivers } from "../services/api"
import API from "../services/api"
import { useToast } from "../context/ToastContext"
import Skeleton from "../components/Skeleton"
import Pagination from "../components/Pagination"
import StatusBadge from "../components/StatusBadge"
import Modal from "../components/Modal"
import FilterBarSkeleton from "../components/FilterBarSkeleton"
import PageHeader from "../components/PageHeader"
import DataTable from "../components/DataTable"
import CardList from "../components/CardList"
import SearchInput from "../components/SearchInput"
import FilterSelect from "../components/FilterSelect"

const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const LIMIT = 10

export default function Bookings() {
    const { showToast } = useToast()
    const [bookings, setBookings] = useState([])
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [drivers, setDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('')
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState('')
    const [editingBooking, setEditingBooking] = useState(null)
    const [editForm, setEditForm] = useState({ status: '', driver_id: '' })
    const [saving, setSaving] = useState(false)

    const fetchData = async () => {
        try {
            const skip = (currentPage - 1) * LIMIT
            const [bookingRes, countRes, driverRes] =  await Promise.all([
                API.get('/bookings', { params: { skip, limit: LIMIT, sort: sort || undefined } }),
                API.get('/bookings/count'),
                getAvailableDrivers()
            ])
            setBookings(bookingRes.data)
            setTotal(countRes.data)
            setDrivers(driverRes.data)
        } catch (err) {
            console.error('Failed to fetch bookings', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [currentPage, sort])

    const handleEditClick = (booking) => {
        setEditingBooking(booking)
        // Driver select starts blank — the assignable list is AVAILABLE drivers only, so a booking's
        // current (now TRAVELLING) driver never appears in it anyway; "Currently assigned" is shown separately.
        setEditForm({ status: booking.status, driver_id: '' })
    }

    const handleEditSave = async () => {
        setSaving(true)
        try {
            const statusChanged = editForm.status !== editingBooking.status
            const driverChanged = !!editForm.driver_id

            if (statusChanged) {
                await API.patch(`/bookings/${editingBooking.booking_id}/status-update`, { status: editForm.status })
            }
            if (driverChanged) {
                await API.patch(`/bookings/${editingBooking.booking_id}/assign-driver`, { driver_id: editForm.driver_id })
            }

            const assignedDriver = driverChanged ? drivers.find(d => d.user_id === editForm.driver_id) : null
            setBookings(prev =>
                prev.map(b => b.booking_id === editingBooking.booking_id
                    ? {
                        ...b,
                        ...(statusChanged ? { status: editForm.status } : {}),
                        ...(driverChanged ? { driver_id: editForm.driver_id, driver_name: assignedDriver?.name || b.driver_name } : {}),
                    }
                    : b
                )
            )

            // Refresh the available-drivers list if this freed a driver (status → terminal) or took one off the market (assignment)
            const freedDriver = statusChanged && (editForm.status === 'COMPLETED' || editForm.status === 'CANCELLED')
            if (freedDriver || driverChanged) {
                const driverRes = await getAvailableDrivers()
                setDrivers(driverRes.data)
            }

            setEditingBooking(null)
            showToast('Booking updated successfully', 'success')
        } catch (err) {
            console.error('Failed to update booking', err)
            showToast(err.response?.data?.detail || 'Failed to update booking')
        } finally {
            setSaving(false)
        }
    }

    // Booking filtration
    const filteredBookings = bookings.filter(b => {
        const matchesStatus = statusFilter ? b.status === statusFilter : true
        const matchesSearch = search ? b.destination_name?.toLowerCase().includes(search.toLowerCase()) ||
                                       b.vehicle_type?.toLowerCase().includes(search.toLowerCase()) ||
                                       b.driver_name?.toLowerCase().includes(search.toLowerCase()) 
                                       : true
                                    return matchesStatus  && matchesSearch
    })

    const totalPages = Math.ceil(total / LIMIT)

    const bookingColumns = [
        {
            key: 'destination',
            header: 'Destination',
            headerClassName: 'w-[15%]',
            render: (booking) => booking.destination_name,
        },
        {
            key: 'vehicle',
            header: 'Vehicle',
            headerClassName: 'w-[18%]',
            render: (booking) => booking.vehicle_type,
        },
        {
            key: 'start_date',
            header: 'Start Date',
            headerClassName: 'w-[12%] whitespace-nowrap',
            cellClassName: 'whitespace-nowrap',
            render: (booking) => booking.start_date,
        },
        {
            key: 'days',
            header: 'Days',
            headerClassName: 'w-[6%]',
            render: (booking) => booking.num_days,
        },
        {
            key: 'total',
            header: 'Total (RWF)',
            headerClassName: 'w-[12%] whitespace-nowrap',
            cellClassName: 'whitespace-nowrap',
            render: (booking) => booking.total_price?.toLocaleString(),
        },
        {
            key: 'status',
            header: 'Status',
            headerClassName: 'w-[12%]',
            render: (booking) => (
                <StatusBadge
                    status={booking.status}
                    colorMap={STATUS_COLORS}
                    label={booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                />
            ),
        },
        {
            key: 'driver',
            header: 'Driver',
            headerClassName: 'w-[12%]',
            cellClassName: 'text-gray-500',
            render: (booking) => booking.driver_name || (
                <span className="text-amber-500 text-xs">Unassigned</span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'w-[15%]',
            render: (booking) => (
                booking.status === 'COMPLETED' || booking.status === 'CANCELLED' ? (
                <span className="text-xs text-gray-300">—</span>
                ) : (
                <button
                onClick={() => handleEditClick(booking)}
                className="w-full whitespace-nowrap text-xs px-3 py-1 rounded text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: '#15435B' }}
                >
                Edit
                </button>
                )
            ),
        },
    ]

    if (loading) {
        return (
            <>
                <PageHeader title="Bookings Overview" subtitle="Manage and assign drivers to bookings" />

                <FilterBarSkeleton filterCount={2} />

                <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] table-fixed text-sm">
                            <thead>
                                <tr style={{ backgroundColor: '#15435B' }} className="text-white">
                                    <th className="w-[15%] text-left px-4 py-3 font-medium">Destination</th>
                                    <th className="w-[15%] text-left px-4 py-3 font-medium">Vehicle</th>
                                    <th className="w-[12%] whitespace-nowrap text-left px-4 py-3 font-medium">Start Date</th>
                                    <th className="w-[6%] text-left px-4 py-3 font-medium">Days</th>
                                    <th className="w-[12%] whitespace-nowrap text-left px-4 py-3 font-medium">Total (RWF)</th>
                                    <th className="w-[12%] text-left px-4 py-3 font-medium">Status</th>
                                    <th className="w-[12%] text-left px-4 py-3 font-medium">Driver</th>
                                    <th className="w-[16%] text-left px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        {Array.from({ length: 8 }).map((__, j) => (
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
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-32 mb-2" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-6 w-16 flex-shrink-0" />
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                {Array.from({ length: 4 }).map((__, j) => (
                                    <Skeleton key={j} className="h-3 w-full" />
                                ))}
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
            <PageHeader title="Bookings Overview" subtitle="Manage and assign drivers to bookings" />

            {/**Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <SearchInput
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search destination, vehicle, driver..."
                />
                <FilterSelect
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    allLabel="All Statuses"
                    options={[
                        { value: 'PENDING', label: 'Pending' },
                        { value: 'CONFIRMED', label: 'Confirmed' },
                        { value: 'COMPLETED', label: 'Completed' },
                        { value: 'CANCELLED', label: 'Cancelled' },
                    ]}
                />
                <FilterSelect
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setCurrentPage(1) }}
                    allLabel="Newest First"
                    options={[
                        { value: 'price_asc', label: 'Price: Low to High' },
                        { value: 'price_desc', label: 'Price: High to Low' },
                        { value: 'date_asc', label: 'Date: Earliest First' },
                        { value: 'date_desc', label: 'Date: Latest First' },
                        { value: 'days_asc', label: 'Days: Low to High' },
                        { value: 'days_desc', label: 'Days: High to Low' },
                        { value: 'destination_asc', label: 'Destination: A–Z' },
                        { value: 'vehicle_asc', label: 'Vehicle: A–Z' },
                    ]}
                />
            </div>

            {/**Table (medium screens and up) */}
            <DataTable
                columns={bookingColumns}
                data={filteredBookings}
                getRowKey={(booking) => booking.booking_id}
                emptyMessage="No bookings found"
                minWidthClass="min-w-[800px]"
                tableClassName="table-fixed"
            />

            {/**Cards (below medium screens) */}
            <CardList
                data={filteredBookings}
                emptyMessage="No bookings found"
                renderCard={(booking) => (
                    <div key={booking.booking_id} className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="min-w-0">
                                <p className="font-medium text-sm truncate" style={{ color: '#15435B' }}>
                                    {booking.destination_name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{booking.vehicle_type}</p>
                            </div>

                            <StatusBadge
                                status={booking.status}
                                colorMap={STATUS_COLORS}
                                label={booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                                className="flex-shrink-0"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div>
                                <span className="block text-gray-400">Start Date</span>
                                <span className="text-gray-600">{booking.start_date}</span>
                            </div>
                            <div>
                                <span className="block text-gray-400">Days</span>
                                <span className="text-gray-600">{booking.num_days}</span>
                            </div>
                            <div>
                                <span className="block text-gray-400">Total (RWF)</span>
                                <span className="font-medium" style={{ color: '#15435B' }}>
                                    {booking.total_price?.toLocaleString()}
                                </span>
                            </div>
                            <div>
                                <span className="block text-gray-400">Driver</span>
                                {booking.driver_name || (
                                <span className="text-yellow-500">Unassigned</span>
                                )}
                            </div>
                        </div>

                        {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                            <button
                            onClick={() => handleEditClick(booking)}
                            className="w-full text-xs px-3 py-1.5 rounded text-white transition-opacity hover:opacity-80"
                            style={{ backgroundColor: '#15435B' }}
                            >
                            Edit
                            </button>
                        )}
                    </div>
                )}
            />

            {/** Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={total}
                limit={LIMIT}
                onPageChange={setCurrentPage}
                itemLabel="bookings"
            />

            {/**Edit Modal */}
            {editingBooking && (
                <Modal
                    onClose={() => setEditingBooking(null)}
                    title="Edit Booking"
                    subtitle={`${editingBooking.destination_name} — ${editingBooking.vehicle_type}`}
                    onConfirm={handleEditSave}
                    confirmDisabled={saving}
                    confirmLabel={saving ? 'Saving...' : 'Save'}
                >
                    <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                            Status
                        </label>
                        <select
                        value={editForm.status}
                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#15435B]">
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                            Driver
                        </label>
                        <select
                        value={editForm.driver_id}
                        onChange={(e) => setEditForm(prev => ({ ...prev, driver_id: e.target.value }))}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#15435B]">
                        <option value="">{editingBooking.driver_name ? 'Keep current driver' : 'Choose a driver'}</option>
                        {drivers.map(driver => (
                            <option key={driver.user_id} value={driver.user_id}>
                            {driver.name} — {driver.driver_capabilities}
                            </option>
                        ))}
                        </select>
                        {editingBooking.driver_name && (
                            <p className="text-xs text-gray-400 mt-1">Currently assigned: {editingBooking.driver_name}</p>
                        )}
                    </div>
                </Modal>
            )}
        </>
    )
}
