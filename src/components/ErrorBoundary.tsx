import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ArrowClockwiseIcon } from '@phosphor-icons/react'

interface Props {
  children: ReactNode
  title?: string
  message?: string
  /** Si no se pasa, el botón "Reintentar" recarga toda la página (recuperación
   *  más confiable — sirve incluso si el bundle quedó en un estado raro tras
   *  un deploy nuevo). Si se pasa, se usa en vez de recargar (ej. cerrar un
   *  modal para que el resto de la página siga usable). */
  onRetry?: () => void
}

interface State {
  hasError: boolean
}

/**
 * Red de seguridad para errores de render que de otra forma dejarían al
 * cliente viendo una pantalla en blanco sin ninguna explicación — incluye
 * fallos de carga del chunk del OrderForm (ej. deploy nuevo mientras el
 * cliente tenía la pestaña abierta), no solo bugs de código.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  handleRetry = (): void => {
    if (this.props.onRetry) {
      this.setState({ hasError: false })
      this.props.onRetry()
    } else {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
          <p className="font-display text-lg text-brand">{this.props.title ?? 'Algo salió mal'}</p>
          <p className="max-w-sm text-sm text-ink-soft">
            {this.props.message ??
              'Tuvimos un problema inesperado. Intenta de nuevo o recarga la página.'}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="flex items-center gap-2 rounded-pill bg-brand px-6 py-2.5 text-sm font-semibold text-on-brand transition-transform duration-200 active:scale-[0.98]"
          >
            <ArrowClockwiseIcon size={18} weight="bold" />
            Reintentar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
