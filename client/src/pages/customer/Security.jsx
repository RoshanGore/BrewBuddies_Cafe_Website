import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  Link2,
  Unlink2,
  Mail,
  Phone,
  Lock,
  ArrowLeft,
  Loader2,
  Check,
  X,
  KeyRound,
  Sparkles,
  Info,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  signInWithGoogle as fbSignInWithGoogle,
  verifyFirebasePhoneOtp,
} from "../../services/firebase";

const Security = () => {
  const navigate = useNavigate();
  const { user, linkProvider, unlinkProvider, getSecurityStatus, sendOtp } = useAuth();

  const [securityStatus, setSecurityStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modals for linking
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneToLink, setPhoneToLink] = useState("");
  const [otpToLink, setOtpToLink] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneConfirmationResult, setPhoneConfirmationResult] = useState(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [emailToLink, setEmailToLink] = useState("");
  const [passwordToLink, setPasswordToLink] = useState("");

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await getSecurityStatus();
      if (res.success && res.security) {
        setSecurityStatus(res.security);
      }
    } catch (err) {
      console.warn("[Security] Could not load security status:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=/security");
      return;
    }
    loadStatus();
  }, [user]);

  // LINK 1: GOOGLE ACCOUNT
  const handleLinkGoogle = async () => {
    try {
      setActionLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const fbRes = await fbSignInWithGoogle();
      if (fbRes?.redirecting) {
        return;
      }
      const idToken = fbRes.idToken;

      const res = await linkProvider({
        provider: "google.com",
        idToken,
      });

      if (res.success) {
        setSuccessMessage("Google Account successfully linked to your customer profile!");
        await loadStatus();
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to link Google account");
    } finally {
      setActionLoading(false);
    }
  };

  // LINK 2: PHONE VIA REAL FIREBASE OTP
  const handleRequestPhoneOtp = async (e) => {
    e.preventDefault();
    const cleanPhone = phoneToLink.trim().replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      const res = await sendOtp(cleanPhone, "+91", "security-recaptcha-container");
      if (res.success && res.confirmationResult) {
        setPhoneConfirmationResult(res.confirmationResult);
        setOtpSent(true);
        setSuccessMessage(`Verification code sent via SMS to +91 ${cleanPhone}`);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to send SMS OTP to mobile number");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPhoneLink = async (e) => {
    e.preventDefault();
    const cleanOtp = otpToLink.trim().replace(/\D/g, "");
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit OTP code");
      return;
    }

    if (!phoneConfirmationResult) {
      setErrorMessage("OTP session expired. Please request a new code.");
      setOtpSent(false);
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage("");

      let linkPayload = { provider: "phone" };
      if (phoneConfirmationResult && typeof phoneConfirmationResult.confirm === "function") {
        const { idToken } = await verifyFirebasePhoneOtp(phoneConfirmationResult, cleanOtp);
        linkPayload.idToken = idToken;
      } else {
        linkPayload.phone = phoneToLink.trim();
        linkPayload.otp = cleanOtp;
      }

      const res = await linkProvider(linkPayload);

      if (res.success) {
        setSuccessMessage("Mobile number verified and linked successfully!");
        setShowPhoneModal(false);
        setPhoneToLink("");
        setOtpToLink("");
        setOtpSent(false);
        setPhoneConfirmationResult(null);
        await loadStatus();
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to verify phone OTP");
    } finally {
      setActionLoading(false);
    }
  };

  // LINK 3: EMAIL & PASSWORD
  const handleLinkPassword = async (e) => {
    e.preventDefault();
    if (!emailToLink || !passwordToLink) {
      setErrorMessage("Please provide both email and password");
      return;
    }
    if (passwordToLink.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage("");
      const res = await linkProvider({
        provider: "password",
        email: emailToLink.trim(),
        password: passwordToLink,
      });

      if (res.success) {
        setSuccessMessage("Email & Password credentials linked successfully!");
        setShowPasswordModal(false);
        setEmailToLink("");
        setPasswordToLink("");
        await loadStatus();
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to link email & password");
    } finally {
      setActionLoading(false);
    }
  };

  // UNLINK PROVIDER
  const handleUnlink = async (providerName) => {
    if (!window.confirm(`Are you sure you want to unlink ${providerName}?`)) return;

    try {
      setActionLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      const res = await unlinkProvider(providerName);
      if (res.success) {
        setSuccessMessage(`Successfully unlinked ${providerName}`);
        await loadStatus();
      }
    } catch (err) {
      setErrorMessage(err.message || `Failed to unlink ${providerName}`);
    } finally {
      setActionLoading(false);
    }
  };

  const hasGoogle = securityStatus?.hasGoogle || false;
  const hasPhone = securityStatus?.hasPhone || false;
  const hasPassword = securityStatus?.hasPassword || false;
  const totalLinked = (hasGoogle ? 1 : 0) + (hasPhone ? 1 : 0) + (hasPassword ? 1 : 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          className="w-9 h-9 rounded-xl bg-white border border-[#EAE0D5] flex items-center justify-center text-[#8C7A6B] hover:text-[#24160F] transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8752A] block">
            Customer Security
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#24160F]">
            Account & Security
          </h1>
        </div>
      </div>

      <p className="text-xs text-[#6B5A4E] leading-relaxed">
        Link Google and Email/Password to access your profile, order history, and loyalty points across any device.
      </p>

      {/* Global Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{successMessage}</div>
        </div>
      )}

      {/* Security Level Summary Card */}
      <div className="bg-white border border-[#EAE0D5] rounded-3xl p-6 shadow-cozy flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#EAE0D5] flex items-center justify-center text-[#C8752A]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#24160F]">
              Identity Protection: {totalLinked > 1 ? "Strong (Multi-Linked)" : "Standard (Single Method)"}
            </h3>
            <p className="text-xs text-[#8C7A6B] mt-0.5">
              {totalLinked} of 3 authentication methods connected to customer ID #{user?._id?.slice(-6) || "profile"}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#EAE0D5] text-[#C8752A] text-xs font-semibold self-start sm:self-center">
          <Sparkles className="w-3.5 h-3.5 text-[#C8752A]" />
          <span>{user?.points ?? user?.loyaltyPoints ?? 0} Loyalty Pts Intact</span>
        </div>
      </div>

      {/* 3 AUTHENTICATION CARDS */}
      <div className="space-y-4">
        {/* 1. GOOGLE SIGN-IN */}
        <div className="bg-white border border-[#EAE0D5] rounded-3xl p-5 sm:p-6 shadow-cozy transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#FAF7F2] border border-[#EAE0D5] flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#24160F]">Google Account</h4>
                  {hasGoogle ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Linked</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#8C7A6B] border border-[#EAE0D5] text-[10px] font-semibold">
                      Not Linked
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8C7A6B] mt-1 leading-relaxed">
                  {hasGoogle
                    ? "Signed in with Google One Tap / Firebase authentication"
                    : "Connect your Google account for one-click instant sign in without passwords."}
                </p>
              </div>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              {hasGoogle ? (
                <button
                  type="button"
                  onClick={() => handleUnlink("google.com")}
                  disabled={actionLoading || totalLinked <= 1}
                  className="px-4 py-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  title={totalLinked <= 1 ? "Cannot unlink your only sign-in method" : "Unlink Google account"}
                >
                  <Unlink2 className="w-3.5 h-3.5 inline mr-1.5" />
                  <span>Unlink</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLinkGoogle}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 border border-[#EAE0D5] text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Link2 className="w-3.5 h-3.5 text-[#C8752A]" />
                  <span>Link Google</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. MOBILE NUMBER WITH OTP */}
        <div className="bg-white border border-[#EAE0D5] rounded-3xl p-5 sm:p-6 shadow-cozy transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#FAF7F2] border border-[#EAE0D5] flex items-center justify-center shrink-0 text-[#C8752A] shadow-sm mt-0.5 sm:mt-0">
                <Phone className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#24160F]">Mobile Phone (OTP)</h4>
                  {hasPhone ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Verified & Linked</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#8C7A6B] border border-[#EAE0D5] text-[10px] font-semibold">
                      Not Linked
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8C7A6B] mt-1 leading-relaxed">
                  {hasPhone ? (
                    <span className="text-[#24160F] font-mono text-xs">{securityStatus?.phone || user?.phone}</span>
                  ) : (
                    "Add your phone number to receive table ordering receipts and log in with SMS codes."
                  )}
                </p>
              </div>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              {hasPhone ? (
                <button
                  type="button"
                  onClick={() => handleUnlink("phone")}
                  disabled={actionLoading || totalLinked <= 1}
                  className="px-4 py-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  title={totalLinked <= 1 ? "Cannot unlink your only sign-in method" : "Unlink phone number"}
                >
                  <Unlink2 className="w-3.5 h-3.5 inline mr-1.5" />
                  <span>Unlink</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowPhoneModal(true);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-[#C8752A] hover:bg-[#D48328] text-white text-xs font-bold transition-all shadow-caramel-glow flex items-center gap-1.5 active:scale-95"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Link Phone via OTP</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. EMAIL & PASSWORD */}
        <div className="bg-white border border-[#EAE0D5] rounded-3xl p-5 sm:p-6 shadow-cozy transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#FAF7F2] border border-[#EAE0D5] flex items-center justify-center shrink-0 text-[#C8752A] shadow-sm mt-0.5 sm:mt-0">
                <Lock className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#24160F]">Email & Password</h4>
                  {hasPassword ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Set & Linked</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#8C7A6B] border border-[#EAE0D5] text-[10px] font-semibold">
                      Not Linked
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8C7A6B] mt-1 leading-relaxed">
                  {hasPassword ? (
                    <span>Connected to: <strong className="text-[#24160F]">{securityStatus?.email || user?.email}</strong></span>
                  ) : (
                    "Create a custom password to sign in from any browser without requiring Google or SMS."
                  )}
                </p>
              </div>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              {hasPassword ? (
                <button
                  type="button"
                  onClick={() => handleUnlink("password")}
                  disabled={actionLoading || totalLinked <= 1}
                  className="px-4 py-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  title={totalLinked <= 1 ? "Cannot unlink your only sign-in method" : "Unlink password login"}
                >
                  <Unlink2 className="w-3.5 h-3.5 inline mr-1.5" />
                  <span>Unlink</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEmailToLink(user?.email || "");
                    setShowPasswordModal(true);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE4] border border-[#EAE0D5] text-[#24160F] text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Link2 className="w-3.5 h-3.5 text-[#C8752A]" />
                  <span>Set Password</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Best Practices Notice */}
      <div className="p-5 rounded-3xl bg-[#FDF9F3] border border-[#EAE0D5] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#C8752A]">
          <Info className="w-4 h-4 text-[#C8752A]" />
          <span>Single Identity Guarantee</span>
        </div>
        <p className="text-xs text-[#6B5A4E] leading-relaxed">
          BrewBuddies never automatically merges accounts based only on matching email addresses or phone numbers. All credential linking requires explicit verification through OTP or cryptographic tokens to protect your privacy and loyalty points.
        </p>
      </div>

      {/* MODAL 1: LINK PHONE WITH OTP */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-[#EAE0D5] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div id="security-recaptcha-container"></div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-[#24160F] flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C8752A]" />
                <span>Link Mobile Number</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowPhoneModal(false);
                  setOtpSent(false);
                }}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#8C7A6B] hover:text-[#24160F] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!otpSent ? (
              <form onSubmit={handleRequestPhoneOtp} className="space-y-4">
                <p className="text-xs text-[#8C7A6B]">
                  Enter your 10-digit mobile number. We will send a 6-digit verification code to confirm ownership.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-[#6B5A4E] mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-xs font-bold text-[#C8752A]">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phoneToLink}
                      onChange={(e) => setPhoneToLink(e.target.value)}
                      placeholder="10-digit number"
                      maxLength={10}
                      className="w-full text-xs pl-12 pr-4 py-3 bg-[#FAF7F2] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#C8752A] text-[#24160F]"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3.5 rounded-2xl bg-[#C8752A] hover:bg-[#D48328] text-white font-bold text-xs transition-all shadow-caramel-glow flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send OTP Code</span>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmPhoneLink} className="space-y-4">
                <p className="text-xs text-[#8C7A6B]">
                  Enter the 6-digit OTP code sent to <strong>{phoneToLink}</strong>.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-[#6B5A4E] mb-1.5">
                    Verification OTP
                  </label>
                  <input
                    type="text"
                    value={otpToLink}
                    onChange={(e) => setOtpToLink(e.target.value)}
                    placeholder="••••••"
                    maxLength={6}
                    className="w-full text-xs px-4 py-3 bg-[#FAF7F2] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#C8752A] text-[#24160F] text-center tracking-widest font-mono"
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3.5 rounded-2xl bg-[#C8752A] hover:bg-[#D48328] text-white font-bold text-xs transition-all shadow-caramel-glow flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm & Link Phone</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: LINK EMAIL & PASSWORD */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-[#EAE0D5] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-[#24160F] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#C8752A]" />
                <span>Link Email & Password</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#8C7A6B] hover:text-[#24160F] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLinkPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B5A4E] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailToLink}
                  onChange={(e) => setEmailToLink(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs px-4 py-3 bg-[#FAF7F2] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#C8752A] text-[#24160F]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B5A4E] mb-1.5">
                  Set Password
                </label>
                <input
                  type="password"
                  value={passwordToLink}
                  onChange={(e) => setPasswordToLink(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full text-xs px-4 py-3 bg-[#FAF7F2] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#C8752A] text-[#24160F]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 rounded-2xl bg-[#C8752A] hover:bg-[#D48328] text-white font-bold text-xs transition-all shadow-caramel-glow flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save & Link Password</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
