/**
 * OTP Service - DECOMMISSIONED
 * 
 * In accordance with production security requirements, in-memory OTP stores,
 * hardcoded OTP backdoors (123456), and local mock OTP generation have been removed.
 * 
 * All phone authentication is handled exclusively by official Firebase Phone Authentication
 * with cryptographic SMS OTP delivery and Firebase Admin SDK token verification.
 */

export const generateOtp = () => {
  throw new Error("Demo OTP has been decommissioned. Use Firebase Phone Authentication.");
};

export const verifyOtp = () => {
  throw new Error("Local OTP verification has been decommissioned. Use Firebase Phone Authentication.");
};
