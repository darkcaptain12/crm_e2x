'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getOffers() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('crm_offers')
      .select(`
        id,
        created_at,
        musteri_id,
        hizmet,
        tutar,
        para_birimi,
        durum,
        not,
        crm_customers!musteri_id (
          firma,
          telefon
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching offers:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error in getOffers:', error)
    return []
  }
}

export async function createOffer(formData: FormData) {
  try {
    const supabase = await createClient()
    const musteriId = formData.get('musteri_id') as string
    const hizmet = formData.get('hizmet') as string
    const tutar = formData.get('tutar') as string
    const paraBirimi = formData.get('para_birimi') as string || 'TL'
    const not = formData.get('not') as string || null

    // Validation
    if (!musteriId || !hizmet || !tutar) {
      return { error: 'Müşteri, hizmet ve tutar alanları zorunludur.' }
    }

    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(musteriId)) {
      return { error: 'Geçersiz müşteri ID formatı.' }
    }

    // Convert tutar to number
    const tutarNumber = Number(tutar)
    if (isNaN(tutarNumber) || tutarNumber <= 0) {
      return { error: 'Tutar geçerli bir sayı olmalıdır.' }
    }

    // Prepare insert data
    const insertData = {
      musteri_id: musteriId,
      hizmet: hizmet,
      tutar: tutarNumber,
      para_birimi: paraBirimi,
      durum: 'Beklemede',
      not: not || null,
    }

    console.log('Inserting offer with data:', insertData)

    const { data, error } = await supabase
      .from('crm_offers')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('offer insert error', error)
      return { error: error.message }
    }

    revalidatePath('/offers')
    revalidatePath('/customers')
    return { data }
  } catch (error) {
    console.error('offer insert error', error)
    return { error: 'Teklif kaydedilirken beklenmeyen bir hata oluştu.' }
  }
}

export async function updateOffer(id: string, formData: FormData) {
  try {
    const supabase = await createClient()
    const musteriId = formData.get('musteri_id') as string
    const hizmet = formData.get('hizmet') as string
    const tutar = formData.get('tutar') as string
    const paraBirimi = formData.get('para_birimi') as string
    const durum = formData.get('durum') as string
    const not = formData.get('not') as string || null

    // Validation
    if (!musteriId || !hizmet || !tutar || !paraBirimi || !durum) {
      return { error: 'Tüm zorunlu alanlar doldurulmalıdır.' }
    }

    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(musteriId)) {
      return { error: 'Geçersiz müşteri ID formatı.' }
    }

    // Convert tutar to number
    const tutarNumber = Number(tutar)
    if (isNaN(tutarNumber) || tutarNumber <= 0) {
      return { error: 'Tutar geçerli bir sayı olmalıdır.' }
    }

    // Prepare update data
    const updateData = {
      musteri_id: musteriId,
      hizmet: hizmet,
      tutar: tutarNumber,
      para_birimi: paraBirimi,
      durum: durum,
      not: not || null,
    }

    console.log('Updating offer with data:', updateData)

    const { data, error } = await supabase
      .from('crm_offers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('offer update error', error)
      return { error: error.message }
    }

    revalidatePath('/offers')
    return { data }
  } catch (error) {
    console.error('offer update error', error)
    return { error: 'Teklif güncellenirken beklenmeyen bir hata oluştu.' }
  }
}

export async function deleteOffer(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('crm_offers')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/offers')
  return { success: true }
}
