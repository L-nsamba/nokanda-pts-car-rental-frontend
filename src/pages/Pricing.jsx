import { useEffect, useState } from "react"
import API from "../services/api"
import Skeleton from "../components/Skeleton"

const VEHICLE_TYPES = [
  'BMW/LC 300', 'V8', 'TXL PRADO', 'TOYOTA RAV4',
  'TOYOTA VIGO', 'HIGHROOF VAN (12-13)', 'STARIA VAN (6 SEATS)',
  'COASTER BUS (29 SEATS)', 'EXECUTIVE BUS (43 SEATS)', 'PRESIDENTIAL BUS (19 SEATS)'
]

const DESTINATION_NAMES = [
  'AIRPORT TRANSFERS', 'KIGALI', 'RWAMAGANA', 'KAYONZA', 'GATSIBO', 'BUGESERA',
  'NGOMA', 'KIREHE', 'NYAGATARE', 'RULINDO', 'GICUMBI', 'GAKENKE', 'MUSANZE',
  'BURERA', 'KAMONYI', 'MUHANGA', 'RUHANGO', 'HUYE', 'GISAGARA', 'NYARUGURU',
  'NYAMAGABE', 'RUBAVU', 'KARONGI', 'RUTSIRO', 'NGORORERO', 'NYABIHU',
  'NYAMASHEKE', 'RUSIZI'
]

const LIMIT = 10
const SEARCH_DEBOUNCE_MS = 400

