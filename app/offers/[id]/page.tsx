import { getOfferById } from '@/app/actions/offers'
import Sidebar from '@/components/Sidebar'
import StatusBadge from '@/components/StatusBadge'
import OfferModal from '@/components/OfferModal'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface OfferDetailPageProps {
  params: { id: string }
}

export default async function OfferDetailPage({ params }: OfferDetailPageProps) {
  const offer = await getOfferById(params.id)
  
  if (!offer) {
    notFound()
  }

  const customer = offer.crm_customers as any

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <a
              href="/offers"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4 inline-block"
            >
              ← Teklifler listesine dön
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Teklif Detayı
                </h1>
                {customer && (
                  <Link
                    href={`/customers/${offer.musteri_id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    Müşteri: {customer.firma}
                  </Link>
                )}
              </div>
              <StatusBadge status={offer.durum || offer.status || 'Beklemede'} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Hizmet</h3>
                <p className="text-lg font-medium text-gray-900">{offer.hizmet || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Tutar</h3>
                <p className="text-lg font-medium text-gray-900">
                  {offer.tutar?.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) || offer.teklif_tutar?.toLocaleString('tr-TR') || '-'} {offer.para_birimi || 'TL'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Durum</h3>
                <StatusBadge status={offer.durum || offer.status || 'Beklemede'} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Oluşturulma Tarihi</h3>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(offer.created_at).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {offer.not && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Not</h3>
                  <p className="text-gray-900">{offer.not}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <OfferModal
                offer={offer}
                onClose={() => {}}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
