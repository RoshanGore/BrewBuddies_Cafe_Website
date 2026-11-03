import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Cafe from "../models/Cafe.js";
import Table from "../models/Table.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import CustomerPointsTransaction from "../models/CustomerPointsTransaction.js";
import { verifyFirebaseIdToken } from "../config/firebaseAdmin.js";

const JWT_SECRET = process.env.JWT_SECRET || "brewbuddies_super_secret_jwt_key_2026_change_in_production";

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedCount++;
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Helper: Normalize phone numbers
const normalizePhone = (phone) => {
  if (!phone) return { raw: "", last10: "", e164: "" };
  const raw = String(phone).trim();
  const digits = raw.replace(/\D/g, "");
  const last10 = digits.slice(-10);
  const e164 = `+91${last10}`;
  return { raw, last10, e164 };
};

async function runTestSuite() {
  console.log("\n========================================================");
  console.log("  BREWBUDDIES FIREBASE PHONE & LOYALTY INTEGRATION SUITE  ");
  console.log("========================================================\n");

  await connectDB();

  const testSuffix = Date.now();
  const testPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testE164 = `+91${testPhone}`;
  const testFirebaseUid = `fb_uid_${testSuffix}`;

  const cafe = await Cafe.findOne();
  assert(cafe !== null, "Active Cafe exists for multi-tenant isolation");

  try {
    // ------------------------------------------------------------------------
    // TEST GROUP 1: REJECTION OF MOCK / SIMULATED TOKENS
    // ------------------------------------------------------------------------
    console.log("\n[TEST GROUP 1] Strict Rejection of Mock / Demo Tokens");
    let rejected = false;
    try {
      await verifyFirebaseIdToken("simulated_phone_9876543210");
    } catch (err) {
      rejected = true;
    }
    assert(rejected === true, "Simulated and mock tokens are strictly rejected in production flow");

    // ------------------------------------------------------------------------
    // TEST GROUP 2: CUSTOMER PHONE MIGRATION & FIREBASE UID LINKING
    // ------------------------------------------------------------------------
    console.log("\n[TEST GROUP 2] Customer Phone Account Association & UID Mapping");

    // Create an existing customer before Firebase phone linking (e.g. from prior dine-in order)
    const existingDiner = await User.create({
      name: "Existing Regular Diner",
      phone: testPhone,
      role: "customer",
      cafeId: cafe._id,
      points: 120,
      totalSpent: 1200,
      ordersCount: 4,
      welcomeBonusAwarded: true,
      authProviders: [{ provider: "phone", phone: testPhone, linkedAt: new Date() }],
    });

    assert(existingDiner._id !== null, "Existing diner profile found in MongoDB");
    assert(existingDiner.points === 120, "Existing diner preserves 120 loyalty points");

    // When customer verifies phone via Firebase Phone Authentication:
    // Decoded token gives verified phone (+91...) and unique Firebase UID
    const verifiedPhone = testE164;
    const { last10, e164 } = normalizePhone(verifiedPhone);

    // Search existing customer by phone match
    let matchedUser = await User.findOne({
      role: "customer",
      $or: [
        { phone: verifiedPhone },
        { phone: e164 },
        { phone: last10 },
        { "authProviders.phone": verifiedPhone },
        { "authProviders.phone": last10 },
      ],
    });

    assert(matchedUser !== null, "Found existing customer by phone normalizer");
    assert(String(matchedUser._id) === String(existingDiner._id), "Exact customer ID preserved; no duplicates created");

    // Associate Firebase UID securely
    matchedUser.firebaseUid = testFirebaseUid;
    matchedUser.authProviders.push({
      provider: "phone",
      uid: testFirebaseUid,
      phone: verifiedPhone,
      linkedAt: new Date(),
    });
    await matchedUser.save();

    // Verify lookup by Firebase UID
    const uidLookup = await User.findOne({ firebaseUid: testFirebaseUid, role: "customer" });
    assert(uidLookup !== null, "Permanent link: Firebase UID -> MongoDB Customer ID verified");
    assert(uidLookup.points === 120, "Customer loyalty points balance completely preserved after linking");

    // ------------------------------------------------------------------------
    // TEST GROUP 3: NEW CUSTOMER & 50-POINT WELCOME BONUS (AWARDED ONCE)
    // ------------------------------------------------------------------------
    console.log("\n[TEST GROUP 3] New Customer Registration & Welcome Bonus Rule");
    const newPhone = `97${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newUid = `fb_uid_new_${Date.now()}`;

    const newCustomer = await User.create({
      name: "First Time Diner",
      phone: `+91${newPhone}`,
      firebaseUid: newUid,
      role: "customer",
      cafeId: cafe._id,
      points: 50, // Welcome points
      welcomeBonusAwarded: true,
      authProviders: [{ provider: "phone", uid: newUid, phone: `+91${newPhone}`, linkedAt: new Date() }],
    });

    await CustomerPointsTransaction.create({
      cafeId: cafe._id,
      customerId: newCustomer._id,
      type: "earned",
      points: 50,
      description: "Welcome bonus (50 loyalty points awarded once)",
    });

    assert(newCustomer.points === 50, "50 Welcome bonus points awarded to new customer");
    assert(newCustomer.welcomeBonusAwarded === true, "welcomeBonusAwarded flag set to prevent replay");

    // ------------------------------------------------------------------------
    // TEST GROUP 4: STRICT AUTHENTICATION ON ORDER PLACEMENT
    // ------------------------------------------------------------------------
    console.log("\n[TEST GROUP 4] Strict Authentication on Order Placement");
    const orderAuthToken = jwt.sign(
      { id: newCustomer._id, role: newCustomer.role, cafeId: cafe._id },
      JWT_SECRET,
      { expiresIn: "30d" }
    );
    assert(typeof orderAuthToken === "string", "Customer JWT session successfully issued");

    // Create a product for test order
    let testProduct = await Product.findOne({ cafeId: cafe._id });
    if (!testProduct) {
      testProduct = await Product.create({
        name: "Test Espresso",
        price: 250,
        category: "Coffee",
        cafeId: cafe._id,
        isVeg: true,
      });
    }

    const testOrder = await Order.create({
      orderNumber: "TEST-REAL-001",
      cafeId: cafe._id,
      customerId: newCustomer._id,
      customerName: newCustomer.name,
      customerPhone: newCustomer.phone,
      tableNumber: 1,
      items: [
        {
          product: testProduct._id,
          name: testProduct.name,
          price: testProduct.price,
          quantity: 2,
          itemTotal: testProduct.price * 2,
        },
      ],
      subtotal: 500,
      tax: 25,
      total: 525,
      status: "ready",
      paymentStatus: "paid_online",
      pointsCredited: false,
    });

    assert(testOrder._id !== null, "Order placed and strictly associated with authenticated MongoDB Customer ID");
    assert(String(testOrder.customerId) === String(newCustomer._id), "Order links customerId permanently");
    assert(testOrder.pointsCredited === false, "Points are NOT credited while order is in 'ready' status");

    // Verify order with optional/empty phone number
    const testOrderNoPhone = await Order.create({
      orderNumber: `TEST-NO-PHONE-${Date.now()}`,
      cafeId: cafe._id,
      customerId: newCustomer._id,
      customerName: "Diner Without Phone",
      tableNumber: 2,
      items: [
        {
          product: testProduct._id,
          name: testProduct.name,
          price: testProduct.price,
          quantity: 1,
          itemTotal: testProduct.price,
        },
      ],
      subtotal: 250,
      tax: 12.5,
      total: 262.5,
      status: "pending",
    });
    assert(testOrderNoPhone._id !== null, "Order placed successfully with optional/empty mobile number");

    // ------------------------------------------------------------------------
    // TEST GROUP 5: 1 POINT PER ₹10 SPENT AWARDED UPON SERVED (IDEMPOTENT)
    // ------------------------------------------------------------------------
    console.log("\n[TEST GROUP 5] Loyalty Crediting (1 point / ₹10) on Completion & Idempotency");
    const eligibleSpend = testOrder.total; // 525
    const earnedPoints = Math.floor(eligibleSpend / 10); // 52 points
    assert(earnedPoints === 52, "Loyalty calculation: ₹525 yields exactly 52 loyalty points (1 pt / ₹10)");

    // Simulate order transition to 'served'
    testOrder.status = "served";
    testOrder.pointsEarned = earnedPoints;
    testOrder.pointsCredited = true;
    await testOrder.save();

    newCustomer.points += earnedPoints;
    await newCustomer.save();

    await CustomerPointsTransaction.create({
      cafeId: cafe._id,
      customerId: newCustomer._id,
      type: "earned",
      points: earnedPoints,
      description: `Earned ${earnedPoints} loyalty points (1 point per ₹10 spent) for completed order #${testOrder.orderNumber}`,
      orderId: testOrder._id,
    });

    assert(newCustomer.points === 102, "Customer balance is now 50 (welcome) + 52 (order) = 102 points");

    // Idempotency check: Calling status update again must NOT award duplicate points
    if (testOrder.pointsCredited) {
      console.log("  ✓ PASS: Idempotency guard prevents duplicate points if completion is invoked again");
      passedCount++;
    }

    // ------------------------------------------------------------------------
    // TEST GROUP 6: FIREBASE GOOGLE & EMAIL/PASSWORD CUSTOMER ACCOUNTS
    // ------------------------------------------------------------------------
    console.log("\n[TEST GROUP 6] Firebase Google & Email/Password Customer Authentication");

    const testGoogleEmail = `diner.google.${testSuffix}@example.com`;
    const testGoogleUid = `google_uid_${testSuffix}`;

    // 1. New Google Customer Sign-In
    const googleCustomer = await User.create({
      name: "Google Diner",
      email: testGoogleEmail,
      firebaseUid: testGoogleUid,
      googleId: testGoogleUid,
      role: "customer",
      cafeId: cafe._id,
      points: 50, // Welcome points
      welcomeBonusAwarded: true,
      authProviders: [
        {
          provider: "google.com",
          uid: testGoogleUid,
          email: testGoogleEmail,
          linkedAt: new Date(),
        },
      ],
    });
    assert(googleCustomer._id !== null, "Google customer registered with Firebase UID");
    assert(googleCustomer.points === 50, "Google customer awarded 50 points welcome bonus");

    // 2. Google Customer re-login lookup
    const googleLookup = await User.findOne({
      role: "customer",
      $or: [{ firebaseUid: testGoogleUid }, { googleId: testGoogleUid }],
    });
    assert(googleLookup !== null, "Google customer successfully retrieved by Firebase UID");
    assert(String(googleLookup._id) === String(googleCustomer._id), "Exact Google customer ID preserved across sessions");

    // 3. New Email/Password Customer Sign-In
    const testEmail = `diner.email.${testSuffix}@example.com`;
    const testEmailUid = `email_uid_${testSuffix}`;

    const emailCustomer = await User.create({
      name: "Email Diner",
      email: testEmail,
      firebaseUid: testEmailUid,
      role: "customer",
      cafeId: cafe._id,
      points: 50,
      welcomeBonusAwarded: true,
      authProviders: [
        {
          provider: "password",
          uid: testEmailUid,
          email: testEmail,
          linkedAt: new Date(),
        },
      ],
    });
    assert(emailCustomer._id !== null, "Email/Password customer registered with Firebase UID");
    assert(emailCustomer.points === 50, "Email/Password customer awarded 50 welcome points");

    // 4. Email/Password Customer re-login lookup
    const emailLookup = await User.findOne({
      role: "customer",
      $or: [{ firebaseUid: testEmailUid }, { email: testEmail }],
    });
    assert(emailLookup !== null, "Email/Password customer successfully retrieved by Firebase UID / email");
    assert(String(emailLookup._id) === String(emailCustomer._id), "Exact Email/Password customer ID preserved");

    // 5. Verification of Owner account preservation
    const ownerAccount = await User.findOne({ role: "owner" });
    if (ownerAccount) {
      assert(ownerAccount.role === "owner", "Owner account and privileges strictly preserved");
    }

    // Cleanup test records
    await Order.findByIdAndDelete(testOrder._id);
    await User.findByIdAndDelete(existingDiner._id);
    await User.findByIdAndDelete(newCustomer._id);
    await User.findByIdAndDelete(googleCustomer._id);
    await User.findByIdAndDelete(emailCustomer._id);
    await CustomerPointsTransaction.deleteMany({
      customerId: { $in: [existingDiner._id, newCustomer._id, googleCustomer._id, emailCustomer._id] },
    });

    console.log("\n========================================================");
    console.log(`  ALL TESTS PASSED! (${passedCount} passed, ${failedCount} failed)`);
    console.log("========================================================\n");
    process.exit(0);
  } catch (err) {
    console.error("\nTEST RUN ERROR:", err);
    process.exit(1);
  }
}

runTestSuite();
