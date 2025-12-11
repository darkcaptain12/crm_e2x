'use client'

import { useState } from 'react'
import StatusBadge from './StatusBadge'
import { deleteLead, convertToCustomer, updateLeadStatus } from '@/app/actions/leads'
import LeadModal from './LeadModal'
import SetActionDateModal from './SetActionDateModal'

interface Lead {
  id: string
  firma: string
  telefon: string
  sektor: string
  kaynak: string
  status?: string
  durum?: string
  next_action_date?: string | null
  created_at: string
}

interface LeadsTableProps {
  leads: Lead[]
}

export default function LeadsTable({ leads: initialLeads }: LeadsTableProps) {
  const [leads, setLeads] = useState(initialLeads || [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [isActionDateModalOpen, setIsActionDateModalOpen] = useState(false)
  const [selectedLeadForAction, setSelectedLeadForAction] = useState<Lead | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm('Bu potansiyel müşteriyi silmek istediğinizden emin misiniz?')) {
      const result = await deleteLead(id)
      if (result?.error) {
        setError(result.error)
      } else {
        setLeads(leads.filter((lead) => lead.id !== id))
      }
    }
  }

  const handleConvert = async (id: string) => {
    if (confirm('Bu potansiyel müşteriyi müşteriye dönüştürmek istiyor musunuz?')) {
      const result = await convertToCustomer(id)
      if (result?.error) {
        setError(result.error)
      } else {
        setLeads(leads.filter((lead) => lead.id !== id))
      }
    }
  }

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead)
    setIsModalOpen(true)
  }

  const handleSetActionDate = (lead: Lead) => {
    setSelectedLeadForAction(lead)
    setIsActionDateModalOpen(true)
  }

  return (
    <>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => {
            setEditingLead(null)
            setIsModalOpen(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Yeni Potansiyel Müşteri
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Firma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sektor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kaynak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Potansiyel müşteri bulunamadı. &quot;Yeni Potansiyel Müşteri&quot; butonuna tıklayarak ekleyebilirsiniz.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lead.firma}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.telefon}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.sektor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.kaynak}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={lead.durum || lead.status || 'Yeni'}
                      onChange={async (e) => {
                        const formData = new FormData()
                        formData.append('durum', e.target.value)
                        const result = await updateLeadStatus(lead.id, formData)
                        if (result?.error) {
                          alert(result.error)
                        } else {
                          setLeads(leads.map(l => l.id === lead.id ? { ...l, durum: e.target.value } : l))
                        }
                      }}
                      className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="Yeni">Yeni</option>
                      <option value="Arandı">Arandı</option>
                      <option value="Teklif Gönderildi">Teklif Gönderildi</option>
                      <option value="Satış Oldu">Satış Oldu</option>
                      <option value="Ulaşılamadı">Ulaşılamadı</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${lead.telefon}`}
                        className="text-primary-600 hover:text-primary-900"
                        title="Ara"
                      >
                        📞
                      </a>
                      <a
                        href={`https://wa.me/${lead.telefon.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900"
                        title="WhatsApp"
                      >
                        💬
                      </a>
                      <button
                        onClick={() => handleSetActionDate(lead)}
                        className="text-orange-600 hover:text-orange-900"
                        title="Takip Tarihi"
                      >
                        📅
                      </button>
                      <button
                        onClick={() => handleEdit(lead)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Düzenle"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleConvert(lead.id)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Müşteriye Dönüştür"
                      >
                        ➡️
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <LeadModal
          lead={editingLead}
          onClose={() => {
            setIsModalOpen(false)
            setEditingLead(null)
            window.location.reload()
          }}
        />
      )}
      {isActionDateModalOpen && selectedLeadForAction && (
        <SetActionDateModal
          leadId={selectedLeadForAction.id}
          leadFirma={selectedLeadForAction.firma}
          currentDate={selectedLeadForAction.next_action_date || null}
          onClose={() => {
            setIsActionDateModalOpen(false)
            setSelectedLeadForAction(null)
          }}
        />
      )}
    </>
  )
}
