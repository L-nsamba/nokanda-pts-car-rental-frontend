import { useEffect, useState, useRef } from "react";
import { timeAgo } from "../utils/timeAgo";
import { getBookings } from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHourglassHalf,
  faCalendarCheck,
  faClipboardCheck,
  faCalendarXmark,
  faCar
} from "@fortawesome/free-solid-svg-icons";

const POLL_INTERVAL = 15000

const STATUS_ICONS =  {
    PENDING: <FontAwesomeIcon icon={faHourglassHalf}></FontAwesomeIcon>,
    CONFIRMED: <FontAwesomeIcon icon={faCalendarCheck}></FontAwesomeIcon>,
    COMPLETED: <FontAwesomeIcon icon={faClipboardCheck}></FontAwesomeIcon>,
    CANCELLED: <FontAwesomeIcon icon={faCalendarXmark}></FontAwesomeIcon>,
}

function generateNotifications(bookings) {
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
            const res = await getBookings()
            const generated = generateNotifications(res.data)
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
}