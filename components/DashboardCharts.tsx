'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface DashboardChartsProps {
  weeklyLeads: Array<{ date: string; count: number }>
  dailyLeads?: Array<{ date: string; count: number }>
  statusCounts: {
    Yeni: number
    Arandı: number
    Teklif: number
    Kazanıldı: number
  }
  conversionRate?: number
  totalLeads?: number
  totalCustomers?: number
}

export default function DashboardCharts({
  weeklyLeads,
  dailyLeads = [],
  statusCounts,
  conversionRate = 0,
  totalLeads = 0,
  totalCustomers = 0,
}: DashboardChartsProps) {
  const hasDailyData = dailyLeads.length > 0 && dailyLeads.some(d => d.count > 0)
  const hasConversionData = totalLeads > 0

  // 30-day daily leads chart
  const dailyLeadsData = {
    labels: dailyLeads.map((item) => {
      const date = new Date(item.date)
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
    }),
    datasets: [
      {
        label: 'Günlük Lead Sayısı',
        data: dailyLeads.map((item) => item.count),
        borderColor: 'rgb(20, 184, 166)',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        tension: 0.4,
      },
    ],
  }

  // Weekly leads chart
  const weeklyLineData = {
    labels: weeklyLeads.map((item) => item.date),
    datasets: [
      {
        label: 'Potansiyel Müşteriler',
        data: weeklyLeads.map((item) => item.count),
        borderColor: 'rgb(20, 184, 166)',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        tension: 0.4,
      },
    ],
  }

  // Status bar chart
  const barData = {
    labels: ['Yeni', 'Arandı', 'Teklif', 'Kazanıldı'],
    datasets: [
      {
        label: 'Duruma Göre Potansiyel Müşteriler',
        data: [
          statusCounts.Yeni,
          statusCounts.Arandı,
          statusCounts.Teklif,
          statusCounts.Kazanıldı,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
      },
    ],
  }

  // Conversion rate donut chart
  const conversionData = {
    labels: ['Lead', 'Müşteriye Dönen'],
    datasets: [
      {
        data: [totalLeads - totalCustomers, totalCustomers],
        backgroundColor: [
          'rgba(156, 163, 175, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        display: true,
      },
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 30-day daily leads chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Son 30 Günde Günlük Lead Sayısı</h2>
        {hasDailyData ? (
          <div className="h-64">
            <Line data={dailyLeadsData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>Henüz yeterli veri yok. Lead ekledikçe grafik burada görünecek.</p>
          </div>
        )}
      </div>

      {/* Conversion rate chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Lead → Müşteri Dönüşüm Oranı</h2>
        {hasConversionData ? (
          <>
            <div className="h-48 mb-4">
              <Doughnut data={conversionData} options={donutOptions} />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{conversionRate}%</p>
              <p className="text-sm text-gray-600 mt-1">
                {totalCustomers} müşteri / {totalLeads} lead
              </p>
            </div>
          </>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>Henüz yeterli veri yok. Lead ve müşteri ekledikçe dönüşüm oranı burada görünecek.</p>
          </div>
        )}
      </div>
    </div>
  )
}
