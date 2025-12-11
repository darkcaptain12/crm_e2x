'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getCustomers } from '@/app/actions/customers'

interface CustomersFiltersProps {
  initialFilters?: {
    sehir?: string
    sektor?: string
    odeme_durumu?: string
    hizmet?: string
  }
}

export default function CustomersFilters({ initialFilters = {} }: CustomersFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState({
    sehir: initialFilters.sehir || '',
    sektor: initialFilters.sektor || '',
    odeme_durumu: initialFilters.odeme_durumu || '',
    hizmet: initialFilters.hizmet || '',
  })
  const [uniqueValues, setUniqueValues] = useState({
    sehirler: [] as string[],
    sektorler: [] as string[],
    hizmetler: [] as string[],
  })

  useEffect(() => {
    // Fetch unique values for autocomplete
    async function fetchUniqueValues() {
      const allCustomers = await getCustomers()
      const sehirler = Array.from(new Set(allCustomers.map((c: any) => c.sehir).filter(Boolean))).sort()
      const sektorler = Array.from(new Set(allCustomers.map((c: any) => c.sektor).filter(Boolean))).sort()
      const hizmetler = Array.from(new Set(allCustomers.map((c: any) => c.hizmet).filter(Boolean))).sort()
      setUniqueValues({ sehirler, sektorler, hizmetler })
    }
    fetchUniqueValues()
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  const handleApplyFilters = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })
    router.push(`/customers?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setFilters({ sehir: '', sektor: '', odeme_durumu: '', hizmet: '' })
    router.push('/customers')
  }

  const hasActiveFilters = Object.values(filters).some(v => v)

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Şehir
          </label>
          <input
            type="text"
            list="sehirler-list"
            value={filters.sehir}
            onChange={(e) => handleFilterChange('sehir', e.target.value)}
            placeholder="Şehir ara..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
          <datalist id="sehirler-list">
            {uniqueValues.sehirler.map((sehir) => (
              <option key={sehir} value={sehir} />
            ))}
          </datalist>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sektor
          </label>
          <input
            type="text"
            list="sektorler-list"
            value={filters.sektor}
            onChange={(e) => handleFilterChange('sektor', e.target.value)}
            placeholder="Sektor ara..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
          <datalist id="sektorler-list">
            {uniqueValues.sektorler.map((sektor) => (
              <option key={sektor} value={sektor} />
            ))}
          </datalist>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ödeme Durumu
          </label>
          <select
            value={filters.odeme_durumu}
            onChange={(e) => handleFilterChange('odeme_durumu', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Tümü</option>
            <option value="Beklemede">Beklemede</option>
            <option value="Ödeme Bekliyor">Ödeme Bekliyor</option>
            <option value="Ödendi">Ödendi</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hizmet
          </label>
          <input
            type="text"
            list="hizmetler-list"
            value={filters.hizmet}
            onChange={(e) => handleFilterChange('hizmet', e.target.value)}
            placeholder="Hizmet ara..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
          <datalist id="hizmetler-list">
            {uniqueValues.hizmetler.map((hizmet) => (
              <option key={hizmet} value={hizmet} />
            ))}
          </datalist>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleApplyFilters}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Filtrele
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Temizle
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
