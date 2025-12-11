'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface OffersFiltersProps {
  initialStatus?: string
  initialDateRange?: string
}

export default function OffersFilters({ initialStatus, initialDateRange }: OffersFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState(initialStatus || '')
  const [dateRange, setDateRange] = useState(initialDateRange || '')

  const handleFilterChange = () => {
    const params = new URLSearchParams()
    if (status) params.set('durum', status)
    if (dateRange) params.set('dateRange', dateRange)
    router.push(`/offers?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setStatus('')
    setDateRange('')
    router.push('/offers')
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durum
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Tümü</option>
            <option value="Beklemede">Beklemede</option>
            <option value="Gönderildi">Gönderildi</option>
            <option value="Bekliyor">Bekliyor</option>
            <option value="Kabul Edildi">Kabul Edildi</option>
            <option value="Reddedildi">Reddedildi</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tarih Aralığı
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Tümü</option>
            <option value="last7days">Son 7 Gün</option>
            <option value="last30days">Son 30 Gün</option>
            <option value="thisMonth">Bu Ay</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleFilterChange}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Filtrele
          </button>
          {(status || dateRange) && (
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
