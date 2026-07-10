import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import { getVehicles } from "../services/api"
import API from "../services/api"

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
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-400">Loading vehicles... </p>

            </div>
        )
    }
}

