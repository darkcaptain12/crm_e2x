'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCustomers() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('crm_customers')
      .select('*')
      .order('created_at', { ascending: false })

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
