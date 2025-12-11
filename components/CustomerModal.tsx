'use client'

import { useState } from 'react'
import { createCustomer, updateCustomer } from '@/app/actions/customers'

interface Customer {
  id: string
  firma: string
  telefon: string
  sektor?: string | null
  hizmet?: string | null
  odeme_durumu: string
  sehir?: string | null
  created_at?: string
}

interface CustomerModalProps {
  customer: Customer | null
  onClose: () => void
}

export default function CustomerModal({
  customer,
  onClose,
}: CustomerModalProps) {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    let result
    if (customer) {
      result = await updateCustomer(customer.id, formData)
    } else {
      result = await createCustomer(formData)
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
          {customer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
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
              defaultValue={customer?.firma || ''}
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
              defaultValue={customer?.telefon || ''}
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
              defaultValue={customer?.sektor || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hizmet
            </label>
            <input
              type="text"
              name="hizmet"
              defaultValue={customer?.hizmet || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ödeme Durumu
            </label>
            <select
              name="odeme_durumu"
              defaultValue={customer?.odeme_durumu || 'Beklemede'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="Beklemede">Beklemede</option>
              <option value="Ödeme Bekliyor">Ödeme Bekliyor</option>
              <option value="Ödendi">Ödendi</option>
            </select>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              {customer ? 'Güncelle' : 'Oluştur'}
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
