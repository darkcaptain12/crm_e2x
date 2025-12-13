'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCustomers(filters?: {
  sehir?: string
  sektor?: string
  odeme_durumu?: string
  hizmet?: string
}) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('crm_customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters) {
      if (filters.sehir) {
        query = query.ilike('sehir', `%${filters.sehir}%`)
      }
      if (filters.sektor) {
        query = query.ilike('sektor', `%${filters.sektor}%`)
      }
      if (filters.odeme_durumu) {
        query = query.eq('odeme_durumu', filters.odeme_durumu)
      }
      if (filters.hizmet) {
        query = query.ilike('hizmet', `%${filters.hizmet}%`)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching customers:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error in getCustomers:', error)
    return []
  }
}

export async function getCustomerById(id: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('crm_customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching customer:', error)
      return null
    }
    return data
  } catch (error) {
    console.error('Error in getCustomerById:', error)
    return null
  }
}

export async function createCustomer(formData: FormData) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('crm_customers')
    .insert({
      firma: formData.get('firma') as string,
      telefon: formData.get('telefon') as string,
      sektor: formData.get('sektor') as string,
      hizmet: formData.get('hizmet') as string,
      odeme_durumu: formData.get('odeme_durumu') as string || 'Beklemede',
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/customers')
  return { data }
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('crm_customers')
    .update({
      firma: formData.get('firma') as string,
      telefon: formData.get('telefon') as string,
      sektor: formData.get('sektor') as string,
      hizmet: formData.get('hizmet') as string,
      odeme_durumu: formData.get('odeme_durumu') as string,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/customers')
  return { data }
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('crm_customers')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/customers')
  return { success: true }
}

export async function convertToLead(customerId: string) {
  try {
    const supabase = await createClient()
    
    // Fetch the customer
    const { data: customer, error: customerError } = await supabase
      .from('crm_customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (customerError) {
      console.error('[convertToLead] Error fetching customer:', customerError)
      return { error: customerError.message || 'Müşteri bulunamadı' }
    }

    if (!customer) {
      console.error('[convertToLead] Customer not found:', customerId)
      return { error: 'Müşteri bulunamadı' }
    }

    // Create lead from customer data
    const { data: lead, error: leadError } = await supabase
      .from('crm_leads')
      .insert({
        firma: customer.firma,
        telefon: customer.telefon,
        sektor: customer.sektor || null,
        sehir: customer.sehir || null,
        kaynak: 'Müşteriden Dönüştürüldü',
        durum: 'Yeni',
      })
      .select()
      .single()

    if (leadError) {
      console.error('[convertToLead] Error creating lead:', leadError)
      return { error: leadError.message }
    }

    if (!lead) {
      console.error('[convertToLead] Lead creation returned no data')
      return { error: 'Potansiyel müşteri oluşturulamadı' }
    }

    // Delete the customer
    const { error: deleteError } = await supabase
      .from('crm_customers')
      .delete()
      .eq('id', customerId)

    if (deleteError) {
      console.warn('[convertToLead] Warning: Could not delete customer:', deleteError.message)
      // Don't fail if deletion fails - lead was created successfully
    }

    revalidatePath('/leads')
    revalidatePath('/customers')
    revalidatePath('/dashboard')

    // Return only serializable data
    const serializableLead = {
      id: String(lead.id),
      firma: String(lead.firma || ''),
      telefon: String(lead.telefon || ''),
      sektor: lead.sektor ? String(lead.sektor) : null,
      sehir: lead.sehir ? String(lead.sehir) : null,
      kaynak: lead.kaynak ? String(lead.kaynak) : null,
      durum: lead.durum ? String(lead.durum) : 'Yeni',
      ...(lead.created_at && { created_at: lead.created_at instanceof Date ? lead.created_at.toISOString() : String(lead.created_at) }),
    }

    return { data: serializableLead }
  } catch (error) {
    console.error('[convertToLead] Unexpected error:', error)
    return { error: error instanceof Error ? error.message : 'Dönüştürme başarısız oldu' }
  }
}

export async function convertToLeadBulk(customerIds: string[]) {
  try {
    if (!customerIds || customerIds.length === 0) {
      return { error: 'En az bir müşteri seçmelisiniz' }
    }

    const supabase = await createClient()
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Process each customer
    for (const customerId of customerIds) {
      try {
        // Fetch the customer
        const { data: customer, error: customerError } = await supabase
          .from('crm_customers')
          .select('*')
          .eq('id', customerId)
          .single()

        if (customerError || !customer) {
          results.failed++
          results.errors.push(`${customerId}: Müşteri bulunamadı`)
          continue
        }

        // Create lead from customer data
        const { data: lead, error: leadError } = await supabase
          .from('crm_leads')
          .insert({
            firma: customer.firma,
            telefon: customer.telefon,
            sektor: customer.sektor || null,
            sehir: customer.sehir || null,
            kaynak: 'Müşteriden Dönüştürüldü',
            durum: 'Yeni',
          })
          .select()
          .single()

        if (leadError || !lead) {
          results.failed++
          results.errors.push(`${customer.firma}: Potansiyel müşteri oluşturulamadı - ${leadError?.message || 'Bilinmeyen hata'}`)
          continue
        }

        // Delete the customer
        const { error: deleteError } = await supabase
          .from('crm_customers')
          .delete()
          .eq('id', customerId)

        if (deleteError) {
          console.warn(`[convertToLeadBulk] Warning: Could not delete customer ${customerId}:`, deleteError.message)
          // Don't fail if deletion fails - lead was created successfully
        }

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`${customerId}: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
      }
    }

    revalidatePath('/leads')
    revalidatePath('/customers')
    revalidatePath('/dashboard')

    if (results.failed > 0 && results.success === 0) {
      return { 
        error: `Tüm dönüştürmeler başarısız oldu. Hatalar: ${results.errors.join('; ')}` 
      }
    }

    return {
      data: {
        success: results.success,
        failed: results.failed,
        ...(results.errors.length > 0 && { errors: results.errors }),
      }
    }
  } catch (error) {
    console.error('[convertToLeadBulk] Unexpected error:', error)
    return { error: error instanceof Error ? error.message : 'Toplu dönüştürme başarısız oldu' }
  }
}
