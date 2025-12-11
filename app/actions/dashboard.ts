'use server'

import { createClient } from '@/lib/supabase/server'

export async function getCurrentUser() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function getDashboardStats() {
  try {
    const supabase = await createClient()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

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

    // Bugün aranacak lead sayısı: leads with next_action_date <= today and status indicates they need contact
    const todayLeadsToCall = leads.data?.filter((lead) => {
      const leadDate = lead.next_action_date ? new Date(lead.next_action_date) : null
      const durum = lead.durum || lead.status || 'Yeni'
      const needsContact = ['Yeni', 'Arandı', 'Teklif Gönderildi'].includes(durum)
      return leadDate && leadDate <= tomorrow && needsContact
    }).length || 0

    // Bu hafta eklenen lead sayısı
    const newLeadsLast7Days = leads.data?.filter(
      (lead) => new Date(lead.created_at) >= sevenDaysAgo
    ).length || 0

    // Bu ay verilen teklif sayısı
    const offersThisMonth = offers.data?.filter(
      (offer) => new Date(offer.created_at) >= firstDayOfMonth
    ).length || 0

    // Bu ay satışa dönen müşteri sayısı (customers with status "Satış Oldu" or offers with "Kabul Edildi")
    const wonDealsThisMonth = offers.data?.filter(
      (offer) => {
        const offerDate = new Date(offer.created_at)
        return offerDate >= firstDayOfMonth && (offer.durum === 'Kabul Edildi' || offer.durum === 'Kabul edildi')
      }
    ).length || 0

    // Bugün aranacaklar listesi
    const todayLeadsList = leads.data?.filter((lead) => {
      const leadDate = lead.next_action_date ? new Date(lead.next_action_date) : null
      const durum = lead.durum || lead.status || 'Yeni'
      const needsContact = ['Yeni', 'Arandı', 'Teklif Gönderildi'].includes(durum)
      return leadDate && leadDate <= tomorrow && needsContact
    }).map((lead) => ({
      id: lead.id,
      firma: lead.firma,
      telefon: lead.telefon,
      sektor: lead.sektor,
      sehir: lead.sehir || null,
      durum: lead.durum || lead.status || 'Yeni',
      next_action_date: lead.next_action_date,
    })) || []

    // Teklif bekleyenler: offers with status "Gönderildi" or "Bekliyor" or "Beklemede"
    const pendingOffers = offers.data?.filter((offer) => {
      const durum = offer.durum || offer.status || ''
      return ['Gönderildi', 'Bekliyor', 'Beklemede'].includes(durum)
    }).map((offer) => ({
      id: offer.id,
      musteri_id: offer.musteri_id || offer.customer_id,
      tutar: offer.tutar || offer.teklif_tutar || 0,
      para_birimi: offer.para_birimi || 'TL',
      durum: offer.durum || offer.status || 'Beklemede',
      created_at: offer.created_at,
      hizmet: offer.hizmet || '',
      not: offer.not || null,
    })) || []

    // Get customer names for pending offers
    const customerIds = Array.from(new Set(pendingOffers.map(o => o.musteri_id).filter(Boolean)))
    const customerMap: Record<string, string> = {}
    if (customerIds.length > 0) {
      const { data: customerData } = await supabase
        .from('crm_customers')
        .select('id, firma')
        .in('id', customerIds)
      
      customerData?.forEach(c => {
        customerMap[c.id] = c.firma
      })
    }

    const pendingOffersWithCustomerNames = pendingOffers.map(offer => ({
      ...offer,
      customer_name: offer.musteri_id ? customerMap[offer.musteri_id] || 'Bilinmeyen' : 'Bilinmeyen',
    }))

    const todayCalls = notes.data?.filter(
      (note) => {
        const noteDate = new Date(note.due_date || note.created_at)
        return noteDate.toDateString() === today.toDateString()
      }
    ).length || 0

    // Last 30 days for chart
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const dailyLeads = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const count = leads.data?.filter((lead) => {
        const leadDate = new Date(lead.created_at)
        return leadDate >= date && leadDate < nextDate
      }).length || 0

      dailyLeads.push({
        date: date.toISOString().split('T')[0],
        count,
      })
    }

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
      Yeni: leads.data?.filter((l) => (l.durum || l.status) === 'Yeni').length || 0,
      Arandı: leads.data?.filter((l) => (l.durum || l.status) === 'Arandı').length || 0,
      Teklif: leads.data?.filter((l) => (l.durum || l.status) === 'Teklif' || (l.durum || l.status) === 'Teklif Gönderildi').length || 0,
      Kazanıldı: leads.data?.filter((l) => (l.durum || l.status) === 'Kazanıldı' || (l.durum || l.status) === 'Satış Oldu').length || 0,
    }

    // Conversion rate calculation
    const totalLeads = leads.data?.length || 0
    const totalCustomers = customers.data?.length || 0
    const conversionRate = totalLeads > 0 ? (totalCustomers / totalLeads * 100) : 0

    return {
      todayCalls,
      todayLeadsToCall,
      newLeadsLast7Days,
      offersThisMonth,
      wonDealsThisMonth,
      sentOffers: offers.data?.filter((offer) => (offer.durum || offer.status) === 'Gönderildi').length || 0,
      wonDeals: offers.data?.filter((offer) => (offer.durum || offer.status) === 'Kabul Edildi' || (offer.durum || offer.status) === 'Kabul edildi').length || 0,
      totalCustomers,
      totalOffers: offers.data?.length || 0,
      weeklyLeads,
      dailyLeads,
      statusCounts,
      todayLeadsList,
      pendingOffers: pendingOffersWithCustomerNames,
      conversionRate: Math.round(conversionRate * 10) / 10,
      totalLeads,
    }
  } catch (error) {
    console.error('Error in getDashboardStats:', error)
    return {
      todayCalls: 0,
      todayLeadsToCall: 0,
      newLeadsLast7Days: 0,
      offersThisMonth: 0,
      wonDealsThisMonth: 0,
      sentOffers: 0,
      wonDeals: 0,
      totalCustomers: 0,
      totalOffers: 0,
      weeklyLeads: [],
      dailyLeads: [],
      statusCounts: {
        Yeni: 0,
        Arandı: 0,
        Teklif: 0,
        Kazanıldı: 0,
      },
      todayLeadsList: [],
      pendingOffers: [],
      conversionRate: 0,
      totalLeads: 0,
    }
  }
}
