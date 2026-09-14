import { useCallback, useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { BarcodeScanner } from '../../components/BarcodeScanner/BarcodeScanner'
import { getProductByBarcode, listProducts } from '../../services/products'
import { createSaleAtomic } from '../../services/sales'
import type { Product } from '../../types/product'

type CartLine = Product & { quantity: number }

export function POS() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartLine[]>([])
  const [search, setSearch] = useState('')
  const [payment, setPayment] = useState<'cash' | 'card' | 'transfer' | 'mixed'>('cash')
  const [paid, setPaid] = useState('')
  const [discount, setDiscount] = useState('0')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState<string | null>(null)

  useEffect(() => {
    listProducts({ activeOnly: true }).then(setProducts).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products.slice(0, 20)
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.barcode?.toLowerCase().includes(q)).slice(0, 20)
  }, [products, search])

  const addProduct = useCallback((product: Product) => {
    setError('')
    setCart((current) => {
      const existing = current.find((line) => line.id === product.id)
      if (existing) return current.map((line) => line.id === product.id ? { ...line, quantity: Math.min(line.quantity + 1, product.stock) } : line)
      return product.stock > 0 ? [...current, { ...product, quantity: 1 }] : current
    })
  }, [])

  const scan = useCallback(async (barcode: string) => {
    setError('')
    try {
      const product = await getProductByBarcode(barcode)
      if (!product) return setError(`Produit introuvable : ${barcode}`)
      addProduct(product)
    } catch (e) { setError(e instanceof Error ? e.message : 'Erreur de recherche') }
  }, [addProduct])

  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0)
  const discountValue = Math.max(0, Math.min(subtotal, Number(discount) || 0))
  const total = subtotal - discountValue
  const paidValue = Number(paid) || 0
  const change = Math.max(0, paidValue - total)

  const validate = async () => {
    setError('')
    if (!cart.length) return setError('Ajoutez au moins un produit.')
    if (payment === 'cash' && paidValue < total) return setError('Le montant reçu est insuffisant.')
    setSaving(true)
    try {
      const result = await createSaleAtomic(cart.map((line) => ({ product_id: line.id, quantity: line.quantity })), payment, paidValue, discountValue)
      setReceipt(`Vente ${result.invoice_number} — ${Number(result.total).toFixed(2)} MAD — Monnaie: ${Number(result.change_amount).toFixed(2)} MAD`)
      setCart([]); setPaid(''); setDiscount('0')
      setProducts(await listProducts({ activeOnly: true }))
    } catch (e) { setError(e instanceof Error ? e.message : 'Impossible d’enregistrer la vente.') }
    finally { setSaving(false) }
  }

  return <>
    <PageHeader title="Nouvelle vente" description="Point de vente Maison Al Teeb — stock mis à jour de façon atomique." />
    {error && <div className="alert error">{error}</div>}
    {receipt && <div className="alert success">{receipt}</div>}
    <section className="pos-grid">
      <div className="panel">
        <h2>Scanner / Produits</h2>
        <BarcodeScanner onDetected={scan} />
        <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par nom ou code-barres..." />
        {loading ? <div className="empty-state">Chargement...</div> : filtered.map((product) => <button className="product-row" key={product.id} onClick={() => addProduct(product)} disabled={product.stock <= 0}>
          <span><strong>{product.name}</strong><small>{product.category ?? 'Sans catégorie'} {product.barcode ? `• ${product.barcode}` : ''}</small></span><b>{product.price.toFixed(2)} MAD</b><small>Stock: {product.stock}</small>
        </button>)}
      </div>
      <div className="panel">
        <h2>Panier</h2>
        {!cart.length && <div className="empty-state">Panier vide</div>}
        {cart.map((line) => <div className="cart-row" key={line.id}>
          <span><strong>{line.name}</strong><small>{line.price.toFixed(2)} MAD × {line.quantity}</small></span>
          <div><button onClick={() => setCart((c) => c.map((x) => x.id === line.id ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x))}>−</button><button onClick={() => setCart((c) => c.map((x) => x.id === line.id ? { ...x, quantity: Math.min(x.stock, x.quantity + 1) } : x))}>+</button><button onClick={() => setCart((c) => c.filter((x) => x.id !== line.id))}>×</button></div>
        </div>)}
        <label>Remise (MAD)<input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} /></label>
        <label>Paiement<select value={payment} onChange={(e) => setPayment(e.target.value as typeof payment)}><option value="cash">Espèces</option><option value="card">Carte</option><option value="transfer">Virement</option><option value="mixed">Mixte</option></select></label>
        <label>Montant reçu<input type="number" min="0" value={paid} onChange={(e) => setPaid(e.target.value)} placeholder={total.toFixed(2)} /></label>
        <div className="total-row"><span>Sous-total</span><strong>{subtotal.toFixed(2)} MAD</strong></div>
        <div className="total-row"><span>Total</span><strong>{total.toFixed(2)} MAD</strong></div>
        <div className="total-row"><span>Monnaie</span><strong>{change.toFixed(2)} MAD</strong></div>
        <button className="primary full" disabled={saving || !cart.length} onClick={validate}>{saving ? 'Enregistrement...' : 'Valider la vente'}</button>
      </div>
    </section>
  </>
}
