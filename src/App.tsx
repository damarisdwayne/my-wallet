import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardPage } from '@/pages/DashboardPage'
import { DividendsPage } from '@/pages/DividendsPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { TaxPage } from '@/pages/TaxPage'

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  expenses: 'Gastos',
  portfolio: 'Carteira',
  dividends: 'Proventos',
  tax: 'Imposto de Renda',
}

const App = () => {
  const [page, setPage] = useState('dashboard')

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
