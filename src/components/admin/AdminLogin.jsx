import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';

export const AdminLogin = () => {
  const { loginAdmin } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = loginAdmin(email, password);
    if (!res.success) {
      setError(res.message || 'Invalid admin credentials. Please enter authorized email and password.');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-[#faf8f5]">
      <div className="w-full max-w-md bg-white border border-[#c99632]/30 rounded-3xl p-8 shadow-xl space-y-6 text-[#171717]">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#c99632]/60 mx-auto shadow-md">
            <img src="/vasavi_logo.png" alt="Vasavi Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-serif-luxury text-2xl font-black text-[#171717] tracking-wider leading-none">
              VASAVI
            </h1>
            <p className="text-xs font-black text-[#c99632] tracking-widest uppercase mt-1">
              FANCY STORE
            </p>
            <p className="text-[10px] text-[#666666] font-bold tracking-wider uppercase mt-1">
              ADMIN CONTROL PANEL
            </p>
          </div>
          <p className="text-xs text-[#666666]">Sign in with authorized administrator credentials to manage the store.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email-input" className="block text-xs font-bold text-[#171717] mb-1.5">Admin Email</label>
            <div className="relative">
              <input
                id="admin-email-input"
                name="adminEmail"
                autoComplete="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-[#171717] placeholder-slate-400 focus:outline-none focus:border-[#c99632]"
                placeholder="Enter admin email"
              />
              <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password-input" className="block text-xs font-bold text-[#171717] mb-1.5">Password</label>
            <div className="relative">
              <input
                id="admin-password-input"
                name="adminPassword"
                autoComplete="current-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-[#171717] placeholder-slate-400 focus:outline-none focus:border-[#c99632]"
                placeholder="Enter password"
              />
              <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all gold-glow"
          >
            <span>SIGN IN TO DASHBOARD</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
