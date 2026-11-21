import { useEffect, useState } from 'react'
import { listProducts } from '../../services/products'
import type { Product } from '../../types/product'

export function StoreHome() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    listProducts({ activeOnly: true })
      .then((items) => { if (mounted) setProducts(items) })
      .catch((err: unknown) => {
        if (mounted) setError(err instanceof Error ? err.message : 'تعذر تحميل المنتجات حالياً')
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const goAdmin = () => { window.location.href = '/admin' }

  return (
    <main className="storefront">
      <header className="storefront-header">
        <img className="storefront-logo" src="/logo.png" alt="Maison Al Teeb" />
        <div>
          <p className="storefront-eyebrow">MAISON AL TEEB</p>
          <h1>دار الطيب</h1>
          <p className="storefront-intro">العطور العربية، الزيوت العطرية، مستحضرات التجميل الطبيعية والبخور.</p>
        </div>
        <button className="store-admin-button" onClick={goAdmin}>الإدارة</button>
      </header>

      <section className="storefront-catalog">
        <div className="storefront-section-heading">
          <div>
            <p className="storefront-eyebrow">اكتشف تشكيلتنا</p>
            <h2>منتجاتنا</h2>
          </div>
          <span>{products.length} منتج</span>
        </div>

        {loading && <p className="storefront-message">جاري تحميل المنتجات...</p>}
        {error && <p className="storefront-error">وقع مشكل أثناء تحميل المنتجات: {error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="storefront-message">لا توجد منتجات متاحة حالياً.</p>
        )}

        <div className="storefront-grid">
          {products.map((product) => (
            <article className="store-product-card" key={product.id}>
              <div className="store-product-image-wrap">
                {product.image_url ? (
                  <img className="store-product-image" src={product.image_url} alt={product.name} loading="lazy" />
                ) : (
                  <div className="store-product-no-image">MAISON AL TEEB</div>
                )}
                <span className={product.stock > 0 ? 'store-stock in-stock' : 'store-stock out-stock'}>
                  {product.stock > 0 ? 'متوفر' : 'غير متوفر'}
                </span>
              </div>
              <div className="store-product-info">
                <p className="store-product-category">{product.category || 'منتجاتنا'}</p>
                <h3>{product.name}</h3>
                <div className="store-product-bottom">
                  <strong>{Number(product.price).toLocaleString('fr-MA')} DH</strong>
                  <span>{product.stock > 0 ? `المخزون: ${product.stock}` : 'نفد المخزون'}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="storefront-footer">© Maison Al Teeb — دار الطيب</footer>
    </main>
  )
}
