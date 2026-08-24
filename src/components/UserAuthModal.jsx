import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle2, ArrowRight, UserCheck, KeyRound, ArrowLeft, MessageCircle } from 'lucide-react';

export const UserAuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    currentUser,
    loginCustomer,
    signupCustomer,
    logoutCustomer,
    requestPasswordReset,
    resetPassword,
    authModalMode,
    setAuthModalMode,
    storeInfo,
    language
  } = useStore();

  const [mode, setMode] = useState(authModalMode || 'login'); // 'login' | 'signup' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
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

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Forgot Password States
  const [forgotStep, setForgotStep] = useState(1); // 1: request code, 2: enter OTP & new password
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setError(language === 'te' ? 'దయచేసి ఈమెయిల్/మొబైల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి.' : 'Please enter both your email/phone and password.');
      return;
    }

    setIsSubmitting(true);
    const res = await loginCustomer(email, password);
    setIsSubmitting(false);

    if (res && res.success) {
      setSuccessMsg(language === 'te' ? 'విజయవంతంగా లాగిన్ అయ్యారు!' : 'Signed in successfully!');
      setTimeout(() => {
        closeAuthModal();
      }, 700);
    } else {
      setError((res && res.message) || (language === 'te' ? 'చెల్లని ఈమెయిల్ లేదా పాస్‌వర్డ్. దయచేసి వివరాలను సరిచూసుకోండి.' : 'Invalid email or password. Please check your credentials.'));
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim() || !phone.trim()) {
      setError(language === 'te' ? 'దయచేసి మీ పేరు మరియు 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.' : 'Please fill in your name and 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    const res = await signupCustomer({ name, email, phone, password });
    setIsSubmitting(false);

    if (res && res.success) {
      setSuccessMsg(language === 'te' ? 'ఖాతా విజయవంతంగా సృష్టించబడింది! వాసవి ఫ్యాన్సీ స్టోర్‌కు స్వాగతం.' : 'Account created successfully! Welcome to Vasavi Fancy Store.');
      setTimeout(() => {
        closeAuthModal();
      }, 900);
    } else {
      setError((res && res.message) || (language === 'te' ? 'రిజిస్ట్రేషన్ విఫలమైంది. దయచేసి మీ వివరాలను సరిచూసుకోండి.' : 'Registration failed. Please check your details.'));
    }
  };

  // Step 1: Send Password Reset Code
  const handleForgotRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!forgotIdentifier.trim()) {
      setError(language === 'te' ? 'దయచేసి మీ రిజిస్టర్డ్ ఈమెయిల్ లేదా మొబైల్ నంబర్ నమోదు చేయండి.' : 'Please enter your registered email address or mobile number.');
      return;
    }

    setIsSubmitting(true);
    const res = await requestPasswordReset(forgotIdentifier);
    setIsSubmitting(false);

    if (res && res.success) {
      setResetEmail(res.email || forgotIdentifier);
      setResetPhone(res.phone || '');
      if (res.otp) {
        setResetOtp(res.otp); // autofill helper for seamless experience
      }
      setSuccessMsg(
        language === 'te'
          ? `పాస్‌వర్డ్ రీసెట్ కోడ్ మీ ఈమెయిల్ (${res.email || forgotIdentifier}) కు పంపబడింది. దయచేసి 6-అంకెల కోడ్‌ను నమోదు చేయండి.`
          : `Verification code has been generated and sent to ${res.email || forgotIdentifier}. Please enter the 6-digit code below.`
      );
      setForgotStep(2);
    } else {
      setError(res?.message || (language === 'te' ? 'ఈ ఈమెయిల్ లేదా మొబైల్ నంబర్‌తో ఖాతా కనుగొనబడలేదు.' : 'No registered account found with this email or mobile number.'));
    }
  };

  // Step 2: Verify Code and Set New Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!resetOtp.trim() || resetOtp.trim().length !== 6) {
      setError(language === 'te' ? 'దయచేసి 6 అంకెల వెరిఫికేషన్ కోడ్ నమోదు చేయండి.' : 'Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword.trim() || newPassword.trim().length < 4) {
      setError(language === 'te' ? 'కొత్త పాస్‌వర్డ్ కనీసం 4 అక్షరాలు ఉండాలి.' : 'New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(language === 'te' ? 'పాస్‌వర్డ్‌లు సరిపోలలేదు. దయచేసి సరిచూసుకోండి.' : 'Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    const res = await resetPassword({
      email: resetEmail,
      phone: resetPhone,
      otp: resetOtp.trim(),
      newPassword: newPassword.trim()
    });
    setIsSubmitting(false);

    if (res && res.success) {
      setSuccessMsg(
        language === 'te'
          ? 'పాస్‌వర్డ్ విజయవంతంగా రీసెట్ చేయబడింది! మీ కొత్త పాస్‌వర్డ్‌తో లాగిన్ అవ్వండి.'
          : 'Password has been reset successfully! You can now sign in with your new password.'
      );
      setEmail(resetEmail);
      setPassword('');
      setTimeout(() => {
        setMode('login');
        setForgotStep(1);
      }, 1500);
    } else {
      setError(res?.message || (language === 'te' ? 'పాస్‌వర్డ్ రీసెట్ విఫలమైంది. దయచేసి కోడ్‌ను సరిచూసుకోండి.' : 'Password reset failed. Please check the code.'));
    }
  };

  const handleWhatsAppReset = () => {
    const waNumber = storeInfo?.whatsappNumber || '918309917665';
    let msg = `Hello Ramcharan Garu (Vasavi Fancy Store) 👋\n`;
    msg += `I forgot my account login password. Please help me reset my account password.\n`;
    if (forgotIdentifier || email) {
      msg += `My registered Email/Phone: ${forgotIdentifier || email}\n`;
    }
    msg += `Thank you!`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
      
      {/* Production Modal Container */}
      <div className="relative w-full max-w-md bg-[#fffcf7] border border-[#c99632]/40 rounded-3xl shadow-2xl overflow-hidden font-sans text-[#171717]">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#c99632] via-[#e5b85c] to-[#a6751d] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg text-white shrink-0">
              {mode === 'forgot' ? '🔑' : '👤'}
            </div>
            <div>
              <h3 className="font-serif-luxury text-sm font-black tracking-wider uppercase leading-none">
                VASAVI FANCY STORE
              </h3>
              <p className="text-[10px] text-amber-100 font-medium tracking-wide mt-0.5">
                {currentUser 
                  ? (language === 'te' ? 'కస్టమర్ ప్రొఫైల్' : 'Customer Account')
                  : mode === 'forgot'
                  ? (language === 'te' ? 'పాస్‌వర్డ్ రీసెట్' : 'Reset Password')
                  : (language === 'te' ? 'కస్టమర్ సైన్ ఇన్ & రిజిస్ట్రేషన్' : 'Customer Sign In & Account')}
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
                  <UserCheck className="w-3 h-3 text-emerald-600" /> {language === 'te' ? 'లాగిన్ అయిన కస్టమర్' : 'LOGGED IN CUSTOMER'}
                </span>
                <h3 className="text-xl font-black font-serif-luxury text-[#171717]">{currentUser.name || 'Valued Customer'}</h3>
                {currentUser.email && <p className="text-xs text-[#666666] font-medium">{currentUser.email}</p>}
                {currentUser.phone && <p className="text-xs text-[#888888] font-mono mt-0.5">📞 {currentUser.phone}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    closeAuthModal();
                    window.location.hash = '#track';
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#faf8f5] border border-[#c99632]/40 text-xs font-bold text-[#171717] hover:bg-[#fff3c4]/50 transition-colors"
                >
                  📦 {language === 'te' ? 'నా ఆర్డర్లు' : 'My Orders'}
                </button>

                <button
                  onClick={() => {
                    logoutCustomer();
                    setSuccessMsg(language === 'te' ? 'లాగౌట్ అయ్యారు.' : 'Signed out cleanly.');
                  }}
                  className="flex-1 py-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
                >
                  🚪 {language === 'te' ? 'లాగౌట్' : 'Sign Out'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mode Toggle Tabs (Sign In / Create Account) */}
              {mode !== 'forgot' ? (
                <div className="flex bg-[#faf8f5] p-1 rounded-2xl border border-[#c99632]/30">
                  <button
                    onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      mode === 'login'
                        ? 'bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white shadow-md gold-glow'
                        : 'text-[#666666] hover:text-[#171717]'
                    }`}
                  >
                    🔐 {language === 'te' ? 'లాగిన్' : 'SIGN IN'}
                  </button>
                  <button
                    onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      mode === 'signup'
                        ? 'bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white shadow-md gold-glow'
                        : 'text-[#666666] hover:text-[#171717]'
                    }`}
                  >
                    ✨ {language === 'te' ? 'కొత్త ఖాతా' : 'CREATE ACCOUNT'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between pb-2 border-b border-[#c99632]/20">
                  <button
                    onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); setForgotStep(1); }}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#c99632] hover:text-[#a6751d] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{language === 'te' ? 'లాగిన్‌కి తిరిగి వెళ్ళండి' : 'Back to Sign In'}</span>
                  </button>
                  <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                    {forgotStep === 1 ? (language === 'te' ? 'దశ 1/2' : 'Step 1/2') : (language === 'te' ? 'దశ 2/2' : 'Step 2/2')}
                  </span>
                </div>
              )}

              {/* Feedback Alerts */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center animate-shake">
                  ⚠️ {error}
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* 1. REAL SIGN IN FORM */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">
                      {language === 'te' ? 'ఈమెయిల్ లేదా ఫోన్ నంబర్' : 'Email Address / Mobile'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={language === 'te' ? 'మీ ఈమెయిల్ లేదా మొబైల్' : 'yourname@gmail.com'}
                        className="w-full bg-white border border-[#c99632]/30 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-[#171717] placeholder-slate-400 focus:outline-none focus:border-[#c99632]"
                      />
                      <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-[#171717]">
                        {language === 'te' ? 'పాస్‌వర్డ్' : 'Password'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setForgotStep(1);
                          setForgotIdentifier(email || '');
                          setError('');
                          setSuccessMsg('');
                        }}
                        className="text-[11px] font-bold text-[#c99632] hover:text-[#a6751d] hover:underline"
                      >
                        {language === 'te' ? 'పాస్‌వర్డ్ మర్చిపోయారా?' : 'Forgot Password?'}
                      </button>
                    </div>
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

                  {/* Sign In Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c99632] via-[#e5b85c] to-[#a6751d] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all gold-glow mt-2 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? (language === 'te' ? 'లాగిన్ అవుతోంది...' : 'Signing In...') : (language === 'te' ? 'నా ఖాతాలోకి లాగిన్ అవ్వండి' : 'SIGN IN TO MY ACCOUNT')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* 2. REAL SIGN UP FORM */}
              {mode === 'signup' && (
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">
                      {language === 'te' ? 'పూర్తి పేరు *' : 'Full Name *'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={language === 'te' ? 'మీ పూర్తి పేరు' : 'Enter your full name'}
                        className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                      />
                      <User className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">
                      {language === 'te' ? 'మొబైల్ నంబర్ (వాట్సాప్) *' : 'Phone Number (WhatsApp) *'}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={language === 'te' ? '10 అంకెల మొబైల్ నంబర్' : 'Enter 10-digit mobile number'}
                        className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                      />
                      <Phone className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">
                      {language === 'te' ? 'ఈమెయిల్ అడ్రస్ *' : 'Email Address *'}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={language === 'te' ? 'మీ ఈమెయిల్ అడ్రస్' : 'Enter email address'}
                        className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                      />
                      <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">
                      {language === 'te' ? 'పాస్‌వర్డ్ సృష్టించండి *' : 'Create Password *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={language === 'te' ? 'కనీసం 6 అక్షరాలు' : 'At least 6 characters'}
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

                  {/* Sign Up Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c99632] via-[#e5b85c] to-[#a6751d] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all gold-glow mt-2 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? (language === 'te' ? 'ఖాతా సృష్టిస్తోంది...' : 'Creating Account...') : (language === 'te' ? 'ఖాతా సృష్టించండి' : 'CREATE ACCOUNT')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* 3. FORGOT PASSWORD & RESET FLOW */}
              {mode === 'forgot' && (
                <div className="space-y-4">
                  {forgotStep === 1 ? (
                    <form onSubmit={handleForgotRequestSubmit} className="space-y-4">
                      <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#c99632]/30 space-y-1">
                        <h4 className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                          <KeyRound className="w-4 h-4 text-[#c99632]" />
                          <span>{language === 'te' ? 'పాస్‌వర్డ్ రీసెట్ కోడ్ పొందండి' : 'Reset Password Verification'}</span>
                        </h4>
                        <p className="text-[11px] text-[#666666]">
                          {language === 'te'
                            ? 'మీ రిజిస్టర్డ్ ఈమెయిల్ లేదా మొబైల్ నంబర్ నమోదు చేయండి. మేము 6-అంకెల వెరిఫికేషన్ కోడ్ పంపుతాము.'
                            : 'Enter your registered email address or mobile number. We will send a 6-digit verification code.'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'రిజిస్టర్డ్ ఈమెయిల్ / మొబైల్ *' : 'Registered Email Address / Phone *'}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={forgotIdentifier}
                            onChange={(e) => setForgotIdentifier(e.target.value)}
                            placeholder={language === 'te' ? 'మీ ఈమెయిల్ లేదా 10 అంకెల మొబైల్' : 'yourname@gmail.com or mobile'}
                            className="w-full bg-white border border-[#c99632]/30 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                          />
                          <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c99632] via-[#e5b85c] to-[#a6751d] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all gold-glow disabled:opacity-50"
                      >
                        <span>{isSubmitting ? (language === 'te' ? 'కోడ్ పంపుతోంది...' : 'Sending Code...') : (language === 'te' ? 'వెరిఫికేషన్ కోడ్ పంపండి' : 'SEND VERIFICATION CODE')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      {/* WhatsApp Fast Support */}
                      <button
                        type="button"
                        onClick={handleWhatsAppReset}
                        className="w-full py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'te' ? 'వాట్సాప్ ద్వారా తక్షణ సాయం పొందండి' : 'Reset Instantly via WhatsApp Support'}</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                        <p className="font-bold">
                          {language === 'te' ? 'ఈమెయిల్‌కు పంపిన 6-అంకెల కోడ్ నమోదు చేయండి:' : 'Enter the 6-digit code sent to your email:'}
                        </p>
                        <p className="text-[11px] text-[#666666] font-mono mt-0.5">{resetEmail}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? '6-అంకెల వెరిఫికేషన్ కోడ్ (OTP) *' : '6-Digit Verification Code *'}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={resetOtp}
                            onChange={(e) => setResetOtp(e.target.value.replace(/[^\d]/g, ''))}
                            placeholder="123456"
                            className="w-full bg-white border border-[#c99632]/40 rounded-xl py-2.5 pl-10 pr-4 text-sm font-mono font-bold tracking-widest text-[#171717] focus:outline-none focus:border-[#c99632]"
                          />
                          <KeyRound className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'కొత్త పాస్‌వర్డ్ *' : 'New Password *'}
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder={language === 'te' ? 'కనీసం 4 అక్షరాలు' : 'At least 4 characters'}
                            className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                          />
                          <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#171717]"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'కొత్త పాస్‌వర్డ్‌ను నిర్ధారించండి *' : 'Confirm New Password *'}
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={language === 'te' ? 'మరలా అదే పాస్‌వర్డ్ నమోదు చేయండి' : 'Re-enter new password'}
                            className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                          />
                          <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c99632] via-[#e5b85c] to-[#a6751d] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all gold-glow mt-2 disabled:opacity-50"
                      >
                        <span>{isSubmitting ? (language === 'te' ? 'పాస్‌వర్డ్ అప్‌డేట్ చేస్తోంది...' : 'Updating Password...') : (language === 'te' ? 'కొత్త పాస్‌వర్డ్ సేవ్ చేయండి' : 'SET NEW PASSWORD')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
