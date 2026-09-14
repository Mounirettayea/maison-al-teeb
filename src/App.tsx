import { useEffect, useState } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './pages/admin/Dashboard'
import { Products } from './pages/products/Products'
import { Stock } from './pages/stock/Stock'
import { POS } from './pages/pos/POS'
import { Sales } from './pages/sales/Sales'
import { Customers } from './pages/customers/Customers'
import { Reports } from './pages/reports/Reports'
import { Settings } from './pages/settings/Settings'
import { StoreHome } from './pages/store/StoreHome'
import './styles/app.css'

function pageFor(pathname: string) {
  if (pathname === '/') return <StoreHome />
  if (pathname === '/pos') return <POS />
  if (pathname === '/admin/produits') return <Products />
  if (pathname === '/admin/stock') return <Stock />
  if (pathname === '/admin/ventes') return <Sales />
  if (pathname === '/admin/clients') return <Customers />
  if (pathname === '/admin/rapports') return <Reports />
  if (pathname === '/admin/parametres') return <Settings />
  return <Dashboard />
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  if (path === '/') return pageFor(path)
  return <AppLayout>{pageFor(path)}</AppLayout>
}
