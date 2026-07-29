import { useEffect, useState } from "react";
import { timeAgo } from "../utils/timeAgo";
import { useNotifications } from "../context/NotificationsContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
} from "@fortawesome/free-solid-svg-icons";
import Skeleton from "../components/Skeleton";
import PageHeader from "../components/PageHeader";
import FilterTabs from "../components/FilterTabs";
import CardList from "../components/CardList";

const FILTER_OPTIONS = [
    { label: 'All', value: '' },
    { label: 'New Bookings', value: 'NEW_BOOKING' },
    { label: 'Status Updates', value: 'STATUS_UPDATE' },
    { label: 'Driver Assigned', value: 'DRIVER_ASSIGNED' },
    { label: 'Price Updates', value: 'PRICE_UPDATE' },
]

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
            <PageHeader
                title="Notifications Overview"
                subtitle={lastUpdated ? `Last updated ${timeAgo(lastUpdated)}` : 'Loading...'}
                action={
                    <button
                        onClick={refresh}
                        className="flex items-center justify-center gap-2 text-xs px-4 py-2 rounded text-white hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: '#15435B' }}
                    >
                        <FontAwesomeIcon icon={faArrowsRotate} />
                        Refresh Now
                    </button>
                }
            />

            {/**Filter tabs */}
            <FilterTabs value={filter} onChange={setFilter} options={FILTER_OPTIONS} />

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
            ) : (
                <CardList
                    data={filteredNotifications}
                    emptyMessage="No notifications"
                    wrapperClassName="flex flex-col gap-3"
                    emptyClassName="text-center py-8 text-gray-400"
                    renderCard={(notification) => {
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
                    }}
                />
            )}
        </>
    )

}
