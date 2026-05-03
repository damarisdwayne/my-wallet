import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '@/pages/login'
import { useAuth } from '@/store/auth'
import { AppLayout } from './app-layout'
import { ProtectedRoute } from './protected-route'

const DashboardPage = lazy(() =>
  import('@/pages/dashboard').then((m) => ({ default: m.DashboardPage })),
)
const ExpensesPage = lazy(() =>
  import('@/pages/expenses').then((m) => ({ default: m.ExpensesPage })),
)
const PortfolioPage = lazy(() =>
  import('@/pages/portfolio').then((m) => ({ default: m.PortfolioPage })),
)
const DividendsPage = lazy(() =>
  import('@/pages/dividends').then((m) => ({ default: m.DividendsPage })),
)
const TaxPage = lazy(() => import('@/pages/tax').then((m) => ({ default: m.TaxPage })))
const SalesPage = lazy(() => import('@/pages/sales').then((m) => ({ default: m.SalesPage })))
const CalculatorsPage = lazy(() =>
  import('@/pages/calculators').then((m) => ({ default: m.CalculatorsPage })),
)

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
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/calculators" element={<CalculatorsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
