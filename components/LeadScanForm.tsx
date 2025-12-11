'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LeadScanForm() {
  const [city, setCity] = useState('')
  const [sector, setSector] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!city.trim() || !sector.trim()) {
      setError('Lütfen şehir ve sektör alanlarını doldurun.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/leads/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: city.trim(),
          sector: sector.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }))
        throw new Error(data.error || 'Tarama başlatılamadı')
      }

      setSuccess(true)
      setCity('')
      setSector('')

      // Refresh leads after 3 seconds
      setTimeout(() => {
        router.refresh()
      }, 3000)
    } catch (err) {
      console.error('Scan error:', err)
      setError('Tarama başlatılamadı. Lütfen daha sonra tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            Şehir
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Örn: İstanbul"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
            Sektör
          </label>
          <input
            id="sector"
            type="text"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Örn: Restoran"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Taranıyor...' : 'Taramayı Başlat'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          Tarama başlatıldı. Birkaç saniye içinde yeni leadler listede görünecek.
        </div>
      )}
    </div>
  )
}
