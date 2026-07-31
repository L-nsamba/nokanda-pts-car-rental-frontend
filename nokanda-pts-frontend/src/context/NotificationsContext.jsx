import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { getBookings, getPricing } from "../services/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faHourglassHalf,
  faCalendarCheck,
  faClipboardCheck,
  faCalendarXmark,
  faCar,
  faMoneyBill
} from "@fortawesome/free-solid-svg-icons"

const POLL_INTERVAL = 15000
const READ_STORAGE_KEY = 'pts_read_notifications'

// Same status -> color language as the Bookings status pills, so a glance at either page reads the same way
const STATUS_ICONS = {
    PENDING: <FontAwesomeIcon icon={faHourglassHalf} className="text-amber-500" />,
    CONFIRMED: <FontAwesomeIcon icon={faCalendarCheck} className="text-blue-500" />,
    COMPLETED: <FontAwesomeIcon icon={faClipboardCheck} className="text-green-600" />,
    CANCELLED: <FontAwesomeIcon icon={faCalendarXmark} className="text-red-500" />,
}

function loadReadIds() {
    try {
        return new Set(JSON.parse(localStorage.getItem(READ_STORAGE_KEY)) || [])
    } catch {
        return new Set()
    }
}

function saveReadIds(ids) {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...ids]))
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
            id: `updated-${booking.booking_id}-${booking.updated_at}`,
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
            id: `driver-${booking.booking_id}-${booking.updated_at}`,
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
            id: `price-${price.pricing_id}-${price.updated_at}`,
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

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [readIds, setReadIds] = useState(loadReadIds)
    const intervalRef = useRef(null)

    const fetchAndProcess = useCallback(async () => {
        try {
            const [bookingRes, pricingRes] = await Promise.all([
                getBookings(),
                getPricing()
            ])
            setNotifications(generateNotifications(bookingRes.data, pricingRes.data))
            setLastUpdated(new Date())
        } catch (err) {
            console.error('Failed to fetch notifications', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAndProcess()
        intervalRef.current = setInterval(fetchAndProcess, POLL_INTERVAL)
        return () => clearInterval(intervalRef.current)
    }, [fetchAndProcess])

    // Marks every notification currently loaded as read/seen, persisted so the badge stays cleared across reloads
    const markAllRead = useCallback(() => {
        setReadIds(prev => {
            const next = new Set(prev)
            notifications.forEach(n => next.add(n.id))
            saveReadIds(next)
            return next
        })
    }, [notifications])

    const unreadCount = notifications.filter(n => !readIds.has(n.id)).length

    return (
        <NotificationsContext.Provider value={{
            notifications,
            loading,
            lastUpdated,
            refresh: fetchAndProcess,
            readIds,
            markAllRead,
            unreadCount,
        }}>
            {children}
        </NotificationsContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationsContext)
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationsProvider')
    }
    return context
}
