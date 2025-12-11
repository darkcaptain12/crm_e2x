import { getCustomerById } from '@/app/actions/customers'
import { getOffersByCustomer } from '@/app/actions/offers'
import { getNotesByRelated } from '@/app/actions/notes'
import Sidebar from '@/components/Sidebar'
import StatusBadge from '@/components/StatusBadge'
import CustomerTimeline from '@/components/CustomerTimeline'
import CustomerOffersList from '@/components/CustomerOffersList'
import CustomerDetailActions from '@/components/CustomerDetailActions'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface CustomerDetailPageProps {
  params: { id: string }
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const customer = await getCustomerById(params.id)
  
  if (!customer) {
    notFound()
  }

  const [offers, notes] = await Promise.all([
    getOffersByCustomer(params.id),
    getNotesByRelated('customer', params.id),
  ])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <a
              href="/customers"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4 inline-block"
            >
              ← Müşteriler listesine dön
            </a>
          </div>

          {/* Main Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{customer.firma}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>📞 {customer.telefon}</span>
                  {customer.sektor && <span>🏢 {customer.sektor}</span>}
                  {customer.sehir && <span>📍 {customer.sehir}</span>}
                  {customer.hizmet && <span>💼 {customer.hizmet}</span>}
                </div>
              </div>
              <StatusBadge status={customer.odeme_durumu || 'Beklemede'} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <span className="text-gray-500">Oluşturulma Tarihi:</span>{' '}
                <span className="font-medium">
                  {new Date(customer.created_at).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <CustomerDetailActions customer={customer} />
          </div>

          {/* Tabs/Sections */}
          <div className="space-y-6">
            {/* Timeline Section */}
            <CustomerTimeline customerId={params.id} initialNotes={notes} />

            {/* Offers Section */}
            <CustomerOffersList customerId={params.id} offers={offers} />
          </div>
        </div>
      </main>
    </div>
  )
}
