import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import {
  auth,
  signInWithGoogle as fbSignInWithGoogle,
  signInWithGoogleRedirect as fbSignInWithGoogleRedirect,
  checkGoogleRedirectResult,
  signInWithEmail as fbSignInWithEmail,
  registerWithEmail as fbRegisterWithEmail,
  sendPasswordReset as fbSendPasswordReset,
  sendVerificationEmail as fbSendVerificationEmail,
  logoutFirebase,
  getFirebaseErrorMessage,
  onAuthStateChanged,
} from "../services/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Separate Customer and Owner/Staff state cleanly
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("bb_user");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Migrate legacy staff/owner session out of customer state
      if (parsed?.role === "owner" || parsed?.role === "staff") {
        const legacyToken = localStorage.getItem("bb_token") || "";
        localStorage.setItem("bb_owner_user", JSON.stringify(parsed));
        if (legacyToken) localStorage.setItem("bb_owner_token", legacyToken);
        localStorage.removeItem("bb_user");
        localStorage.removeItem("bb_token");
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    const savedUser = localStorage.getItem("bb_user");
    if (!savedUser) return "";
    try {
      const parsed = JSON.parse(savedUser);
      if (parsed?.role === "owner" || parsed?.role === "staff") return "";
    } catch (e) {}
    return localStorage.getItem("bb_token") || "";
  });

  const [ownerUser, setOwnerUser] = useState(() => {
    try {
      const saved = localStorage.getItem("bb_owner_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [ownerToken, setOwnerToken] = useState(() => localStorage.getItem("bb_owner_token") || "");
  const [loading, setLoading] = useState(true);

  // Refresh customer profile and points balance from server
  const refreshUser = async () => {
    const currentToken = localStorage.getItem("bb_token");
    if (!currentToken) return null;
    try {
      const res = await api.getMe();
      if (res.success && res.user && res.user.role === "customer") {
        setUser(res.user);
        localStorage.setItem("bb_user", JSON.stringify(res.user));
        return res.user;
      }
    } catch (err) {
      console.warn("[AuthContext] Failed to refresh customer profile:", err.message);
    }
    return null;
  };

  useEffect(() => {
    let unsubscribeAuth = null;

    const initAuth = async () => {
      // 1. Process Google redirect result if returning from redirect sign-in
      try {
        const redirectRes = await checkGoogleRedirectResult();
        if (redirectRes?.user && redirectRes?.idToken) {
          const res = await api.firebaseCustomerLogin({
            idToken: redirectRes.idToken,
            provider: "google.com",
            name: redirectRes.user.displayName || "",
          });
          if (res.success && res.token) {
            login(res.token, res.user);
            const target = sessionStorage.getItem("bb_auth_redirect_target");
            sessionStorage.removeItem("bb_auth_redirect_target");
            if (target && target !== window.location.pathname) {
              window.location.href = target;
              return;
            }
          }
        }
      } catch (redirErr) {
        console.warn("[Auth] Redirect sign-in processing:", redirErr.message);
      }

      // 2. Listen to Firebase Auth state for automatic session sync (redirects / persistence)
      try {
        unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser && !localStorage.getItem("bb_token")) {
            try {
              const idToken = await fbUser.getIdToken(true);
              const res = await api.firebaseCustomerLogin({
                idToken,
                provider: fbUser.providerData?.[0]?.providerId || "google.com",
                name: fbUser.displayName || "",
              });
              if (res.success && res.token) {
                login(res.token, res.user);
                const target = sessionStorage.getItem("bb_auth_redirect_target") || "/profile";
                sessionStorage.removeItem("bb_auth_redirect_target");
                if (window.location.pathname === "/login" || window.location.pathname === "/register") {
                  window.location.href = target;
                }
              }
            } catch (autoLoginErr) {
              console.warn("[Auth] onAuthStateChanged session sync warning:", autoLoginErr.message);
            }
          }
        });
      } catch (subErr) {
        console.warn("[Auth] onAuthStateChanged setup warning:", subErr.message);
      }

      // 3. Validate customer token session
      const currentToken = localStorage.getItem("bb_token");
      if (currentToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            if (res.user.role === "customer") {
              setUser(res.user);
              localStorage.setItem("bb_user", JSON.stringify(res.user));
            } else {
              // Legacy cleanup
              loginOwner(currentToken, res.user);
              setUser(null);
              setToken("");
              localStorage.removeItem("bb_user");
              localStorage.removeItem("bb_token");
            }
          }
        } catch (err) {
          console.warn("[Auth] Token verification failed:", err.message);
          logout();
        }
      }

      setLoading(false);
    };

    initAuth();

    // Re-sync customer points whenever tab gains focus or an order updates
    const handleSync = () => refreshUser();
    window.addEventListener("focus", handleSync);
    window.addEventListener("bb:orders-updated", handleSync);
    window.addEventListener("bb:points-updated", handleSync);

    return () => {
      if (typeof unsubscribeAuth === "function") unsubscribeAuth();
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("bb:orders-updated", handleSync);
      window.removeEventListener("bb:points-updated", handleSync);
    };
  }, []);

  const login = (authToken, userData) => {
    if (userData?.role === "owner" || userData?.role === "staff") {
      loginOwner(authToken, userData);
      return;
    }
    setToken(authToken);
    setUser(userData);
    localStorage.setItem("bb_token", authToken);
    localStorage.setItem("bb_user", JSON.stringify(userData));
  };

  const loginOwner = (authToken, userData) => {
    setOwnerToken(authToken);
    setOwnerUser(userData);
    localStorage.setItem("bb_owner_token", authToken);
    localStorage.setItem("bb_owner_user", JSON.stringify(userData));
  };

  const logoutOwner = () => {
    setOwnerToken("");
    setOwnerUser(null);
    localStorage.removeItem("bb_owner_token");
    localStorage.removeItem("bb_owner_user");
  };

  const logout = async () => {
    try {
      await logoutFirebase();
    } catch (e) {}
    setToken("");
    setUser(null);
    localStorage.removeItem("bb_token");
    localStorage.removeItem("bb_user");
  };

  const setCustomerSession = (authToken, customerData) => {
    if (customerData?.role === "owner" || customerData?.role === "staff") return;
    setToken(authToken);
    setUser(customerData);
    localStorage.setItem("bb_token", authToken);
    localStorage.setItem("bb_user", JSON.stringify(customerData));
  };

  const updateCustomerPoints = (points) => {
    if (user) {
      const updated = { ...user, loyaltyPoints: points, points };
      setUser(updated);
      localStorage.setItem("bb_user", JSON.stringify(updated));
    }
  };

  // 1. Google Sign-In via Firebase Auth SDK (Popup with automatic Redirect Fallback)
  const signInWithGoogle = async (targetRedirect = "/profile") => {
    try {
      if (targetRedirect) {
        sessionStorage.setItem("bb_auth_redirect_target", targetRedirect);
      }
      const fbRes = await fbSignInWithGoogle();
      if (fbRes?.redirecting) {
        return { redirecting: true };
      }
      const idToken = fbRes.idToken;
      const profileName = fbRes.user.displayName || "";

      const res = await api.firebaseCustomerLogin({
        idToken,
        provider: "google.com",
        name: profileName,
      });

      if (res.success && res.token) {
        login(res.token, res.user);
      }
      sessionStorage.removeItem("bb_auth_redirect_target");
      return res;
    } catch (err) {
      console.error("[AuthContext] Google Sign-In error:", err);
      const friendly = getFirebaseErrorMessage(err);
      throw new Error(friendly);
    }
  };

  // Dedicated Google Redirect trigger
  const signInWithGoogleRedirect = async (targetRedirect = "/profile") => {
    try {
      if (targetRedirect) {
        sessionStorage.setItem("bb_auth_redirect_target", targetRedirect);
      }
      return await fbSignInWithGoogleRedirect();
    } catch (err) {
      console.error("[AuthContext] Google Redirect error:", err);
      const friendly = getFirebaseErrorMessage(err);
      throw new Error(friendly);
    }
  };

  // 2. Email & Password Sign-In via Firebase Auth SDK
  const loginWithEmail = async (email, password, targetRedirect = "/profile") => {
    try {
      if (targetRedirect) {
        sessionStorage.setItem("bb_auth_redirect_target", targetRedirect);
      }
      const fbRes = await fbSignInWithEmail(email, password);
      const idToken = fbRes.idToken;
      const profileName = fbRes.user.displayName || "";

      const res = await api.firebaseCustomerLogin({
        idToken,
        provider: "password",
        name: profileName,
      });

      if (res.success && res.token) {
        login(res.token, res.user);
      }
      sessionStorage.removeItem("bb_auth_redirect_target");
      return {
        ...res,
        emailVerified: fbRes.emailVerified,
      };
    } catch (err) {
      console.error("[AuthContext] Email Sign-In error:", err);
      const friendly = getFirebaseErrorMessage(err);
      throw new Error(friendly);
    }
  };

  // 3. Email & Password Registration via Firebase Auth SDK
  const registerWithEmail = async ({ name, email, password, sendVerification = true }, targetRedirect = "/profile") => {
    try {
      if (targetRedirect) {
        sessionStorage.setItem("bb_auth_redirect_target", targetRedirect);
      }
      const fbRes = await fbRegisterWithEmail(name, email, password, sendVerification);
      const idToken = fbRes.idToken;

      const res = await api.firebaseCustomerLogin({
        idToken,
        provider: "password",
        name: name || "",
      });

      if (res.success && res.token) {
        login(res.token, res.user);
      }
      sessionStorage.removeItem("bb_auth_redirect_target");
      return {
        ...res,
        emailVerified: fbRes.emailVerified,
      };
    } catch (err) {
      console.error("[AuthContext] Email Registration error:", err);
      const friendly = getFirebaseErrorMessage(err);
      throw new Error(friendly);
    }
  };

  // 4. Password Reset via Firebase Auth SDK
  const resetPassword = async (email) => {
    try {
      await fbSendPasswordReset(email);
      return {
        success: true,
        message: `Password reset email sent to ${email}. Please check your inbox and spam folder.`,
      };
    } catch (err) {
      console.error("[AuthContext] Password Reset error:", err);
      const friendly = getFirebaseErrorMessage(err);
      throw new Error(friendly);
    }
  };

  // 5. Email Verification Resend via Firebase Auth SDK
  const sendVerification = async () => {
    try {
      await fbSendVerificationEmail(auth.currentUser);
      return {
        success: true,
        message: "Verification email sent. Please check your inbox and verify your email.",
      };
    } catch (err) {
      console.error("[AuthContext] Send Verification error:", err);
      const friendly = getFirebaseErrorMessage(err);
      throw new Error(friendly);
    }
  };

  // 6. Account Linking (for Account & Security)
  const linkProvider = async (linkData) => {
    const res = await api.linkCustomerProvider(linkData);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem("bb_user", JSON.stringify(res.user));
    }
    return res;
  };

  const unlinkProvider = async (provider) => {
    const res = await api.unlinkCustomerProvider({ provider });
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem("bb_user", JSON.stringify(res.user));
    }
    return res;
  };

  const getSecurityStatus = async () => {
    return await api.getCustomerSecurityStatus();
  };

  const isOwner = ownerUser?.role === "owner" || user?.role === "owner";
  const isStaff = ownerUser?.role === "staff" || user?.role === "staff";
  const isStaffOrOwner = isOwner || isStaff;
  const isCustomer = !!user && user.role === "customer";

  return (
    <AuthContext.Provider
      value={{
        // Customer session (strictly for diner / customer portal)
        user,
        token,
        loading,
        isCustomer,
        refreshUser,

        // Owner / Staff session (strictly for cafe management hub)
        ownerUser,
        ownerToken,
        isOwner,
        isStaff,
        isStaffOrOwner,
        loginOwner,
        logoutOwner,

        login,
        logout,
        setCustomerSession,
        updateCustomerPoints,

        // Authentication Methods (Strictly Google & Email/Password)
        signInWithGoogle,
        signInWithGoogleRedirect,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        sendVerification,
        sendOtp: async () => ({ success: false, message: "Mobile OTP has been replaced with Email and Google login." }),

        // Account Linking & Security
        linkProvider,
        unlinkProvider,
        getSecurityStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
