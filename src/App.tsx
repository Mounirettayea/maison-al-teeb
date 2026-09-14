import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StoreHome />} />
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/produits" element={<Products />} />
          <Route path="/admin/stock" element={<Stock />} />
          <Route path="/admin/ventes" element={<Sales />} />
          <Route path="/admin/clients" element={<Customers />} />
          <Route path="/admin/rapports" element={<Reports />} />
          <Route path="/admin/parametres" element={<Settings />} />
          <Route path="/pos" element={<POS />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
