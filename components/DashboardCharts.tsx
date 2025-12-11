'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface DashboardChartsProps {
  weeklyLeads: Array<{ date: string; count: number }>
  statusCounts: {
    Yeni: number
    Arandı: number
    Teklif: number
    Kazanıldı: number
  }
}

export default function DashboardCharts({
  weeklyLeads,
  statusCounts,
}: DashboardChartsProps) {
  const lineData = {
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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Haftalık Potansiyel Müşteriler</h2>
        <div className="h-64">
          <Line data={lineData} options={options} />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dönüşüm Hunisi</h2>
        <div className="h-64">
          <Bar data={barData} options={options} />
        </div>
      </div>
    </div>
  )
}
