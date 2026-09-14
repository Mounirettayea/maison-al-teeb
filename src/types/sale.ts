export type CartItem = {
  productId: number
  name: string
  quantity: number
  unitPrice: number
  total: number
}

export type SaleDraft = {
  items: CartItem[]
  discount: number
  paymentMethod: 'cash' | 'card' | 'transfer' | 'other'
  amountPaid: number
}
