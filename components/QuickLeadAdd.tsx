'use client'

import { useState } from 'react'
import { createLead } from '@/app/actions/leads'
import { useRouter } from 'next/navigation'

export default function QuickLeadAdd() {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firma: '',
    telefon: '',
    sektor: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('firma', formData.firma)
      formDataToSend.append('telefon', formData.telefon)
      formDataToSend.append('sektor', formData.sektor)
      formDataToSend.append('kaynak', 'manuel')

      const result = await createLead(formDataToSend)
      if (result?.error) {
        setError(result.error)
      } else {
        setFormData({ firma: '', telefon: '', sektor: '' })
        setIsExpanded(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Error creating lead:', error)
      setError('Lead eklenirken bir hata oluştu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isExpanded) {
    return (
      <div className="mb-4">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          + Hızlı Lead Ekle
        </button>
      </div>
    )
  }

  return (
    <div className="mb-6 bg-white rounded-lg shadow p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Hızlı Lead Ekle</h3>
        <button
          onClick={() => {
            setIsExpanded(false)
            setFormData({ firma: '', telefon: '', sektor: '' })
            setError(null)
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Firma adı *"
            value={formData.firma}
            onChange={(e) => setFormData({ ...formData, firma: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <input
            type="tel"
            placeholder="Telefon (opsiyonel)"
            value={formData.telefon}
            onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <input
            type="text"
            placeholder="Sektor (opsiyonel)"
            value={formData.sektor}
            onChange={(e) => setFormData({ ...formData, sektor: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
          </button>
        </div>
      </form>
    </div>
  )
}
