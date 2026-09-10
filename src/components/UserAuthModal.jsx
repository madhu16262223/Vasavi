import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { cleanIndianPhone, EMAIL_REGEX, PHONE_REGEX } from '../utils/phoneUtils';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle2, ArrowRight, UserCheck, KeyRound, ArrowLeft, MessageCircle, AlertCircle, Check, Smartphone, Sparkles } from 'lucide-react';

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
    setAuthModalMode,
    storeInfo,
    language
  } = useStore();

  const [mode, setMode] = useState(authModalMode || 'login'); // 'login' | 'signup' | 'forgot'
  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'email'
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorAction, setErrorAction] = useState(null); // 'goto-login' | 'goto-signup'

  // Phone Auth States
  const [phoneOtpStep, setPhoneOtpStep] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneName, setPhoneName] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState('');

  // Google 1-Click Fast Auth States
  const [googlePromptOpen, setGooglePromptOpen] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleCustomName, setGoogleCustomName] = useState('');

  // Sync mode whenever modal opens or authModalMode changes
  React.useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
    }
    setError('');
    setErrorAction(null);
    setSuccessMsg('');
    setGooglePromptOpen(false);
  }, [authModalMode, isAuthModalOpen]);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

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

  // Handle Google 1-Click Fast Auth
  const handleGoogleSignIn = async (customProfile) => {
    setIsSubmitting(true);
    setError('');
    setErrorAction(null);
    try {
      let profile = customProfile;

      // Check if Google Client ID is configured in env
      const clientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
      if (!profile && clientId && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const decoded = JSON.parse(jsonPayload);
                const res = await loginWithGoogle({
                  email: decoded.email,
                  name: decoded.name,
                  picture: decoded.picture,
                  credential: response.credential
                });
                if (res?.success) {
                  setSuccessMsg(language === 'te' ? `స్వాగతం, ${decoded.name}!` : `Welcome, ${decoded.name}!`);
                  setTimeout(() => closeAuthModal(), 1200);
                }
              } catch (decErr) {
                console.warn('Google decode error:', decErr);
              }
            }
          }
        });
        window.google.accounts.id.prompt();
        setIsSubmitting(false);
        return;
      }

      // If no GIS client ID or user needs prompt
      if (!profile) {
        setGoogleCustomEmail(email.includes('@') ? email : '');
        setGooglePromptOpen(true);
        setIsSubmitting(false);
        return;
      }

      const res = await loginWithGoogle(profile);
      if (res && res.success) {
        setSuccessMsg(
          language === 'te'
            ? `స్వాగతం, ${res.user?.name}! మీ Google ఖాతాతో విజయవంతంగా లాగిన్ అయ్యారు.`
            : `Welcome back, ${res.user?.name}! Signed in successfully with Google.`
        );
        setTimeout(() => {
          closeAuthModal();
          setGooglePromptOpen(false);
        }, 1200);
      } else {
        setError(res?.error || (language === 'te' ? 'Google లాగిన్ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.' : 'Google sign-in failed. Please try again.'));
      }
    } catch (err) {
      setError(err.message || 'Google authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGooglePromptSubmit = (e) => {
    e.preventDefault();
    const cleanMail = googleCustomEmail.trim();
    if (!cleanMail || !cleanMail.includes('@')) {
      setError(language === 'te' ? 'దయచేసి సరైన Gmail అడ్రస్ నమోదు చేయండి.' : 'Please enter a valid Gmail address.');
      return;
    }
    const namePart = googleCustomName.trim() || cleanMail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    handleGoogleSignIn({
      email: cleanMail,
      name: formattedName,
      avatar: formattedName.charAt(0).toUpperCase()
    });
  };

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

  // 0. Handle Phone Authentication (Instant OTP & Fast Sign In)
  const handleSendPhoneOtp = (e) => {
    if (e) e.preventDefault();
    setError('');
    setErrorAction(null);
    setSuccessMsg('');

    const targetPhone = phoneInput || phone;
    const cleanP = cleanIndianPhone(targetPhone);
    if (!PHONE_REGEX.test(cleanP)) {
      setError(
        language === 'te'
          ? 'దయచేసి 6, 7, 8, లేదా 9 తో ప్రారంభమయ్యే సరైన 10 అంకెల భారతీయ మొబైల్ నంబర్ (+91) నమోదు చేయండి.'
          : 'Please enter a valid 10-digit Indian mobile number (+91) starting with 6, 7, 8, or 9.'
      );
      return;
    }

    if (mode === 'signup') {
      const cleanN = (phoneName || name).trim();
      if (!cleanN || cleanN.length < 3) {
        setError(language === 'te' ? 'దయచేసి మీ పూర్తి పేరు (కనీసం 3 అక్షరాలు) నమోదు చేయండి.' : 'Please enter your valid full name (minimum 3 characters).');
        return;
      }
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

    const targetPhone = phoneInput || phone;
    const cleanP = cleanIndianPhone(targetPhone);
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
    const finalName = (phoneName || name).trim() || `Customer ${cleanP.slice(-4)}`;
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
      }, 900);
    } else {
      setError(res?.message || (language === 'te' ? 'మొబైల్ లాగిన్ విఫలమైంది.' : 'Mobile login failed.'));
    }
  };

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
                <div className="space-y-4">
                  {/* Google 1-Click Fast Auth Button */}
                  {!googlePromptOpen && (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => handleGoogleSignIn()}
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 rounded-2xl bg-white border border-[#c99632]/40 text-[#171717] font-bold text-xs shadow-xs hover:bg-[#fff9ed] hover:border-[#c99632] flex items-center justify-center gap-3 transition-all group active:scale-[0.99]"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                        </svg>
                        <span className="group-hover:text-[#c99632] transition-colors">
                          {language === 'te' ? 'Google తో కొనసాగించండి (1-క్లిక్)' : 'Continue with Google (1-Click)'}
                        </span>
                      </button>

                      <div className="relative flex items-center justify-center">
                        <div className="border-t border-[#c99632]/20 w-full"></div>
                        <span className="bg-[#fffcf7] px-3 text-[10px] font-bold text-[#888888] uppercase tracking-wider shrink-0">
                          {language === 'te' ? 'లేదా ఈమెయిల్ / ఫోన్ ద్వారా' : 'Or with Email / Phone'}
                        </span>
                        <div className="border-t border-[#c99632]/20 w-full"></div>
                      </div>
                    </div>
                  )}

                  {/* Google Fast Connect Inline Form */}
                  {googlePromptOpen && (
                    <form onSubmit={handleGooglePromptSubmit} className="p-4 bg-white border border-[#c99632]/40 rounded-2xl space-y-3 shadow-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-[#c99632]/20">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                          </svg>
                          <h4 className="font-bold text-xs text-[#171717]">
                            {language === 'te' ? 'Google 1-క్లిక్ లాగిన్' : 'Google 1-Click Sign-In'}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGooglePromptOpen(false)}
                          className="text-slate-400 hover:text-[#171717] p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <label htmlFor="google-email-input" className="block text-[11px] font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'మీ Gmail అడ్రస్ *' : 'Your Gmail Address *'}
                        </label>
                        <input
                          id="google-email-input"
                          type="email"
                          required
                          value={googleCustomEmail}
                          onChange={(e) => setGoogleCustomEmail(e.target.value)}
                          placeholder="yourname@gmail.com"
                          className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl py-2 px-3 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                        />
                      </div>

                      <div>
                        <label htmlFor="google-name-input" className="block text-[11px] font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'మీ పేరు (ఐచ్ఛికం)' : 'Your Name (Optional)'}
                        </label>
                        <input
                          id="google-name-input"
                          type="text"
                          value={googleCustomName}
                          onChange={(e) => setGoogleCustomName(e.target.value)}
                          placeholder="e.g. Ramesh"
                          className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl py-2 px-3 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-xs shadow-xs hover:brightness-110 flex items-center justify-center gap-1.5 transition-all gold-glow disabled:opacity-50"
                      >
                        <span>{isSubmitting ? (language === 'te' ? 'కనెక్ట్ అవుతోంది...' : 'Connecting...') : (language === 'te' ? 'Google తో తక్షణ లాగిన్' : 'Instant Sign In with Google')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )}

                  {/* Sign In vs Create Account Mode Tabs */}
                  <div className="flex bg-[#faf8f5] p-1 rounded-2xl border border-[#c99632]/30">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(''); setErrorAction(null); setSuccessMsg(''); setPhoneOtpStep(false); }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        mode === 'login'
                          ? 'bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white shadow-md gold-glow'
                          : 'text-[#666666] hover:text-[#171717]'
                      }`}
                    >
                      🔐 {language === 'te' ? 'లాగిన్' : 'SIGN IN'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode('signup'); setError(''); setErrorAction(null); setSuccessMsg(''); setPhoneOtpStep(false); }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        mode === 'signup'
                          ? 'bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white shadow-md gold-glow'
                          : 'text-[#666666] hover:text-[#171717]'
                      }`}
                    >
                      ✨ {language === 'te' ? 'కొత్త ఖాతా' : 'CREATE ACCOUNT'}
                    </button>
                  </div>

                  {/* Auth Method Selector (Phone vs Email) */}
                  <div className="flex bg-[#faf8f5] p-1 rounded-2xl border border-[#c99632]/25">
                    <button
                      type="button"
                      onClick={() => { setAuthMethod('phone'); setError(''); setSuccessMsg(''); setPhoneOtpStep(false); }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        authMethod === 'phone'
                          ? 'bg-white text-[#c99632] border border-[#c99632]/40 shadow-xs'
                          : 'text-[#666666] hover:text-[#171717]'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>{language === 'te' ? 'మొబైల్ నంబర్ (+91)' : 'Phone Number (+91)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMethod('email'); setError(''); setSuccessMsg(''); }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        authMethod === 'email'
                          ? 'bg-white text-[#c99632] border border-[#c99632]/40 shadow-xs'
                          : 'text-[#666666] hover:text-[#171717]'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{language === 'te' ? 'ఈమెయిల్ & పాస్‌వర్డ్' : 'Email & Password'}</span>
                    </button>
                  </div>
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

              {/* PHONE AUTHENTICATION FORM */}
              {authMethod === 'phone' && mode !== 'forgot' && (
                <div className="space-y-4">
                  {!phoneOtpStep ? (
                    <form onSubmit={handleSendPhoneOtp} className="space-y-3.5">
                      {mode === 'signup' && (
                        <div>
                          <label htmlFor="phone-name-input" className="block text-xs font-bold text-[#171717] mb-1">
                            {language === 'te' ? 'మీ పూర్తి పేరు *' : 'Full Name *'}
                          </label>
                          <div className="relative">
                            <input
                              id="phone-name-input"
                              type="text"
                              required
                              value={phoneName}
                              onChange={(e) => setPhoneName(e.target.value)}
                              placeholder={language === 'te' ? 'మీ పేరు (ఉదా: రామ్‌చరణ్)' : 'e.g. Ramesh Kumar'}
                              className="w-full bg-white border border-[#c99632]/30 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                            />
                            <User className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>
                      )}

                      <div>
                        <label htmlFor="phone-auth-input" className="block text-xs font-bold text-[#171717] mb-1">
                          {language === 'te' ? 'మొబైల్ నంబర్ (భారతీయ +91) *' : 'Mobile Number (+91) *'}
                        </label>
                        <div className="relative flex rounded-xl border border-[#c99632]/30 bg-white overflow-hidden focus-within:border-[#c99632] transition-all">
                          <span className="bg-[#faf8f5] px-3.5 py-2.5 text-xs font-bold text-[#171717] border-r border-[#c99632]/30 flex items-center gap-1 shrink-0 select-none">
                            <span>🇮🇳</span>
                            <span>+91</span>
                          </span>
                          <input
                            id="phone-auth-input"
                            type="tel"
                            required
                            maxLength={10}
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value.replace(/[^\d]/g, ''))}
                            placeholder="9876543210"
                            className="w-full bg-white py-2.5 px-3 text-xs font-bold text-[#171717] tracking-wider placeholder-slate-400 focus:outline-none"
                          />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {language === 'te' ? 'త్వరిత లాగిన్ కోసం మేము 4-అంకెల OTP పంపుతాము.' : 'We will send a 4-digit verification code (OTP) for instant sign in.'}
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || phoneInput.length < 10}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c99632] via-[#e5b85c] to-[#a6751d] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all gold-glow disabled:opacity-50"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>{language === 'te' ? 'ఓటీపీ పొందండి & కొనసాగించండి' : 'GET OTP & CONTINUE'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    /* OTP VERIFICATION VIEW */
                    <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                      <div className="p-3 bg-[#faf8f5] border border-[#c99632]/30 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-[#c99632]" />
                          <div>
                            <span className="text-[10px] text-gray-500 block">{language === 'te' ? 'మొబైల్ నంబర్' : 'Mobile Number'}</span>
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
                          <label htmlFor="phone-otp-code" className="block text-xs font-bold text-[#171717]">
                            {language === 'te' ? '4-అంకెల వెరిఫికేషన్ కోడ్ (OTP) *' : '4-Digit Verification Code (OTP) *'}
                          </label>
                          {generatedPhoneOtp && (
                            <button
                              type="button"
                              onClick={() => setEnteredOtp(generatedPhoneOtp)}
                              className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md transition-colors"
                            >
                              ⚡ {language === 'te' ? `ఆటో-ఫిల్ (${generatedPhoneOtp})` : `Auto-fill (${generatedPhoneOtp})`}
                            </button>
                          )}
                        </div>
                        <input
                          id="phone-otp-code"
                          type="text"
                          required
                          maxLength={6}
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value.replace(/[^\d]/g, ''))}
                          placeholder="••••"
                          className="w-full text-center tracking-[0.5em] font-mono font-black text-lg py-2.5 bg-white border border-[#c99632]/40 rounded-xl focus:outline-none focus:border-[#c99632]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || enteredOtp.length < 4}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c99632] via-[#e5b85c] to-[#a6751d] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all gold-glow disabled:opacity-50"
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

                  <div className="pt-2 text-center border-t border-[#c99632]/20">
                    <button
                      type="button"
                      onClick={() => { setAuthMethod('email'); setError(''); setSuccessMsg(''); }}
                      className="text-[11px] font-semibold text-[#888888] hover:text-[#c99632] transition-colors inline-flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{language === 'te' ? 'ఈమెయిల్ & పాస్‌వర్డ్ ద్వారా లాగిన్ అవ్వాలనుకుంటున్నారా?' : 'Prefer Email & Password instead?'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 1. PROFESSIONAL SIGN IN FORM (EMAIL) */}
              {authMethod === 'email' && mode === 'login' && (
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

                  <div className="pt-2 text-center border-t border-[#c99632]/20">
                    <button
                      type="button"
                      onClick={() => { setAuthMethod('phone'); setError(''); setSuccessMsg(''); setPhoneOtpStep(false); }}
                      className="text-[11px] font-semibold text-[#888888] hover:text-[#c99632] transition-colors inline-flex items-center gap-1.5"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-[#c99632]" />
                      <span>{language === 'te' ? 'మొబైల్ నంబర్ (+91) OTP తో వేగంగా లాగిన్ అవ్వండి' : 'Sign in faster with Mobile OTP (+91)'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* 2. PROFESSIONAL SIGN UP FORM (EMAIL) */}
              {authMethod === 'email' && mode === 'signup' && (
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
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
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

                    {/* Live Password Character Combination Badges - Shown only when user enters / types */}
                    {(isPasswordFocused || password.length > 0) && (
                      <div className="space-y-1.5 pt-1.5 animate-fadeIn">
                        {isPasswordComplex ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{language === 'te' ? '✓ బలమైన పాస్‌వర్డ్ సెట్ చేయబడింది' : '✓ Strong password requirement met'}</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
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
                        )}
                      </div>
                    )}
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

                  <div className="pt-2 text-center border-t border-[#c99632]/20">
                    <button
                      type="button"
                      onClick={() => { setAuthMethod('phone'); setError(''); setSuccessMsg(''); setPhoneOtpStep(false); }}
                      className="text-[11px] font-semibold text-[#888888] hover:text-[#c99632] transition-colors inline-flex items-center gap-1.5"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-[#c99632]" />
                      <span>{language === 'te' ? 'పాస్‌వర్డ్ అవసరం లేకుండా మొబైల్ నంబర్ (+91) తో ఖాతా తెరవండి' : 'No password needed: Sign up with Mobile (+91)'}</span>
                    </button>
                  </div>
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
