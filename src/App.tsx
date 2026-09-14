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
import { Login } from './pages/auth/Login'
import { getSession, getProfile, onAuthStateChange, type Profile } from './lib/auth'
import './styles/app.css'

function pageFor(pathname: string) {
  if (pathname === '/') return <StoreHome />
  if (pathname === '/admin' || pathname === '/admin/') return <Dashboard />
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
  const [profile, setProfile] = useState<Profile | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const session = await getSession()
        if (mounted) setProfile(session ? await getProfile(session.user.id) : null)
      } catch {
        if (mounted) setProfile(null)
      } finally {
        if (mounted) setReady(true)
      }
    }

    load()
    const { data } = onAuthStateChange(async (session) => {
      if (!mounted) return
      if (!session) {
        setProfile(null)
        return
      }
      try {
        setProfile(await getProfile(session.user.id))
      } catch {
        setProfile(null)
      }
    })

    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => {
      mounted = false
      data.subscription.unsubscribe()
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  if (!ready) return <div className="loading-page">Chargement...</div>
  if (path === '/') return pageFor(path)
  if (!profile) return <Login onLoggedIn={() => setPath('/pos')} />

  if (path.startsWith('/admin/parametres') && profile.role !== 'admin') {
    return <AppLayout><Dashboard /></AppLayout>
  }

  return <AppLayout>{pageFor(path)}</AppLayout>
}
