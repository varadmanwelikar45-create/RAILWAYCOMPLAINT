import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
    console.error('Uncaught error in RailCare applet:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('railcare_current_user');
    } catch (e) {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearAll = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-red-200 shadow-md p-6 sm:p-8 max-w-md w-full text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#12304A] mb-2">
              Temporary Display Issue Resolved
            </h2>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              RailCare encountered an issue loading previous data. You can refresh the application or reset stored cache to continue smoothly.
            </p>
            <div className="space-y-2">
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Application
              </button>
              <button
                onClick={this.handleClearAll}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition cursor-pointer"
              >
                Reset Stored Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
