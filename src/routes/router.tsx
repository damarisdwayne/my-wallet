import { Navigate, Route, Routes } from 'react-router-dom'
import { CalculatorsPage } from '@/pages/calculators'
import { DashboardPage } from '@/pages/dashboard'
import { DividendsPage } from '@/pages/dividends'
import { ExpensesPage } from '@/pages/expenses'
import { LoginPage } from '@/pages/login'
import { PortfolioPage } from '@/pages/portfolio'
import { SalesPage } from '@/pages/sales'
import { TaxPage } from '@/pages/tax'
import { useAuth } from '@/store/auth'
import { ErrorBoundary } from '@/components/error-boundary'
import { AppLayout } from './app-layout'
import { ProtectedRoute } from './protected-route'

export const Router = () => {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={
              <ErrorBoundary fallbackLabel="Dashboard">
                <DashboardPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/expenses"
            element={
              <ErrorBoundary fallbackLabel="Despesas">
                <ExpensesPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ErrorBoundary fallbackLabel="Portfólio">
                <PortfolioPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/dividends"
            element={
              <ErrorBoundary fallbackLabel="Dividendos">
                <DividendsPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/tax"
            element={
              <ErrorBoundary fallbackLabel="IR">
                <TaxPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/sales"
            element={
              <ErrorBoundary fallbackLabel="Vendas">
                <SalesPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/calculators"
            element={
              <ErrorBoundary fallbackLabel="Calculadoras">
                <CalculatorsPage />
              </ErrorBoundary>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
