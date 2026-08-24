import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle2, ArrowRight, UserCheck, KeyRound, ArrowLeft, MessageCircle, AlertCircle, Check } from 'lucide-react';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

const cleanIndianPhone = (phoneInput) => {
  if (!phoneInput) return '';
  let str = String(phoneInput).trim().replace(/\D/g, ''); // strip spaces, dashes, +
  if (str.startsWith('91') && str.length === 12) {
    str = str.slice(2);
  } else if (str.startsWith('0') && str.length === 11) {
    str = str.slice(1);
  }
  return str;
};

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
  const [errorAction, setErrorAction] = useState(null); // 'goto-login' | 'goto-signup'

  // Sync mode whenever modal opens or authModalMode changes
  React.useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
    }
    setError('');
    setErrorAction(null);
    setSuccessMsg('');
  }, [authModalMode, isAuthModalOpen]);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Forgot Password States
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  // Password Complexity Live Checkers
  const pwdHasUpper = /[A-Z]/.test(password);
  const pwdHasLower = /[a-z]/.test(password);
  const pwdHasNumber = /[0-9]/.test(password);
  const pwdHasSpecial = /[^A-Za-z0-9]/.test(password);
  const pwdHasLength = password.length >= 6;
  const isPasswordComplex = pwdHasUpper && pwdHasLower && pwdHasNumber && pwdHasSpecial && pwdHasLength;

  // Validation Checks
  const isNameValid = name.trim().length >= 3;
  const cleanPhoneInput = cleanIndianPhone(phone);
  const isPhoneValid = PHONE_REGEX.test(cleanPhoneInput);
  const isEmailValid = !email.trim() || EMAIL_REGEX.test(email.trim());
  const isPasswordValid = isPasswordComplex;
  const isLoginIdentifierValid = EMAIL_REGEX.test(email.trim()) || PHONE_REGEX.test(cleanIndianPhone(email));

  // 1. Handle Professional Sign In Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorAction(null);
    setSuccessMsg('');

    const rawId = email.trim();
    const rawPass = password.trim();

    if (!rawId) {
      setError(language === 'te' ? 'దయచేసి మీ ఈమెయిల్ లేదా 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.' : 'Please enter your registered email address or 10-digit mobile number.');
      return;
    }

    const cleanP = cleanIndianPhone(rawId);
    if (!EMAIL_REGEX.test(rawId) && !PHONE_REGEX.test(cleanP)) {
      setError(
        language === 'te'
          ? 'దయచేసి సరైన ఈమెయిల్ అడ్రస్ లేదా 6-9 తో ప్రారంభమయ్యే 10 అంకెల మొబైల్ నంబర్ (+91) నమోదు చేయండి.'
          : 'Please enter a valid email address (e.g. name@gmail.com) or a 10-digit Indian mobile number (+91).'
      );
      return;
    }

    if (!rawPass) {
      setError(language === 'te' ? 'దయచేసి మీ పాస్‌వర్డ్ నమోదు చేయండి.' : 'Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const res = await loginCustomer(rawId, rawPass);
    setIsSubmitting(false);

    if (res && res.success) {
      setSuccessMsg(language === 'te' ? 'విజయవంతంగా లాగిన్ అయ్యారు! స్వాగతం.' : 'Signed in successfully! Welcome back.');
      setTimeout(() => {
        closeAuthModal();
      }, 700);
    } else {
      const errMsg = res?.message || (language === 'te' ? 'చెల్లని వివరాలు. దయచేసి సరిచూసుకోండి.' : 'Invalid credentials. Please check and try again.');
      setError(errMsg);
      if (errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('create')) {
        setErrorAction('goto-signup');
      } else if (errMsg.toLowerCase().includes('password')) {
        setErrorAction('goto-forgot');
      }
    }
  };

  // 2. Handle Professional Sign Up Submit
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorAction(null);
    setSuccessMsg('');

    const cleanN = name.trim();
    const cleanP = cleanIndianPhone(phone);
    const cleanE = email.trim();
    const cleanPass = password.trim();

    if (!cleanN || cleanN.length < 3) {
      setError(language === 'te' ? 'దయచేసి మీ పూర్తి పేరు (కనీసం 3 అక్షరాలు) నమోదు చేయండి.' : 'Please enter your valid full name (minimum 3 characters).');
      return;
    }

    if (!PHONE_REGEX.test(cleanP)) {
      setError(
        language === 'te'
          ? 'దయచేసి 6, 7, 8, లేదా 9 తో ప్రారంభమయ్యే సరైన 10 అంకెల భారతీయ మొబైల్ నంబర్ (+91) నమోదు చేయండి.'
          : 'Please enter a valid 10-digit Indian mobile number (+91) starting with 6, 7, 8, or 9 (e.g., 9876543210).'
      );
      return;
    }

    if (cleanE && !EMAIL_REGEX.test(cleanE)) {
      setError(language === 'te' ? 'దయచేసి సరైన ఈమెయిల్ అడ్రస్ నమోదు చేయండి (ఉదా: yourname@gmail.com).' : 'Please enter a valid email address (e.g., yourname@gmail.com).');
      return;
    }

    if (!cleanPass || cleanPass.length < 6 || !isPasswordComplex) {
      setError(
        language === 'te'
          ? 'పాస్‌వర్డ్‌లో పెద్ద అక్షరం (A-Z), చిన్న అక్షరం (a-z), అంకె (0-9), మరియు స్పెషల్ క్యారెక్టర్ (!@#$) అన్నీ కలిపి ఉండాలి.'
          : 'Password must combine uppercase (A-Z), lowercase (a-z), numbers (0-9), and special characters (!@#$).'
      );
      return;
    }

    setIsSubmitting(true);
    const res = await signupCustomer({ name: cleanN, email: cleanE, phone: cleanP, password: cleanPass });
    setIsSubmitting(false);

    if (res && res.success) {
      setSuccessMsg(language === 'te' ? 'ఖాతా విజయవంతంగా సృష్టించబడింది! వాసవి ఫ్యాన్సీ స్టోర్‌కు స్వాగతం.' : 'Account created successfully! Welcome to Vasavi Fancy Store.');
      setTimeout(() => {
        closeAuthModal();
      }, 900);
    } else {
      const errMsg = res?.message || (language === 'te' ? 'రిజిస్ట్రేషన్ విఫలమైంది. దయచేసి మీ వివరాలను సరిచూసుకోండి.' : 'Registration failed. Please check your details.');
      setError(errMsg);
      if (errMsg.toLowerCase().includes('already exists') || errMsg.toLowerCase().includes('sign in')) {
        setErrorAction('goto-login');
      }
    }
  };

  // 3. Handle Forgot Password Request (Step 1)
  const handleForgotRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorAction(null);
    setSuccessMsg('');

    const rawId = forgotIdentifier.trim();
    if (!rawId) {
      setError(language === 'te' ? 'దయచేసి మీ రిజిస్టర్డ్ ఈమెయిల్ లేదా 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.' : 'Please enter your registered email address or 10-digit mobile number.');
      return;
    }

    const cleanP = cleanIndianPhone(rawId);
    if (!EMAIL_REGEX.test(rawId) && !PHONE_REGEX.test(cleanP)) {
      setError(language === 'te' ? 'దయచేసి సరైన ఈమెయిల్ లేదా 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.' : 'Please enter a valid email or 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    const res = await requestPasswordReset(rawId);
    setIsSubmitting(false);

    if (res && res.success) {
      setResetEmail(res.email || rawId);
      setResetPhone(res.phone || '');
      if (res.otp) {
        setResetOtp(res.otp);
      }
      setSuccessMsg(
        language === 'te'
          ? `పాస్‌వర్డ్ రీసెట్ వెరిఫికేషన్ కోడ్ (${res.email || rawId}) కు పంపబడింది. 6-అంకెల కోడ్‌ను నమోదు చేయండి.`
          : `Verification code generated for ${res.email || rawId}. Enter the 6-digit code below.`
      );
      setForgotStep(2);
    } else {
      setError(res?.message || (language === 'te' ? 'ఈ వివరాలతో ఖాతా కనుగొనబడలేదు. దయచేసి సరిచూసుకోండి.' : 'No registered account found. Please check your details or create a new account.'));
      setErrorAction('goto-signup');
    }
  };

  // 4. Handle Reset Password Execution (Step 2)
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorAction(null);
    setSuccessMsg('');

    const cleanOtp = resetOtp.replace(/[^\d]/g, '').trim();
    const cleanPass = newPassword.trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      setError(language === 'te' ? 'దయచేసి 6 అంకెల వెరిఫికేషన్ కోడ్ (OTP) నమోదు చేయండి.' : 'Please enter the 6-digit verification code.');
      return;
    }

    const resetHasUpper = /[A-Z]/.test(cleanPass);
    const resetHasLower = /[a-z]/.test(cleanPass);
    const resetHasNumber = /[0-9]/.test(cleanPass);
    const resetHasSpecial = /[^A-Za-z0-9]/.test(cleanPass);

    if (!cleanPass || cleanPass.length < 6 || !resetHasUpper || !resetHasLower || !resetHasNumber || !resetHasSpecial) {
      setError(
        language === 'te'
          ? 'కొత్త పాస్‌వర్డ్‌లో పెద్ద అక్షరం (A-Z), చిన్న అక్షరం (a-z), అంకె (0-9), మరియు స్పెషల్ క్యారెక్టర్ (!@#$) ఉండాలి.'
          : 'New password must combine uppercase (A-Z), lowercase (a-z), numbers (0-9), and special characters (!@#$).'
      );
      return;
    }

    if (cleanPass !== confirmPassword.trim()) {
      setError(language === 'te' ? 'పాస్‌వర్డ్‌లు సరిపోలలేదు. దయచేసి మరలా సరిచూసుకోండి.' : 'Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    const res = await resetPassword({
      email: resetEmail,
      phone: resetPhone,
      otp: cleanOtp,
      newPassword: cleanPass
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
      setError(res?.message || (language === 'te' ? 'పాస్‌వర్డ్ రీసెట్ విఫలమైంది. దయచేసి కోడ్‌ను సరిచూసుకోండి.' : 'Password reset failed. Please check the code and try again.'));
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
        <div className="p-6 sm:p-8 space-y-5">
          
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
                {currentUser.phone && <p className="text-xs text-[#888888] font-mono mt-0.5">📞 +91 {currentUser.phone}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    closeAuthModal();
                    if (useStore) {
                      window.location.hash = '#track';
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#faf8f5] border border-[#c99632]/40 text-xs font-bold text-[#171717] hover:bg-[#fff3c4]/50 transition-colors shadow-2xs"
                >
                  📦 {language === 'te' ? 'నా ఆర్డర్లు' : 'My Orders'}
                </button>

                <button
                  onClick={() => {
                    logoutCustomer();
                    setSuccessMsg(language === 'te' ? 'లాగౌట్ అయ్యారు.' : 'Signed out cleanly.');
                  }}
                  className="flex-1 py-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors shadow-2xs"
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
                    onClick={() => { setMode('login'); setError(''); setErrorAction(null); setSuccessMsg(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      mode === 'login'
                        ? 'bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white shadow-md gold-glow'
                        : 'text-[#666666] hover:text-[#171717]'
                    }`}
                  >
                    🔐 {language === 'te' ? 'లాగిన్' : 'SIGN IN'}
                  </button>
                  <button
                    onClick={() => { setMode('signup'); setError(''); setErrorAction(null); setSuccessMsg(''); }}
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
                    onClick={() => { setMode('login'); setError(''); setErrorAction(null); setSuccessMsg(''); setForgotStep(1); }}
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

              {/* Feedback Alerts & Contextual Actions */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium space-y-2 animate-shake">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                  
                  {/* Contextual Action Button */}
                  {errorAction === 'goto-signup' && (
                    <button
                      type="button"
                      onClick={() => { setMode('signup'); setError(''); setErrorAction(null); }}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-rose-300 text-rose-700 font-bold text-xs hover:bg-rose-100/60 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>✨ {language === 'te' ? 'ఇప్పుడే కొత్త ఖాతా తెరవండి' : 'Create a New Account Now'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {errorAction === 'goto-login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(''); setErrorAction(null); }}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-rose-300 text-rose-700 font-bold text-xs hover:bg-rose-100/60 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>🔐 {language === 'te' ? 'ఈ ఖాతాతో లాగిన్ అవ్వండి' : 'Sign In with this Account'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {errorAction === 'goto-forgot' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setForgotStep(1); setForgotIdentifier(email || ''); setError(''); setErrorAction(null); }}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-rose-300 text-rose-700 font-bold text-xs hover:bg-rose-100/60 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>🔑 {language === 'te' ? 'పాస్‌వర్డ్‌ను రీసెట్ చేయండి' : 'Reset Your Password'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* 1. PROFESSIONAL SIGN IN FORM */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="login-identifier" className="block text-xs font-bold text-[#171717]">
                        {language === 'te' ? 'రిజిస్టర్డ్ ఈమెయిల్ లేదా మొబైల్ *' : 'Registered Email Address or Mobile *'}
                      </label>
                      {email.trim() && isLoginIdentifierValid && (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Valid format
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="login-identifier"
                        name="identifier"
                        autoComplete="username"
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={language === 'te' ? 'మీ ఈమెయిల్ లేదా 10 అంకెల మొబైల్ (+91)' : 'yourname@gmail.com or 9876543210'}
                        className={`w-full bg-white border rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-[#171717] placeholder-slate-400 focus:outline-none transition-all ${
                          email.trim() && !isLoginIdentifierValid
                            ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                            : 'border-[#c99632]/30 focus:border-[#c99632]'
                        }`}
                      />
                      <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="login-password" className="block text-xs font-bold text-[#171717]">
                        {language === 'te' ? 'పాస్‌వర్డ్ *' : 'Password *'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setForgotStep(1);
                          setForgotIdentifier(email || '');
                          setError('');
                          setErrorAction(null);
                          setSuccessMsg('');
                        }}
                        className="text-[11px] font-bold text-[#c99632] hover:text-[#a6751d] hover:underline"
                      >
                        {language === 'te' ? 'పాస్‌వర్డ్ మర్చిపోయారా?' : 'Forgot Password?'}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password"
                        name="password"
                        autoComplete="current-password"
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
                        aria-label="Toggle password visibility"
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

              {/* 2. PROFESSIONAL SIGN UP FORM */}
              {mode === 'signup' && (
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="signup-name" className="block text-xs font-bold text-[#171717]">
                        {language === 'te' ? 'పూర్తి పేరు *' : 'Full Name *'}
                      </label>
                      {name.trim() && (
                        <span className={`text-[10px] font-bold ${isNameValid ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {isNameValid ? '✓ Valid' : 'Min 3 letters'}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="signup-name"
                        name="name"
                        autoComplete="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={language === 'te' ? 'మీ పూర్తి పేరు (ఉదా: రామ్‌చరణ్)' : 'Enter your full name'}
                        className={`w-full bg-white border rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-[#171717] focus:outline-none transition-all ${
                          name.trim() && !isNameValid ? 'border-rose-400 bg-rose-50/20' : 'border-[#c99632]/30 focus:border-[#c99632]'
                        }`}
                      />
                      <User className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="signup-phone" className="block text-xs font-bold text-[#171717]">
                        {language === 'te' ? 'మొబైల్ నంబర్ (భారతీయ +91) *' : 'Indian Mobile Number (+91) *'}
                      </label>
                      {phone.trim() && (
                        <span className={`text-[10px] font-bold ${isPhoneValid ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {isPhoneValid ? '✓ Valid +91' : '10 digits (6-9)'}
                        </span>
                      )}
                    </div>
                    <div className="relative flex rounded-xl border border-[#c99632]/30 bg-white overflow-hidden focus-within:border-[#c99632] transition-all">
                      <span className="bg-[#faf8f5] px-3 py-2.5 text-xs font-bold text-[#171717] border-r border-[#c99632]/30 flex items-center gap-1 shrink-0 select-none">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </span>
                      <input
                        id="signup-phone"
                        name="phone"
                        autoComplete="tel"
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ''))}
                        placeholder="9876543210"
                        className="w-full py-2.5 px-3 text-xs font-medium font-mono text-[#171717] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="signup-email" className="block text-xs font-bold text-[#171717]">
                        {language === 'te' ? 'ఈమెయిల్ అడ్రస్ (ఐచ్ఛికం / Optional)' : 'Email Address (Optional)'}
                      </label>
                      {email.trim() && (
                        <span className={`text-[10px] font-bold ${isEmailValid ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {isEmailValid ? '✓ Valid email' : 'Invalid email'}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="signup-email"
                        name="email"
                        autoComplete="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className={`w-full bg-white border rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-[#171717] focus:outline-none transition-all ${
                          email.trim() && !isEmailValid ? 'border-rose-400 bg-rose-50/20' : 'border-[#c99632]/30 focus:border-[#c99632]'
                        }`}
                      />
                      <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="signup-password" className="block text-xs font-bold text-[#171717]">
                        {language === 'te' ? 'పాస్‌వర్డ్ సృష్టించండి *' : 'Create Secure Password *'}
                      </label>
                      {password.trim() && (
                        <span className={`text-[10px] font-bold ${isPasswordComplex ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {isPasswordComplex ? '✓ Strong' : 'Incomplete'}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="signup-password"
                        name="password"
                        autoComplete="new-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Vasavi@2026"
                        className={`w-full bg-white border rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-[#171717] focus:outline-none transition-all ${
                          password.trim() && !isPasswordComplex ? 'border-amber-400 bg-amber-50/10' : 'border-[#c99632]/30 focus:border-[#c99632]'
                        }`}
                      />
                      <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#171717]"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Live Password Character Combination Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-2">
                      <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors ${pwdHasUpper ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        <span>{pwdHasUpper ? '✓' : '○'}</span>
                        <span>{language === 'te' ? 'పెద్ద అక్షరం (A-Z)' : 'Uppercase (A-Z)'}</span>
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors ${pwdHasLower ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        <span>{pwdHasLower ? '✓' : '○'}</span>
                        <span>{language === 'te' ? 'చిన్న అక్షరం (a-z)' : 'Lowercase (a-z)'}</span>
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors ${pwdHasNumber ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        <span>{pwdHasNumber ? '✓' : '○'}</span>
                        <span>{language === 'te' ? 'అంకె (0-9)' : 'Number (0-9)'}</span>
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors ${pwdHasSpecial ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        <span>{pwdHasSpecial ? '✓' : '○'}</span>
                        <span>{language === 'te' ? 'స్పెషల్ (@#$%)' : 'Special (@#$%)'}</span>
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors ${pwdHasLength ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        <span>{pwdHasLength ? '✓' : '○'}</span>
                        <span>{language === 'te' ? 'కనీసం 6+ అక్షరాలు' : 'Min 6+ chars'}</span>
                      </div>
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
                          <span>{language === 'te' ? 'పాస్‌వర్డ్ రీసెట్ వెరిఫికేషన్' : 'Password Reset Verification'}</span>
                        </h4>
                        <p className="text-[11px] text-[#666666] leading-relaxed">
                          {language === 'te'
                            ? 'మీ రిజిస్టర్డ్ ఈమెయిల్ లేదా 10 అంకెల మొబైల్ నంబర్ (+91) నమోదు చేయండి. మేము 6-అంకెల వెరిఫికేషన్ కోడ్ పంపుతాము.'
                            : 'Enter your registered email address or 10-digit mobile number (+91). We will verify your account.'}
                        </p>
                      </div>

                      <div>
                        <label htmlFor="forgot-identifier" className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'రిజిస్టర్డ్ ఈమెయిల్ లేదా మొబైల్ *' : 'Registered Email Address or Phone *'}
                        </label>
                        <div className="relative">
                          <input
                            id="forgot-identifier"
                            name="identifier"
                            autoComplete="username"
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
                          {language === 'te' ? 'ఈ ఖాతా కోసం వెరిఫికేషన్ కోడ్ నమోదు చేయండి:' : 'Enter 6-digit verification code for:'}
                        </p>
                        <p className="text-[11px] text-[#666666] font-mono mt-0.5">{resetEmail}</p>
                      </div>

                      <div>
                        <label htmlFor="reset-otp" className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? '6-అంకెల వెరిఫికేషన్ కోడ్ (OTP) *' : '6-Digit Verification Code (OTP) *'}
                        </label>
                        <div className="relative">
                          <input
                            id="reset-otp"
                            name="otp"
                            autoComplete="one-time-code"
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
                        <label htmlFor="reset-new-password" className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'కొత్త పాస్‌వర్డ్ (కనీసం 6 అక్షరాలు, A-Z, a-z, 0-9, @#$) *' : 'New Password (A-Z, a-z, 0-9, @#$) *'}
                        </label>
                        <div className="relative">
                          <input
                            id="reset-new-password"
                            name="newPassword"
                            autoComplete="new-password"
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Vasavi@2026"
                            className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                          />
                          <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#171717]"
                            aria-label="Toggle new password visibility"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="reset-confirm-password" className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'కొత్త పాస్‌వర్డ్‌ను నిర్ధారించండి *' : 'Confirm New Password *'}
                        </label>
                        <div className="relative">
                          <input
                            id="reset-confirm-password"
                            name="confirmPassword"
                            autoComplete="new-password"
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Vasavi@2026"
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
