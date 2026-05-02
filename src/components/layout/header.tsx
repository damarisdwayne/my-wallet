import { useState } from 'react'
import { Bell, ExternalLink, Loader2, LogOut, Moon, RefreshCw, Sun, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/store/auth'
import { useTheme } from '@/store/theme'
import type { CvmAlert } from '@/hooks/use-cvm-alerts'

interface HeaderProps {
  title: string
  alerts: CvmAlert[]
  unseenCount: number
  checking: boolean
  lastCheckedAt: Date | null
  error: string | null
  onCheck: () => void
  onMarkAllSeen: () => void
  onDismissOne: (alert: CvmAlert) => void
}

const UserAvatar = ({
  photoURL,
  displayName,
}: {
  photoURL?: string | null
  displayName?: string | null
}) =>
  photoURL ? (
    <img
      src={photoURL}
      alt={displayName ?? 'avatar'}
      className="w-8 h-8 rounded-full object-cover ring-2 ring-border"
    />
  ) : (
    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold ring-2 ring-border">
      {displayName?.[0]?.toUpperCase() ?? '?'}
    </div>
  )

const categoryLabel: Record<string, string> = {
  'Relatório Gerencial': 'Rel. Gerencial',
  'Fato Relevante': 'Fato Relevante',
  'Comunicado ao Mercado': 'Comunicado',
}

const fmtDeliveryDate = (raw: string) => {
  const d = new Date(raw.replace(' ', 'T'))
  if (isNaN(d.getTime())) return raw
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const Header = ({
  title,
  alerts,
  unseenCount,
  checking,
  lastCheckedAt,
  error,
  onCheck,
  onMarkAllSeen,
  onDismissOne,
}: HeaderProps) => {
  const { resolved, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <header className="h-16.25 flex items-center justify-between px-6 border-b border-border bg-card">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-2">
        {/* alerts bell */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              className="relative p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Alertas de relatórios"
            >
              <Bell size={18} />
              {unseenCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-[10px] text-white font-bold flex items-center justify-center leading-none">
                  {unseenCount > 9 ? '9+' : unseenCount}
                </span>
              )}
            </button>
          </SheetTrigger>

          <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
            <SheetHeader className="px-5 py-4 border-b border-border">
              <div className="flex items-center justify-between pr-8">
                <SheetTitle className="text-base">Novos Relatórios</SheetTitle>
                <div className="flex items-center gap-2">
                  {unseenCount > 0 && (
                    <button
                      onClick={onMarkAllSeen}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Marcar todos como lidos
                    </button>
                  )}
                  <button
                    onClick={onCheck}
                    disabled={checking}
                    className="flex items-center gap-1.5 text-xs bg-muted hover:bg-accent text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md transition-colors disabled:opacity-50"
                  >
                    {checking ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <RefreshCw size={13} />
                    )}
                    {checking ? 'Verificando…' : 'Verificar agora'}
                  </button>
                </div>
              </div>
              {lastCheckedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Última verificação: {lastCheckedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
              {error && (
                <div className="mx-5 mt-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              {!checking && !error && alerts.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
                  <Bell size={32} className="opacity-30" />
                  <p className="text-sm text-center px-6">
                    {lastCheckedAt
                      ? 'Nenhum novo relatório encontrado.'
                      : 'Clique em "Verificar agora" para buscar novos relatórios da sua carteira.'}
                  </p>
                </div>
              )}

              {checking && (
                <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground text-sm">
                  <Loader2 size={18} className="animate-spin" />
                  Buscando relatórios na CVM…
                </div>
              )}

              {!checking && alerts.length > 0 && (
                <div className="divide-y divide-border">
                  {alerts.map((alert, i) => (
                    <div key={i} className="px-5 py-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">
                            {alert.ticker}
                          </span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {categoryLabel[alert.category] ?? alert.category}
                          </span>
                        </div>
                        <button
                          onClick={() => onDismissOne(alert)}
                          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                          aria-label="Dispensar"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {alert.subject || alert.type}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {fmtDeliveryDate(alert.deliveryDate)}
                        </span>
                        <a
                          href={alert.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          Abrir PDF
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* theme toggle */}
        <button
          onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {resolved === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* user menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors outline-none">
              <UserAvatar photoURL={user?.photoURL} displayName={user?.displayName} />
              {user?.displayName && (
                <span className="text-sm font-medium text-foreground hidden sm:block max-w-32 truncate">
                  {user.displayName}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="font-medium text-foreground truncate">
                {user?.displayName ?? 'Usuário'}
              </p>
              <p className="truncate mt-0.5">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut size={15} />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
