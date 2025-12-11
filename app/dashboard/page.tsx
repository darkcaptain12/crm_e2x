import { getDashboardStats, getCurrentUser } from '@/app/actions/dashboard'
import Sidebar from '@/components/Sidebar'
import StatsCard from '@/components/StatsCard'
import DashboardCharts from '@/components/DashboardCharts'
import TodayLeadsList from '@/components/TodayLeadsList'
import PendingOffersList from '@/components/PendingOffersList'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const userName = user?.email?.split('@')[0] || 'Kullanıcı'
  
  let stats
  try {
    stats = await getDashboardStats()
  } catch (error) {
    console.error('Error loading dashboard:', error)
    stats = {
      todayCalls: 0,
      todayLeadsToCall: 0,
      newLeadsLast7Days: 0,
      offersThisMonth: 0,
      wonDealsThisMonth: 0,
      sentOffers: 0,
      wonDeals: 0,
      totalCustomers: 0,
      totalOffers: 0,
      weeklyLeads: [],
      dailyLeads: [],
      statusCounts: {
        Yeni: 0,
        Arandı: 0,
        Teklif: 0,
        Kazanıldı: 0,
      },
      todayLeadsList: [],
      pendingOffers: [],
      conversionRate: 0,
      totalLeads: 0,
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Merhaba, {userName.charAt(0).toUpperCase() + userName.slice(1)}
          </h1>
          <p className="text-gray-600 mb-8">Bugün ne yapacağınızı görmek için aşağıya bakın 👇</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Bugün aranacak lead sayısı"
              value={stats.todayLeadsToCall}
              icon="📞"
            />
            <StatsCard
              title="Bu hafta eklenen lead sayısı"
              value={stats.newLeadsLast7Days}
              icon="👥"
            />
            <StatsCard
              title="Bu ay verilen teklif sayısı"
              value={stats.offersThisMonth}
              icon="📧"
            />
            <StatsCard
              title="Bu ay satışa dönen müşteri sayısı"
              value={stats.wonDealsThisMonth}
              icon="✅"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <TodayLeadsList leads={stats.todayLeadsList} />
            <PendingOffersList offers={stats.pendingOffers} />
          </div>

          <DashboardCharts
            weeklyLeads={stats.weeklyLeads}
            dailyLeads={stats.dailyLeads}
            statusCounts={stats.statusCounts}
            conversionRate={stats.conversionRate}
            totalLeads={stats.totalLeads}
            totalCustomers={stats.totalCustomers}
          />
        </div>
      </main>
    </div>
  )
}
