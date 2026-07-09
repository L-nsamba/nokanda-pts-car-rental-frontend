import { useEffec, useState } from "react"
import Sidebar from "../components/Sidebar"
import { getDrivers } from "../services/api"
import API from "../services/api"
import { useEffect } from "react"

const STATUS_COLORS = {
  AVAILABLE: 'bg-green-100 text-green-700',
  UNAVAILABLE: 'bg-red-100 text-red-700',
  TRAVELLING: 'bg-blue-100 text-blue-700',
}

export default function Drivers() {
    const [drivers, setDrivers] =  useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('')
    const [capabilityFilter, setCapabilityFilter] = useState('')
    const [search, setSearch] = useState('')
    const [editingDriver, setEditingDriver] = useState(null)
    const [editForm, setEditForm] = useState({availability_status: '', driver_capabilities: ''})
    const [saving, setSaving] = useState(false)


useEffect(() => {
    fetchDrivers()
}, [])

    const fetchDrivers = async () => {
        try {
            const res = await getDrivers()
            setDrivers(res.data)
        } catch (err) {
            console.error('Failed to fetch drivers', err)
        } finally {
            setLoading(false)
        }
    }

    const handleEditClick = (driver)  => {
        setEditingDriver(driver)
        setEditForm({
            status: driver.availability_status,
            capabilities: driver.driver_capabilities
        })
    }

    const handleEditSave = async () => {
        setSaving(true)
            try {
                await API.put(`/drivers/${editingDriver.user_id}`, editForm)
                setDrivers(prev =>
                    prev.map(d =>
                        d.user_id === editingDriver.user_id
                        ? {...d, ...editForm}
                        : d
                    )
                )
                setEditingDriver(null)
            } catch(err) {
                console.error('Failed to update driver', err)
            } finally {
                setSaving(false)
        }
    }

    const filteredDrivers = drivers.filter(d => {
        const matchesStatus = statusFilter ? d.availability_status === statusFilter : true
        const matchesCapability = capabilityFilter ? d.driver_capabilities === capabilityFilter : true
        const matchesSearch = search 
            ? d.name?.toLowerCase().includes(search.toLowerCase())
            : true
            return matchesStatus && matchesCapability && matchesSearch
    })

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-400">Loading drivers...</p>
            </div>
        )
    }
}