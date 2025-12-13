'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatusBadge from './StatusBadge'
import { deleteLead, convertToCustomer, updateLeadStatus, updateLeadStatusBulk, deleteLeadBulk, convertToCustomerBulk } from '@/app/actions/leads'
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
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads || [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [isActionDateModalOpen, setIsActionDateModalOpen] = useState(false)
  const [selectedLeadForAction, setSelectedLeadForAction] = useState<Lead | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)

  // Update leads when initialLeads prop changes (e.g., when filters change)
  useEffect(() => {
    setLeads(initialLeads || [])
    setSelectedIds(new Set()) // Clear selection when leads change
  }, [initialLeads])

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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(leads.map(l => l.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkStatusUpdate = async (durum: string) => {
    if (selectedIds.size === 0) {
      setError('Lütfen en az bir lead seçin')
      return
    }

    setIsBulkProcessing(true)
    setError(null)

    try {
      const result = await updateLeadStatusBulk(Array.from(selectedIds), durum)
      if (result?.error) {
        setError(result.error)
      } else {
        setLeads(leads.map(l => selectedIds.has(l.id) ? { ...l, durum } : l))
        setSelectedIds(new Set())
        router.refresh()
      }
    } catch (err) {
      setError('Toplu durum güncelleme sırasında bir hata oluştu')
    } finally {
      setIsBulkProcessing(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      setError('Lütfen en az bir lead seçin')
      return
    }

    const count = selectedIds.size
    if (!confirm(`${count} potansiyel müşteriyi silmek istediğinizden emin misiniz?`)) {
      return
    }

    setIsBulkProcessing(true)
    setError(null)

    try {
      const result = await deleteLeadBulk(Array.from(selectedIds))
      if (result?.error) {
        setError(result.error)
      } else {
        setLeads(leads.filter((lead) => !selectedIds.has(lead.id)))
        setSelectedIds(new Set())
        router.refresh()
      }
    } catch (err) {
      setError('Toplu silme sırasında bir hata oluştu')
    } finally {
      setIsBulkProcessing(false)
    }
  }

  const handleBulkConvert = async () => {
    if (selectedIds.size === 0) {
      setError('Lütfen en az bir lead seçin')
      return
    }

    const count = selectedIds.size
    if (!confirm(`${count} potansiyel müşteriyi müşteriye dönüştürmek istediğinizden emin misiniz?`)) {
      return
    }

    setIsBulkProcessing(true)
    setError(null)

    try {
      const result = await convertToCustomerBulk(Array.from(selectedIds))
      if (result?.error) {
        setError(result.error)
      } else {
        setLeads(leads.filter((lead) => !selectedIds.has(lead.id)))
        setSelectedIds(new Set())
        if (result?.data) {
          const { success, failed } = result.data
          if (failed > 0) {
            setError(`${success} lead başarıyla dönüştürüldü, ${failed} lead başarısız oldu`)
          }
        }
        router.refresh()
      }
    } catch (err) {
      setError('Toplu dönüştürme sırasında bir hata oluştu')
    } finally {
      setIsBulkProcessing(false)
    }
  }

  const isAllSelected = leads.length > 0 && selectedIds.size === leads.length
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < leads.length

  return (
    <>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-700">
              {selectedIds.size} lead seçildi
            </span>
            <select
              onChange={(e) => handleBulkStatusUpdate(e.target.value)}
              disabled={isBulkProcessing}
              className="text-sm border border-gray-300 rounded px-3 py-2 bg-white disabled:opacity-50"
              defaultValue=""
            >
              <option value="" disabled>Durum Güncelle</option>
              <option value="Yeni">Yeni</option>
              <option value="Arandı">Arandı</option>
              <option value="Teklif Gönderildi">Teklif Gönderildi</option>
              <option value="Satış Oldu">Satış Oldu</option>
              <option value="Ulaşılamadı">Ulaşılamadı</option>
            </select>
            <button
              onClick={handleBulkConvert}
              disabled={isBulkProcessing}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isBulkProcessing ? 'İşleniyor...' : `Seçili ${selectedIds.size} Lead'i Müşteriye Dönüştür`}
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkProcessing}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isBulkProcessing ? 'İşleniyor...' : `Seçili ${selectedIds.size} Lead'i Sil`}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Seçimi Temizle
            </button>
          </div>
        )}
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
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate
                    }}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
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
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Potansiyel müşteri bulunamadı. &quot;Yeni Potansiyel Müşteri&quot; butonuna tıklayarak ekleyebilirsiniz.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className={`hover:bg-gray-50 ${selectedIds.has(lead.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(lead.id)}
                      onChange={() => handleSelectOne(lead.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
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
                          router.refresh()
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
