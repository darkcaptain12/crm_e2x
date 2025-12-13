'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, useTransition } from 'react'
import { getLeads } from '@/app/actions/leads'

interface LeadsFiltersProps {
  initialFilters?: {
    durum?: string
    sehir?: string
    sektor?: string
    kaynak?: string
  }
}

export default function LeadsFilters({ initialFilters = {} }: LeadsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [filters, setFilters] = useState({
    durum: initialFilters.durum || '',
    sehir: initialFilters.sehir || '',
    sektor: initialFilters.sektor || '',
    kaynak: initialFilters.kaynak || '',
  })
  const [uniqueValues, setUniqueValues] = useState({
    sehirler: [] as string[],
    sektorler: [] as string[],
    kaynaklar: [] as string[],
  })

  useEffect(() => {
    // Fetch unique values for autocomplete
    async function fetchUniqueValues() {
      const allLeads = await getLeads()
      const sehirler = Array.from(new Set(allLeads.map((l: any) => l.sehir).filter(Boolean))).sort()
      const sektorler = Array.from(new Set(allLeads.map((l: any) => l.sektor).filter(Boolean))).sort()
      const kaynaklar = Array.from(new Set(allLeads.map((l: any) => l.kaynak).filter(Boolean))).sort()
      setUniqueValues({ sehirler, sektorler, kaynaklar })
    }
    fetchUniqueValues()
  }, [])

  // Sync filters with URL params when they change externally
  useEffect(() => {
    setFilters({
      durum: searchParams.get('durum') || '',
      sehir: searchParams.get('sehir') || '',
      sektor: searchParams.get('sektor') || '',
      kaynak: searchParams.get('kaynak') || '',
    })
  }, [searchParams])

  // Apply filters to URL with debounce
  const applyFilters = useCallback((newFilters: typeof filters) => {
    startTransition(() => {
      const params = new URLSearchParams()
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        }
      })
      const queryString = params.toString()
      const newUrl = queryString ? `/leads?${queryString}` : '/leads'
      router.push(newUrl)
    })
  }, [router, startTransition])

  // Debounce function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters(filters)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [filters, applyFilters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  const handleClearFilters = () => {
    setFilters({ durum: '', sehir: '', sektor: '', kaynak: '' })
    router.push('/leads')
  }

  const hasActiveFilters = Object.values(filters).some(v => v)

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      {isPending && (
        <div className="mb-2 text-sm text-gray-500">
          Filtreler uygulanıyor...
        </div>
      )}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durum
          </label>
          <select
            value={filters.durum}
            onChange={(e) => handleFilterChange('durum', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Tümü</option>
            <option value="Yeni">Yeni</option>
            <option value="Arandı">Arandı</option>
            <option value="Teklif Gönderildi">Teklif Gönderildi</option>
            <option value="Satış Oldu">Satış Oldu</option>
            <option value="Ulaşılamadı">Ulaşılamadı</option>
          </select>
        </div>
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
            Kaynak
          </label>
          <select
            value={filters.kaynak}
            onChange={(e) => handleFilterChange('kaynak', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Tümü</option>
            {uniqueValues.kaynaklar.map((kaynak) => (
              <option key={kaynak} value={kaynak}>
                {kaynak}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
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
