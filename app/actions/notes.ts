'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getNotes() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('crm_notes')
      .select('*')
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Error fetching notes:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error in getNotes:', error)
    return []
  }
}

export async function getNotesByRelated(relatedType: 'lead' | 'customer', relatedId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('crm_notes')
      .select('*')
      .eq('related_type', relatedType)
      .eq('related_id', relatedId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error in getNotesByRelated:', error)
    return []
  }
}

export async function createNote(formData: FormData) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('crm_notes')
    .insert({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      due_date: formData.get('due_date') as string || null,
      related_type: formData.get('related_type') as string || null,
      related_id: formData.get('related_id') as string || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/notes')
  return { data }
}

export async function updateNote(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('crm_notes')
    .update({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      due_date: formData.get('due_date') as string || null,
      related_type: formData.get('related_type') as string || null,
      related_id: formData.get('related_id') as string || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/notes')
  return { data }
}

export async function deleteNote(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('crm_notes')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/notes')
  return { success: true }
}
