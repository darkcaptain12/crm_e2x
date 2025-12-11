'use client'

import Link from 'next/link'
import StatusBadge from './StatusBadge'

interface PendingOffer {
  id: string
  musteri_id: string
  customer_name: string
  tutar: number
  para_birimi: string
  durum: string
  created_at: string
  hizmet: string
  not: string | null
}

interface PendingOffersListProps {
  offers: PendingOffer[]
}

export default function PendingOffersList({ offers }: PendingOffersListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`
  }

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Teklif Bekleyenler</h2>
        <p className="text-gray-500 text-center py-8">
          Bekleyen teklif bulunmuyor. Tüm teklifler sonuçlandı! ✅
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Teklif Bekleyenler</h2>
        <Link
          href="/offers"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Tümünü gör →
        </Link>
      </div>
      
      {/* Mobile Card View */}
      <div className="block lg:hidden divide-y divide-gray-200">
        {offers.map((offer) => (
          <div key={offer.id} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <Link
                href={`/customers/${offer.musteri_id}`}
                className="font-medium text-gray-900 text-sm hover:text-primary-600 flex-1 pr-2"
              >
                {offer.customer_name}
              </Link>
              <StatusBadge status={offer.durum} />
            </div>
            <div className="space-y-1 text-xs text-gray-600 mb-3">
              <div className="flex items-center gap-2">
                <span>💰</span>
                <span className="font-semibold text-gray-900">{formatAmount(offer.tutar, offer.para_birimi)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{formatDate(offer.created_at)}</span>
              </div>
            </div>
            <Link
              href={`/offers/${offer.id}`}
              className="text-primary-600 hover:text-primary-900 text-sm font-medium inline-block"
            >
              Detaya git →
            </Link>
          </div>
        ))}
      </div>

      {/* Desktop Table View - Grid Layout */}
      <div className="hidden lg:block">
        <div className="divide-y divide-gray-200">
          {offers.map((offer) => (
            <div key={offer.id} className="px-3 py-2.5 hover:bg-gray-50 grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5 min-w-0">
                <Link
                  href={`/customers/${offer.musteri_id}`}
                  className="font-medium text-sm text-gray-900 hover:text-primary-600 truncate block"
                  title={offer.customer_name}
                >
                  {offer.customer_name}
                </Link>
              </div>
              <div className="col-span-2 text-sm text-gray-900 font-medium">
                {formatAmount(offer.tutar, offer.para_birimi)}
              </div>
              <div className="col-span-2">
                <StatusBadge status={offer.durum} />
              </div>
              <div className="col-span-2 text-xs text-gray-500">
                {formatDate(offer.created_at)}
              </div>
              <div className="col-span-1 text-right">
                <Link
                  href={`/offers/${offer.id}`}
                  className="text-primary-600 hover:text-primary-900 text-sm"
                >
                  →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tablet View - Card Style */}
      <div className="hidden md:block lg:hidden">
        {offers.map((offer) => (
          <div key={offer.id} className="px-4 py-3 border-b border-gray-200 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <Link
                href={`/customers/${offer.musteri_id}`}
                className="font-medium text-sm text-gray-900 hover:text-primary-600 flex-1 pr-2 truncate"
                title={offer.customer_name}
              >
                {offer.customer_name}
              </Link>
              <StatusBadge status={offer.durum} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-900">{formatAmount(offer.tutar, offer.para_birimi)}</span>
                <span className="text-xs text-gray-500 ml-2">{formatDate(offer.created_at)}</span>
              </div>
              <Link
                href={`/offers/${offer.id}`}
                className="text-primary-600 hover:text-primary-900 text-sm font-medium"
              >
                Detay →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
