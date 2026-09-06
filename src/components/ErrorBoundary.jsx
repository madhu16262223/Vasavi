import React from 'react';
import { RefreshCw, AlertTriangle, Home, Trash2 } from 'lucide-react';

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

  handleCleanAndFix = () => {
    try {
      // Clear all cached storage to wipe corrupted items
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch (e) {
      console.warn('[ErrorBoundary] Storage reset note:', e);
    }
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleReset = () => {
    try {
      // Evict bulky and potentially corrupted product/cart caches
      localStorage.removeItem('vasavi_products');
      localStorage.removeItem('vasavi_cart');
      localStorage.removeItem('vasavi_categories');
      localStorage.removeItem('vasavi_orders');
      sessionStorage.clear();
    } catch {
      // Ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#c99632]/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-[#c99632] flex items-center justify-center mx-auto shadow-md">
              <AlertTriangle className="w-8 h-8 text-[#c99632]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif-luxury text-xl font-bold text-[#171717]">
                స్వాగతం — వాసవి ఫ్యాన్సీ స్టోర్
              </h2>
              <p className="text-xs text-[#666666] leading-relaxed">
                చిన్న సాంకేతిక అంతరాయం ఏర్పడింది. మీ కార్ట్ సురక్షితంగా ఉంది. కింద బటన్ నొక్కి స్టోర్‌ను రీస్టార్ట్ చేయండి.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-110 gold-glow transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>స్టోర్ రీలోడ్ చేయండి / Reload Store</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={this.handleCleanAndFix}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-50 border border-[#c99632]/40 text-[#a6751d] font-bold text-xs hover:bg-amber-100 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#c99632]" />
                  <span>క్యాష్ క్లియర్ చేయండి / Fix Cache</span>
                </button>

                <button
                  onClick={() => {
                    window.location.href = '/';
                  }}
                  className="py-2.5 px-4 rounded-xl bg-white border border-gray-200 text-[#171717] font-bold text-xs hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Home className="w-3.5 h-3.5 text-[#c99632]" />
                  <span>Home</span>
                </button>
              </div>
            </div>

            {this.state.error && (
              <details className="text-left text-[11px] text-gray-500 bg-amber-50/40 p-2.5 rounded-xl border border-amber-200/50 mt-2">
                <summary className="cursor-pointer font-bold text-gray-600 select-none">
                  సాంకేతిక వివరాలు / Error Info
                </summary>
                <p className="mt-1 font-mono text-[10px] break-all text-red-600 bg-white p-2 rounded-md border border-red-100">
                  {this.state.error.toString()}
                </p>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
