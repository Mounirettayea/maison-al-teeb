import { PageHeader } from '../../components/ui/PageHeader'

export function Reports() {
  return <><PageHeader title="Rapports" description="Indicateurs de ventes, stock et performance." /><section className="stats-grid"><div className="panel"><h2>Ventes</h2><p>Rapports journaliers, hebdomadaires et mensuels.</p></div><div className="panel"><h2>Stock</h2><p>Valeur du stock et alertes de rupture.</p></div></section></>
}
