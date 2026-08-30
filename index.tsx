
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Suppress unhandled third-party browser extension errors (such as MetaMask or injected Web3 wallets)
if (typeof window !== 'undefined') {
  const isIgnored = (val: any) => {
    if (!val) return false;
    const str = typeof val === 'string' ? val : (val.message || val.stack || JSON.stringify(val) || '');
    return /metamask|ethereum|web3|failed to connect|inpage|chrome-extension|moz-extension/i.test(str);
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (isIgnored(event.reason)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('error', (event) => {
    if (isIgnored(event.message) || isIgnored(event.filename) || isIgnored(event.error)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("RestoFlow App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 rounded-3xl p-6 border border-slate-700 space-y-4 text-center">
            <h2 className="text-xl font-bold text-white">Application Encountered a Notice</h2>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold transition-all text-white"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
