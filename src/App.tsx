import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardPage } from '@/pages/DashboardPage'
import { DividendsPage } from '@/pages/DividendsPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { LoginPage } from '@/pages/LoginPage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { TaxPage } from '@/pages/TaxPage'
import { useAuth, useAuthInit } from '@/store/auth'

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  expenses: 'Gastos',
  portfolio: 'Carteira',
  dividends: 'Proventos',
  tax: 'Imposto de Renda',
}

const App = () => {
  useAuthInit()
  const { user, loading } = useAuth()
  const [page, setPage] = useState('dashboard')

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return <LoginPage />

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <DashboardPage />
      case 'expenses':
        return <ExpensesPage />
      case 'portfolio':
        return <PortfolioPage />
      case 'dividends':
        return <DividendsPage />
      case 'tax':
        return <TaxPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage={page} onNavigate={setPage} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header title={pageTitles[page]} />
        <main className="flex-1 overflow-y-auto">{renderPage()}</main>
      </div>
    </div>
  )
}

export default App
