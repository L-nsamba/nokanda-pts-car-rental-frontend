import axios from "axios";

const API =  axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

// Attaching token to requests
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Redirection back to login when token expires
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href  = '/'
        }
        return Promise.reject(error)
    }
)

export const getStats = () => API.get('/admin/stats')
// The backend defaults /admin/bookings to limit=10 (most recent first). Both callers — the
// Dashboard charts and notification generation — need the full booking history, not just the
// last 10, or older activity silently drops out of the analytics and notifications.
export const getBookings = () => API.get('/admin/bookings', { params: { limit: 1000 } })
export const getDrivers = () => API.get('/drivers')
export const getAvailableDrivers = () => API.get('/drivers/available')
// The backend defaults /vehicles to limit=10 with no stable ordering, so the Vehicles page
// (which renders the whole fleet as one grid, not a paginated table) needs the full list here.
export const getVehicles = () => API.get('/vehicles', { params: { limit: 1000 } })
// The backend defaults /pricing to limit=10, sorted alphabetically by destination — far too
// narrow a window for callers (like notifications) that need the whole pricing catalog.
export const getPricing = () => API.get('/pricing', { params: { limit: 1000 } })
export const getDestinations = () => API.get('/destinations')

export default API