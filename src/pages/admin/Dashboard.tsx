import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'

export function Dashboard() {
  return <>
    <PageHeader title="Dashboard" description="Vue générale de Maison Al Teeb." />
    <section className="stats-grid">
      <StatCard label="Chiffre d'affaires" value="0 MAD" note="Aujourd'hui" />
      <StatCard label="Ventes" value="0" note="Aujourd'hui" />
      <StatCard label="Produits" value="—" note="Connectés à Supabase" />
      <StatCard label="Stock faible" value="—" note="À vérifier" />
    </section>
    <section className="panel"><h2>Activité récente</h2><p>Aucune vente récente.</p></section>
  </>
}
