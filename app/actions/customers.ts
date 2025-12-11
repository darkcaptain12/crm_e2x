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
