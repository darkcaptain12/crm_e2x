import { getOffers } from '@/app/actions/offers'
import Sidebar from '@/components/Sidebar'
import OffersTable from '@/components/OffersTable'
import OffersFilters from '@/components/OffersFilters'

export const dynamic = 'force-dynamic'

interface OffersPageProps {
  searchParams: { 
    durum?: string
    dateRange?: string
  }
}

export default async function OffersPage({ searchParams }: OffersPageProps) {
  const offers = await getOffers().catch((error) => {
    console.error('Error loading offers page:', error)
    return []
  })

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Teklifler</h1>
          </div>
          <OffersFilters initialStatus={searchParams.durum} initialDateRange={searchParams.dateRange} />
          <OffersTable offers={offers as any} filters={searchParams} />
        </div>
      </main>
    </div>
  )
}
