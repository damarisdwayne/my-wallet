import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from '@/pages/DashboardPage'
import { DividendsPage } from '@/pages/DividendsPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { LoginPage } from '@/pages/LoginPage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { TaxPage } from '@/pages/TaxPage'
import { useAuth } from '@/store/auth'
import { AppLayout } from './AppLayout'
import { ProtectedRoute } from './ProtectedRoute'

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
