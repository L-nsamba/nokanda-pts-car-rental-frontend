import { useEffect, useState } from "react";
import { timeAgo } from "../utils/timeAgo";
import { useNotifications } from "../context/NotificationsContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHourglassHalf,
  faArrowsRotate,
  faUser,
  faMoneyBill
} from "@fortawesome/free-solid-svg-icons";
import Skeleton from "../components/Skeleton";

// How long a newly-loaded notification stays visually "unread" before it's marked seen
const MARK_READ_DELAY = 3000

export default function Notifications() {
    const { notifications, loading, lastUpdated, refresh, readIds, markAllRead } = useNotifications()
    const [filter, setFilter] = useState('')

    // Give the admin a moment to actually notice the unread state before it clears
    useEffect(() => {
        if (loading || notifications.length === 0) return
        const timer = setTimeout(() => markAllRead(), MARK_READ_DELAY)
        return () => clearTimeout(timer)
    }, [loading, notifications, markAllRead])

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
                    onClick={refresh}
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
                        <div key={i} className="bg-white rounded-lg px-5 py-4 shadow-sm flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                            <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <Skeleton className="h-4 w-40 mb-2" />
                                <Skeleton className="h-3 w-64 max-w-full" />
                            </div>
                            <Skeleton className="h-3 w-12 flex-shrink-0" />
                        </div>
                    ))}
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No notifications</div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filteredNotifications.map(notification => {
                        const isUnread = !readIds.has(notification.id)
                        return (
                        <div
                        key={notification.id}
                        className={`rounded-lg px-5 py-4 shadow-sm flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 transition-colors ${
                            isUnread ? 'bg-blue-50/70' : 'bg-white'
                        }`}>

                            {/* Icon */}
                            <span className="text-xl flex-shrink-0">{notification.icon}</span>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                            <p className={`text-sm flex items-center gap-2 ${isUnread ? 'font-semibold' : 'font-medium'}`} style={{ color: '#15435B' }}>
                                {isUnread && (
                                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" title="Unread"></span>
                                )}
                                <span className="truncate">{notification.title}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 break-words">
                                {notification.detail}
                            </p>
                            </div>

                            {/* Time */}
                            <div className="text-left sm:text-right flex-shrink-0">
                            <p
                                className="text-xs text-gray-400"
                                title={new Date(notification.time).toLocaleString()}
                            >
                                {timeAgo(notification.time)}
                            </p>
                            </div>
                        </div>
                        )
                    })}

                </div>
            )}
        </>
    )

}
