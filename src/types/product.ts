export type Product = {
  id: number
  name: string
  category: string | null
  price: number
  stock: number
  active: boolean
  barcode?: string | null
  image_url?: string | null
}
