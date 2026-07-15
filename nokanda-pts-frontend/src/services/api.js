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
export const getBookings = () => API.get('/admin/bookings')
export const getDrivers = () => API.get('/drivers')
export const getAvailableDrivers = () => API.get('/drivers/available')
export const getVehicles = () => API.get('/vehicles')
export const getPricing = () => API.get('/pricing')
export const getDestinations = () => API.get('/destinations')

export default API