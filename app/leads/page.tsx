import { getLeads, getTodayLeads } from '@/app/actions/leads'
import Sidebar from '@/components/Sidebar'
import LeadsTable from '@/components/LeadsTable'
import TodayLeadsCard from '@/components/TodayLeadsCard'
import LeadStatusFilters from '@/components/LeadStatusFilters'
import LeadsFilters from '@/components/LeadsFilters'
import LeadScanForm from '@/components/LeadScanForm'
import QuickLeadAdd from '@/components/QuickLeadAdd'

export const dynamic = 'force-dynamic'

interface LeadsPageProps {
  searchParams: { 
    durum?: string
    sehir?: string
    sektor?: string
    kaynak?: string
  }
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const statusFilter = searchParams.durum || 'Tümü'
  const filters = {
    sehir: searchParams.sehir,
    sektor: searchParams.sektor,
    kaynak: searchParams.kaynak,
  }
  
  const leads = await getLeads(
    statusFilter === 'Tümü' ? undefined : statusFilter,
    filters
  ).catch((error) => {
    console.error('Error loading leads page:', error)
    return []
  })

  const todayLeads = await getTodayLeads().catch((error) => {
    console.error('Error loading today leads:', error)
    return []
  })

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Potansiyel Müşteriler</h1>
            <p className="mt-1 text-sm text-gray-500">
              Google Haritalar ve diğer kaynaklardan gelen lead kayıtları.
            </p>
          </div>

          <LeadScanForm />

          <QuickLeadAdd />

          <LeadStatusFilters />

          <LeadsFilters initialFilters={searchParams} />

          <TodayLeadsCard leads={todayLeads as any} />

          <LeadsTable leads={leads as any} />
        </div>
      </main>
    </div>
  )
}