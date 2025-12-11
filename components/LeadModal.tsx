'use client'

import { useState } from 'react'
import { createLead, updateLead } from '@/app/actions/leads'

interface Lead {
  id: string
  firma: string
  telefon: string
  sektor?: string | null
  kaynak?: string | null
  status?: string
  durum?: string
  sehir?: string | null
  next_action_date?: string | null
  created_at?: string
}

interface LeadModalProps {
  lead: Lead | null
  onClose: () => void
}

export default function LeadModal({ lead, onClose }: LeadModalProps) {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    let result
    if (lead) {
      result = await updateLead(lead.id, formData)
    } else {
      result = await createLead(formData)
    }
    if (result?.error) {
      setError(result.error)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">
          {lead ? 'Potansiyel Müşteri Düzenle' : 'Yeni Potansiyel Müşteri'}
        </h2>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Firma
            </label>
            <input
              type="text"
              name="firma"
              required
              defaultValue={lead?.firma || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              name="telefon"
              required
              defaultValue={lead?.telefon || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sektor
            </label>
            <input
              type="text"
              name="sektor"
              required
              defaultValue={lead?.sektor || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kaynak
            </label>
            <input
              type="text"
              name="kaynak"
              required
              defaultValue={lead?.kaynak || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {lead && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                name="durum"
                defaultValue={lead.durum || lead.status || 'Yeni'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="Yeni">Yeni</option>
                <option value="Arandı">Arandı</option>
                <option value="Teklif Gönderildi">Teklif Gönderildi</option>
                <option value="Satış Oldu">Satış Oldu</option>
                <option value="Ulaşılamadı">Ulaşılamadı</option>
              </select>
            </div>
          )}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              {lead ? 'Güncelle' : 'Oluştur'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
