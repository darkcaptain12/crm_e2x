'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
  try {
    const supabase = await createClient()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [leads, customers, offers, notes] = await Promise.all([
      supabase.from('crm_leads').select('*'),
      supabase.from('crm_customers').select('*'),
      supabase.from('crm_offers').select('*'),
      supabase.from('crm_notes').select('*'),
    ])

    // Check for errors
    if (leads.error) console.error('Error fetching leads:', leads.error)
    if (customers.error) console.error('Error fetching customers:', customers.error)
    if (offers.error) console.error('Error fetching offers:', offers.error)
    if (notes.error) console.error('Error fetching notes:', notes.error)

  const newLeadsLast7Days = leads.data?.filter(
    (lead) => new Date(lead.created_at) >= sevenDaysAgo
  ).length || 0

  const sentOffers = offers.data?.filter(
    (offer) => offer.status === 'Gönderildi'
  ).length || 0

  const wonDeals = offers.data?.filter(
    (offer) => offer.status === 'Kabul Edildi'
  ).length || 0

  const todayCalls = notes.data?.filter(
    (note) => {
      const noteDate = new Date(note.due_date || note.created_at)
      return noteDate.toDateString() === today.toDateString()
    }
  ).length || 0

  const weeklyLeads = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    const count = leads.data?.filter((lead) => {
      const leadDate = new Date(lead.created_at)
      return leadDate >= date && leadDate < nextDate
    }).length || 0

    weeklyLeads.push({
      date: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
      count,
    })
  }

  const statusCounts = {
    Yeni: leads.data?.filter((l) => l.status === 'Yeni').length || 0,
    Arandı: leads.data?.filter((l) => l.status === 'Arandı').length || 0,
    Teklif: leads.data?.filter((l) => l.status === 'Teklif').length || 0,
    Kazanıldı: leads.data?.filter((l) => l.status === 'Kazanıldı').length || 0,
  }

    return {
      todayCalls,
      newLeadsLast7Days,
      sentOffers,
      wonDeals,
      totalCustomers: customers.data?.length || 0,
      totalOffers: offers.data?.length || 0,
      weeklyLeads,
      statusCounts,
    }
  } catch (error) {
    console.error('Error in getDashboardStats:', error)
    return {
      todayCalls: 0,
      newLeadsLast7Days: 0,
      sentOffers: 0,
      wonDeals: 0,
      totalCustomers: 0,
      totalOffers: 0,
      weeklyLeads: [],
      statusCounts: {
        Yeni: 0,
        Arandı: 0,
        Teklif: 0,
        Kazanıldı: 0,
      },
    }
  }
}
