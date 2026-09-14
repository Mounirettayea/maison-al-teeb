import { supabase } from '../lib/supabase'

export type CartItemInput = { product_id: number; quantity: number }

export type SaleResult = {
  sale_id: number
  invoice_number: string
  subtotal: number
  discount: number
  total: number
  amount_paid: number
  change_amount: number
}

export async function createSaleAtomic(
  items: CartItemInput[],
  paymentMethod: 'cash' | 'card' | 'transfer' | 'mixed',
  amountPaid: number,
  discount = 0,
) {
  if (!items.length) throw new Error('Le panier est vide.')

  const { data, error } = await supabase.rpc('create_sale_atomic', {
    p_items: items,
    p_payment_method: paymentMethod,
    p_amount_paid: amountPaid,
    p_discount: discount,
  })

  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  if (!row) throw new Error('La vente n’a pas retourné de résultat.')
  return row as SaleResult
}
