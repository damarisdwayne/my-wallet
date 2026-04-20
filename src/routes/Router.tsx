import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from '@/pages/dashboard'
import { DividendsPage } from '@/pages/dividends'
import { ExpensesPage } from '@/pages/expenses'
import { LoginPage } from '@/pages/login'
import { PortfolioPage } from '@/pages/portfolio'
import { TaxPage } from '@/pages/tax'
import { useAuth } from '@/store/auth'
import { AppLayout } from './app-layout'
import { ProtectedRoute } from './protected-route'

export const Router = () => {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/dividends" element={<DividendsPage />} />
          <Route path="/tax" element={<TaxPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
