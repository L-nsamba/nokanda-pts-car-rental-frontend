import { useEffect, useState } from "react"
import API from "../services/api"
import Skeleton from "../components/Skeleton"
import Pagination from "../components/Pagination"
import FilterBarSkeleton from "../components/FilterBarSkeleton"
import PageHeader from "../components/PageHeader"
import DataTable from "../components/DataTable"
import CardList from "../components/CardList"
import SearchInput from "../components/SearchInput"
import FilterSelect from "../components/FilterSelect"

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

    const priceColumns = [
        {
            key: 'destination',
            header: 'Destination',
            cellClassName: 'text-gray-600',
            render: (price) => price.destination_name || price.destination_id,
        },
        {
            key: 'vehicle_type',
            header: 'Vehicle Type',
            cellClassName: 'text-gray-600',
            render: (price) => price.vehicle_type,
        },
        {
            key: 'unit_price',
            header: 'Unit Price (RWF)',
            render: (price) => (
                <span className="font-medium" style={{ color: '#15435B' }}>
                    {price.unit_price?.toLocaleString()}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (price) => (
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
            ),
        },
    ]

    if (loading) {
        return (
            <>
                <PageHeader title="Pricing Overview" subtitle="Manage vehicle-destination pricing" />

                <FilterBarSkeleton filterCount={2} />

                <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
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

                {/** Mobile skeleton cards */}
                <div className="md:hidden flex flex-col gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <Skeleton className="h-4 w-32 mb-2" />
                                <Skeleton className="h-3 w-24 mb-2" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <Skeleton className="h-7 w-20 flex-shrink-0" />
                        </div>
                    ))}
                </div>
            </>
        )
    }

    return (
        <>
            {/**Header */}
            <PageHeader title="Pricing Overview" subtitle="Manage vehicle-destination pricing" />

            {/** Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <SearchInput
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search destination or vehicle type..."
                />

                <FilterSelect
                    value={destinationFilter}
                    onChange={(e) => {
                        setDestinationFilter(e.target.value)
                        setCurrentPage(1)
                    }}
                    allLabel="All Destinations"
                    options={DESTINATION_NAMES}
                />

                <FilterSelect
                    value={vehicleTypeFilter}
                    onChange={(e) => {
                        setVehicleTypeFilter(e.target.value)
                        setCurrentPage(1)
                    }}
                    allLabel="All Vehicle Types"
                    options={VEHICLE_TYPES}
                />
            </div>

            {/* Table (medium screens and up) */}
            <DataTable
                columns={priceColumns}
                data={pricing}
                getRowKey={(price) => price.pricing_id}
                emptyMessage="No pricing records found"
                minWidthClass="min-w-[560px]"
                className={refreshing ? 'opacity-60' : ''}
            />

            {/* Cards (below medium screens) */}
            <CardList
                data={pricing}
                emptyMessage="No pricing records found"
                className={refreshing ? 'opacity-60' : ''}
                renderCard={(price) => (
                    <div key={price.pricing_id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="font-medium text-sm truncate" style={{ color: '#15435B' }}>
                                {price.destination_name || price.destination_id}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{price.vehicle_type}</p>
                            <p className="text-sm font-semibold mt-1" style={{ color: '#15435B' }}>
                                {price.unit_price?.toLocaleString()} RWF
                            </p>
                        </div>
                        <button
                            onClick={() => {
                            setEditingPrice(price)
                            setNewPrice(price.unit_price.toString())
                            }}
                            className="text-xs px-3 py-1.5 rounded text-white hover:opacity-80 transition-opacity flex-shrink-0"
                            style={{ backgroundColor: '#15435B' }}
                        >
                            Edit Price
                        </button>
                    </div>
                )}
            />

            {/** Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={total}
                limit={LIMIT}
                onPageChange={setCurrentPage}
                itemLabel="records"
            />

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