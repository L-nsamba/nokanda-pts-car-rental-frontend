import { useEffect, useState } from "react"
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    plugins,
} from 'chart.js'
import {
  faGauge,
  faBook,
  faIdCard,
  faCar,
  faMoneyBill,
  faBell,
} from "@fortawesome/free-solid-svg-icons";

import { Doughnut, Bar} from 'react-chartjs-2'
import Sidebar from "../components/Sidebar"
import StatCard from "../components/StatCard"
import { getStats, getBookings, getDestinations } from "../services/api"

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, bookingsRes] = await Promise.all([
                    getStats(),
                    getBookings(),
                ])
                setStats(statsRes.data)
                setBookings(bookingsRes.data)
            } catch (err) {
                console.error('Failed to fetch dashboard data', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Bookings for popular destinations chart
    const destinationCounts = bookings.reduce((acc, bookings) => {
        const dest = bookings.destination_id
        acc[dest] = (acc[dest] || 0) + 1
        return acc
    }, {})
    // Extracting and sorting the top 5 destinations
    const topDestinations = Object.entries(destinationCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

    // Bookings for popular vehicle types
    const vehicleCounts = bookings.reduce((acc, booking) => {
        const type = booking.vehicle_type || 'Unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
    }, {})

    const doughnutData = {
        labels: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
        datasets: [{
            data: stats ? [
                stats.bookings_by_status.pending,
                stats.bookings_by_status.confirmed,
                stats.bookings_by_status.completed,
                stats.bookings_by_status.cancelled,
            ] : [],
            backgroundColor: ['#F59E0B', '#15435B', '#10B981', '#EF4444'],
            borderWidth: 0,
        }]
    }

    // Popular destination chart design
    const destinationBarData = {
        labels: topDestinations.map(([id]) => id),
        datasets: [{
            label: 'Bookings',
            data: topDestinations.map(([, count]) => count),
            backgroundColor: '#15435B',
            borderRadius: 4,
        }]
    }

    // Popular vehicle chart design
    const vehicleBarData = {
        labels: Object.keys(vehicleCounts),
        datasets: [{
            label: 'Bookings',
            data: Object.values(vehicleCounts),
            backgroundColor: '#B4B8AB',
            borderRadius: 4,
        }]
    }

    const chartOptions = {
        responsive: true,
        plugins: { legend: { display: false} },
        scales: {
            x: { grid: {display: false} },
            y: { grid: { color: '#f0f0f0' }, ticks: { stepSize: 1}}
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-400">Loading dashboard...</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar></Sidebar>

            {/**Main content */}
            <div className="ml-48 flex-1 p-8">

                {/**Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold" style={{color: '#15435B'}}>
                        Dashboard Overview
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Welcome back, Admin
                    </p>
                </div>

                {/**Stat cards */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <StatCard title="Total Bookings" value={stats?.total_bookings} icon={faBook}></StatCard>
                    <StatCard title="Active Trips" value={stats?.active_trips} icon={faBell}></StatCard>
                    <StatCard title="Available Drivers" value={stats?.available_drivers} icon={faIdCard}></StatCard>
                    <StatCard title="Available Vehicles" value={stats?.available_vehicles} icon={faCar}></StatCard>

                </div>
            </div>
        </div>
    )


}