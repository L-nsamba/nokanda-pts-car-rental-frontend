import { useEffect, useState, useRef } from "react";
import { timeAgo } from "../utils/timeAgo";
import { getBookings, getPricing } from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHourglassHalf,
  faCalendarCheck,
  faClipboardCheck,
  faCalendarXmark,
  faCar,
  faArrowsRotate,
  faUser,
  faMoneyBill
} from "@fortawesome/free-solid-svg-icons";
import Skeleton from "../components/Skeleton";

const POLL_INTERVAL = 15000

const STATUS_ICONS =  {
    PENDING: <FontAwesomeIcon icon={faHourglassHalf}></FontAwesomeIcon>,
    CONFIRMED: <FontAwesomeIcon icon={faCalendarCheck}></FontAwesomeIcon>,
    COMPLETED: <FontAwesomeIcon icon={faClipboardCheck}></FontAwesomeIcon>,
    CANCELLED: <FontAwesomeIcon icon={faCalendarXmark}></FontAwesomeIcon>,
}

function generateNotifications(bookings, pricing) {
    const notifications = []

    bookings.forEach(booking => {
        const createdAt = new Date(booking.created_at)
        const updatedAt = new Date(booking.updated_at)
        const timeDiff = Math.abs(updatedAt - createdAt)

        // New booking notification
        notifications.push({
            id:  `created-${booking.booking_id}`,
            type: 'NEW_BOOKING',
            icon: <FontAwesomeIcon icon={faHourglassHalf} />,
            title: 'New booking request',
            detail: `${booking.vehicle_type || 'Vehicle'} → ${booking.destination_name || 'Destination'} — ${booking.num_days} day${booking.num_days > 1 ? 's' : ''}`,
            time: booking.created_at,
            booking_id: booking.booking_id,
        })

        // Status update notification (appears only after a notification is existing)
        if (timeDiff > 5000 && booking.status != 'PENDING') {
            notifications.push({
            id: `updated-${booking.booking_id}`,
            type: 'STATUS_UPDATE',
            icon: STATUS_ICONS[booking.status],
            title: `Booking ${booking.status.toLowerCase()}`,
            detail: `${booking.vehicle_type || 'Vehicle'} → ${booking.destination_name || 'Destination'}`,
            time: booking.updated_at,
            booking_id: booking.booking_id,
            })
        }

        // Driver assigned notification
        if (booking.driver_name && timeDiff > 5000) {
            notifications.push({
            id: `driver-${booking.booking_id}`,
            type: 'DRIVER_ASSIGNED',
            icon: <FontAwesomeIcon icon={faCar} />,
            title: `Driver assigned`,
            detail: `${booking.driver_name} assigned to ${booking.destination_name || 'destination'}`,
            time: booking.updated_at,
            booking_id: booking.booking_id,
            })
        }
    })

    pricing.forEach(price => {
        const createdAt = new Date(price.created_at)
        const updatedAt = new Date(price.updated_at)
        const timeDiff = Math.abs(updatedAt - createdAt)

        // Price update notification (only once a seeded price has actually been edited)
        if (timeDiff > 5000) {
            notifications.push({
            id: `price-${price.pricing_id}`,
            type: 'PRICE_UPDATE',
            icon: <FontAwesomeIcon icon={faMoneyBill} />,
            title: 'Price updated',
            detail: `${price.vehicle_type || 'Vehicle'} → ${price.destination_name || 'Destination'} — ${price.unit_price?.toLocaleString() || '—'} RWF`,
            time: price.updated_at,
            booking_id: null,
            })
        }
    })
    // Sort by most recent first
    return notifications.sort((a, b) => new Date(b.time) - new Date(a.time))
}

export default function Notifications() {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] =  useState(true)
    const [lastUpdated, setLastUpdated] =  useState(null)
    const [filter, setFilter] = useState('')
    const intervalRef =  useRef(null)

    const fetchAndProcess = async () => {
        try {
            const [bookingRes, pricingRes] = await Promise.all([
                getBookings(),
                getPricing()
            ])
            const generated = generateNotifications(bookingRes.data, pricingRes.data)
            setNotifications(generated)
            setLastUpdated(new Date())
        } catch (err) {
            console.error('Failed to fetch notifications', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect (() => {
        fetchAndProcess()
        intervalRef.current = setInterval(fetchAndProcess, POLL_INTERVAL)
        return () => clearInterval(intervalRef.current)
    }, [])

    const filteredNotifications = notifications.filter(n => 
        filter ? n.type === filter : true
    )

    return (
        <>
            {/**Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#15435B'}}>
                        Notifications Overview
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                    {lastUpdated
                        ? `Last updated ${timeAgo(lastUpdated)}`
                        : 'Loading...'}
                    </p>
                </div>

                {/** Manual refresh */}
                <button
                    onClick={fetchAndProcess}
                    className="flex items-center justify-center gap-2 text-xs px-4 py-2 rounded text-white hover:opacity-80 transition-opacity self-start"
                    style={{ backgroundColor: '#15435B' }}
                >
                    <FontAwesomeIcon icon={faArrowsRotate} />
                    Refresh Now
                </button>
            </div>

            {/**Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
            {[
                { label: 'All', value: '' },
                { label: 'New Bookings', icon: <FontAwesomeIcon icon={faHourglassHalf}></FontAwesomeIcon>, value: 'NEW_BOOKING' },
                { label: 'Status Updates', icon: <FontAwesomeIcon icon={faArrowsRotate}></FontAwesomeIcon>, value: 'STATUS_UPDATE' },
                { label: 'Driver Assigned', icon: <FontAwesomeIcon icon={faUser}></FontAwesomeIcon>,value: 'DRIVER_ASSIGNED' },
                { label: 'Price Updates', icon: <FontAwesomeIcon icon={faMoneyBill}></FontAwesomeIcon>, value: 'PRICE_UPDATE' },
            ].map(tab => (
                <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`text-xs px-4 py-2 rounded transition-colors ${
                    filter === tab.value
                    ? 'text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
                style={filter === tab.value ? { backgroundColor: '#15435B' } : {}}
                >
                {tab.label}
                </button>
            ))}
            </div>

            {/** Notification count */}
            <p className="text-xs text-gray-400 mb-4">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            </p>

            {/** Notifications list */}
            {loading ? (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg px-5 py-4 shadow-sm flex items-start gap-4">
                            <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-40 mb-2" />
                                <Skeleton className="h-3 w-64" />
                            </div>
                            <Skeleton className="h-3 w-12 flex-shrink-0" />
                        </div>
                    ))}
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No notifications</div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filteredNotifications.map(notification => (
                        <div
                        key={notification.id}
                        className="bg-white rounded-lg px-5 py-4 shadow-sm flex items-start gap-4">

                            {/* Icon */}
                            <span className="text-xl mt-0.5">{notification.icon}</span>

                            {/* Content */}
                            <div className="flex-1">
                            <p className="text-sm font-medium" style={{ color: '#15435B' }}>
                                {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {notification.detail}
                            </p>
                            </div>

                            {/* Time */}
                            <div className="text-right flex-shrink-0">
                            <p
                                className="text-xs text-gray-400"
                                title={new Date(notification.time).toLocaleString()}
                            >
                                {timeAgo(notification.time)}
                            </p>
                            </div>
                        </div>
                    ))}

                </div>
            )}
        </>
    )

}