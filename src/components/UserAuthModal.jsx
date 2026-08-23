import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react';

export const UserAuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    currentUser,
    loginCustomer,
    signupCustomer,
    logoutCustomer,
    authModalMode,
    setAuthModalMode,
    setActiveTab
  } = useStore();

  const [mode, setMode] = useState(authModalMode || 'login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync mode whenever modal opens or authModalMode changes
  React.useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
    }
    setError('');
    setSuccessMsg('');
  }, [authModalMode, isAuthModalOpen]);

  // Real-world Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }

    const res = await loginCustomer(email, password);
    if (res && res.success) {
      setSuccessMsg('Signed in successfully!');
      setTimeout(() => {
        closeAuthModal();
      }, 700);
    } else {
      setError((res && res.message) || 'Invalid email or password. Please check your credentials.');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim() || !phone.trim()) {
      setError('Please fill in your name and 10-digit mobile number.');
      return;
    }

    const res = await signupCustomer({ name, email, phone, password });
    if (res && res.success) {
      setSuccessMsg('Account created successfully! Welcome to Vasavi Fancy Store.');
      setTimeout(() => {
        closeAuthModal();
      }, 900);
    } else {
      setError((res && res.message) || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
      
      {/* Real-World Production Modal Container */}
      <div className="relative w-full max-w-md bg-[#fffcf7] border border-[#c99632]/40 rounded-3xl shadow-2xl overflow-hidden font-sans text-[#171717]">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#c99632] via-[#e5b85c] to-[#a6751d] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg text-white shrink-0">
              👤
            </div>
            <div>
              <h3 className="font-serif-luxury text-sm font-black tracking-wider uppercase leading-none">
                VASAVI FANCY STORE
              </h3>
              <p className="text-[10px] text-amber-100 font-medium tracking-wide mt-0.5">
                {currentUser ? 'Customer Account' : 'Customer Sign In & Account'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* LOGGED IN USER PROFILE VIEW */}
          {currentUser ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#c99632]/20 border-2 border-[#c99632] flex items-center justify-center text-2xl font-black text-[#c99632]">
                {currentUser.avatar || '👤'}
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold uppercase tracking-widest mb-1">
                  <UserCheck className="w-3 h-3 text-emerald-600" /> LOGGED IN CUSTOMER
                </span>
                <h3 className="text-xl font-black font-serif-luxury text-[#171717]">{currentUser.name}</h3>
                <p className="text-xs text-[#666666] font-medium">{currentUser.email}</p>
                <p className="text-xs text-[#888888] font-mono mt-0.5">📞 {currentUser.phone}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    closeAuthModal();
                    setActiveTab('track');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#faf8f5] border border-[#c99632]/40 text-xs font-bold text-[#171717] hover:bg-[#fff3c4]/50 transition-colors"
                >
                  📦 My Orders
                </button>

                <button
                  onClick={() => {
                    logoutCustomer();
                    setSuccessMsg('Signed out cleanly.');
                  }}
                  className="flex-1 py-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mode Toggle Tabs (Sign In / Create Account) */}
              <div className="flex bg-[#faf8f5] p-1 rounded-2xl border border-[#c99632]/30">
                <button
                  onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    mode === 'login'
                      ? 'bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white shadow-md gold-glow'
                      : 'text-[#666666] hover:text-[#171717]'
                  }`}
                >
                  🔐 SIGN IN
                </button>
                <button
                  onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    mode === 'signup'
                      ? 'bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white shadow-md gold-glow'
                      : 'text-[#666666] hover:text-[#171717]'
                  }`}
                >
                  ✨ CREATE ACCOUNT
                </button>
              </div>

              {/* Real-World Feedback Alerts */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center animate-shake">
                  ⚠️ {error}
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* REAL SIGN IN FORM */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">Mobile Number or Email Address</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. 9876543210 or yourname@gmail.com"
                        className="w-full bg-white border border-[#c99632]/30 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-[#171717] placeholder-slate-400 focus:outline-none focus:border-[#c99632]"
                      />
                      <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-[#c99632]/30 rounded-xl py-3 pl-10 pr-10 text-xs font-medium text-[#171717] placeholder-slate-400 focus:outline-none focus:border-[#c99632]"
                      />
                      <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#171717]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Real Sign In Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c99632] via-[#e5b85c] to-[#a6751d] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all gold-glow mt-2"
                  >
                    <span>SIGN IN TO MY ACCOUNT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* REAL SIGN UP FORM */}
              {mode === 'signup' && (
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">Full Name *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                      />
                      <User className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">Phone Number (WhatsApp) *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                      />
                      <Phone className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">Email Address *</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                      />
                      <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">Create Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                      />
                      <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#171717]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Real Sign Up Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c99632] via-[#e5b85c] to-[#a6751d] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all gold-glow mt-2"
                  >
                    <span>CREATE ACCOUNT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
