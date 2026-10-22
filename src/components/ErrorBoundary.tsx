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
    console.error('Uncaught error in VYOM RATH applet:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('railcare_current_user');
      localStorage.removeItem('vyom_rath_current_user');
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
        <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DDE4E6] shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-[#FBE0E6] text-[#D72645] border-2 border-[#D72645]/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <AlertTriangle className="w-7 h-7 text-[#D72645]" />
            </div>
            <h2 className="text-xl font-black text-[#202A2B] mb-2 tracking-tight">
              Application State Recovered
            </h2>
            <p className="text-xs text-[#526365] mb-6 leading-relaxed">
              VYOM RATH encountered an unexpected interface state. Click below to continue smoothly or return to the role selection portal.
            </p>
            <div className="space-y-2.5">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 bg-[#202A2B] hover:bg-[#202A2B]/90 text-white text-xs font-black rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer border border-[#202A2B]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#65D6B0]" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full py-2.5 px-4 bg-[#F0F4F6] hover:bg-[#D7F7FC] text-[#202A2B] text-xs font-bold rounded-xl transition cursor-pointer border border-[#DDE4E6] flex items-center justify-center gap-2"
              >
                <Home className="w-3.5 h-3.5 text-[#007D99]" />
                <span>Return to Role Selection</span>
              </button>
              <button
                onClick={this.handleClearAll}
                className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-[#7E9092] text-[11px] font-semibold rounded-xl transition cursor-pointer border border-[#DDE4E6]"
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
