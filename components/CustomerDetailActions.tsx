'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CustomerModal from './CustomerModal'

interface Customer {
  id: string
  firma: string
  telefon: string
  sektor?: string | null
  sehir?: string | null
  hizmet?: string | null
  odeme_durumu: string
  created_at?: string
}

interface CustomerDetailActionsProps {
  customer: Customer
}

export default function CustomerDetailActions({ customer }: CustomerDetailActionsProps) {
  const router = useRouter()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  return (
    <>
      <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
        <a
          href={`tel:${customer.telefon}`}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          📞 Ara
        </a>
        <a
          href={`https://wa.me/${customer.telefon.replace(/[^0-9]/g, '')}`}
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
      </div>

      {isEditModalOpen && (
        <CustomerModal
          customer={customer}
          onClose={() => {
            setIsEditModalOpen(false)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
