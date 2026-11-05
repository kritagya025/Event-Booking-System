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
        <div className="min-h-screen bg-asphalt-black text-grit-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-lg w-full bg-asphalt-card border-4 border-neon-magenta p-6 shadow-[10px_10px_0px_#eefc54]">
            <div className="hazard-tape-magenta h-3 w-full mb-4"></div>
            <span className="font-ticker text-xs text-neon-magenta uppercase tracking-widest font-black block mb-2">
              CRITICAL SYSTEM EXCEPTION INTERCEPTED
            </span>
            <h2 className="font-display text-3xl uppercase tracking-tight text-grit-white mb-2">
              RUNTIME FAULT DETECTED
            </h2>
            <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mb-4">
              {this.state.error?.message || 'AN UNEXPECTED RENDERING EXCEPTION OCCURRED.'}
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-base uppercase px-6 py-2.5 border-2 border-asphalt-black hover:bg-neon-magenta hover:text-grit-white transition-all shadow-[4px_4px_0px_#ffffff] cursor-pointer"
              >
                RELOAD INTERFACE
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
