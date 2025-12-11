import { getLeadById } from '@/app/actions/leads'
import { getNotesByRelated, createNote } from '@/app/actions/notes'
import Sidebar from '@/components/Sidebar'
import StatusBadge from '@/components/StatusBadge'
import LeadTimeline from '@/components/LeadTimeline'
import LeadDetailActions from '@/components/LeadDetailActions'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface LeadDetailPageProps {
  params: { id: string }
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const lead = await getLeadById(params.id)
  
  if (!lead) {
    notFound()
  }

  const notes = await getNotesByRelated('lead', params.id)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <a
              href="/leads"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4 inline-block"
            >
              ← Leads listesine dön
            </a>
          </div>

          {/* Main Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{lead.firma}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>📞 {lead.telefon}</span>
                  {lead.sektor && <span>🏢 {lead.sektor}</span>}
                  {lead.sehir && <span>📍 {lead.sehir}</span>}
                  {lead.kaynak && <span>🔗 {lead.kaynak}</span>}
                </div>
              </div>
              <StatusBadge status={lead.durum || lead.status || 'Yeni'} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <span className="text-gray-500">Oluşturulma Tarihi:</span>{' '}
                <span className="font-medium">
                  {new Date(lead.created_at).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {lead.next_action_date && (
                <div>
                  <span className="text-gray-500">Sonraki İşlem Tarihi:</span>{' '}
                  <span className="font-medium">
                    {new Date(lead.next_action_date).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>

            <LeadDetailActions lead={lead} />
          </div>

          {/* Timeline Section */}
          <LeadTimeline leadId={params.id} initialNotes={notes} />
        </div>
      </main>
    </div>
  )
}
