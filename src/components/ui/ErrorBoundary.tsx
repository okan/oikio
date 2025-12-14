import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './Button'
import { logError } from '@/lib/errors'
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logError(error, {
      componentStack: errorInfo.componentStack,
    })
    this.props.onError?.(error, errorInfo)
  }
  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }
  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="min-h-[200px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Bir şeyler yanlış gitti
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya tekrar deneyin.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                  Hata detayları
                </summary>
                <pre className="mt-2 p-3 bg-slate-100 rounded-lg text-xs text-red-600 overflow-auto max-h-40">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <Button onClick={this.handleRetry} variant="primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tekrar Dene
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
interface WithErrorBoundaryOptions {
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
): React.FC<P> {
  const WithErrorBoundaryComponent: React.FC<P> = (props) => {
    return (
      <ErrorBoundary fallback={options.fallback} onError={options.onError}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component'
  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${displayName})`
  return WithErrorBoundaryComponent
}

