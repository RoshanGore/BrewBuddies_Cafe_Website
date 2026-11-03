import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from "firebase/auth";

// Google OAuth Client ID (optional reference for GIS)
export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "711843278918-qr1pi2doqn3b3dt141ddns0k9es5bopr.apps.googleusercontent.com";

// Firebase Web App Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCQL9jCLNilnOdMMkXpPGs7IH0aVLBnbxQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "brewbuddies-2a2f8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "brewbuddies-2a2f8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "brewbuddies-2a2f8.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "711843278918",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:711843278918:web:9807ddd5700d45c682da47",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KB5SDFXCKH",
};

// Initialize Firebase App instance (Singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("profile");
googleProvider.addScope("email");
googleProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Translate Firebase Authentication error codes into friendly user messages
 * @param {Error} error
 * @returns {string}
 */
export const getFirebaseErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred. Please try again.";
  const code = error.code || "";
  const msg = error.message || "";

  switch (code) {
    case "auth/user-not-found":
      return "No account exists with this email address. Please register an account first.";
    case "auth/wrong-password":
      return "Incorrect password. Please verify your password or use 'Forgot Password?'.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please check your credentials and try again.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Please sign in instead.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact café staff.";
    case "auth/too-many-requests":
      return "Too many unsuccessful attempts. Access to this account is temporarily disabled. Please reset your password or try again later.";
    case "auth/popup-blocked":
      return "The Google sign-in pop-up was blocked by your browser. Redirecting you to sign in directly...";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled before completion. Please try again.";
    case "auth/cancelled-popup-request":
      return "Sign-in pop-up was cancelled due to a concurrent request.";
    case "auth/unauthorized-domain": {
      const currentHost = typeof window !== "undefined" ? window.location.hostname : "current domain";
      return `This domain (${currentHost}) is not authorized in Firebase Console. Add '${currentHost}' or 'trycloudflare.com' to Authorized Domains in Firebase Console > Authentication > Settings.`;
    }
    case "auth/operation-not-allowed":
      return "This sign-in provider is not enabled in Firebase Console. Please enable Email/Password and Google in Authentication > Sign-in method.";
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
      return "Firebase Web API key is invalid. Please verify VITE_FIREBASE_API_KEY in client/.env.";
    case "auth/network-request-failed":
      return "Network connection failed. Please check your internet connection.";
    case "auth/internal-error":
      return "Firebase service encountered an internal error. Please try again.";
    default:
      return msg.replace("Firebase: ", "").trim() || "Authentication failed. Please try again.";
  }
};

/**
 * 1. Google Sign-In with Popup and automatic Redirect fallback
 * @returns {Promise<{ user: Object, idToken: string } | { redirecting: boolean }>}
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken(true);
    return {
      user: result.user,
      idToken,
      emailVerified: result.user.emailVerified,
    };
  } catch (error) {
    console.warn("[Firebase] Google signInWithPopup notice:", error.code, error.message);

    // If popup is blocked by browser, automatically trigger redirect fallback
    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/cancelled-popup-request" ||
      /popup/i.test(error.message)
    ) {
      console.log("[Firebase] Initiating signInWithRedirect fallback...");
      try {
        await signInWithRedirect(auth, googleProvider);
        return { redirecting: true };
      } catch (redirectError) {
        console.error("[Firebase] signInWithRedirect error:", redirectError);
        throw redirectError;
      }
    }

    throw error;
  }
};

/**
 * 2. Dedicated Google Redirect Sign-In (for mobile viewports or permanent popup blockers)
 */
export const signInWithGoogleRedirect = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
    return { redirecting: true };
  } catch (error) {
    console.error("[Firebase] signInWithGoogleRedirect error:", error);
    throw error;
  }
};

/**
 * 3. Check and process redirect result upon page return
 * @returns {Promise<{ user: Object, idToken: string } | null>}
 */
