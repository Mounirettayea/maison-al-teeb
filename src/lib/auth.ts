import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type Role = 'admin' | 'manager' | 'cashier'

export type Profile = {
  id: string
  full_name: string | null
  role: Role
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser()
  return data.user ?? null
}

export async function getProfile(userId?: string): Promise<Profile | null> {
  const id = userId ?? (await getCurrentUser())?.id
  if (!id) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id,full_name,role')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as Profile | null
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session))
}
