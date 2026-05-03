import { Component } from 'react'
import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackLabel?: string
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        <PageErrorFallback
          label={this.props.fallbackLabel}
          message={this.state.error.message}
          onRetry={this.reset}
        />
      )
    }
    return this.props.children
  }
}

interface FallbackProps {
  label?: string
  message: string
  onRetry: () => void
}

const PageErrorFallback = ({ label, message, onRetry }: FallbackProps) => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8 text-center">
    <AlertTriangle className="text-destructive" size={36} />
    <div className="space-y-1">
      <p className="font-semibold text-foreground">
        {label ? `Erro em ${label}` : 'Algo deu errado'}
      </p>
      <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
    </div>
    <button
      onClick={onRetry}
      className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      Tentar novamente
    </button>
  </div>
)
