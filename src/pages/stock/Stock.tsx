import { PageHeader } from '../../components/ui/PageHeader'

export function Stock() {
  return <>
    <PageHeader title="Stock" description="Suivi du stock et mouvements d'inventaire." />
    <section className="panel"><h2>État du stock</h2><p>Les mouvements seront gérés via un journal de stock afin de conserver un historique fiable.</p></section>
  </>
}
