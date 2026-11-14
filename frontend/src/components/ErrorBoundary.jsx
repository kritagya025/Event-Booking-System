import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Critical UI Error Caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#111111] text-[#111111] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="max-w-md w-full bg-white rounded-[28px] border border-[#e5e7eb] p-8 shadow-2xl">
            <span className="inline-block bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              System Notice
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#111111] mb-2">
              Something went wrong
            </h2>
            <p className="text-xs text-[#6b7280] mb-6 leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred. Please reload to resume.'}
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="h-[51px] px-8 rounded-full bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                Reload Interface
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

