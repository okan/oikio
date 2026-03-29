import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import i18next from 'i18next'
import { Button } from './Button'
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
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary]', error, errorInfo.componentStack)
    }
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
            <h2 className="text-lg font-semibold text-stone-900 mb-2">
              {i18next.t('errorBoundary.title')}
            </h2>
            <p className="text-sm text-stone-500 mb-4">
              {i18next.t('errorBoundary.description')}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="text-xs text-stone-400 cursor-pointer hover:text-stone-600">
                  {i18next.t('errorBoundary.details')}
                </summary>
                <pre className="mt-2 p-3 bg-stone-100 rounded-lg text-xs text-red-600 overflow-auto max-h-40">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <Button onClick={this.handleRetry} variant="primary" leftIcon={<RefreshCw className="w-4 h-4" />}>
              {i18next.t('errorBoundary.retry')}
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
