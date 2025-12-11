'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const statusOptions = [
  { value: 'Tümü', label: 'Tümü' },
  { value: 'Yeni', label: 'Yeni' },
  { value: 'Arandı', label: 'Arandı' },
  { value: 'Teklif Gönderildi', label: 'Teklif Gönderildi' },
  { value: 'Satış Oldu', label: 'Satış Oldu' },
  { value: 'Ulaşılamadı', label: 'Ulaşılamadı' },
]

export default function LeadStatusFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFilter = searchParams.get('durum') || 'Tümü'

  const handleFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'Tümü') {
      params.delete('durum')
    } else {
      params.set('durum', status)
    }
    router.push(`/leads?${params.toString()}`)
  }

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {statusOptions.map((option) => {
        const isActive = currentFilter === option.value
        return (
          <button
            key={option.value}
            onClick={() => handleFilterChange(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
