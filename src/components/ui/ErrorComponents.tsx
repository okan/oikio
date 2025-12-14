import { AlertTriangle } from 'lucide-react'

interface InlineErrorProps {
    message: string
    className?: string
}

export function InlineError({ message, className = '' }: InlineErrorProps): JSX.Element {
    return (
        <div className={`flex items-center gap-2 text-sm text-red-600 ${className}`}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
        </div>
    )
}

interface ErrorAlertProps {
    title?: string
    message: string
    onDismiss?: () => void
    className?: string
}

export function ErrorAlert({
    title = 'Hata',
    message,
    onDismiss,
    className = '',
}: ErrorAlertProps): JSX.Element {
    return (
        <div
            className={`p-4 rounded-lg bg-red-50 border border-red-200 ${className}`}
            role="alert"
        >
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-red-800">{title}</h4>
                    <p className="text-sm text-red-700 mt-1">{message}</p>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        aria-label="Kapat"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}
