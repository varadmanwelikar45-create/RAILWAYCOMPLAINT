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

  private handleGoHome = () => {
    try {
      window.location.hash = '#landing';
    } catch (e) {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4FBF8] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#D8EAE4] shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-[#E5F5EF] text-[#0F766E] border-2 border-[#A7E8D0] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
              <AlertTriangle className="w-7 h-7 text-[#0F766E]" />
            </div>
            <h2 className="text-xl font-extrabold text-[#115E59] mb-2 tracking-tight">
              Application State Recovered
            </h2>
            <p className="text-xs text-[#647773] mb-6 leading-relaxed">
              RailCare encountered an unexpected state error. Click below to continue smoothly or return to the role selection portal.
            </p>
            <div className="space-y-2.5">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer border border-[#0F766E]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#A7E8D0]" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full py-2.5 px-4 bg-[#E5F5EF] hover:bg-[#CCFBF1] text-[#0F766E] text-xs font-bold rounded-xl transition cursor-pointer border border-[#A7E8D0] flex items-center justify-center gap-2"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Role Selection</span>
              </button>
              <button
                onClick={this.handleClearAll}
                className="w-full py-2 px-4 bg-[#F4FBF8] hover:bg-slate-100 text-[#647773] text-[11px] font-semibold rounded-xl transition cursor-pointer border border-[#D8EAE4]"
              >
                Clear Local Cache &amp; Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
