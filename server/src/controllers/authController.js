import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Cafe from "../models/Cafe.js";
import CustomerPointsTransaction from "../models/CustomerPointsTransaction.js";
import { verifyFirebaseIdToken } from "../config/firebaseAdmin.js";

// Helper: Normalize phone numbers to 10-digit national and E.164
const normalizePhone = (phone) => {
  if (!phone) return { raw: "", last10: "", e164: "" };
  const raw = String(phone).trim();
  const digits = raw.replace(/\D/g, "");
  const last10 = digits.slice(-10);
  const e164 = `+91${last10}`;
  return { raw, last10, e164 };
};

// In-memory Phone OTP store with 5-minute TTL
const phoneOtpStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, data] of phoneOtpStore.entries()) {
    if (data.expiresAt < now) {
      phoneOtpStore.delete(key);
    }
  }
}, 60000);

const generateToken = (id, role, cafeId) => {
  return jwt.sign(
    { id, role, cafeId },
    process.env.JWT_SECRET || "brewbuddies_super_secret_jwt_key_2026_change_in_production",
    { expiresIn: "30d" }
  );
};

// Helper: Format user object for client response
const formatUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email || null,
    phone: user.phone || null,
    role: user.role,
    cafeId: user.cafeId,
    loyaltyPoints: user.points ?? user.loyaltyPoints ?? 0,
    points: user.points ?? 0,
    totalSpent: user.totalSpent || 0,
    ordersCount: user.ordersCount || 0,
    welcomeBonusAwarded: user.welcomeBonusAwarded || false,
    googleId: user.googleId || null,
    firebaseUid: user.firebaseUid || null,
    authProviders: user.authProviders || [],
    createdAt: user.createdAt,
  };
};

// Helper: Safely award 50 welcome points only once
const awardWelcomeBonusIfEligible = async (user, cafeId) => {
  if (!user.welcomeBonusAwarded) {
    user.points = (user.points || 0) + 50;
    user.welcomeBonusAwarded = true;
    await user.save();

    await CustomerPointsTransaction.create({
      cafeId: cafeId || user.cafeId,
      customerId: user._id,
      type: "earned",
      points: 50,
      description: "Welcome bonus (50 loyalty points awarded once)",
    });
    console.log(`[Loyalty] Awarded 50 welcome bonus points to ${user.name} (${user._id})`);
  }
};

// ============================================================================
// 1. STANDARD EMAIL & PASSWORD REGISTRATION & LOGIN
// ============================================================================

