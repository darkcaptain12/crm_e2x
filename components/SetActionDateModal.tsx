'use client'

import { useState } from 'react'
import { updateLeadNextActionDate } from '@/app/actions/leads'
import { useRouter } from 'next/navigation'

interface SetActionDateModalProps {
  leadId: string
  leadFirma: string
  currentDate: string | null
  onClose: () => void
}

export default function SetActionDateModal({
  leadId,
  leadFirma,
  currentDate,
  onClose,
}: SetActionDateModalProps) {
  const [selectedOption, setSelectedOption] = useState<'today' | 'tomorrow' | 'custom' | null>(null)
  const [customDate, setCustomDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    let dateToSet: string | null = null

    if (selectedOption === 'today') {
      const today = new Date()
      today.setHours(9, 0, 0, 0) // Default to 9 AM
      dateToSet = today.toISOString()
    } else if (selectedOption === 'tomorrow') {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0)
      dateToSet = tomorrow.toISOString()
    } else if (selectedOption === 'custom' && customDate) {
      const date = new Date(customDate)
      date.setHours(9, 0, 0, 0)
      dateToSet = date.toISOString()
    }

    const result = await updateLeadNextActionDate(leadId, dateToSet)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      onClose()
      router.refresh()
    }
  }

  const handleClear = async () => {
    setIsSubmitting(true)
    setError(null)

    const result = await updateLeadNextActionDate(leadId, null)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      onClose()
      router.refresh()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-2">Takip Tarihi Belirle</h2>
        <p className="text-sm text-gray-600 mb-4">Müşteri: <span className="font-medium">{leadFirma}</span></p>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-4">
          <button
            onClick={() => setSelectedOption('today')}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
              selectedOption === 'today'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-900">Bugün</div>
            <div className="text-sm text-gray-500">Takip tarihini bugüne ayarla</div>
          </button>

          <button
            onClick={() => setSelectedOption('tomorrow')}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
              selectedOption === 'tomorrow'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-900">Yarın</div>
            <div className="text-sm text-gray-500">Takip tarihini yarına ayarla</div>
          </button>

          <button
            onClick={() => setSelectedOption('custom')}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
              selectedOption === 'custom'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-900 mb-2">Tarihi Seç</div>
            {selectedOption === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min={new Date().toISOString().split('T')[0]}
              />
            )}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!selectedOption || isSubmitting || (selectedOption === 'custom' && !customDate)}
            className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          {currentDate && (
            <button
              onClick={handleClear}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Temizle
            </button>
          )}
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  )
}
