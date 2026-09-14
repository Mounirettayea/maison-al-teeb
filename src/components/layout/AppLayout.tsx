import type { ReactNode } from 'react'

const nav = [
  ['/admin', 'Dashboard'],
  ['/pos', 'Nouvelle vente'],
  ['/admin/produits', 'Produits'],
  ['/admin/stock', 'Stock'],
  ['/admin/ventes', 'Ventes'],
  ['/admin/clients', 'Clients'],
  ['/admin/rapports', 'Rapports'],
  ['/admin/parametres', 'Paramètres'],
] as const

export function AppLayout({ children }: { children: ReactNode }) {
  const go = (href: string) => {
    window.history.pushState({}, '', href)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Maison <span>Al Teeb</span></div>
        <nav>
          {nav.map(([href, label]) => (
            <button key={href} onClick={() => go(href)}>{label}</button>
          ))}
        </nav>
      </aside>
      <main className="app-main">
        <header className="topbar">
          <strong>Maison Al Teeb</strong>
          <span>Administration</span>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  )
}
