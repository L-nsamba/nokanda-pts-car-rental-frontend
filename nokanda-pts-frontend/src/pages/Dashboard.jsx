import { useEffect, useState } from "react"
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    DoughnutController,
    LineController,
    PointElement,
    LineElement,
    Filler,
} from 'chart.js'

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    DoughnutController,
    LineController,
    PointElement,
    LineElement,
    Filler,
)
import {
  faGauge,
  faBook,
  faIdCard,
  faCar,
  faMoneyBill,
  faBell,
} from "@fortawesome/free-solid-svg-icons";

import { Doughnut, Bar, Line} from 'react-chartjs-2'
import StatCard from "../components/StatCard"
import Skeleton from "../components/Skeleton"
import { getStats, getBookings } from "../services/api"

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
    const destinationCounts = bookings.reduce((acc, booking) => {
        const dest = booking.destination_name
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

    // Bookings created over time
    const bookingsByDate = bookings.reduce((acc, booking) => {
        const date = (booking.created_at || '').slice(0, 10)
        acc[date] = (acc[date] || 0) + 1
        return acc
    }, {})
    const bookingTrend = Object.entries(bookingsByDate).sort(([a], [b]) => a.localeCompare(b))

    const doughnutData = {
        labels: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
        datasets: [{
            data: stats ? [
                stats.booking_by_status.PENDING,
                stats.booking_by_status.CONFIRMED,
                stats.booking_by_status.COMPLETED,
                stats.booking_by_status.CANCELLED,
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

    // Booking trend chart design
    const trendLineData = {
        labels: bookingTrend.map(([date]) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [{
            label: 'Bookings',
            data: bookingTrend.map(([, count]) => count),
            borderColor: '#15435B',
            backgroundColor: 'rgba(21, 67, 91, 0.1)',
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: '#15435B',
        }]
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false} },
        scales: {
            x: { grid: {display: false} },
            y: { grid: { color: '#f0f0f0' }, ticks: { stepSize: 1}}
        }
    }

    // Horizontal bar so long vehicle type labels don't get squeezed against a fixed-height chart
    const vehicleChartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { color: '#f0f0f0' }, ticks: { stepSize: 1 } },
            y: { grid: { display: false } }
        }
    }

    if (loading) {
        return (
            <>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold" style={{color: '#15435B'}}>
                        Dashboard Overview
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Welcome back, Admin
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg p-5 shadow-sm flex items-center gap-4">
                            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                            <div className="flex-1">
                                <Skeleton className="h-3 w-16 mb-2" />
                                <Skeleton className="h-4 w-10" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg p-5 shadow-sm">
                            <Skeleton className="h-3 w-32 mx-auto mb-4" />
                            <Skeleton className="h-56 w-full" />
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
                <h1 className="text-2xl font-bold" style={{color: '#15435B'}}>
                    Dashboard Overview
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                    Welcome back, Admin
                </p>
            </div>

            {/**Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Bookings" value={stats?.total_bookings} icon={faBook}></StatCard>
                <StatCard title="Active Trips" value={stats?.active_trips} icon={faBell}></StatCard>
                <StatCard title="Available Drivers" value={stats?.available_drivers} icon={faIdCard}></StatCard>
                <StatCard title="Available Vehicles" value={stats?.available_vehicles} icon={faCar}></StatCard>
            </div>

            {/**Charts: 2x2 grid, each panel takes half the row width */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/**Booking status (donut chart) */}
                <div className="bg-white rounded-lg p-5 shadow-sm">
                    <h2 className="text-xs text-center font-semibold mb-4" style={{ color: '#15435B'}}>
                        STATUS BREAKDOWN
                    </h2>
                    <div className="flex justify-center">
                        <div className="w-full max-w-xs h-56">
                            <Doughnut
                                data={doughnutData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            align: 'center',
                                            labels: { font: { size: 11 }, boxWidth: 10, padding: 12 }
                                        }
                                    }
                                }}
                            >
                            </Doughnut>
                        </div>
                    </div>
                </div>

                {/**Popular destinations */}
                <div className="bg-white rounded-lg p-5 shadow-sm">
                    <h2 className="text-xs text-center font-semibold mb-4" style={{ color: '#15435B' }}>
                        POPULAR DESTINATIONS
                    </h2>
                    <div className="h-56">
                        <Bar data={destinationBarData} options={chartOptions}></Bar>
                    </div>
                </div>

                {/**Most used vehicle types */}
                <div className="bg-white rounded-lg p-5 shadow-sm">
                    <h2 className="text-xs text-center font-semibold mb-4" style={{ color: '#15435B' }}>
                        MOST USED VEHICLES
                    </h2>
                    <div className="h-56">
                        <Bar data={vehicleBarData} options={vehicleChartOptions}></Bar>
                    </div>
                </div>

                {/**Booking trend over time */}
                <div className="bg-white rounded-lg p-5 shadow-sm">
                    <h2 className="text-xs text-center font-semibold mb-4" style={{ color: '#15435B' }}>
                        BOOKING TREND
                    </h2>
                    <div className="h-56">
                        <Line data={trendLineData} options={chartOptions}></Line>
                    </div>
                </div>
            </div>
        </>
    )
}