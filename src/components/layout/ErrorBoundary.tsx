'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050E1A] px-4">
          <div className="w-full max-w-lg rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-8">
            <h1 className="text-xl font-semibold text-[#F0F4F8] mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-[#829AB1] mb-4">
              {this.state.error.message}
            </p>

            <details className="mb-6">
              <summary className="text-xs text-[#829AB1] cursor-pointer hover:text-[#F0F4F8] transition-colors">
                Show error details
              </summary>
              <pre className="mt-2 text-xs text-[#829AB1] bg-[#050E1A] border border-[#1A3550] rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                {this.state.error.stack}
              </pre>
            </details>

            <div className="flex items-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[#00D4AA] text-[#050E1A] hover:bg-[#00E8BC] transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-[#1A3550] text-[#829AB1] hover:text-[#F0F4F8] hover:bg-[#1A3550]/50 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
