export function StoreHome() {
  const goAdmin = () => { window.location.href = '/admin' }
  return <main className="store-home"><div className="store-card"><p className="eyebrow">MAISON AL TEEB</p><h1>Maison Al Teeb</h1><p>Parfums arabes, huiles aromatiques, cosmétiques naturels, encens et vêtements traditionnels.</p><button className="primary" onClick={goAdmin}>Accéder à l'administration</button></div></main>
}
