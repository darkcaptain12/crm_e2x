'use client'

import { useState } from 'react'
import StatusBadge from './StatusBadge'
import { deleteCustomer, updateCustomer } from '@/app/actions/customers'
import CustomerModal from './CustomerModal'
import CreateOfferModal from './CreateOfferModal'

interface Customer {
  id: string
  firma: string
  telefon: string
  sektor: string
  hizmet: string
  odeme_durumu: string
  created_at: string
}

interface CustomersTableProps {
  customers: Customer[]
}

export default function CustomersTable({
  customers: initialCustomers,
}: CustomersTableProps) {
  const [customers, setCustomers] = useState(initialCustomers || [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      const result = await deleteCustomer(id)
      if (result?.error) {
        setError(result.error)
      } else {
        setCustomers(customers.filter((customer) => customer.id !== id))
      }
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsModalOpen(true)
  }

  const handleCreateOffer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsOfferModalOpen(true)
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
            setEditingCustomer(null)
            setIsModalOpen(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Yeni Müşteri
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
                  Hizmet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ödeme Durumu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Müşteri bulunamadı. &quot;Yeni Müşteri&quot; butonuna tıklayarak ekleyebilirsiniz.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {customer.firma}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.telefon}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.sektor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.hizmet}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={customer.odeme_durumu}
                      onChange={async (e) => {
                        const formData = new FormData()
                        formData.append('firma', customer.firma)
                        formData.append('telefon', customer.telefon)
                        formData.append('sektor', customer.sektor)
                        formData.append('hizmet', customer.hizmet)
                        formData.append('odeme_durumu', e.target.value)
                        const result = await updateCustomer(customer.id, formData)
                        if (result?.error) {
                          alert(result.error)
                        } else {
                          setCustomers(customers.map(c => c.id === customer.id ? { ...c, odeme_durumu: e.target.value } : c))
                        }
                      }}
                      className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="Beklemede">Beklemede</option>
                      <option value="Ödeme Bekliyor">Ödeme Bekliyor</option>
                      <option value="Ödendi">Ödendi</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${customer.telefon}`}
                        className="text-primary-600 hover:text-primary-900"
                        title="Ara"
                      >
                        📞
                      </a>
                      <a
                        href={`https://wa.me/${customer.telefon.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900"
                        title="WhatsApp"
                      >
                        💬
                      </a>
                      <button
                        onClick={() => handleCreateOffer(customer)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Teklif Oluştur"
                      >
                        📄
                      </button>
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Düzenle"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
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
        <CustomerModal
          customer={editingCustomer}
          onClose={() => {
            setIsModalOpen(false)
            setEditingCustomer(null)
            window.location.reload()
          }}
        />
      )}
      {isOfferModalOpen && selectedCustomer && (
        <CreateOfferModal
          customerId={selectedCustomer.id}
          customerFirma={selectedCustomer.firma}
          onClose={() => {
            setIsOfferModalOpen(false)
            setSelectedCustomer(null)
          }}
        />
      )}
    </>
  )
}
