import { getDashboardStats } from '@/app/actions/dashboard'
import Sidebar from '@/components/Sidebar'
import StatsCard from '@/components/StatsCard'
import DashboardCharts from '@/components/DashboardCharts'

export default async function DashboardPage() {
  let stats
  try {
    stats = await getDashboardStats()
  } catch (error) {
    console.error('Error loading dashboard:', error)
    stats = {
      todayCalls: 0,
      newLeadsLast7Days: 0,
      sentOffers: 0,
      wonDeals: 0,
      totalCustomers: 0,
      totalOffers: 0,
      weeklyLeads: [],
      statusCounts: {
        Yeni: 0,
        Arandı: 0,
        Teklif: 0,
        Kazanıldı: 0,
      },
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Kontrol Paneli</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Bugünkü Aramalar"
              value={stats.todayCalls}
              icon="📞"
            />
            <StatsCard
              title="Yeni Potansiyel Müşteriler (7 gün)"
              value={stats.newLeadsLast7Days}
              icon="👥"
            />
            <StatsCard
              title="Gönderilen Teklifler"
              value={stats.sentOffers}
              icon="📧"
            />
            <StatsCard
              title="Kazanılan İşler"
              value={stats.wonDeals}
              icon="✅"
            />
            <StatsCard
              title="Toplam Müşteri"
              value={stats.totalCustomers}
              icon="🏢"
            />
            <StatsCard
              title="Toplam Teklif"
              value={stats.totalOffers}
              icon="📄"
            />
          </div>

          <DashboardCharts
            weeklyLeads={stats.weeklyLeads}
            statusCounts={stats.statusCounts}
          />
        </div>
      </main>
    </div>
  )
}
