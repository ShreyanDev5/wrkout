'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
    errorInfo?: React.ErrorInfo
}

/**
 * Error Boundary component for graceful failure handling.
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them, and displays a fallback UI instead of crashing.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        // Update state so next render shows the fallback UI
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo)
        }
        this.setState({ errorInfo })
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }

    handleRefresh = () => {
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback or default error UI
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-destructive/10">
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                        An unexpected error occurred. Please try again or refresh the page.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={this.handleRetry}
                            className="gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </Button>
                        <Button
                            onClick={this.handleRefresh}
                            className="bg-primary text-primary-foreground"
                        >
                            Refresh Page
                        </Button>
                    </div>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="mt-6 p-4 rounded-lg bg-muted/50 text-left w-full max-w-lg">
                            <summary className="text-sm font-medium cursor-pointer text-muted-foreground">
                                Error Details (Development Only)
                            </summary>
                            <pre className="mt-2 text-xs text-destructive overflow-auto whitespace-pre-wrap">
                                {this.state.error.toString()}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            )
        }

        return this.props.children
    }
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        )
    }
}
