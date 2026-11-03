import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  Sparkles,
  ArrowRight,
  Check,
  AlertCircle,
  Loader2,
  Coffee,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Send,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/profile";
  const initialMode = searchParams.get("mode") === "register" ? "register" : "signin";
  const isFromCart = redirectPath.includes("cart");

  const {
    user,
    signInWithGoogle,
    signInWithGoogleRedirect,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    sendVerification,
  } = useAuth();

  // Active Mode: 'signin' | 'register' | 'forgot'
  const [mode, setMode] = useState(initialMode);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // If already authenticated as a customer and not actively switching accounts, navigate to destination
  useEffect(() => {
    if (user && user.role === "customer" && !loading && !searchParams.get("switch")) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath, loading, searchParams]);

  // 1. Google Sign-In Handler (Popup with Redirect Fallback)
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      const res = await signInWithGoogle(redirectPath);
      if (res?.redirecting) {
        // Redirection to Google in progress
        return;
      }
      navigate(redirectPath);
    } catch (err) {
      console.error("[Login] Google Sign-In error:", err);
      if (err.message && err.message.includes("ACCOUNT_EXISTS_UNLINKED")) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(err.message || "Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Direct Redirect Fallback for Google Sign-In
  const handleGoogleRedirectSignIn = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      await signInWithGoogleRedirect(redirectPath);
    } catch (err) {
      setErrorMessage(err.message || "Failed to initiate Google sign-in redirect.");
      setLoading(false);
    }
  };

  // 2. Email & Password Sign-In Handler
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      const res = await loginWithEmail(cleanEmail, password, redirectPath);
      if (res.user) {
        setSuccessMessage(`Welcome back, ${res.user.name || "valued customer"}!`);
        navigate(redirectPath);
      }
    } catch (err) {
      console.error("[Login] Email Sign-In error:", err);
      setErrorMessage(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Email & Password Registration Handler
  const handleEmailRegister = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (!cleanEmail || !password) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter your password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      const res = await registerWithEmail(
        {
          name: cleanName || cleanEmail.split("@")[0],
          email: cleanEmail,
          password,
          sendVerification: true,
        },
        redirectPath
      );

      if (res.user) {
        setSuccessMessage("Account created successfully! Welcome bonus credited.");
        navigate(redirectPath);
      }
    } catch (err) {
      console.error("[Login] Registration error:", err);
      setErrorMessage(err.message || "Registration failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Password Reset Handler
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your email address to receive the password reset link.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      const res = await resetPassword(cleanEmail);
      setSuccessMessage(res.message || `Password reset link sent to ${cleanEmail}. Please check your inbox.`);
      setInfoMessage("Follow the link in your email to choose a new password, then return here to sign in.");
    } catch (err) {
      console.error("[Login] Password reset error:", err);
      setErrorMessage(err.message || "Failed to send password reset email. Please verify the address.");
    } finally {
      setLoading(false);
    }
  };

  // 5. Email Verification Resend Handler
  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await sendVerification();
      setSuccessMessage(res.message || "Verification email sent. Please check your inbox.");
    } catch (err) {
      setErrorMessage(err.message || "Failed to send verification email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-[#FAF7F0]">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#EAE0D5] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF7F0] border border-[#EAE0D5] flex items-center justify-center mx-auto text-[#A66B45] shadow-xs">
            <Coffee className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#A66B45] block">
            BrewBuddies Café
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#553B2D]">
            {mode === "forgot"
              ? "Reset Password"
              : mode === "register"
              ? "Create Your Account"
              : isFromCart
              ? "Sign In to Place Order"
              : "Customer Login"}
          </h1>
          <p className="text-xs text-[#553B2D]/70 max-w-xs mx-auto leading-relaxed">
            {mode === "forgot"
              ? "Enter your registered email address and we'll send you a secure password reset link."
              : isFromCart
              ? "Sign in with Google or Email to link your loyalty rewards and place your order."
              : "Access your dine-in loyalty points, order history, and exclusive café rewards."}
          </p>

          {/* Welcome Bonus Callout */}
          {mode !== "forgot" && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F0] border border-[#647653]/30 text-[#647653] text-[11px] font-semibold mt-1">
              <Sparkles className="w-3.5 h-3.5 text-[#647653]" />
              <span>50-Point Welcome Bonus awarded on your first sign-in!</span>
            </div>
          )}
        </div>

        {/* Global Error, Success, and Info Alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{successMessage}</div>
          </div>
        )}

        {infoMessage && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{infoMessage}</div>
          </div>
        )}

        {/* 1. Google Sign-In Button (Available in signin and register modes) */}
        {mode !== "forgot" && (
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-neutral-50 text-[#553B2D] border border-[#EAE0D5] font-semibold text-xs transition-all flex items-center justify-center gap-3 shadow-xs hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="font-bold">
                {mode === "register" ? "Sign up with Google" : "Continue with Google"}
              </span>
            </button>

            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={handleGoogleRedirectSignIn}
                disabled={loading}
                className="text-[11px] text-[#A66B45] hover:text-[#8F5B39] hover:underline font-medium transition-colors cursor-pointer"
              >
                Pop-up blocked? Use direct Google sign-in
              </button>
            </div>
          </div>
        )}

        {/* Divider */}
        {mode !== "forgot" && (
          <div className="flex items-center gap-3 text-xs text-[#553B2D]/50">
            <div className="h-px flex-1 bg-[#EAE0D5]" />
            <span>or with email & password</span>
            <div className="h-px flex-1 bg-[#EAE0D5]" />
          </div>
        )}

        {/* Mode Switcher Tabs (Sign In vs Register) */}
        {mode !== "forgot" && (
          <div className="flex bg-[#FAF7F0] p-1 rounded-2xl border border-[#EAE0D5]">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "signin"
                  ? "bg-[#FFFFFF] text-[#553B2D] shadow-xs"
                  : "text-[#553B2D]/60 hover:text-[#553B2D]"
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-[#A66B45]" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "register"
                  ? "bg-[#FFFFFF] text-[#553B2D] shadow-xs"
                  : "text-[#553B2D]/60 hover:text-[#553B2D]"
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#647653]" />
              <span>Create Account</span>
            </button>
          </div>
        )}

        {/* FORM 1: EMAIL SIGN IN */}
        {mode === "signin" && (
          <form onSubmit={handleEmailSignIn} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#553B2D] mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#553B2D]/50 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full text-xs pl-10 pr-4 py-3 bg-[#FAF7F0] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#A66B45] text-[#553B2D] placeholder-[#553B2D]/40"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#553B2D]">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="text-[11px] text-[#A66B45] hover:underline font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#553B2D]/50 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full text-xs pl-10 pr-10 py-3 bg-[#FAF7F0] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#A66B45] text-[#553B2D] placeholder-[#553B2D]/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#553B2D]/50 hover:text-[#553B2D]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#A66B45] hover:bg-[#8F5B39] text-white font-bold text-xs transition-all shadow-md shadow-[#A66B45]/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In with Firebase...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In with Password</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="text-xs text-[#553B2D]/70 hover:text-[#A66B45] font-semibold transition-colors cursor-pointer"
              >
                New customer? <strong className="text-[#A66B45]">Create an account</strong>
              </button>
            </div>
          </form>
        )}

        {/* FORM 2: EMAIL REGISTRATION */}
        {mode === "register" && (
          <form onSubmit={handleEmailRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#553B2D] mb-1.5">
                Full Name <span className="text-[#553B2D]/60 font-normal">(for loyalty rewards)</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#553B2D]/50 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Roshan Gore"
                  autoComplete="name"
                  className="w-full text-xs pl-10 pr-4 py-3 bg-[#FAF7F0] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#A66B45] text-[#553B2D] placeholder-[#553B2D]/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#553B2D] mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#553B2D]/50 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full text-xs pl-10 pr-4 py-3 bg-[#FAF7F0] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#A66B45] text-[#553B2D] placeholder-[#553B2D]/40"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#553B2D] mb-1.5">
                Password <span className="text-red-500">*</span>{" "}
                <span className="text-[#553B2D]/60 font-normal">(min. 6 characters)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#553B2D]/50 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full text-xs pl-10 pr-10 py-3 bg-[#FAF7F0] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#A66B45] text-[#553B2D] placeholder-[#553B2D]/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#553B2D]/50 hover:text-[#553B2D]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#553B2D] mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-[#553B2D]/50 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full text-xs pl-10 pr-4 py-3 bg-[#FAF7F0] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#A66B45] text-[#553B2D] placeholder-[#553B2D]/40"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#EAE0D5] text-[11px] text-[#553B2D]/80 leading-relaxed flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#647653] shrink-0" />
              <span>An official verification email will be automatically sent to verify your address.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#A66B45] hover:bg-[#8F5B39] text-white font-bold text-xs transition-all shadow-md shadow-[#A66B45]/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering with Firebase...</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5" />
                  <span>Create Account & Claim 50 Pts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="text-xs text-[#553B2D]/70 hover:text-[#A66B45] font-semibold transition-colors cursor-pointer"
              >
                Already have an account? <strong className="text-[#A66B45]">Sign In</strong>
              </button>
            </div>
          </form>
        )}

        {/* FORM 3: FORGOT PASSWORD */}
        {mode === "forgot" && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#553B2D] mb-1.5">
                Registered Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#553B2D]/50 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full text-xs pl-10 pr-4 py-3 bg-[#FAF7F0] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#A66B45] text-[#553B2D] placeholder-[#553B2D]/40"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3.5 rounded-2xl bg-[#A66B45] hover:bg-[#8F5B39] text-white font-bold text-xs transition-all shadow-md shadow-[#A66B45]/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Reset Email...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Password Reset Email</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMessage("");
                  setSuccessMessage("");
                  setInfoMessage("");
                }}
                className="text-xs text-[#A66B45] hover:underline font-bold transition-colors cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Optional Email Verification Resend Button if user is logged in or recently signed in */}
        {user && !user.emailVerified && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={loading}
              className="text-[11px] text-[#647653] hover:underline font-semibold"
            >
              Need another verification email? Click here to resend
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-3 border-t border-[#EAE0D5] text-center space-y-2">
          <p className="text-[11px] text-[#553B2D]/60 leading-relaxed">
            By continuing, you agree to BrewBuddies Dine-In Loyalty terms & privacy policy.
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] text-[#553B2D]/70 font-medium">
            <Link to="/menu" className="hover:text-[#A66B45] underline">
              Browse Menu
            </Link>
            <span>•</span>
            <Link to="/rewards" className="hover:text-[#A66B45] underline">
              View Rewards
            </Link>
            <span>•</span>
            <Link to="/owner/login" className="hover:text-[#A66B45]">
              Staff & Owner Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
