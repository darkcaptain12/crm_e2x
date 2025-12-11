import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase ortam değişkenleri eksik. Lütfen .env.local dosyanızı kontrol edin.')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
