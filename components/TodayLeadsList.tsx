'use client'

import Link from 'next/link'
import StatusBadge from './StatusBadge'
import { updateLeadStatus } from '@/app/actions/leads'
import { useState } from 'react'

interface TodayLead {
  id: string
  firma: string
  telefon: string
  sektor: string | null
  sehir: string | null
  durum: string
  next_action_date: string | null
}

interface TodayLeadsListProps {
  leads: TodayLead[]
}

export default function TodayLeadsList({ leads: initialLeads }: TodayLeadsListProps) {
  const [leads, setLeads] = useState(initialLeads || [])
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdatingId(leadId)
    try {
      const formData = new FormData()
      formData.append('durum', newStatus)
      const result = await updateLeadStatus(leadId, formData)
      if (result?.error) {
        alert(result.error)
      } else {
        setLeads(leads.map(l => l.id === leadId ? { ...l, durum: newStatus } : l))
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Tarih yok'
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Bugün Aranacaklar</h2>
        <p className="text-gray-500 text-center py-8">
          Bugün aranacak lead bulunmuyor. Tüm leadler güncel! 🎉
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Bugün Aranacaklar</h2>
        <Link
          href="/leads"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Tümünü gör →
        </Link>
      </div>
      
      {/* Mobile Card View */}
      <div className="block lg:hidden divide-y divide-gray-200">
        {leads.map((lead) => (
          <div key={lead.id} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-gray-900 text-sm flex-1 pr-2 leading-tight">{lead.firma}</h3>
              <StatusBadge status={lead.durum} />
            </div>
            
            <div className="space-y-2 text-xs text-gray-600 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">📞</span>
                <a href={`tel:${lead.telefon}`} className="text-primary-600 hover:underline font-medium">
                  {lead.telefon}
                </a>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {lead.sehir && (
                  <div className="flex items-center gap-1.5">
                    <span>📍</span>
                    <span>{lead.sehir}</span>
                  </div>
                )}
                {lead.sektor && (
                  <div className="flex items-center gap-1.5">
                    <span>🏢</span>
                    <span>{lead.sektor}</span>
                  </div>
                )}
                {lead.next_action_date && (
                  <div className="flex items-center gap-1.5">
                    <span>📅</span>
                    <span>{formatDate(lead.next_action_date)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <a
                href={`tel:${lead.telefon}`}
                className="text-primary-600 hover:text-primary-800 text-lg p-1.5 hover:bg-primary-50 rounded transition-colors"
                title="Ara"
              >
                📞
              </a>
              <a
                href={`https://wa.me/${lead.telefon.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 text-lg p-1.5 hover:bg-green-50 rounded transition-colors"
                title="WhatsApp"
              >
                💬
              </a>
              <select
                value={lead.durum}
                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                disabled={updatingId === lead.id}
                className="text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white flex-1 min-w-[130px]"
              >
                <option value="Yeni">Yeni</option>
                <option value="Arandı">Arandı</option>
                <option value="Teklif Gönderildi">Teklif Gönderildi</option>
                <option value="Satış Oldu">Satış Oldu</option>
                <option value="Ulaşılamadı">Ulaşılamadı</option>
              </select>
              <Link
                href={`/leads/${lead.id}`}
                className="text-blue-600 hover:text-blue-700 text-lg p-1.5 hover:bg-blue-50 rounded transition-colors"
                title="Detay"
              >
                👁️
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View - Clean Grid Layout */}
      <div className="hidden lg:block">
        <div className="divide-y divide-gray-200">
          {leads.map((lead) => (
            <div key={lead.id} className="px-4 py-3 hover:bg-gray-50">
              <div className="flex items-start gap-4">
                {/* Left Section - Company Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="font-medium text-sm text-gray-900 flex-1 min-w-0" title={lead.firma}>
                      <span className="block truncate">{lead.firma}</span>
                    </h3>
                    <StatusBadge status={lead.durum} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1.5">
                    {lead.sehir && (
                      <span className="flex items-center gap-1">
                        <span>📍</span>
                        <span>{lead.sehir}</span>
                      </span>
                    )}
                    {lead.sektor && (
                      <span className="flex items-center gap-1">
                        <span>🏢</span>
                        <span>{lead.sektor}</span>
                      </span>
                    )}
                    {lead.next_action_date && (
                      <span className="flex items-center gap-1">
                        <span>📅</span>
                        <span>{formatDate(lead.next_action_date)}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Section - Phone & Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <a 
                    href={`tel:${lead.telefon}`} 
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
                  >
                    {lead.telefon}
                  </a>
                  
                  <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                    <a
                      href={`tel:${lead.telefon}`}
                      className="text-primary-600 hover:text-primary-800 text-lg p-1 hover:bg-primary-50 rounded transition-colors"
                      title="Ara"
                    >
                      📞
                    </a>
                    <a
                      href={`https://wa.me/${lead.telefon.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 text-lg p-1 hover:bg-green-50 rounded transition-colors"
                      title="WhatsApp"
                    >
                      💬
                    </a>
                    <select
                      value={lead.durum}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      disabled={updatingId === lead.id}
                      className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white hover:border-gray-400 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="Yeni">Yeni</option>
                      <option value="Arandı">Arandı</option>
                      <option value="Teklif Gönderildi">Teklif Gönderildi</option>
                      <option value="Satış Oldu">Satış Oldu</option>
                      <option value="Ulaşılamadı">Ulaşılamadı</option>
                    </select>
                    <Link
                      href={`/leads/${lead.id}`}
                      className="text-blue-600 hover:text-blue-700 text-lg p-1 hover:bg-blue-50 rounded transition-colors"
                      title="Detay"
                    >
                      👁️
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tablet View - Card Style */}
      <div className="hidden md:block lg:hidden">
        {leads.map((lead) => (
          <div key={lead.id} className="px-4 py-3 border-b border-gray-200 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0 pr-3">
                <h3 className="font-medium text-sm text-gray-900 mb-1" title={lead.firma}>
                  {lead.firma}
                </h3>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                  {lead.sehir && <span>📍 {lead.sehir}</span>}
                  {lead.sektor && <span>🏢 {lead.sektor}</span>}
                  {lead.next_action_date && <span>📅 {formatDate(lead.next_action_date)}</span>}
                </div>
              </div>
              <StatusBadge status={lead.durum} />
            </div>
            <div className="flex items-center justify-between gap-3 mt-2">
              <a 
                href={`tel:${lead.telefon}`} 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {lead.telefon}
              </a>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${lead.telefon}`}
                  className="text-primary-600 hover:text-primary-800 text-lg p-1"
                  title="Ara"
                >
                  📞
                </a>
                <a
                  href={`https://wa.me/${lead.telefon.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-lg p-1"
                  title="WhatsApp"
                >
                  💬
                </a>
                <select
                  value={lead.durum}
                  onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                  disabled={updatingId === lead.id}
                  className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white"
                >
                  <option value="Yeni">Yeni</option>
                  <option value="Arandı">Arandı</option>
                  <option value="Teklif Gönderildi">Teklif Gönderildi</option>
                  <option value="Satış Oldu">Satış Oldu</option>
                  <option value="Ulaşılamadı">Ulaşılamadı</option>
                </select>
                <Link
                  href={`/leads/${lead.id}`}
                  className="text-blue-600 hover:text-blue-700 text-lg p-1"
                  title="Detay"
                >
                  👁️
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
