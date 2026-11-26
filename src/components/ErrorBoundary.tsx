import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AeroShield ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertOctagon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Application Exception Caught</h1>
              <p className="text-xs text-slate-300 mt-1">
                AeroShield encountered an unexpected state. Your telemetry data is safe.
              </p>
              {this.state.error && (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-rose-300 font-mono text-left overflow-x-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
