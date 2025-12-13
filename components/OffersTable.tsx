'use client'

import { useState } from 'react'
import StatusBadge from './StatusBadge'
import { deleteOffer } from '@/app/actions/offers'
import OfferModal from './OfferModal'

interface Offer {
  id: string
  musteri_id: string
  hizmet: string
  tutar: number
  para_birimi: string
  durum: string
  not: string | null
  created_at: string
  crm_customers?: { firma: string; telefon?: string } | null
}

interface OffersTableProps {
  offers: Offer[]
  filters?: {
    durum?: string
    dateRange?: string
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}.${month}.${year} ${hours}:${minutes}`
}

export default function OffersTable({
  offers: initialOffers,
  filters = {},
}: OffersTableProps) {
  const [offers, setOffers] = useState(initialOffers || [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Apply filters
  let filteredOffers = offers
  if (filters.durum) {
    filteredOffers = filteredOffers.filter(o => o.durum === filters.durum)
  }
  if (filters.dateRange) {
    const now = new Date()
    let startDate = new Date()
    switch (filters.dateRange) {
      case 'last7days':
        startDate.setDate(now.getDate() - 7)
        break
      case 'last30days':
        startDate.setDate(now.getDate() - 30)
        break
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }
    filteredOffers = filteredOffers.filter(o => new Date(o.created_at) >= startDate)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu teklifi silmek istediğinizden emin misiniz?')) {
      const result = await deleteOffer(id)
      if (result?.error) {
        setError(result.error)
      } else {
        setOffers(offers.filter((offer) => offer.id !== id))
      }
    }
  }

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer)
    setIsModalOpen(true)
  }

  return (
    <>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => {
            setEditingOffer(null)
            setIsModalOpen(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Yeni Teklif Oluştur
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FİRMA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HİZMET
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TUTAR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DURUM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TARİH
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {offers.length === 0 
                      ? 'Şu anda kayıtlı teklif yok.'
                      : 'Filtrelere uygun teklif bulunamadı.'}
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <a
                      href={`/customers/${offer.musteri_id}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                    {offer.crm_customers?.firma || 'N/A'}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {offer.hizmet}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {offer.tutar.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {offer.para_birimi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={offer.durum} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(offer.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/offers/${offer.id}`}
                        className="text-primary-600 hover:text-primary-900"
                        title="Detay"
                      >
                        👁️
                      </a>
                      <button
                        onClick={() => handleEdit(offer)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Düzenle"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(offer.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <OfferModal
          offer={editingOffer}
          onClose={() => {
            setIsModalOpen(false)
            setEditingOffer(null)
            window.location.reload()
          }}
        />
      )}
    </>
  )
}
