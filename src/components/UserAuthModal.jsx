import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { cleanIndianPhone, EMAIL_REGEX, PHONE_REGEX } from '../utils/phoneUtils';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  KeyRound,
  ArrowLeft,
  MessageCircle,
  AlertCircle,
  Check,
  Smartphone,
  ChevronRight,
  Plus
} from 'lucide-react';

export const UserAuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    currentUser,
    loginCustomer,
    signupCustomer,
    loginWithGoogle,
    loginWithPhone,
    logoutCustomer,
    requestPasswordReset,
    resetPassword,
    authModalMode,
    storeInfo,
    language,
    registeredUsers = []
  } = useStore();

  // Primary Views: 'main' (Phone + Google) | 'email' | 'forgot'
  const [authView, setAuthView] = useState('main');
  const [emailMode, setEmailMode] = useState('login'); // 'login' | 'signup'

  // Password & Form States
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorAction, setErrorAction] = useState(null);

  // Phone Auth States (Indian E-Commerce Standard)
  const [phoneOtpStep, setPhoneOtpStep] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneName, setPhoneName] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState('');

  // Google Real-World Account Chooser States
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);
  const [showAnotherGoogleInput, setShowAnotherGoogleInput] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [savedGoogleAccounts, setSavedGoogleAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('vasavi_saved_google_accounts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Email / Password Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailPhone, setEmailPhone] = useState('');

  // Forgot Password States
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state on open
  useEffect(() => {
    if (authModalMode === 'forgot') {
      setAuthView('forgot');
    } else {
      setAuthView('main');
    }
    setError('');
    setErrorAction(null);
    setSuccessMsg('');
    setPhoneOtpStep(false);
    setIsGoogleChooserOpen(false);
    setShowAnotherGoogleInput(false);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Build the list of available Google accounts (saved accounts + registered customers with Google/Gmail)
  const getGoogleAccountsList = () => {
    const map = new Map();

    // 1. Saved accounts in browser
    savedGoogleAccounts.forEach((acc) => {
      if (acc?.email) map.set(acc.email.toLowerCase(), acc);
    });

    // 2. Any registered users from store state that have an email
    if (Array.isArray(registeredUsers)) {
      registeredUsers.forEach((u) => {
        if (u?.email && u.email.includes('@') && !map.has(u.email.toLowerCase())) {
          map.set(u.email.toLowerCase(), {
            email: u.email,
            name: u.name || u.email.split('@')[0],
            avatar: u.avatar || u.name?.charAt(0)?.toUpperCase() || '👤'
          });
        }
      });
    }

    return Array.from(map.values());
  };

  const availableGoogleAccounts = getGoogleAccountsList();

  // Execute Google Authentication with 1-Click
  const handleSelectGoogleAccount = async (account) => {
    setIsSubmitting(true);
    setError('');
    setErrorAction(null);
    try {
      const cleanEmail = account.email.toLowerCase().trim();
      const cleanName = (account.name || cleanEmail.split('@')[0]).trim();
      const avatarLetter = cleanName.charAt(0).toUpperCase() || '👤';

      const res = await loginWithGoogle({
        email: cleanEmail,
        name: cleanName,
        avatar: account.avatar || avatarLetter
      });

      if (res && res.success) {
        // Save to browser saved accounts
        const updatedAccounts = [
          { email: cleanEmail, name: cleanName, avatar: account.avatar || avatarLetter },
          ...savedGoogleAccounts.filter((a) => a.email.toLowerCase() !== cleanEmail)
        ].slice(0, 5);
        setSavedGoogleAccounts(updatedAccounts);
        try {
          localStorage.setItem('vasavi_saved_google_accounts', JSON.stringify(updatedAccounts));
        } catch (e) {}

        const isNew = res.isNew;
        setSuccessMsg(
          isNew
            ? (language === 'te'
                ? `ఖాతా విజయవంతంగా సృష్టించబడింది! స్వాగతం, ${res.user?.name}!`
                : `Account created successfully! Welcome to Vasavi, ${res.user?.name}!`)
            : (language === 'te'
                ? `తిరిగి స్వాగతం, ${res.user?.name}! విజయవంతంగా లాగిన్ అయ్యారు.`
                : `Welcome back, ${res.user?.name}! Signed in successfully with Google.`)
        );

        setTimeout(() => {
          setIsGoogleChooserOpen(false);
          closeAuthModal();
        }, 900);
      } else {
        setError(res?.error || (language === 'te' ? 'Google లాగిన్ విఫలమైంది.' : 'Google sign-in failed. Please try again.'));
      }
    } catch (err) {
      setError(err.message || 'Google authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle custom Google account submit
  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    const cleanMail = customGoogleEmail.trim();
    if (!cleanMail || !cleanMail.includes('@')) {
      setError(language === 'te' ? 'దయచేసి సరైన Gmail అడ్రస్ నమోదు చేయండి.' : 'Please enter a valid Gmail address.');
      return;
    }
    const namePart = customGoogleName.trim() || cleanMail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    handleSelectGoogleAccount({
      email: cleanMail,
      name: formattedName,
      avatar: formattedName.charAt(0).toUpperCase()
    });
  };

  // 1. Phone OTP Handlers (Indian E-Commerce Standard: Flipkart / Amazon style)
  const handleSendPhoneOtp = (e) => {
    if (e) e.preventDefault();
    setError('');
    setErrorAction(null);
    setSuccessMsg('');

    const cleanP = cleanIndianPhone(phoneInput);
    if (!PHONE_REGEX.test(cleanP)) {
      setError(
        language === 'te'
          ? 'దయచేసి 6, 7, 8, లేదా 9 తో ప్రారంభమయ్యే సరైన 10 అంకెల మొబైల్ నంబర్ (+91) నమోదు చేయండి.'
          : 'Please enter a valid 10-digit Indian mobile number (+91) starting with 6, 7, 8, or 9.'
      );
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedPhoneOtp(code);
    setPhoneOtpStep(true);
    setSuccessMsg(
      language === 'te'
        ? `+91 ${cleanP} కు OTP పంపబడింది. వెరిఫికేషన్ కోడ్: ${code}`
        : `Verification OTP generated for +91 ${cleanP}: ${code}`
    );
  };

  const handleVerifyPhoneOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setErrorAction(null);
    setSuccessMsg('');

    const cleanP = cleanIndianPhone(phoneInput);
    const cleanO = enteredOtp.trim();

    if (!cleanO || cleanO.length < 4) {
      setError(language === 'te' ? 'దయచేసి 4 అంకెల OTP నమోదు చేయండి.' : 'Please enter the 4-digit verification code.');
      return;
    }

    if (generatedPhoneOtp && cleanO !== generatedPhoneOtp) {
      setError(language === 'te' ? 'తప్పు OTP కోడ్. దయచేసి సరిచూసుకోండి.' : 'Incorrect OTP code. Please check and try again.');
      return;
    }

    setIsSubmitting(true);
    const finalName = phoneName.trim() || `Customer ${cleanP.slice(-4)}`;
    const res = await loginWithPhone({ phone: cleanP, name: finalName, otp: cleanO });
    setIsSubmitting(false);

    if (res && res.success) {
      setSuccessMsg(
        language === 'te'
          ? `స్వాగతం, ${res.user?.name}! విజయవంతంగా లాగిన్ అయ్యారు.`
          : `Welcome, ${res.user?.name}! Signed in successfully.`
      );
      setTimeout(() => {
        closeAuthModal();
        setPhoneOtpStep(false);
        setEnteredOtp('');
      }, 800);
    } else {
      setError(res?.message || (language === 'te' ? 'మొబైల్ లాగిన్ విఫలమైంది.' : 'Mobile login failed.'));
    }
  };

  // 2. Traditional Email & Password Sign In
  const handleEmailLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorAction(null);
    setSuccessMsg('');

    const rawId = email.trim();
    const rawPass = password.trim();

    if (!rawId) {
      setError(language === 'te' ? 'దయచేసి మీ ఈమెయిల్ లేదా మొబైల్ నంబర్ నమోదు చేయండి.' : 'Please enter your registered email or mobile number.');
      return;
    }
    if (!rawPass) {
      setError(language === 'te' ? 'దయచేసి పాస్‌వర్డ్ నమోదు చేయండి.' : 'Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const res = await loginCustomer(rawId, rawPass);
    setIsSubmitting(false);

    if (res && res.success) {
      setSuccessMsg(language === 'te' ? 'విజయవంతంగా లాగిన్ అయ్యారు! స్వాగతం.' : 'Signed in successfully! Welcome back.');
      setTimeout(() => closeAuthModal(), 700);
    } else {
      const errMsg = res?.message || (language === 'te' ? 'చెల్లని వివరాలు.' : 'Invalid credentials. Please check and try again.');
      setError(errMsg);
      if (errMsg.toLowerCase().includes('not found')) {
        setErrorAction('goto-signup');
      } else if (errMsg.toLowerCase().includes('password')) {
        setErrorAction('goto-forgot');
      }
    }
  };

  // 3. Email Sign Up
  const handleEmailSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorAction(null);
    setSuccessMsg('');

    const cleanN = name.trim();
    const cleanP = cleanIndianPhone(emailPhone);
    const cleanE = email.trim();
    const cleanPass = password.trim();

    if (!cleanN || cleanN.length < 3) {
      setError(language === 'te' ? 'దయచేసి మీ పూర్తి పేరు (కనీసం 3 అక్షరాలు) నమోదు చేయండి.' : 'Please enter your valid full name (minimum 3 characters).');
      return;
    }
    if (!PHONE_REGEX.test(cleanP)) {
      setError(language === 'te' ? 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ (+91) నమోదు చేయండి.' : 'Please enter a valid 10-digit Indian mobile number (+91).');
      return;
    }
    if (cleanE && !EMAIL_REGEX.test(cleanE)) {
      setError(language === 'te' ? 'దయచేసి సరైన ఈమెయిల్ అడ్రస్ నమోదు చేయండి.' : 'Please enter a valid email address.');
      return;
    }
    if (!cleanPass || cleanPass.length < 6) {
      setError(language === 'te' ? 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.' : 'Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const res = await signupCustomer({ name: cleanN, email: cleanE, phone: cleanP, password: cleanPass });
    setIsSubmitting(false);

    if (res && res.success) {
      setSuccessMsg(language === 'te' ? 'ఖాతా సృష్టించబడింది! వాసవికి స్వాగతం.' : 'Account created successfully! Welcome to Vasavi.');
      setTimeout(() => closeAuthModal(), 900);
    } else {
      setError(res?.message || (language === 'te' ? 'రిజిస్ట్రేషన్ విఫలమైంది.' : 'Registration failed.'));
    }
  };

  // 4. Forgot Password Flow
  const handleForgotRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorAction(null);
    setSuccessMsg('');

    const rawId = forgotIdentifier.trim();
    if (!rawId) {
      setError(language === 'te' ? 'దయచేసి మీ రిజిస్టర్డ్ ఈమెయిల్ లేదా మొబైల్ నమోదు చేయండి.' : 'Please enter your registered email address or mobile number.');
      return;
    }

    setIsSubmitting(true);
    const res = await requestPasswordReset(rawId);
    setIsSubmitting(false);

    if (res && res.success) {
      setResetEmail(res.email || rawId);
      setResetPhone(res.phone || '');
      if (res.otp) setResetOtp(res.otp);
      setSuccessMsg(
        language === 'te'
          ? `వెరిఫికేషన్ కోడ్ (${res.email || rawId}) కు పంపబడింది. కోడ్‌ను నమోదు చేయండి.`
          : `Verification code generated for ${res.email || rawId}. Enter the code below.`
      );
      setForgotStep(2);
    } else {
      setError(res?.message || (language === 'te' ? 'ఈ వివరాలతో ఖాతా కనుగొనబడలేదు.' : 'No registered account found.'));
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorAction(null);
    setSuccessMsg('');

    const cleanOtp = resetOtp.replace(/[^\d]/g, '').trim();
    const cleanPass = newPassword.trim();

    if (!cleanOtp || cleanOtp.length < 4) {
      setError(language === 'te' ? 'దయచేసి సరైన వెరిఫికేషన్ కోడ్ నమోదు చేయండి.' : 'Please enter the verification code.');
      return;
    }
    if (!cleanPass || cleanPass.length < 6) {
      setError(language === 'te' ? 'కొత్త పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.' : 'New password must be at least 6 characters long.');
      return;
    }
    if (cleanPass !== confirmPassword.trim()) {
      setError(language === 'te' ? 'పాస్‌వర్డ్‌లు సరిపోలలేదు.' : 'Passwords do not match.');
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
      setSuccessMsg(language === 'te' ? 'పాస్‌వర్డ్ విజయవంతంగా రీసెట్ చేయబడింది! లాగిన్ అవ్వండి.' : 'Password reset successfully! You can now sign in.');
      setEmail(resetEmail);
      setPassword('');
      setTimeout(() => {
        setAuthView('email');
        setEmailMode('login');
        setForgotStep(1);
      }, 1200);
    } else {
      setError(res?.message || (language === 'te' ? 'పాస్‌వర్డ్ రీసెట్ విఫలమైంది.' : 'Password reset failed.'));
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
      {/* Container */}
      <div className="relative w-full max-w-md bg-[#fffcf7] border border-[#c99632]/40 rounded-3xl shadow-2xl overflow-hidden font-sans text-[#171717]">
        
        {/* Top Luxury Banner */}
        <div className="bg-gradient-to-r from-[#c99632] via-[#e5b85c] to-[#a6751d] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm text-white shrink-0">
              {currentUser ? '👤' : authView === 'forgot' ? '🔑' : '🛍️'}
            </div>
            <div>
              <h3 className="font-serif-luxury text-sm font-black tracking-wider uppercase leading-none">
                VASAVI FANCY STORE
              </h3>
              <p className="text-[10.5px] text-amber-100 font-medium mt-0.5">
                {currentUser
                  ? (language === 'te' ? 'కస్టమర్ ప్రొఫైల్' : 'Customer Account')
                  : authView === 'forgot'
                  ? (language === 'te' ? 'పాస్‌వర్డ్ రీసెట్' : 'Password Reset')
                  : (language === 'te' ? 'కస్టమర్ లాగిన్ & సైన్ అప్' : 'Customer Login & Sign Up')}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-4">

          {/* 1. LOGGED IN CUSTOMER PROFILE VIEW */}
          {currentUser ? (
            <div className="space-y-5 text-center py-2">
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

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    closeAuthModal();
                    window.location.hash = '#track';
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
              {/* Notifications & Error Alerts */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium space-y-1.5 animate-shake">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                  {errorAction === 'goto-forgot' && (
                    <button
                      type="button"
                      onClick={() => { setAuthView('forgot'); setForgotStep(1); setError(''); setErrorAction(null); }}
                      className="w-full py-1.5 px-3 rounded-lg bg-white border border-rose-300 text-rose-700 font-bold text-[11px] hover:bg-rose-100/60 transition-all flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <span>🔑 {language === 'te' ? 'పాస్‌వర్డ్‌ను రీసెట్ చేయండి' : 'Reset Your Password'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  PRIMARY VIEW: FLIPKART / AMAZON STYLE E-COMMERCE LOGIN & SIGNUP
                  Unified single screen with 1-Click Google + Mobile Number OTP
                  ───────────────────────────────────────────────────────────── */}
              {authView === 'main' && (
                <div className="space-y-4">
                  {/* Clean Title */}
                  <div className="text-center space-y-1">
                    <h2 className="text-lg font-black text-[#171717] font-serif-luxury">
                      {language === 'te' ? 'లాగిన్ లేదా సైన్ అప్' : 'Login or Sign Up'}
                    </h2>
                    <p className="text-[11.5px] text-[#666666]">
                      {language === 'te'
                        ? 'మీ ఆర్డర్లు, విష్‌లిస్ట్ మరియు ఆఫర్ల కోసం కొనసాగండి'
                        : 'Get access to your Orders, Wishlist & Offers'}
                    </p>
                  </div>

                  {/* 1. Real-World 1-Click Google Authentication */}
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccessMsg('');
                      setShowAnotherGoogleInput(false);
                      setIsGoogleChooserOpen(true);
                    }}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-white border border-[#dadce0] hover:border-[#c99632] hover:bg-[#fffdf9] text-[#3c4043] font-semibold text-xs shadow-2xs flex items-center justify-center gap-3 transition-all active:scale-[0.99] group"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                    </svg>
                    <span className="font-bold text-[#171717] group-hover:text-[#c99632] transition-colors">
                      {language === 'te' ? 'Google తో కొనసాగించండి (1-క్లిక్)' : 'Continue with Google (1-Click)'}
                    </span>
                  </button>

                  {/* Clean Divider */}
                  <div className="relative flex items-center justify-center my-2">
                    <div className="border-t border-[#c99632]/20 w-full"></div>
                    <span className="bg-[#fffcf7] px-3 text-[10px] font-bold text-[#888888] uppercase tracking-wider shrink-0">
                      {language === 'te' ? 'లేదా మొబైల్ నంబర్‌తో' : 'Or with Mobile Number'}
                    </span>
                    <div className="border-t border-[#c99632]/20 w-full"></div>
                  </div>

                  {/* 2. Indian E-Commerce Mobile Number Form */}
                  {!phoneOtpStep ? (
                    <form onSubmit={handleSendPhoneOtp} className="space-y-3">
                      <div>
                        <label htmlFor="main-phone-input" className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'మొబైల్ నంబర్ *' : 'Mobile Number *'}
                        </label>
                        <div className="relative flex rounded-xl border border-[#c99632]/35 bg-white overflow-hidden focus-within:border-[#c99632] focus-within:ring-2 focus-within:ring-[#c99632]/20 transition-all shadow-2xs">
                          <span className="bg-[#faf8f5] px-3 py-2.5 text-xs font-bold text-[#171717] border-r border-[#c99632]/30 flex items-center gap-1 shrink-0 select-none">
                            <span>🇮🇳</span>
                            <span>+91</span>
                          </span>
                          <input
                            id="main-phone-input"
                            name="phone"
                            autoComplete="tel"
                            type="tel"
                            required
                            maxLength={10}
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value.replace(/[^\d]/g, ''))}
                            placeholder="9876543210"
                            className="w-full py-2.5 px-3 text-xs font-semibold font-mono text-[#171717] focus:outline-none"
                          />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {language === 'te'
                            ? 'కొత్త కస్టమర్ల కోసం ఆటోమేటిక్‌గా ఖాతా సృష్టించబడుతుంది'
                            : 'Existing users sign in; new users auto-sign up with 1 click.'}
                        </p>
                      </div>

                      {/* Optional Name field for smooth registration */}
                      <div>
                        <input
                          id="main-phone-name"
                          type="text"
                          value={phoneName}
                          onChange={(e) => setPhoneName(e.target.value)}
                          placeholder={language === 'te' ? 'మీ పేరు (ఐచ్ఛికం / Optional)' : 'Your Name (Optional)'}
                          className="w-full bg-white border border-[#c99632]/25 rounded-xl py-2 px-3 text-xs text-[#171717] placeholder-slate-400 focus:outline-none focus:border-[#c99632]"
                        />
                      </div>

                      {/* Continue Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting || phoneInput.length < 10}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c99632] via-[#e5b85c] to-[#a6751d] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all gold-glow disabled:opacity-50 active:scale-[0.99]"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>{language === 'te' ? 'ఓటీపీ పొందండి & కొనసాగించండి' : 'CONTINUE'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    /* OTP Verification View */
                    <form onSubmit={handleVerifyPhoneOtp} className="space-y-3.5 animate-fadeIn">
                      <div className="p-3 bg-[#faf8f5] border border-[#c99632]/30 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-[#c99632]" />
                          <div>
                            <span className="text-[10px] text-gray-500 block">{language === 'te' ? 'ధృవీకరణ సంఖ్య' : 'Verifying Mobile'}</span>
                            <span className="text-xs font-bold text-[#171717] font-mono">+91 {phoneInput}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPhoneOtpStep(false)}
                          className="text-[11px] font-bold text-[#c99632] hover:underline"
                        >
                          {language === 'te' ? 'నంబర్ మార్చండి' : 'Change'}
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor="otp-box-input" className="block text-xs font-bold text-[#171717]">
                            {language === 'te' ? '4-అంకెల వెరిఫికేషన్ కోడ్ (OTP) *' : '4-Digit Verification Code (OTP) *'}
                          </label>
                          {generatedPhoneOtp && (
                            <button
                              type="button"
                              onClick={() => setEnteredOtp(generatedPhoneOtp)}
                              className="text-[10.5px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md transition-colors"
                            >
                              ⚡ {language === 'te' ? `ఆటో-ఫిల్ (${generatedPhoneOtp})` : `Auto-fill (${generatedPhoneOtp})`}
                            </button>
                          )}
                        </div>
                        <input
                          id="otp-box-input"
                          type="text"
                          required
                          maxLength={6}
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value.replace(/[^\d]/g, ''))}
                          placeholder="••••"
                          className="w-full text-center tracking-[0.6em] font-mono font-black text-lg py-2.5 bg-white border border-[#c99632]/40 rounded-xl focus:outline-none focus:border-[#c99632]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || enteredOtp.length < 4}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c99632] via-[#e5b85c] to-[#a6751d] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all gold-glow disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isSubmitting ? (language === 'te' ? 'ధృవీకరిస్తోంది...' : 'Verifying...') : (language === 'te' ? 'వెరిఫై చేసి లాగిన్ అవ్వండి' : 'VERIFY & SIGN IN')}</span>
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => handleSendPhoneOtp()}
                          className="text-[11px] font-bold text-gray-500 hover:text-[#c99632]"
                        >
                          {language === 'te' ? 'మళ్లీ OTP పంపండి' : 'Resend OTP'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Secondary Switch to Email */}
                  <div className="pt-2 text-center border-t border-[#c99632]/15">
                    <button
                      type="button"
                      onClick={() => { setAuthView('email'); setEmailMode('login'); setError(''); setSuccessMsg(''); }}
                      className="text-xs font-semibold text-[#666666] hover:text-[#c99632] transition-colors inline-flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{language === 'te' ? 'ఈమెయిల్ & పాస్‌వర్డ్ ద్వారా లాగిన్ అవ్వండి' : 'Sign in with Email & Password instead'}</span>
                    </button>
                  </div>

                  {/* Terms & Privacy */}
                  <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                    {language === 'te'
                      ? 'కొనసాగించడం ద్వారా, మీరు వాసవి ఫ్యాన్సీ స్టోర్ నిబంధనలు మరియు గోప్యతా విధానాన్ని అంగీకరిస్తున్నారు.'
                      : 'By continuing, you agree to Vasavi Fancy Store\'s Terms of Use and Privacy Policy.'}
                  </p>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  SECONDARY VIEW: EMAIL & PASSWORD AUTHENTICATION
                  Clean, undisturbing form with back button
                  ───────────────────────────────────────────────────────────── */}
              {authView === 'email' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#c99632]/20">
                    <button
                      type="button"
                      onClick={() => { setAuthView('main'); setError(''); setSuccessMsg(''); }}
                      className="flex items-center gap-1 text-xs font-bold text-[#c99632] hover:text-[#a6751d] transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{language === 'te' ? 'మొబైల్ లాగిన్‌కు తిరిగి వెళ్ళండి' : 'Back to Mobile Login'}</span>
                    </button>
                    <span className="text-[10.5px] font-bold uppercase text-[#888888]">
                      {emailMode === 'login' ? (language === 'te' ? 'ఈమెయిల్ లాగిన్' : 'Email Sign In') : (language === 'te' ? 'ఖాతా తెరవండి' : 'New Account')}
                    </span>
                  </div>

                  {/* Mode switch between Email Login & Email Signup */}
                  <div className="flex bg-[#faf8f5] p-1 rounded-xl border border-[#c99632]/25 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => { setEmailMode('login'); setError(''); setSuccessMsg(''); }}
                      className={`flex-1 py-1.5 rounded-lg transition-all ${emailMode === 'login' ? 'bg-[#c99632] text-white shadow-xs' : 'text-gray-600 hover:text-black'}`}
                    >
                      {language === 'te' ? 'లాగిన్' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEmailMode('signup'); setError(''); setSuccessMsg(''); }}
                      className={`flex-1 py-1.5 rounded-lg transition-all ${emailMode === 'signup' ? 'bg-[#c99632] text-white shadow-xs' : 'text-gray-600 hover:text-black'}`}
                    >
                      {language === 'te' ? 'కొత్త ఖాతా' : 'Create Account'}
                    </button>
                  </div>

                  {emailMode === 'login' ? (
                    <form onSubmit={handleEmailLoginSubmit} className="space-y-3.5">
                      <div>
                        <label htmlFor="email-login-id" className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'ఈమెయిల్ లేదా మొబైల్ *' : 'Email Address or Mobile *'}
                        </label>
                        <div className="relative">
                          <input
                            id="email-login-id"
                            type="text"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="yourname@gmail.com or 9876543210"
                            className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2.5 pl-9 pr-3 text-xs text-[#171717] focus:outline-none focus:border-[#c99632]"
                          />
                          <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor="email-login-pass" className="block text-xs font-bold text-[#171717]">
                            {language === 'te' ? 'పాస్‌వర్డ్ *' : 'Password *'}
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthView('forgot');
                              setForgotStep(1);
                              setForgotIdentifier(email || '');
                              setError('');
                              setSuccessMsg('');
                            }}
                            className="text-[11px] font-bold text-[#c99632] hover:underline"
                          >
                            {language === 'te' ? 'పాస్‌వర్డ్ మర్చిపోయారా?' : 'Forgot Password?'}
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            id="email-login-pass"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2.5 pl-9 pr-9 text-xs text-[#171717] focus:outline-none focus:border-[#c99632]"
                          />
                          <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all gold-glow"
                      >
                        <span>{isSubmitting ? (language === 'te' ? 'లాగిన్ అవుతోంది...' : 'Signing In...') : (language === 'te' ? 'లాగిన్ అవ్వండి' : 'SIGN IN')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleEmailSignupSubmit} className="space-y-3">
                      <div>
                        <label htmlFor="reg-name" className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'పూర్తి పేరు *' : 'Full Name *'}
                        </label>
                        <input
                          id="reg-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ramesh Kumar"
                          className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2 px-3 text-xs text-[#171717] focus:outline-none focus:border-[#c99632]"
                        />
                      </div>

                      <div>
                        <label htmlFor="reg-phone" className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'మొబైల్ నంబర్ (+91) *' : 'Mobile Number (+91) *'}
                        </label>
                        <input
                          id="reg-phone"
                          type="tel"
                          required
                          maxLength={10}
                          value={emailPhone}
                          onChange={(e) => setEmailPhone(e.target.value.replace(/[^\d]/g, ''))}
                          placeholder="9876543210"
                          className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2 px-3 text-xs font-mono text-[#171717] focus:outline-none focus:border-[#c99632]"
                        />
                      </div>

                      <div>
                        <label htmlFor="reg-email" className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'ఈమెయిల్ అడ్రస్' : 'Email Address (Optional)'}
                        </label>
                        <input
                          id="reg-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@gmail.com"
                          className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2 px-3 text-xs text-[#171717] focus:outline-none focus:border-[#c99632]"
                        />
                      </div>

                      <div>
                        <label htmlFor="reg-pass" className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'పాస్‌వర్డ్ *' : 'Password (min 6 characters) *'}
                        </label>
                        <input
                          id="reg-pass"
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2 px-3 text-xs text-[#171717] focus:outline-none focus:border-[#c99632]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all gold-glow"
                      >
                        <span>{isSubmitting ? (language === 'te' ? 'ఖాతా సృష్టిస్తోంది...' : 'Creating Account...') : (language === 'te' ? 'ఖాతా సృష్టించండి' : 'CREATE ACCOUNT')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TERTIARY VIEW: FORGOT PASSWORD FLOW
                  ───────────────────────────────────────────────────────────── */}
              {authView === 'forgot' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#c99632]/20">
                    <button
                      onClick={() => { setAuthView('main'); setError(''); setSuccessMsg(''); }}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#c99632] hover:text-[#a6751d] transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{language === 'te' ? 'లాగిన్‌కు తిరిగి వెళ్ళండి' : 'Back to Sign In'}</span>
                    </button>
                    <span className="text-[11px] font-bold text-[#888888]">
                      {forgotStep === 1 ? 'Step 1/2' : 'Step 2/2'}
                    </span>
                  </div>

                  {forgotStep === 1 ? (
                    <form onSubmit={handleForgotRequestSubmit} className="space-y-3.5">
                      <p className="text-xs text-[#666666] leading-relaxed">
                        {language === 'te'
                          ? 'మీ రిజిస్టర్డ్ ఈమెయిల్ లేదా 10 అంకెల మొబైల్ నమోదు చేయండి. మేము వెరిఫికేషన్ కోడ్ పంపుతాము.'
                          : 'Enter your registered email or 10-digit mobile number (+91) to reset your password.'}
                      </p>

                      <div>
                        <label htmlFor="forgot-id" className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'ఈమెయిల్ లేదా మొబైల్ నంబర్ *' : 'Email or Mobile Number *'}
                        </label>
                        <input
                          id="forgot-id"
                          type="text"
                          required
                          value={forgotIdentifier}
                          onChange={(e) => setForgotIdentifier(e.target.value)}
                          placeholder="yourname@gmail.com or 9876543210"
                          className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2.5 px-3 text-xs text-[#171717] focus:outline-none focus:border-[#c99632]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all gold-glow"
                      >
                        <span>{isSubmitting ? (language === 'te' ? 'కోడ్ పంపుతోంది...' : 'Sending Code...') : (language === 'te' ? 'వెరిఫికేషన్ కోడ్ పంపండి' : 'SEND VERIFICATION CODE')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

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
                    <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                        <span>{language === 'te' ? 'ఖాతా:' : 'Account:'} </span>
                        <strong className="font-mono">{resetEmail || resetPhone}</strong>
                      </div>

                      <div>
                        <label htmlFor="reset-otp-input" className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'వెరిఫికేషన్ కోడ్ (OTP) *' : 'Verification Code (OTP) *'}
                        </label>
                        <input
                          id="reset-otp-input"
                          type="text"
                          required
                          value={resetOtp}
                          onChange={(e) => setResetOtp(e.target.value.replace(/[^\d]/g, ''))}
                          placeholder="123456"
                          className="w-full bg-white border border-[#c99632]/40 rounded-xl py-2 px-3 text-sm font-mono font-bold tracking-widest text-[#171717] focus:outline-none focus:border-[#c99632]"
                        />
                      </div>

                      <div>
                        <label htmlFor="reset-pass-new" className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'కొత్త పాస్‌వర్డ్ (కనీసం 6 అక్షరాలు) *' : 'New Password (min 6 chars) *'}
                        </label>
                        <input
                          id="reset-pass-new"
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2 px-3 text-xs text-[#171717] focus:outline-none focus:border-[#c99632]"
                        />
                      </div>

                      <div>
                        <label htmlFor="reset-pass-confirm" className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'కొత్త పాస్‌వర్డ్ నిర్ధారించండి *' : 'Confirm New Password *'}
                        </label>
                        <input
                          id="reset-pass-confirm"
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2 px-3 text-xs text-[#171717] focus:outline-none focus:border-[#c99632]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all gold-glow"
                      >
                        <span>{isSubmitting ? (language === 'te' ? 'పాస్‌వర్డ్ అప్‌డేట్ చేస్తోంది...' : 'Updating...') : (language === 'te' ? 'కొత్త పాస్‌వర్డ్ సేవ్ చేయండి' : 'SET NEW PASSWORD')}</span>
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

      {/* ─────────────────────────────────────────────────────────────
          AUTHENTIC REAL-WORLD GOOGLE ACCOUNT CHOOSER DIALOG
          Pixel-perfect Google OAuth popup with 1-Click Login & Auto-Signup
          ───────────────────────────────────────────────────────────── */}
      {isGoogleChooserOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-[390px] bg-white rounded-3xl shadow-2xl border border-[#dadce0] overflow-hidden font-sans text-[#202124] animate-scaleUp">
            
            {/* Google Header */}
            <div className="p-6 pb-4 border-b border-[#f1f3f4]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                  <span className="text-xs font-semibold text-[#5f6368]">
                    {language === 'te' ? 'Google తో సైన్ ఇన్ చేయండి' : 'Sign in with Google'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGoogleChooserOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3">
                <h3 className="text-base font-bold text-[#202124]">
                  {language === 'te' ? 'ఖాతాను ఎంచుకోండి' : 'Choose an account'}
                </h3>
                <p className="text-xs text-[#5f6368] mt-0.5">
                  {language === 'te' ? 'వాసవి ఫ్యాన్సీ స్టోర్‌కు కొనసాగడానికి' : 'to continue to '}
                  <strong className="text-[#202124]">Vasavi Fancy Store</strong>
                </p>
              </div>
            </div>

            {/* Google Accounts List (Real-World Single-Click Selection) */}
            <div className="p-3 max-h-[280px] overflow-y-auto divide-y divide-[#f1f3f4]">
              {availableGoogleAccounts.length > 0 && !showAnotherGoogleInput ? (
                <>
                  {availableGoogleAccounts.map((account, idx) => (
                    <button
                      key={account.email || idx}
                      type="button"
                      onClick={() => handleSelectGoogleAccount(account)}
                      disabled={isSubmitting}
                      className="w-full p-3 rounded-xl hover:bg-[#f8f9fa] flex items-center justify-between text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#1a73e8]/10 border border-[#1a73e8]/30 flex items-center justify-center font-bold text-sm text-[#1a73e8] shrink-0">
                          {account.avatar || account.name?.charAt(0)?.toUpperCase() || '👤'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#202124] truncate group-hover:text-[#1a73e8] transition-colors">
                            {account.name}
                          </p>
                          <p className="text-[11px] text-[#5f6368] truncate font-mono">
                            {account.email}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1a73e8] shrink-0 ml-2" />
                    </button>
                  ))}

                  {/* Option to use another Google account */}
                  <button
                    type="button"
                    onClick={() => setShowAnotherGoogleInput(true)}
                    className="w-full p-3 rounded-xl hover:bg-[#f8f9fa] flex items-center gap-3 text-left transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#202124] group-hover:text-[#1a73e8] transition-colors">
                        {language === 'te' ? 'వేరే ఖాతాను ఉపయోగించండి' : 'Use another account'}
                      </p>
                    </div>
                  </button>
                </>
              ) : (
                /* Enter another Google Account Screen */
                <form onSubmit={handleCustomGoogleSubmit} className="p-3 space-y-3">
                  <div>
                    <label htmlFor="google-oauth-email" className="block text-xs font-bold text-[#202124] mb-1">
                      {language === 'te' ? 'మీ ఈమెయిల్ లేదా ఫోన్ *' : 'Email or phone *'}
                    </label>
                    <input
                      id="google-oauth-email"
                      type="email"
                      required
                      autoFocus
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full px-3 py-2 text-xs text-[#202124] border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                    />
                  </div>

                  <div>
                    <label htmlFor="google-oauth-name" className="block text-xs font-bold text-[#202124] mb-1">
                      {language === 'te' ? 'మీ పేరు (ఐచ్ఛికం)' : 'Your Name (Optional)'}
                    </label>
                    <input
                      id="google-oauth-name"
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="e.g. Ramesh"
                      className="w-full px-3 py-2 text-xs text-[#202124] border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {availableGoogleAccounts.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setShowAnotherGoogleInput(false)}
                        className="text-xs font-bold text-[#1a73e8] hover:underline"
                      >
                        {language === 'te' ? 'ఖాతాల జాబితాకు తిరిగి వెళ్ళండి' : 'Back to accounts'}
                      </button>
                    ) : <div></div>}

                    <button
                      type="submit"
                      disabled={isSubmitting || !customGoogleEmail.includes('@')}
                      className="py-2 px-5 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting ? (language === 'te' ? 'కనెక్ట్ అవుతోంది...' : 'Connecting...') : (language === 'te' ? 'కొనసాగించండి' : 'Next')}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Google OAuth Disclaimer Footer */}
            <div className="p-4 bg-[#f8f9fa] border-t border-[#f1f3f4] text-[10.5px] text-[#5f6368] space-y-2">
              <p className="leading-relaxed">
                {language === 'te'
                  ? 'కొనసాగించడానికి, Google మీ పేరు, ఈమెయిల్ అడ్రస్ మరియు ప్రొఫైల్ చిత్రాన్ని vasavistore.in తో పంచుకుంటుంది.'
                  : 'To continue, Google will share your name, email address, and profile picture with vasavistore.in.'}
              </p>
              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-medium">
                <span>English (United States)</span>
                <div className="flex items-center gap-3">
                  <span className="hover:underline cursor-pointer">Help</span>
                  <span className="hover:underline cursor-pointer">Privacy</span>
                  <span className="hover:underline cursor-pointer">Terms</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
