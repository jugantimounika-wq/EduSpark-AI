import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Production-grade Accessible Error Boundary
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a graceful, accessible fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Secure client-side logging (avoids leaking sensitive data)
    console.error('[Application ErrorBoundary Caught]:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/EduSpark-AI/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-[70vh] flex items-center justify-center p-6"
        >
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xl text-center backdrop-blur-xl">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" aria-hidden="true" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Something went wrong
            </h1>
            
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              An unexpected error occurred in this component. Our resilience mechanisms have isolated the issue to prevent total platform interruption.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-left overflow-auto max-h-32 text-xs font-mono text-rose-500 dark:text-rose-400 border border-rose-500/20">
                {this.state.error.message || 'Unknown runtime error'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/25 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 outline-none"
                aria-label="Reload current application state"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm transition-all focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
                aria-label="Return to homepage"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
