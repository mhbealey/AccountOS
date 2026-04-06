'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#050E1A] p-8">
          <div className="max-w-lg rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-6">
            <h2 className="text-lg font-semibold text-red-400">Something went wrong</h2>
            <pre className="mt-4 overflow-auto whitespace-pre-wrap text-sm text-[#829AB1]">
              {this.state.error?.message}
            </pre>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs text-[#627D98]">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-[#050E1A]"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
