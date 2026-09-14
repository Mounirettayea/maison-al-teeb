import { FormEvent, useState } from 'react'
import { signIn } from '../../lib/auth'

export function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setLoading(true)
    try { const { error } = await signIn(email.trim(), password); if (error) throw error; onLoggedIn() }
    catch (e) { setError(e instanceof Error ? e.message : 'Connexion impossible.') }
    finally { setLoading(false) }
  }

  return <main className="login-page"><form className="login-card" onSubmit={submit}><h1>Maison Al Teeb</h1><p>Connexion administration / caisse</p>{error && <div className="alert error">{error}</div>}<label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Mot de passe<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label><button className="primary full" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</button></form></main>
}
