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
    const handleStatusUpdate =  async (bookingId, newStatus)
    try {
        await APT.put(`/bookings/${bookingId}`, {status: newStatus})
        setBookings(prev =>
            prev.map(b => b.booking_id === bookingId ? { ...b, status: newStatus} : b)
        )
    } catch (err) {
        console.error('Failed to update status', err)
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
}
