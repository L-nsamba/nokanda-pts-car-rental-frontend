import { useEffect, useState } from "react" 
import API from "../services/api"

const VEHICLE_TYPES = [
  'BMW/LC 300', 'V8', 'TXL PRADO', 'TOYOTA RAV4',
  'TOYOTA VIGO', 'HIGHROOF VAN (12-13)', 'STARIA VAN (6 SEATS)',
  'COASTER BUS (29 SEATS)', 'EXECUTIVE BUS (43 SEATS)', 'PRESIDENTIAL BUS (19 SEATS)'
]

const LIMIT = 10

export default function Pricing(){
    const [pricing, setPricing] =  useState([])
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [vehicleTypeFilter, setVehicleTypeFilter] = useState('')
    const [search, setSearch] = useState('')
    const [editingPrice, setEditingPrice] = useState('')
    const [newPrice, setNewPrice] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchPricing()
    }, [currentPage])

    const fetchPricing = async () => {
        setLoading(true)
        try {
            const skip = (currentPage - 1) * LIMIT
            const [pricingRes, countRes] = await Promise.all([
                API.get(`/pricing?skip=${skip}&limit=${LIMIT}`),
                API.get('/pricing/count')
            ])
            setPricing(pricingRes.data)
            setTotal(countRes.data.total)
        } catch (err) {
            console.error('Failed to fetch pricing', err)
        } finally {
            setLoading(false)
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

    const filteredPricing = pricing.filter(p => {
        const matchesType = vehicleTypeFilter ? p.vehicle_type === vehicleTypeFilter : true
        const matchesSearch = search
            ? p.vehicle_type?.toLowerCase().includes(search.toLocaleLowerCase()) ||
              p.destination_id?.toLowerCase().includes(search.toLowerCase())
            : true
        
            return matchesType  && matchesSearch
    })
}