export const checkGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (!result || !result.user) {
      return null;
    }
    const idToken = await result.user.getIdToken(true);
    return {
      user: result.user,
      idToken,
      emailVerified: result.user.emailVerified,
    };
  } catch (error) {
    console.error("[Firebase] checkGoogleRedirectResult error:", error);
    if (error.code === "auth/null-user" || error.code === "auth/no-auth-event") {
      return null;
    }
    throw error;
  }
};

/**
 * 4. Sign in with Email and Password using Firebase Auth SDK
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: Object, idToken: string, emailVerified: boolean }>}
 */
export const signInWithEmail = async (email, password) => {
  try {
    const cleanEmail = String(email).trim().toLowerCase();
    const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const idToken = await result.user.getIdToken(true);
    return {
      user: result.user,
      idToken,
      emailVerified: result.user.emailVerified,
    };
  } catch (error) {
    console.error("[Firebase] signInWithEmail error:", error);
    throw error;
  }
};

/**
 * 5. Register new account with Email and Password using Firebase Auth SDK
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @param {boolean} sendVerification
 * @returns {Promise<{ user: Object, idToken: string, emailVerified: boolean }>}
 */
export const registerWithEmail = async (name, email, password, sendVerification = true) => {
  try {
    const cleanEmail = String(email).trim().toLowerCase();
    const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);

    // Update Firebase display name if provided
    if (name) {
      try {
        await updateProfile(result.user, { displayName: name.trim() });
      } catch (profileErr) {
        console.warn("[Firebase] updateProfile warning:", profileErr.message);
      }
    }

    // Send email verification if requested
    if (sendVerification) {
      try {
        await sendEmailVerification(result.user);
      } catch (verifErr) {
        console.warn("[Firebase] sendEmailVerification warning:", verifErr.message);
      }
    }

    const idToken = await result.user.getIdToken(true);
    return {
      user: result.user,
      idToken,
      emailVerified: result.user.emailVerified,
    };
  } catch (error) {
    console.error("[Firebase] registerWithEmail error:", error);
    throw error;
  }
};

/**
 * 6. Send Password Reset Email using Firebase Auth SDK
 * @param {string} email
 * @returns {Promise<{ success: boolean }>}
 */
export const sendPasswordReset = async (email) => {
  try {
    const cleanEmail = String(email).trim().toLowerCase();
    await sendPasswordResetEmail(auth, cleanEmail);
    return { success: true };
  } catch (error) {
    console.error("[Firebase] sendPasswordReset error:", error);
    throw error;
  }
};

/**
 * 7. Send Email Verification to current or specified user
 * @param {Object} [firebaseUser]
 * @returns {Promise<{ success: boolean }>}
 */
export const sendVerificationEmail = async (firebaseUser = auth.currentUser) => {
  if (!firebaseUser) {
    throw new Error("No active Firebase session found. Please sign in first.");
  }
  try {
    await sendEmailVerification(firebaseUser);
    return { success: true };
  } catch (error) {
    console.error("[Firebase] sendVerificationEmail error:", error);
    throw error;
  }
};

/**
 * 8. Sign out of Firebase Auth SDK session
 */
export const logoutFirebase = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn("[Firebase] signOut notice:", err.message);
  }
};

/**
 * Compatibility helpers for existing codebase
 */
export const linkGoogleToAccount = async () => {
  return await signInWithGoogle();
};

export const formatPhoneForFirebase = (phone, countryCode = "+91") => {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  return digits.length === 10 ? `${countryCode}${digits}` : `+${digits}`;
};

export const verifyFirebasePhoneOtp = async (confirmationResult, verificationCode) => {
  if (!confirmationResult || typeof confirmationResult.confirm !== "function") {
    throw new Error("Invalid or expired verification session.");
  }
  const userCredential = await confirmationResult.confirm(verificationCode);
  const idToken = await userCredential.user.getIdToken(true);
  return { user: userCredential.user, idToken };
};

export { onAuthStateChanged };
export default app;
