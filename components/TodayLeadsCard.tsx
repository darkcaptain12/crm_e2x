'use client'

import Link from 'next/link'

interface Lead {
  id: string
  firma: string
  telefon: string
  sektor: string | null
  next_action_date: string | null
}

interface TodayLeadsCardProps {
  leads: Lead[]
}

function formatTime(dateString: string | null): string {
  if (!dateString) return 'Tarih yok'
  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const actionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (actionDate.getTime() === today.getTime()) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `Bugün ${hours}:${minutes}`
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (actionDate.getTime() === yesterday.getTime()) {
    return 'Dün'
  }

  if (actionDate < today) {
    return 'Geçti'
  }

  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
}

export default function TodayLeadsCard({ leads }: TodayLeadsCardProps) {
  if (leads.length === 0) {
    return null
  }

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Bugün Aranacaklar</h2>
        <Link
          href="/leads"
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Tümünü gör →
        </Link>
      </div>
      <div className="space-y-3">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex-1">
              <div className="font-medium text-slate-800">{lead.firma}</div>
              <div className="text-sm text-slate-600 mt-1">
                {lead.telefon} {lead.sektor && `• ${lead.sektor}`}
              </div>
            </div>
            <div className="text-sm text-slate-500 font-medium ml-4">
              {formatTime(lead.next_action_date)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
