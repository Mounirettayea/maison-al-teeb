import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { listProducts } from '../../services/products'
import type { Product } from '../../types/product'

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    listProducts().then(setProducts).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.barcode?.includes(q))
  }, [products, search])

  return <>
    <PageHeader title="Produits" description="Catalogue, prix, catégories, codes-barres et stock." />
    {error && <div className="alert error">{error}</div>}
    <section className="panel">
      <div className="panel-toolbar"><h2>Catalogue ({filtered.length})</h2><button onClick={load}>Actualiser</button></div>
      <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit..." />
      {loading ? <div className="empty-state">Chargement des produits...</div> : <div className="table-wrap"><table><thead><tr><th>Produit</th><th>Catégorie</th><th>Code-barres</th><th>Prix</th><th>Stock</th><th>État</th></tr></thead><tbody>
        {filtered.map((p) => <tr key={p.id}><td><strong>{p.name}</strong></td><td>{p.category ?? '—'}</td><td>{p.barcode ?? '—'}</td><td>{p.price.toFixed(2)} MAD</td><td>{p.stock}</td><td>{p.active ? 'Actif' : 'Inactif'}</td></tr>)}
      </tbody></table></div>}
    </section>
  </>
}
