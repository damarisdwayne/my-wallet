import { LogOut, Moon, Sun } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/store/auth'
import { useTheme } from '@/store/theme'

interface HeaderProps {
  title: string
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

export const Header = ({ title }: HeaderProps) => {
  const { resolved, setTheme } = useTheme()
  const { user, logout } = useAuth()

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {resolved === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

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