export default function Pricing(){
    const [pricing, setPricing] =  useState([])
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [vehicleTypeFilter, setVehicleTypeFilter] = useState('')
    const [destinationFilter, setDestinationFilter] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [editingPrice, setEditingPrice] = useState('')
    const [newPrice, setNewPrice] = useState('')
    const [saving, setSaving] = useState(false)

    // Debounce free-text search so it doesn't refetch on every keystroke
    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearch(searchInput)
            setCurrentPage(1)
        }, SEARCH_DEBOUNCE_MS)
        return () => clearTimeout(timeout)
    }, [searchInput])

    useEffect(() => {
        fetchPricing()
    }, [currentPage, vehicleTypeFilter, destinationFilter, search])

    const fetchPricing = async () => {
        setRefreshing(true)
        try {
            const skip = (currentPage - 1) * LIMIT
            const filters = {}
            if (vehicleTypeFilter) filters.vehicle_type = vehicleTypeFilter
            if (destinationFilter) filters.destination_name = destinationFilter
            if (search) filters.search = search

            const [pricingRes, countRes] = await Promise.all([
                API.get('/pricing', { params: { skip, limit: LIMIT, ...filters } }),
                API.get('/pricing/count', { params: filters })
            ])
            setPricing(pricingRes.data)
            setTotal(countRes.data)
        } catch (err) {
            console.error('Failed to fetch pricing', err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }
    
    const handleEditSave = async () => {
        if (!newPrice) return
        setSaving(true)

        try {
            await API.put(`/pricing/${editingPrice.pricing_id}`, {
                unit_price: parseInt(newPrice)
            })
            setPricing(prev => 
                prev.map(p =>
                    p.pricing_id === editingPrice.pricing_id
                    ? {...p, unit_price: parseInt(newPrice) }
                    : p
                )
            )
            setEditingPrice(null)
            setNewPrice('')
        } catch (err) {
            console.error('Failed to update price', err)
        } finally {
            setSaving(false)
        }
    }

    const totalPages = Math.ceil(total / LIMIT)

    if (loading) {
        return (
            <>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold" style={{ color: '#15435B'}}>
                        Pricing Overview
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Manage vehicle-destination pricing
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <Skeleton className="h-9 w-full sm:w-72" />
                    <Skeleton className="h-9 w-full sm:w-40" />
                    <Skeleton className="h-9 w-full sm:w-40" />
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] text-sm">
                            <thead>
                                <tr style={{ backgroundColor: '#15435B' }} className="text-white">
                                    <th className="text-left px-4 py-3 font-medium">Destination</th>
                                    <th className="text-left px-4 py-3 font-medium">Vehicle Type</th>
                                    <th className="text-left px-4 py-3 font-medium">Unit Price (RWF)</th>
                                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        {Array.from({ length: 4 }).map((__, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <Skeleton className="h-4 w-full max-w-[120px]" />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            {/**Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: '#15435B'}}>
                    Pricing Overview
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                    Manage vehicle-destination pricing
                </p>
            </div>

            {/** Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                type="text"
                placeholder="Search destination or vehicle type..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="border border-gray-200 rounded px-3 py-2 text-sm w-full sm:w-72 outline-none focus:border-[#15435B]">
                </input>

                <select
                value={destinationFilter}
                onChange={(e) => {
                    setDestinationFilter(e.target.value)
                    setCurrentPage(1)
                }}
                className="border border-gray-200 rounded px-3 py-2 text-sm outline-none w-full sm:w-auto">
                    <option value="">All Destinations</option>
                    {DESTINATION_NAMES.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}

                </select>

                <select
                value={vehicleTypeFilter}
                onChange={(e) => {
                    setVehicleTypeFilter(e.target.value)
                    setCurrentPage(1)
                }}
                className="border border-gray-200 rounded px-3 py-2 text-sm outline-none w-full sm:w-auto">
                    <option value="">All Vehicle Types</option>
                    {VEHICLE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}

                </select>
            </div>

            {/* Table */}
            <div className={`bg-white rounded-lg shadow-sm overflow-hidden transition-opacity ${refreshing ? 'opacity-60' : ''}`}>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
                <thead>
                <tr style={{ backgroundColor: '#15435B' }} className="text-white">
                    <th className="text-left px-4 py-3 font-medium">Destination</th>
                    <th className="text-left px-4 py-3 font-medium">Vehicle Type</th>
                    <th className="text-left px-4 py-3 font-medium">Unit Price (RWF)</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
                </thead>
                <tbody>
                {pricing.length === 0 ? (
                    <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                        No pricing records found
                    </td>
                    </tr>
                ) : (
                    pricing.map((price, index) => (
                    <tr
                        key={price.pricing_id}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                        <td className="px-4 py-3 text-gray-600">
                        {price.destination_name || price.destination_id}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                        {price.vehicle_type}
                        </td>
                        <td className="px-4 py-3 font-medium" style={{ color: '#15435B' }}>
                        {price.unit_price?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                        <button
                            onClick={() => {
                            setEditingPrice(price)
                            setNewPrice(price.unit_price.toString())
                            }}
                            className="text-xs px-3 py-1 rounded text-white hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: '#15435B' }}
                        >
                            Edit Price
                        </button>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>
            </div>

            {/** Pagination */}
            <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-gray-400">
                    Showing {((currentPage  - 1) * LIMIT) + 1}-{Math.min(currentPage * LIMIT, total)} of {total} records
                </p>

                <div className="flex items-center gap-2">
                    <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="text-xs px-3 py-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                    >
                    Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                    )
                    .reduce((acc, page, idx, arr) => {
                        if (idx > 0 && page - arr[idx - 1] > 1) {
                        acc.push('...')
                        }
                        acc.push(page)
                        return acc
                    }, [])
                    .map((page, idx) =>
                        page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="text-xs text-gray-400 px-1">...</span>
                        ) : (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                            currentPage === page
                                ? 'text-white border-transparent'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                            style={currentPage === page ? { backgroundColor: '#15435B' } : {}}
                        >
                            {page}
                        </button>
                        )
                    )
                    }
                    <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="text-xs px-3 py-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                    >
                    Next
                    </button>

                </div>
            </div>

            {/** Edit Price Modal */}
            {editingPrice && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-80 max-w-[90vw] shadow-xl">

                        <h2 className="text-lg font-bold mb-1" style={{ color: '#15435B'}}>
                            Edit Price
                        </h2>
                        <p className="text-sm text-gray-400 mb-1">
                            {editingPrice.destination_name || editingPrice.destination_id} 
                        </p>
                        <p className="text-xs text-gray-400 mb-5">
                            {editingPrice.vehicle_type}
                        </p>

                        <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                                Unit Price (RWF)
                            </label>
                            <input
                            type="number"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#15435B]">
                            </input>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                            onClick={() => {
                                setEditingPrice(null)
                                setNewPrice('')
                            }}
                            className="flex-1 py-2 rounded text-sm border-gray-200 text-gray-500 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                            onClick={handleEditSave}
                            disabled={saving}
                            className="flex-1 py-2 rounded text-sm text-white disabled:opacity-50"
                            style={{ backgroundColor: '#15435B'}}
                            >
                                {saving ? 'Saving' : 'Save'}

                            </button>

                        </div>

                    </div>

                </div>
            )}
        </>
    )
}