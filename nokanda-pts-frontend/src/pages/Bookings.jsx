import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import { getBookings, getDrivers } from "../services/api"
import API from "../services/api"

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function Bookings() {
    const [bookings, setBookings] = useState([])
    const [drivers, setDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('')
    const [search, setSearch] = useState('')
    const [assigningId, setAssigningId] = useState(null)
    const [selectedDriver, setSelectedDriver] = useState('')
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookingRes, driverRes] =  await Promise.all([
                    getBookings(),
                    getDrivers
                ])
                setBookings(bookingRes.data)
                setDrivers(driverRes.data)
            } catch (err) {
                console.error('Failed to fetch bookings', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    //Booking status updates//
    const handleStatusUpdate =  async (bookingId, newStatus) => {
        try {
            await APT.put(`/bookings/${bookingId}`, {status: newStatus})
            setBookings(prev =>
                prev.map(b => b.booking_id === bookingId ? { ...b, status: newStatus} : b)
            )
        } catch (err) {
            console.error('Failed to update status', err)
        }
    }

    //Driver assignment handling//
    const handleDriverAssign = async (bookingId) => {
        if (!selectedDriver) return
        setUpdating(true)
        try {
            await API.put(`/bookings/${bookingId}`, {driver_id: selectedDriver})
            const driver = drivers.find(d => d.driver_id === selectedDriver)
            setBookings(prev =>
                prev.map(b => b.booking_id === bookingId ? { ...b, driver_id: selectedDriver, driver_name: driver?.name || selectedDriver } : b)
            )
            setAssigningId(null)
            setSelectedDriver('')
        } catch (err) {
            console.error('Failed to assign driver', err)
        } finally{
            setUpdating(false)
        }
    }

    // Booking filtration
    const filteredBookings = bookings.filter(b => {
        const matchesStatus = statusFilter ? b.status === statusFilter : true
        const matchesSearch = search ? b.destination_name?.toLowerCase().includes(search.toLowerCase()) ||
                                       b.vehicle_name?.toLowerCase().includes(search.toLowerCase()) ||
                                       b.driver_name?.toLowerCase().includes(search.toLowerCase()) 
                                       : true
                                    return matchesStatus  && matchesSearch
    })

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-400">Loading bookings...</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar></Sidebar>

            <div className="ml-48 flex-1 p-8">

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
                <div className="flex gap-3 mb-6">
                    <input
                    type="text"
                    placeholder="Search destination, vehicle, driver..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-200 rounded px-3 py-2 text-sm w-72 outline-none focus:border-[#15435B]">
                    </input>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#15435B]"
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>

                    </select>
                </div>
                
                {/**Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ backgroundColor: '#15435B' }} className="text-white">
                                <th className="text-left px-4 py-3 font-medium">Destination</th>
                                <th className="text-left px-4 py-3 font-medium">Vehicle</th>
                                <th className="text-left px-4 py-3 font-medium">Start Date</th>
                                <th className="text-left px-4 py-3 font-medium">Days</th>
                                <th className="text-left px-4 py-3 font-medium">Total (RWF)</th>
                                <th className="text-left px-4 py-3 font-medium">Status</th>
                                <th className="text-left px-4 py-3 font-medium">Driver</th>
                                <th className="text-left px-4 py-3 font-medium">Actions</th>
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
                                        <td className="px-4 py-3">{booking.vehicle_name}</td>
                                        <td className="px-4 py-3">{booking.start_date}</td>
                                        <td className="px-4 py-3">{booking.num_days}</td>

                                        <td className="px-4 py-3">
                                            {booking.total_price?.toLocaleString()}
                                        </td>

                                        <td className="px-4 py-3">
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
                                        </td>

                                        <td className="px-4 py-3 text-gray-500">
                                            {booking.driver_name || (
                                            <span className="text-yellow-500 text-xs">Unassigned</span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <button
                                            onClick={() => setAssigningId(
                                                assigningId === booking.booking_id ? null : booking.booking_id
                                            )}
                                            className="text-xs px-3 py-1 rounded text-white transition-opacity hover:opacity-80"
                                            style={{ backgroundColor: '#15435B' }}
                                            >
                                            {assigningId === booking.booking_id ? 'Cancel' : 'Assign Driver'}
                                            </button>
                                        </td>
                                    </tr>

                                    {/**Driver assignment dropdown row */}
                                    {assigningId === booking.bookingId && (
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
                                                <option key={driver.driver_id} value={driver.driver_id}>
                                                {driver.name} — {driver.status} — {driver.capabilities}
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

                {/**Pagination hint*/}
                <p className="text-xs text-gray-400 mt-4">
                    Showing {filteredBookings.length} of {bookings.length} bookings
                </p>
            </div>
        </div>
    )
}
