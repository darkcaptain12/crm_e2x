'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getLeads(
  statusFilter?: string,
  filters?: {
    sehir?: string
    sektor?: string
    kaynak?: string
  }
) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('crm_leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'Tümü') {
      query = query.eq('durum', statusFilter)
    }

    if (filters) {
      if (filters.sehir) {
        query = query.ilike('sehir', `%${filters.sehir}%`)
      }
      if (filters.sektor) {
        query = query.ilike('sektor', `%${filters.sektor}%`)
      }
      if (filters.kaynak) {
        query = query.eq('kaynak', filters.kaynak)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching leads:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error in getLeads:', error)
    return []
  }
}

export async function getLeadById(id: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching lead:', error)
      return null
    }
    return data
  } catch (error) {
    console.error('Error in getLeadById:', error)
    return null
  }
}

export async function getTodayLeads() {
  try {
    const supabase = await createClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .in('durum', ['Yeni', 'Arandı'])
      .not('next_action_date', 'is', null)
      .lte('next_action_date', tomorrow.toISOString())
      .order('next_action_date', { ascending: true })
      .limit(10)

    if (error) {
      console.error('Error fetching today leads:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error in getTodayLeads:', error)
    return []
  }
}

export async function updateLeadNextActionDate(id: string, nextActionDate: string | null) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('crm_leads')
      .update({ next_action_date: nextActionDate })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating lead next_action_date:', error)
      return { error: error.message }
    }

    revalidatePath('/leads')
    return { data }
  } catch (error) {
    console.error('Error in updateLeadNextActionDate:', error)
    return { error: 'Takip tarihi güncellenirken bir hata oluştu.' }
  }
}

export async function createLead(formData: FormData) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('crm_leads')
    .insert({
      firma: formData.get('firma') as string,
      telefon: formData.get('telefon') as string,
      sektor: formData.get('sektor') as string,
      kaynak: formData.get('kaynak') as string,
      status: 'Yeni',
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/leads')
  return { data }
}

export async function updateLeadStatus(id: string, formData: FormData) {
  const supabase = await createClient()
  const durum = formData.get('durum') as string
  const status = formData.get('status') as string
  
  const updateData: any = {}
  if (durum) {
    updateData.durum = durum
  } else if (status) {
    updateData.durum = status
  }

  const { data, error } = await supabase
    .from('crm_leads')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/leads')
  revalidatePath('/dashboard')
  return { data }
}

export async function updateLead(id: string, formData: FormData) {
  const supabase = await createClient()
  const updateData: any = {
      firma: formData.get('firma') as string,
      telefon: formData.get('telefon') as string,
      sektor: formData.get('sektor') as string,
      kaynak: formData.get('kaynak') as string,
  }

  // Use durum if provided, otherwise fall back to status
  const durum = formData.get('durum') as string
  const status = formData.get('status') as string
  if (durum) {
    updateData.durum = durum
  } else if (status) {
    updateData.durum = status
  }

  const { data, error } = await supabase
    .from('crm_leads')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/leads')
  return { data }
}

export async function deleteLead(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('crm_leads')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/leads')
  return { success: true }
}

export async function convertToCustomer(leadId: string) {
  try {
    const supabase = await createClient()
    
    const { data: lead, error: leadError } = await supabase
      .from('crm_leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (leadError) {
      console.error('[convertToCustomer] Error fetching lead:', leadError)
      return { error: leadError.message || 'Lead not found' }
    }

    if (!lead) {
      console.error('[convertToCustomer] Lead not found:', leadId)
      return { error: 'Lead not found' }
    }

    const { data: customer, error: customerError } = await supabase
      .from('crm_customers')
      .insert({
        firma: lead.firma,
        telefon: lead.telefon,
        sektor: lead.sektor || null,
        sehir: lead.sehir || null,
        hizmet: '',
        odeme_durumu: 'Beklemede',
      })
      .select()
      .single()

    if (customerError) {
      console.error('[convertToCustomer] Error creating customer:', customerError)
      return { error: customerError.message }
    }

    if (!customer) {
      console.error('[convertToCustomer] Customer creation returned no data')
      return { error: 'Customer creation failed' }
    }

    // Update lead status before deletion
    await supabase
      .from('crm_leads')
      .update({ durum: 'Satış Oldu' })
      .eq('id', leadId)

    // Delete the lead
    const { error: deleteError } = await supabase
      .from('crm_leads')
      .delete()
      .eq('id', leadId)

    if (deleteError) {
      console.warn('[convertToCustomer] Warning: Could not delete lead:', deleteError.message)
      // Don't fail if deletion fails - customer was created successfully
    }

    revalidatePath('/leads')
    revalidatePath('/customers')
    revalidatePath('/dashboard')
    return { data: customer }
  } catch (error) {
    console.error('[convertToCustomer] Unexpected error:', error)
    return { error: error instanceof Error ? error.message : 'Conversion failed' }
  }
}