// @desc    Register a new user with Email & Password (Customer by default)
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered. Please sign in instead.",
      });
    }

    const cleanPhone = phone ? phone.trim() : "";
    if (cleanPhone) {
      const existingPhoneUser = await User.findOne({ phone: cleanPhone });
      if (existingPhoneUser) {
        return res.status(400).json({
          success: false,
          message: "An account with this phone number already exists. Please sign in or use a different phone number.",
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let cafe = await Cafe.findOne();

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash: hashedPassword,
      role: "customer",
      cafeId: cafe?._id,
      points: 0,
      welcomeBonusAwarded: false,
      authProviders: [
        {
          provider: "password",
          email: cleanEmail,
          linkedAt: new Date(),
        },
      ],
    });

    // Award welcome bonus points once
    await awardWelcomeBonusIfEligible(user, cafe?._id);

    const token = generateToken(user._id, user.role, user.cafeId);

    res.status(201).json({
      success: true,
      message: "Account registered successfully with Email & Password",
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login for Owner / Staff / Customer with Email & Password
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    const storedHash = user?.passwordHash || user?.password;

    if (!user || !storedHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, storedHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Ensure password provider is recorded in authProviders if missing
    if (!user.authProviders?.some((p) => p.provider === "password")) {
      user.authProviders.push({
        provider: "password",
        email: user.email,
        linkedAt: new Date(),
      });
      await user.save();
    }

    const token = generateToken(user._id, user.role, user.cafeId);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 2. MOBILE NUMBER WITH OTP AUTHENTICATION
// ============================================================================

// @desc    Send 6-digit SMS OTP to customer's mobile number
// @route   POST /api/auth/customer/send-otp
export const sendCustomerOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone || String(phone).replace(/\D/g, "").length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number",
      });
    }

    const { last10, e164 } = normalizePhone(phone);
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5-minute validity

    phoneOtpStore.set(last10, {
      code,
      expiresAt,
      attempts: 0,
      phone: e164,
    });

    console.log(`[BrewBuddies SMS OTP] Sent OTP code for ${e164}: ${code}`);

    // If an external SMS gateway (Fast2SMS / Twilio) is configured in environment, dispatch SMS
    if (process.env.FAST2SMS_API_KEY) {
      try {
        await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&route=otp&variables_values=${code}&numbers=${last10}`);
      } catch (smsErr) {
        console.warn("[SMS Gateway] Error sending SMS:", smsErr.message);
      }
    }

    return res.json({
      success: true,
      message: `Verification code sent via SMS to ${e164}`,
      phone: e164,
      otpSent: true,
      // For local testing convenience if SMS provider is not yet linked, return devCode in non-production
      devCode: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 6-digit OTP and sign in / register customer
// @route   POST /api/auth/customer/verify-otp
export const verifyCustomerOtp = async (req, res, next) => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and 6-digit OTP code are required",
      });
    }

    const { last10, e164 } = normalizePhone(phone);
    const cleanOtp = String(otp).trim();

    const record = phoneOtpStore.get(last10);
    if (!record) {
      return res.status(400).json({
        success: false,
        message: "No OTP was requested for this mobile number or code has expired. Please request a new code.",
      });
    }

    if (Date.now() > record.expiresAt) {
      phoneOtpStore.delete(last10);
      return res.status(400).json({
        success: false,
        message: "The OTP code has expired. Please request a new code.",
      });
    }

    if (record.attempts >= 5) {
      phoneOtpStore.delete(last10);
      return res.status(400).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    if (record.code !== cleanOtp) {
      record.attempts += 1;
      return res.status(400).json({
        success: false,
        message: "Incorrect 6-digit OTP code. Please check and re-enter.",
      });
    }

    // OTP verified! Single-use: delete from store
    phoneOtpStore.delete(last10);

    // Look up existing customer by phone number
    let user = await User.findOne({
      role: "customer",
      $or: [
        { phone: e164 },
        { phone: last10 },
        { phone: `+91 ${last10}` },
        { "authProviders.phone": e164 },
        { "authProviders.phone": last10 },
      ],
    });

    let cafe = await Cafe.findOne();

    if (user) {
      // Existing customer: update details if necessary
      if (!user.phone) user.phone = e164;
      if (name && (user.name === "Dine-in Guest" || !user.name)) {
        user.name = name.trim();
      }
      if (!user.authProviders?.some((p) => p.provider === "phone")) {
        user.authProviders.push({
          provider: "phone",
          phone: e164,
          linkedAt: new Date(),
        });
      }
      await user.save();
    } else {
      // Create new customer
      user = await User.create({
        name: (name || "Dine-in Guest").trim(),
        phone: e164,
        role: "customer",
        cafeId: cafe?._id,
        points: 0,
        welcomeBonusAwarded: false,
        authProviders: [
          {
            provider: "phone",
            phone: e164,
            linkedAt: new Date(),
          },
        ],
      });

      // Award 50 welcome loyalty points once
      await awardWelcomeBonusIfEligible(user, cafe?._id);
    }

    const token = generateToken(user._id, user.role, user.cafeId);

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 3. FIREBASE AUTHENTICATION (REAL SMS PHONE OTP & GOOGLE SIGN-IN)
// ============================================================================

// @desc    Sign in or Register via Firebase ID Token (Phone SMS, Google, Email)
// @route   POST /api/auth/customer/firebase-login
export const firebaseCustomerLogin = async (req, res, next) => {
  try {
    const { idToken, provider: declaredProvider, name: clientName } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required",
      });
    }

    // Verify token cryptographically using Firebase Admin SDK
    const decoded = await verifyFirebaseIdToken(idToken);
    const firebaseUid = decoded.uid;
    const email = decoded.email ? decoded.email.toLowerCase().trim() : null;
    const phone = decoded.phone_number ? decoded.phone_number.trim() : null;
    const provider = decoded.firebase?.sign_in_provider || declaredProvider || (phone ? "phone" : "google.com");
    const name = decoded.name || clientName || (email ? email.split("@")[0] : "BrewBuddies Diner");

    // 1. Look up existing user by Firebase UID or matching authProvider UID
    let user = await User.findOne({
      role: "customer",
      $or: [
        { firebaseUid },
        { "authProviders.uid": firebaseUid },
        ...(provider === "google.com" ? [{ googleId: firebaseUid }] : []),
      ],
    });

    // 2. If user not found by Firebase UID, and provider is 'phone',
    // the customer has cryptographically proven ownership of this mobile number via Firebase SMS OTP!
    // Search for existing MongoDB customer record with matching phone number to migrate & associate UID.
    if (!user && phone) {
      const { last10, e164 } = normalizePhone(phone);
      if (last10) {
        user = await User.findOne({
          role: "customer",
          $or: [
            { phone: phone },
            { phone: e164 },
            { phone: last10 },
            { phone: `+91 ${last10}` },
            { "authProviders.phone": phone },
            { "authProviders.phone": last10 },
          ],
        });
      }
    }

    if (user) {
      // Existing customer matched by Firebase UID or verified phone number
      if (!user.firebaseUid) user.firebaseUid = firebaseUid;
      if (provider === "google.com" && !user.googleId) user.googleId = firebaseUid;
      if (email && !user.email) user.email = email;
      if (phone && !user.phone) user.phone = phone;

      // Update provider in authProviders list if missing
      if (!user.authProviders?.some((p) => p.provider === provider && (p.uid === firebaseUid || p.phone === phone))) {
        user.authProviders.push({
          provider,
          uid: firebaseUid,
          email: email || undefined,
          phone: phone || undefined,
          linkedAt: new Date(),
        });
      }
      await user.save();

      const token = generateToken(user._id, user.role, user.cafeId);
      return res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        token,
        user: formatUserResponse(user),
      });
    }

    // 3. User not found. If this is a Google sign-in with an email or phone, prevent unverified merging
    if (provider !== "phone") {
      if (email) {
        const existingEmailUser = await User.findOne({ email, role: "customer" });
        if (existingEmailUser) {
          // If customer verified credentials via Firebase Email & Password, link Firebase UID seamlessly
          if (provider === "password") {
            if (!existingEmailUser.firebaseUid) existingEmailUser.firebaseUid = firebaseUid;
            if (!existingEmailUser.authProviders?.some((p) => p.provider === "password")) {
              existingEmailUser.authProviders.push({
                provider: "password",
                uid: firebaseUid,
                email,
                linkedAt: new Date(),
              });
            }
            await existingEmailUser.save();
            const token = generateToken(existingEmailUser._id, existingEmailUser.role, existingEmailUser.cafeId);
            return res.json({
              success: true,
              message: `Welcome back, ${existingEmailUser.name}!`,
              token,
              user: formatUserResponse(existingEmailUser),
            });
          }

          // Verified Google account matches existing customer record - link Google account seamlessly
          existingEmailUser.googleId = firebaseUid;
          if (!existingEmailUser.firebaseUid) existingEmailUser.firebaseUid = firebaseUid;
          if (!existingEmailUser.authProviders?.some((p) => p.provider === "google.com")) {
            existingEmailUser.authProviders.push({
              provider: "google.com",
              uid: firebaseUid,
              email,
              linkedAt: new Date(),
            });
          }
          await existingEmailUser.save();
          const token = generateToken(existingEmailUser._id, existingEmailUser.role, existingEmailUser.cafeId);
          return res.json({
            success: true,
            message: `Welcome back, ${existingEmailUser.name}!`,
            token,
            user: formatUserResponse(existingEmailUser),
          });
        }
      }

      if (phone) {
        const existingPhoneUser = await User.findOne({ phone, role: "customer" });
        if (existingPhoneUser) {
          return res.status(409).json({
            success: false,
            code: "ACCOUNT_EXISTS_UNLINKED",
            message:
              "An account with this phone number already exists. For your security, please sign in with your phone OTP first, then link your Google account in Account & Security.",
            existingPhone: phone,
          });
        }
      }
    }

    // 4. Brand-new customer profile creation
    let cafe = await Cafe.findOne();

    user = await User.create({
      name: name.trim(),
      email: email || undefined,
      phone: phone || undefined,
      firebaseUid,
      googleId: provider === "google.com" ? firebaseUid : undefined,
      role: "customer",
      cafeId: cafe?._id,
      points: 0,
      welcomeBonusAwarded: false,
      authProviders: [
        {
          provider,
          uid: firebaseUid,
          email: email || undefined,
          phone: phone || undefined,
          linkedAt: new Date(),
        },
      ],
    });

    // Award welcome bonus points once
    await awardWelcomeBonusIfEligible(user, cafe?._id);

    const token = generateToken(user._id, user.role, user.cafeId);

    res.status(201).json({
      success: true,
      message: "Customer account created and verified successfully with " + provider,
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 4. SECURE ACCOUNT LINKING & UNLINKING (ACCOUNT & SECURITY)
// ============================================================================

// @desc    Link an additional authentication provider to the current customer profile
// @route   POST /api/auth/customer/link-provider
export const linkCustomerProvider = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Customer authentication required to manage account linking",
      });
    }

    const { provider, idToken, email, password, phone, otp } = req.body;
    const validProviders = ["google.com", "phone", "password"];

    if (!provider || !validProviders.includes(provider)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider. Must be one of: google.com, phone, password",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found" });
    }

    // Check if provider is already linked
    const alreadyLinked = user.authProviders?.some((p) => p.provider === provider);
    if (alreadyLinked) {
      return res.status(400).json({
        success: false,
        message: `Your account is already linked with ${provider}`,
      });
    }

    // SECURE VERIFICATION FOR EACH METHOD BEFORE LINKING
    if (provider === "google.com") {
      if (!idToken) {
        return res.status(400).json({ success: false, message: "Google ID token is required for verification" });
      }

      const decoded = await verifyFirebaseIdToken(idToken);
      const googleUid = decoded.uid;
      const googleEmail = decoded.email ? decoded.email.toLowerCase().trim() : null;

      // Prevent identity hijacking: Ensure no other user is linked to this Google UID
      const conflictingUser = await User.findOne({
        _id: { $ne: user._id },
        $or: [
          { googleId: googleUid },
          { firebaseUid: googleUid },
          { "authProviders.uid": googleUid },
          ...(googleEmail ? [{ email: googleEmail }] : []),
        ],
      });

      if (conflictingUser) {
        return res.status(400).json({
          success: false,
          message: "This Google account is already linked to another customer profile.",
        });
      }

      user.googleId = googleUid;
      if (!user.firebaseUid) user.firebaseUid = googleUid;
      if (!user.email && googleEmail) user.email = googleEmail;

      user.authProviders.push({
        provider: "google.com",
        uid: googleUid,
        email: googleEmail || undefined,
        linkedAt: new Date(),
      });
    } else if (provider === "phone") {
      let verifiedPhone = null;
      let linkedUid = null;

      if (idToken) {
        const decoded = await verifyFirebaseIdToken(idToken);
        verifiedPhone = decoded.phone_number ? decoded.phone_number.trim() : null;
        linkedUid = decoded.uid;
      } else if (phone && otp) {
        const { last10, e164 } = normalizePhone(phone);
        const record = phoneOtpStore.get(last10);
        if (!record || record.code !== String(otp).trim() || Date.now() > record.expiresAt) {
          return res.status(400).json({ success: false, message: "Invalid or expired phone OTP code" });
        }
        phoneOtpStore.delete(last10);
        verifiedPhone = e164;
      } else {
        return res.status(400).json({
          success: false,
          message: "Verification token or OTP required to verify mobile number",
        });
      }

      if (!verifiedPhone) {
        return res.status(400).json({
          success: false,
          message: "No verified phone number found",
        });
      }

      const { last10, e164 } = normalizePhone(verifiedPhone);

      // Prevent conflicting user
      const conflictingPhoneUser = await User.findOne({
        _id: { $ne: user._id },
        $or: [
          { phone: verifiedPhone },
          { phone: e164 },
          { phone: last10 },
          { "authProviders.phone": verifiedPhone },
          { "authProviders.phone": last10 },
        ],
      });

      if (conflictingPhoneUser) {
        return res.status(400).json({
          success: false,
          message: "This mobile number is already linked to another customer profile.",
        });
      }

      user.phone = verifiedPhone;
      if (linkedUid && !user.firebaseUid) user.firebaseUid = linkedUid;
      user.authProviders.push({
        provider: "phone",
        uid: linkedUid || undefined,
        phone: verifiedPhone,
        linkedAt: new Date(),
      });
    } else if (provider === "password") {
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
      }

      const cleanEmail = String(email).toLowerCase().trim();

      // Prevent conflicting user
      const conflictingUser = await User.findOne({
        _id: { $ne: user._id },
        email: cleanEmail,
      });

      if (conflictingUser) {
        return res.status(400).json({
          success: false,
          message: "This email address is already linked to another customer profile.",
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
      user.email = cleanEmail;

      user.authProviders.push({
        provider: "password",
        email: cleanEmail,
        linkedAt: new Date(),
      });
    }

    await user.save();

    res.json({
      success: true,
      message: `Successfully linked ${provider} to your profile!`,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlink an authentication provider from the customer profile
// @route   POST /api/auth/customer/unlink-provider
export const unlinkCustomerProvider = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { provider } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.authProviders || user.authProviders.length <= 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot unlink your only sign-in method. You must keep at least one provider active.",
      });
    }

    const initialLength = user.authProviders.length;
    user.authProviders = user.authProviders.filter((p) => p.provider !== provider);

    if (user.authProviders.length === initialLength) {
      return res.status(400).json({
        success: false,
        message: `Provider ${provider} is not linked to your account`,
      });
    }

    // Clear specific fields if unlinked
    if (provider === "google.com") {
      user.googleId = undefined;
    } else if (provider === "password") {
      user.passwordHash = undefined;
    }

    await user.save();

    res.json({
      success: true,
      message: `Successfully unlinked ${provider}`,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's current security & linked providers status
// @route   GET /api/auth/customer/security-status
export const getCustomerSecurityStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name email phone role points loyaltyPoints authProviders googleId firebaseUid passwordHash welcomeBonusAwarded createdAt"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      security: {
        hasPassword: Boolean(user.passwordHash),
        hasPhone: Boolean(user.phone),
        hasGoogle: Boolean(user.googleId || user.authProviders?.some((p) => p.provider === "google.com")),
        hasEmail: Boolean(user.email),
        email: user.email || null,
        phone: user.phone || null,
        authProviders: user.authProviders || [],
        welcomeBonusAwarded: Boolean(user.welcomeBonusAwarded),
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 5. EXISTING UTILITIES & COMPATIBILITY ENDPOINTS
// ============================================================================

// @desc    Frictionless customer session for table ordering (Legacy / Quick Table Session)
// @route   POST /api/auth/customer-session
export const customerSession = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required for dine-in loyalty" });
    }

    const cleanPhone = phone.trim();
    let cafe = await Cafe.findOne();
    let user = await User.findOne({ phone: cleanPhone, role: "customer" });

    if (!user) {
      user = await User.create({
        name: name ? name.trim() : "Dine-in Guest",
        phone: cleanPhone,
        role: "customer",
        cafeId: cafe?._id,
        points: 0,
        welcomeBonusAwarded: false,
        authProviders: [{ provider: "phone", phone: cleanPhone, linkedAt: new Date() }],
      });
      await awardWelcomeBonusIfEligible(user, cafe?._id);
    } else {
      if (name && (user.name === "Dine-in Guest" || !user.name)) {
        user.name = name.trim();
      }
      if (!user.cafeId && cafe) {
        user.cafeId = cafe._id;
      }
      await user.save();
    }

    const token = generateToken(user._id, user.role, user.cafeId);

    res.json({
      success: true,
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash -password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name.trim();
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      // Ensure email isn't taken by someone else
      const conflict = await User.findOne({ _id: { $ne: user._id }, email: cleanEmail });
      if (conflict) {
        return res.status(400).json({ success: false, message: "Email is already taken by another user" });
      }
      user.email = cleanEmail;
    }
    if (phone) {
      const cleanPhone = phone.trim();
      const conflict = await User.findOne({ _id: { $ne: user._id }, phone: cleanPhone });
      if (conflict) {
        return res.status(400).json({ success: false, message: "Phone number is already taken by another user" });
      }
      user.phone = cleanPhone;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};
