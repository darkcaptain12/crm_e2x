'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateLeadStatus, convertToCustomer } from '@/app/actions/leads'
import LeadModal from './LeadModal'

interface Lead {
  id: string
  firma: string
  telefon: string
  sektor: string | null
  sehir?: string | null
  kaynak: string | null
  durum?: string
  status?: string
  next_action_date?: string | null
}

interface LeadDetailActionsProps {
  lead: Lead
}

export default function LeadDetailActions({ lead }: LeadDetailActionsProps) {
  const router = useRouter()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    const formData = new FormData()
    formData.append('durum', newStatus)
    const result = await updateLeadStatus(lead.id, formData)
    if (result?.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  const handleConvert = async () => {
    if (!confirm('Bu lead\'i müşteriye dönüştürmek istediğinizden emin misiniz?')) {
      return
    }
    setIsConverting(true)
    try {
      const result = await convertToCustomer(lead.id)
      if (result?.error) {
        alert(result.error)
      } else {
        router.push('/customers')
      }
    } catch (error) {
      console.error('Error converting lead:', error)
      alert('Müşteriye dönüştürülürken bir hata oluştu.')
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
        <a
          href={`tel:${lead.telefon}`}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          📞 Ara
        </a>
        <a
          href={`https://wa.me/${lead.telefon.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          💬 WhatsApp
        </a>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          ✏️ Düzenle
        </button>
        <select
          value={lead.durum || lead.status || 'Yeni'}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
        >
          <option value="Yeni">Yeni</option>
          <option value="Arandı">Arandı</option>
          <option value="Teklif Gönderildi">Teklif Gönderildi</option>
          <option value="Satış Oldu">Satış Oldu</option>
          <option value="Ulaşılamadı">Ulaşılamadı</option>
        </select>
        <button
          onClick={handleConvert}
          disabled={isConverting}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
        >
          {isConverting ? 'Dönüştürülüyor...' : '➡️ Müşteriye Dönüştür'}
        </button>
      </div>

      {isEditModalOpen && (
        <LeadModal
          lead={lead}
          onClose={() => {
            setIsEditModalOpen(false)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
