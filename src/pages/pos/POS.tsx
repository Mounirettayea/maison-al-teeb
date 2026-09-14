import { PageHeader } from '../../components/ui/PageHeader'

export function POS() {
  return <>
    <PageHeader title="Nouvelle vente" description="Point de vente Maison Al Teeb." />
    <section className="pos-grid">
      <div className="panel"><h2>Produits</h2><input className="search" placeholder="Scanner ou rechercher un produit..." /><div className="empty-state">Scanner code-barres et catalogue produits à connecter.</div></div>
      <div className="panel"><h2>Panier</h2><div className="empty-state">Panier vide</div><div className="total-row"><span>Total</span><strong>0 MAD</strong></div><button className="primary full">Valider la vente</button></div>
    </section>
  </>
}
