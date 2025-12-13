'use client'

import { useState, useEffect } from 'react'
import { updateOffer, createOffer } from '@/app/actions/offers'
import { getCustomers } from '@/app/actions/customers'
import { useRouter } from 'next/navigation'

interface Offer {
  id: string
  musteri_id: string
  hizmet: string
  tutar: number
  para_birimi: string
  durum: string
  not: string | null
}

interface OfferModalProps {
  offer: Offer | null
  onClose: () => void
}

export default function OfferModal({ offer, onClose }: OfferModalProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<Array<{ id: string; firma: string }>>([])

  useEffect(() => {
    async function fetchData() {
      const customersData = await getCustomers()
      setCustomers(customersData)
    }
    fetchData()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    
    if (offer) {
      // Update existing offer
      const result = await updateOffer(offer.id, formData)
    if (result?.error) {
      setError(result.error)
        setIsSubmitting(false)
      } else {
        onClose()
        router.refresh()
      }
    } else {
      // Create new offer
      const result = await createOffer(formData)
      if (result?.error) {
        setError(result.error)
        setIsSubmitting(false)
    } else {
      onClose()
        router.refresh()
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">{offer ? 'Teklif Düzenle' : 'Yeni Teklif Oluştur'}</h2>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Müşteri <span className="text-red-500">*</span>
            </label>
            <select
              name="musteri_id"
              defaultValue={offer?.musteri_id || ''}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Müşteri Seçin</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.firma}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hizmet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="hizmet"
              required
              defaultValue={offer?.hizmet || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tutar <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="tutar"
              required
              step="0.01"
              min="0"
              defaultValue={offer?.tutar || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Para Birimi <span className="text-red-500">*</span>
            </label>
            <select
              name="para_birimi"
              defaultValue={offer?.para_birimi || 'TL'}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="TL">TL</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durum <span className="text-red-500">*</span>
            </label>
            <select
              name="durum"
              defaultValue={offer?.durum || 'Gönderildi'}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="Beklemede">Beklemede</option>
              <option value="Gönderildi">Gönderildi</option>
              <option value="Bekliyor">Bekliyor</option>
              <option value="Kabul Edildi">Kabul Edildi</option>
              <option value="Reddedildi">Reddedildi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Not
            </label>
            <textarea
              name="not"
              rows={3}
              defaultValue={offer?.not || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Opsiyonel not..."
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Kaydediliyor...' : (offer ? 'Güncelle' : 'Oluştur')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
