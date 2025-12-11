'use client'

import Link from 'next/link'
import StatusBadge from './StatusBadge'
import { updateOfferStatus } from '@/app/actions/offers'
import { useState } from 'react'
import CreateOfferModal from './CreateOfferModal'

interface Offer {
  id: string
  musteri_id: string
  hizmet: string
  tutar: number
  para_birimi: string
  durum: string
  not: string | null
  created_at: string
}

interface CustomerOffersListProps {
  customerId: string
  offers: Offer[]
}

export default function CustomerOffersList({ customerId, offers: initialOffers }: CustomerOffersListProps) {
  const [offers, setOffers] = useState(initialOffers || [])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleStatusChange = async (offerId: string, newStatus: string) => {
    setUpdatingId(offerId)
    try {
      const formData = new FormData()
      formData.append('durum', newStatus)
      const result = await updateOfferStatus(offerId, formData)
      if (result?.error) {
        alert(result.error)
      } else {
        setOffers(offers.map(o => o.id === offerId ? { ...o, durum: newStatus } : o))
      }
    } catch (error) {
      console.error('Error updating offer status:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Teklifler</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            + Yeni Teklif Oluştur
          </button>
        </div>
        {offers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Bu müşteri için henüz teklif oluşturulmamış.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              İlk teklifi oluşturun →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hizmet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {offer.hizmet}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatAmount(offer.tutar, offer.para_birimi)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={offer.durum}
                        onChange={(e) => handleStatusChange(offer.id, e.target.value)}
                        disabled={updatingId === offer.id}
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                      >
                        <option value="Beklemede">Beklemede</option>
                        <option value="Gönderildi">Gönderildi</option>
                        <option value="Bekliyor">Bekliyor</option>
                        <option value="Kabul Edildi">Kabul Edildi</option>
                        <option value="Reddedildi">Reddedildi</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(offer.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/offers/${offer.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Detay →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <CreateOfferModal
          customerId={customerId}
          customerFirma=""
          onClose={() => {
            setIsCreateModalOpen(false)
            window.location.reload()
          }}
        />
      )}
    </>
  )
}
