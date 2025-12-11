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
}: OffersTableProps) {
  const [offers, setOffers] = useState(initialOffers || [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [error, setError] = useState<string | null>(null)

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
              {offers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Şu anda kayıtlı teklif yok.
                  </td>
                </tr>
              ) : (
                offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {offer.crm_customers?.firma || 'N/A'}
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
