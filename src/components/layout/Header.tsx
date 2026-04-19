import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/store/theme'

interface HeaderProps {
  title: string
}

export const Header = ({ title }: HeaderProps) => {
  const { resolved, setTheme } = useTheme()

  const toggleTheme = () => setTheme(resolved === 'dark' ? 'light' : 'dark')

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        aria-label="Toggle theme"
      >
        {resolved === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  )
}
