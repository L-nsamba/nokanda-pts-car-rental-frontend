import { useEffect, useState } from "react"
import { getAvailableDrivers } from "../services/api"
import API from "../services/api"
import { useToast } from "../context/ToastContext"
import Skeleton from "../components/Skeleton"
import Pagination from "../components/Pagination"
import StatusBadge from "../components/StatusBadge"

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
    const [assigningId, setAssigningId] = useState(null)
    const [selectedDriver, setSelectedDriver] = useState('')
    const [updating, setUpdating] = useState(false)

    const fetchData = async () => {
        try {
            const skip = (currentPage - 1) * LIMIT
            const [bookingRes, countRes, driverRes] =  await Promise.all([
                API.get('/bookings', { params: { skip, limit: LIMIT } }),
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
    }, [currentPage])

    //Booking status updates//
    const handleStatusUpdate =  async (bookingId, newStatus) => {
        try {
            await API.patch(`/bookings/${bookingId}/status-update`, {status: newStatus})
            setBookings(prev =>
                prev.map(b => b.booking_id === bookingId ? { ...b, status: newStatus} : b)
            )
            // Completing/cancelling frees the driver, refresh the available list
            if (newStatus === 'COMPLETED' || newStatus === 'CANCELLED') {
                const driverRes = await getAvailableDrivers()
                setDrivers(driverRes.data)
            }
        } catch (err) {
            console.error('Failed to update status', err)
            showToast(err.response?.data?.detail || 'Failed to update status')
        }
    }

    //Driver assignment handling//
    const handleDriverAssign = async (bookingId) => {
        if (!selectedDriver) return
        setUpdating(true)
        try {
            await API.patch(`/bookings/${bookingId}/assign-driver`, {driver_id: selectedDriver})
            const driver = drivers.find(d => d.user_id === selectedDriver)
            setBookings(prev =>
                prev.map(b => b.booking_id === bookingId ? { ...b, driver_id: selectedDriver, driver_name: driver?.name || selectedDriver } : b)
            )
            setAssigningId(null)
            setSelectedDriver('')
            // Refresh available drivers now that this one (and any previous driver) changed status
            const driverRes = await getAvailableDrivers()
            setDrivers(driverRes.data)
        } catch (err) {
            console.error('Failed to assign driver', err)
            showToast(err.response?.data?.detail || 'Failed to assign driver')
        } finally{
            setUpdating(false)
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

    if (loading) {
        return (
            <>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold" style={{ color: '#15435B'}}>
                        Bookings Overview
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Manage and assign drivers to bookings
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <Skeleton className="h-9 w-full sm:w-72" />
                    <Skeleton className="h-9 w-full sm:w-40" />
                </div>

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
            <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: '#15435B'}}>
                    Bookings Overview
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                    Manage and assign drivers to bookings
                </p>
            </div>

            {/**Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                type="text"
                placeholder="Search destination, vehicle, driver..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-200 rounded px-3 py-2 text-sm w-full sm:w-72 outline-none focus:border-[#15435B]">
                </input>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#15435B] w-full sm:w-auto"
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>

                </select>
            </div>

            {/**Table (medium screens and up) */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] table-fixed text-sm">
                    <thead>
                        <tr style={{ backgroundColor: '#15435B' }} className="text-white">
                            <th className="w-[15%] text-left px-4 py-3 font-medium">Destination</th>
                            <th className="w-[18%] text-left px-4 py-3 font-medium">Vehicle</th>
                            <th className="w-[12%] whitespace-nowrap text-left px-4 py-3 font-medium">Start Date</th>
                            <th className="w-[6%] text-left px-4 py-3 font-medium">Days</th>
                            <th className="w-[12%] whitespace-nowrap text-left px-4 py-3 font-medium">Total (RWF)</th>
                            <th className="w-[12%] text-left px-4 py-3 font-medium">Status</th>
                            <th className="w-[12%] text-left px-4 py-3 font-medium">Driver</th>
                            <th className="w-[15%] text-left px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredBookings.length === 0 ? (
                            <tr>
                               <td colSpan={8} className="text-center py-8 text-gray-400">
                                    No bookings found
                                </td>
                            </tr>
                        ) : (
                            filteredBookings.map((booking, index) => (
                                <>
                                <tr
                                key={booking.booking_id}
                                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                >
                                    <td className="px-4 py-3">{booking.destination_name}</td>
                                    <td className="px-4 py-3">{booking.vehicle_type}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{booking.start_date}</td>
                                    <td className="px-4 py-3">{booking.num_days}</td>

                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {booking.total_price?.toLocaleString()}
                                    </td>

                                    <td className="px-4 py-3">
                                        {booking.status === 'COMPLETED' || booking.status === 'CANCELLED' ? (
                                        <StatusBadge
                                            status={booking.status}
                                            colorMap={STATUS_COLORS}
                                            label={booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                                        />
                                        ) : (
                                        <select
                                        value={booking.status}
                                        onChange={(e) => handleStatusUpdate(booking.booking_id, e.target.value)}
                                        className={`text-xs px-2 py-1 rounded font-medium border-0 outline-none cursor-pointer ${STATUS_COLORS[booking.status]}`}
                                        >
                                        <option value="PENDING">Pending</option>
                                        <option value="CONFIRMED">Confirmed</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                        </select>
                                        )}
                                    </td>

                                    <td className="px-4 py-3 text-gray-500">
                                        {booking.driver_name || (
                                        <span className="text-amber-500 text-xs">Unassigned</span>
                                        )}
                                    </td>

                                    <td className="px-4 py-3">
                                        {booking.status === 'COMPLETED' || booking.status === 'CANCELLED' ? (
                                        <span className="text-xs text-gray-300">—</span>
                                        ) : (
                                        <button
                                        onClick={() => setAssigningId(
                                            assigningId === booking.booking_id ? null : booking.booking_id
                                        )}
                                        className="w-full whitespace-nowrap text-xs px-3 py-1 rounded text-white transition-opacity hover:opacity-80"
                                        style={{ backgroundColor: '#15435B' }}
                                        >
                                        {assigningId === booking.booking_id ? 'Cancel' : booking.driver_name ? 'Reassign Driver' : 'Assign Driver'}
                                        </button>
                                        )}
                                    </td>
                                </tr>

                                {/**Driver assignment dropdown row */}
                                {assigningId === booking.booking_id && (
                                    <tr key={`assign-${booking.booking_id}`} className="bg-blue-50">
                                    <td colSpan={8} className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500">Select driver:</span>
                                        <select
                                        value={selectedDriver}
                                        onChange={(e) => setSelectedDriver(e.target.value)}
                                        className="border border-gray-200 rounded px-3 py-1 text-sm outline-none"
                                        >
                                        <option value="">Choose a driver</option>
                                        {drivers.map(driver => (
                                            <option key={driver.user_id} value={driver.user_id}>
                                            {driver.name} — {driver.driver_capabilities}
                                            </option>
                                        ))}
                                        </select>
                                        <button
                                        onClick={() => handleDriverAssign(booking.booking_id)}
                                        disabled={!selectedDriver || updating}
                                        className="text-xs px-3 py-1 rounded text-white disabled:opacity-50"
                                        style={{ backgroundColor: '#15435B' }}
                                        >
                                        {updating ? 'Assigning...' : 'Confirm'}
                                        </button>
                                    </div>
                                    </td>
                                </tr>
                                )}
                            </>
                            ))
                        )}
                    </tbody>
                </table>
              </div>
            </div>

            {/**Cards (below medium screens) */}
            <div className="md:hidden flex flex-col gap-3">
                {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-400">
                        No bookings found
                    </div>
                ) : (
                    filteredBookings.map(booking => (
                        <div key={booking.booking_id} className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="min-w-0">
                                    <p className="font-medium text-sm truncate" style={{ color: '#15435B' }}>
                                        {booking.destination_name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{booking.vehicle_type}</p>
                                </div>

                                {booking.status === 'COMPLETED' || booking.status === 'CANCELLED' ? (
                                <StatusBadge
                                    status={booking.status}
                                    colorMap={STATUS_COLORS}
                                    label={booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                                    className="flex-shrink-0"
                                />
                                ) : (
                                <select
                                value={booking.status}
                                onChange={(e) => handleStatusUpdate(booking.booking_id, e.target.value)}
                                className={`text-xs px-2 py-1 rounded font-medium border-0 outline-none cursor-pointer flex-shrink-0 ${STATUS_COLORS[booking.status]}`}
                                >
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                                </select>
                                )}
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
                                onClick={() => setAssigningId(
                                    assigningId === booking.booking_id ? null : booking.booking_id
                                )}
                                className="w-full text-xs px-3 py-1.5 rounded text-white transition-opacity hover:opacity-80"
                                style={{ backgroundColor: '#15435B' }}
                                >
                                {assigningId === booking.booking_id ? 'Cancel' : booking.driver_name ? 'Reassign Driver' : 'Assign Driver'}
                                </button>
                            )}

                            {assigningId === booking.booking_id && (
                                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
                                    <span className="text-xs text-gray-500">Select driver:</span>
                                    <select
                                    value={selectedDriver}
                                    onChange={(e) => setSelectedDriver(e.target.value)}
                                    className="border border-gray-200 rounded px-3 py-2 text-sm outline-none w-full"
                                    >
                                    <option value="">Choose a driver</option>
                                    {drivers.map(driver => (
                                        <option key={driver.user_id} value={driver.user_id}>
                                        {driver.name} — {driver.driver_capabilities}
                                        </option>
                                    ))}
                                    </select>
                                    <button
                                    onClick={() => handleDriverAssign(booking.booking_id)}
                                    disabled={!selectedDriver || updating}
                                    className="w-full text-xs px-3 py-2 rounded text-white disabled:opacity-50"
                                    style={{ backgroundColor: '#15435B' }}
                                    >
                                    {updating ? 'Assigning...' : 'Confirm'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/** Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={total}
                limit={LIMIT}
                onPageChange={setCurrentPage}
                itemLabel="bookings"
            />
        </>
    )
}
