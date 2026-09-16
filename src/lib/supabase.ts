import { createClient } from '@supabase/supabase-js'

// Production-safe public Supabase configuration for the Maison Al Teeb frontend.
// The publishable/anon key is intended for browser use; database access remains
// protected by Supabase RLS policies.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)
  ?? 'https://mbjgirwuqzcjrllnokzj.supabase.co'
const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)
  ?? 'sb_publishable_gEivTgSBsntxUkkJc3h9AA_-cmDpszh'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
