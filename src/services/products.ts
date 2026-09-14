import { supabase } from '../lib/supabase'
import type { Product } from '../types/product'

export async function listProducts(options?: { search?: string; activeOnly?: boolean }) {
  let query = supabase
    .from('products')
    .select('id,name,category,price,stock,active,barcode,image_url')
    .order('id', { ascending: false })

  if (options?.activeOnly) query = query.eq('active', true)
  if (options?.search?.trim()) {
    const search = options.search.trim().replace(/[%(),]/g, ' ')
    query = query.or(`name.ilike.%${search}%,barcode.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Product[]
}

export async function getProductByBarcode(barcode: string) {
  const value = barcode.trim()
  if (!value) return null

  const { data, error } = await supabase
    .from('products')
    .select('id,name,category,price,stock,active,barcode,image_url')
    .eq('barcode', value)
    .eq('active', true)
    .maybeSingle()

  if (error) throw error
  return data as Product | null
}
