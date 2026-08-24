import React from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Vasavi Fancy Store Caught Exception:', error, errorInfo);
  }

  handleReset = () => {
    try {
      // Safe cleanup of temporary flags
      sessionStorage.clear();
    } catch {
      // Ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#c99632]/40 rounded-3xl p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-[#c99632] flex items-center justify-center mx-auto shadow-md">
              <AlertTriangle className="w-8 h-8 text-[#c99632]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif-luxury text-xl font-bold text-[#171717]">
                స్వాగతం — వాసవి ఫ్యాన్సీ స్టోర్
              </h2>
              <p className="text-xs text-[#666666] leading-relaxed">
                Something went slightly unexpected. Your cart and data are safe. Please reload to continue smoothly.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-110 gold-glow transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>రిలోడ్ చేయండి / Reload Store</span>
              </button>

              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="py-3 px-4 rounded-xl bg-white border border-[#c99632]/40 text-[#171717] font-bold text-xs hover:bg-[#fffcf7] flex items-center justify-center gap-1.5 transition-all"
              >
                <Home className="w-4 h-4 text-[#c99632]" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
