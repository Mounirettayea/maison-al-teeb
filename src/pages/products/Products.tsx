import { PageHeader } from '../../components/ui/PageHeader'

export function Products() {
  return <>
    <PageHeader title="Produits" description="Catalogue, prix, catégories et codes-barres." />
    <section className="panel"><div className="panel-toolbar"><h2>Catalogue</h2><button>Ajouter un produit</button></div><p>Le module produits sera connecté à la table <code>products</code>.</p></section>
  </>
}
