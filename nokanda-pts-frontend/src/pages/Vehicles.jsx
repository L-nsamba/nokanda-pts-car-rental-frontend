import { useEffect, useState } from "react"
import { getVehicles } from "../services/api"
import API from "../services/api"
import { useToast } from "../context/ToastContext"

import {
  faCar

} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const STATUS_COLORS = {
  AVAILABLE: 'bg-green-100 text-green-700',
  UNAVAILABLE: 'bg-red-100 text-red-700',
}

const VEHICLE_TYPES = [
  'BMW/LC 300', 'V8', 'TXL PRADO', 'TOYOTA RAV4',
  'TOYOTA VIGO', 'HIGHROOF VAN (12-13)', 'STARIA VAN (6 SEATS)',
  'COASTER BUS (29 SEATS)', 'EXECUTIVE BUS (43 SEATS)', 'PRESIDENTIAL BUS (19 SEATS)'
]

export default function Vehicles() {
    const { showToast } = useToast()
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [search, setSearch] = useState('')
    const [editingVehicle, setEditingVehicle] = useState(null)
    const [editForm, setEditForm] = useState({
        vehicle_type: '',
        photo_url: '',
        description: '',
        status: ''
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchVehicles()
    }, [])

    const fetchVehicles = async () => {
        try {
            const res = await getVehicles()
            setVehicles(res.data)
        } catch (err) {
            console.error('Failed to fetch vehicles', err)
        } finally{
            setLoading(false)
        }
    }

    const handleEditClick = (vehicle) => {
        setEditingVehicle(vehicle)
        setEditForm({
            vehicle_type: vehicle.vehicle_type,
            photo_url: vehicle.photo_url,
            description: vehicle.description,
            status: vehicle.status
        })
    }

    const handleEditSave = async () => {
        setSaving(true)
        try{
            await API.put(`/vehicles/${editingVehicle.vehicle_id}`, editForm)
            setVehicles(prev =>
                prev.map(v => 
                    v.vehicle_id === editingVehicle.vehicle_id
                    ? {...v, ...editForm}
                    : v
                )
            )
            setEditingVehicle(null)
        } catch (err) {
            console.error('Failed to update vehicle', err)
            showToast(err.response?.data?.detail || 'Failed to update vehicle')
        } finally  {
            setSaving(false)
        }
    }

    const handleStatusToggle = async (vehicle) => {
        const newStatus = vehicle.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE'
        try {
            await API.put(`/vehicles/${vehicle.vehicle_id}`, {status: newStatus})
            setVehicles(prev =>
                prev.map(v =>
                    v.vehicle_id === vehicle.vehicle_id
                    ? {...v, status: newStatus}
                    : v
                )
            )
        } catch (err) {
            console.error('Failed to toggle status', err)
            showToast(err.response?.data?.detail || 'Failed to toggle status')
        }
    }

    const filteredVehicles = vehicles.filter(v => {
        const matchesStatus = statusFilter ? v.status === statusFilter : true
        const matchesTypes = typeFilter ? v.vehicle_type ===  typeFilter : true
        const matchesSearch = search
            ? v.vehicle_type?.toLowerCase().includes(search.toLowerCase())
            : true
            return matchesStatus && matchesTypes && matchesSearch
    })

    if (loading) {
        return <p className="text-gray-400">Loading vehicles...</p>
    }

    return (
        <>
            {/**Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: '#15435B'}}>
                    Vehicle Overview
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                    Manage vehicle details and availability
                </p>
            </div>

            {/** Stat cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Available</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#15435B' }}>
                    {vehicles.filter(v => v.status === 'AVAILABLE').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Unavailable</p>
                    <p className="text-2xl font-bold mt-1 text-red-500">
                    {vehicles.filter(v => v.status === 'UNAVAILABLE').length}
                    </p>
                </div>
            </div>

            {/** Filters */}
            <div className="flex gap-3 mb-6">

                <input
                type="text"
                placeholder="Search by type...."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-200 rounded px-3 py-2 text-sm w-64 outline-none focus:border-[#15435B]">
                </input>

                <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded px-3 py-2 text-sm outline-none">

                    <option value="">All Statues</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="UNAVAILABLE">Unavailable</option>

                </select>

                <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-200 rounded px-3 py-2 text-sm outline-none">

                    <option value="">All Types</option>
                    {VEHICLE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            {/** Vehicle grid */}
            <div className="grid grid-cols-3 gap-4">
                {filteredVehicles.length === 0 ? (
                    <div className="col-span-3 text-center py-8 text-gray-400">
                        No vehicles found
                    </div>

                ):(
                    filteredVehicles.map(vehicle => (
                        <div
                        key={vehicle.vehicle_id}
                        className="bg-white rounded-lg shadow-sm overflow-hidden">

                            {/**Vehicle image */}
                            <div className="h-40 bg-gray-100 overflow-hidden">
                                {vehicle.photo_url ? (
                                    <img
                                    src={vehicle.photo_url}
                                    alt={vehicle.vehicle_type}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                    }}>
                                    </img>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl" >
                                        <FontAwesomeIcon icon={faCar}></FontAwesomeIcon>
                                    </div>
                                )}

                            </div>

                            {/**Vehicle info */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-1">
                                    <h3 className="font-semibold text-sm" style={{ color: '#15435B'}}>
                                        {vehicle.vehicle_type}
                                    </h3>
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[vehicle.status]}`}>
                                        {vehicle.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                                    {vehicle.description}
                                </p>

                                {/** Actions */}
                                <div className="flex gap-2">
                                    <button
                                    onClick={() => handleEditClick(vehicle)}
                                    className="flex-1 text-xs py-1.5 rounded text-white hover:opacity-80 transition-opacity"
                                    style={{ backgroundColor: '#15435B'}}>

                                    Edit
                                    </button>
                                    <button
                                        onClick={() => handleStatusToggle(vehicle)}
                                        className={`flex-1 text-xs py-1.5 rounded font-medium transition-opacity hover:opacity-80 ${
                                            vehicle.status === 'AVAILABLE'
                                            ? 'bg-red-100 text-red-600'
                                            : 'bg-green-100 text-green-600'
                                        }`}
                                        >
                                        {vehicle.status === 'AVAILABLE' ? 'Mark Unavailable' : 'Mark Available'}
                                    </button>

                                </div>
                            </div>

                        </div>
                    ))
                )}

            </div>
            <p className="text-xs text-gray-400 mt-4">
                Showing {filteredVehicles.length} of {vehicles.length} vehicles
            </p>

            {/**Edit Modal */}
            {editingVehicle && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl">

                        <h2 className="text-lg font-bold mb-1" style={{ color: '#15435B' }}>
                            Edit Vehicle
                        </h2>
                        <p className="text-sm text-gray-400 mb-5">{editingVehicle.vehicle_type}</p>

                        <div className="flex flex-col gap-4">

                        <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                            Vehicle Type
                            </label>
                            <select
                            value={editForm.vehicle_type}
                            onChange={(e) => setEditForm(prev => ({ ...prev, vehicle_type: e.target.value }))}
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#15435B]"
                            >
                            {VEHICLE_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                            Photo URL
                            </label>
                            <input
                            type="text"
                            value={editForm.photo_url}
                            onChange={(e) => setEditForm(prev => ({ ...prev, photo_url: e.target.value }))}
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#15435B]"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                            Description
                            </label>
                            <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#15435B] resize-none"
                            rows={3}
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                            Status
                            </label>
                            <select
                            value={editForm.status}
                            onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#15435B]"
                            >
                            <option value="AVAILABLE">Available</option>
                            <option value="UNAVAILABLE">Unavailable</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                        onClick={() => setEditingVehicle(null)}
                        className="flex-1 py-2 rounded text-sm border border-gray-200 text-gray-500 hover:bg-gray-50">
                        Cancel
                        </button>

                        <button
                            onClick={handleEditSave}
                            disabled={saving}
                            className="flex-1 py-2 rounded text-sm text-white disabled:opacity-50"
                            style={{ backgroundColor: '#15435B' }}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>

                </div>

            </div>
            )}
        </>
    )
}

