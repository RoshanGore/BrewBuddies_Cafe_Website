import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "../config/db.js";
import Cafe from "../models/Cafe.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Table from "../models/Table.js";
import Order from "../models/Order.js";
import Offer from "../models/Offer.js";
import Reward from "../models/Reward.js";
import CustomerPointsTransaction from "../models/CustomerPointsTransaction.js";
import CafeSetting from "../models/CafeSetting.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const runSuite = async () => {
  let passed = 0;
  let failed = 0;
  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    await connectDB();
    console.log("\n========================================================");
    console.log("   BREWBUDDIES AUTOMATED INTEGRATION & SECURITY SUITE    ");
    console.log("========================================================\n");

    // TEST 1: Cafe and Tables Setup
    console.log("[TEST GROUP 1] Cafe & Table Infrastructure");
    const cafe = await Cafe.findOne();
    assert(cafe !== null, "Primary Cafe exists in MongoDB");
    assert(cafe.phone === "+91 8275115011", "Cafe phone matches genuine menu PDF (+91 8275115011)");

    let table3 = await Table.findOne({ tableNumber: 3, cafeId: cafe._id });
    if (!table3) {
      table3 = await Table.create({ cafeId: cafe._id, tableNumber: 3, capacity: 4 });
    }
    assert(table3 && table3.tableNumber === 3, "Table #3 exists for QR table identification");

    // TEST 2: Real Menu & Product Variants
    console.log("\n[TEST GROUP 2] Real Menu Categories, Variants & Add-ons");
    const categoriesCount = await Category.countDocuments();
    assert(categoriesCount >= 20, `Real menu categories imported (count: ${categoriesCount})`);

    const pizzaCat = await Category.findOne({ name: "Veg Pizza" });
    assert(pizzaCat !== null, "Category 'Veg Pizza' exists");

    const margherita = await Product.findOne({ name: "Classic Margherita Pizza" });
    assert(margherita !== null, "Product 'Classic Margherita Pizza' exists");
    assert(margherita.variants && margherita.variants.length === 3, "Margherita has 3 size variants (Small, Medium, Large)");
    
    const smallVar = margherita.variants.find((v) => v.name.includes("Small"));
    const medVar = margherita.variants.find((v) => v.name.includes("Medium"));
    const largeVar = margherita.variants.find((v) => v.name.includes("Large"));
    assert(smallVar && smallVar.price === 140, "Small (8in) price is ₹140 as per PDF");
    assert(medVar && medVar.price === 160, "Medium (9in) price is ₹160 as per PDF");
    assert(largeVar && largeVar.price === 200, "Large (10in) price is ₹200 as per PDF");

    const chai = await Product.findOne({ name: "Classic Chaai" });
    assert(chai !== null, "Product 'Classic Chaai' exists");
    assert(chai.variants && chai.variants.length === 2, "Classic Chaai has 2 size variants (70ml & 100ml)");
    const c70 = chai.variants.find((v) => v.name === "70ml");
    const c100 = chai.variants.find((v) => v.name === "100ml");
    assert(c70 && c70.price === 12, "70ml Chaai price is ₹12 as per PDF");
    assert(c100 && c100.price === 20, "100ml Chaai price is ₹20 as per PDF");

    // TEST 3: Order Controller Security & Tamper Protection
    console.log("\n[TEST GROUP 3] Server-Side Price Calculation & Anti-Tamper Security");
    const { createOrder, updateOrderStatus } = await import("../controllers/orderController.js");

    const mockCustomerPhone = `9999${Math.floor(100000 + Math.random() * 900000)}`;
    const mockReq = {
      body: {
        customerName: "Test Automation Diner",
        customerPhone: mockCustomerPhone,
        tableNumber: 3,
        items: [
          {
            productId: margherita._id.toString(),
            name: margherita.name,
            selectedVariant: {
              variantId: largeVar._id.toString(),
              name: largeVar.name,
              price: 1, // TAMPERED CLIENT PRICE! Should be overridden by server
            },
            selectedAddOns: [
              {
                name: "Cheese",
                price: 1, // TAMPERED CLIENT PRICE! Should be overridden by server to ₹20
              },
            ],
            quantity: 2,
          },
        ],
      },
    };

    let capturedResponse = {};
    const mockRes = {
      status: (code) => {
        capturedResponse.statusCode = code;
        return mockRes;
      },
      json: (data) => {
        capturedResponse.body = data;
        return mockRes;
      },
    };

    await createOrder(mockReq, mockRes, (err) => {
      if (err) console.error("createOrder error:", err);
    });

    assert(capturedResponse.statusCode === 201, "Order placed successfully (HTTP 201)");
    const placedOrder = capturedResponse.body.order;
    assert(placedOrder !== undefined, "Order object created");

    // Server-side calculation verification:
    // Large Margherita = ₹200
    // Cheese Addon = ₹20
    // Unit price = 200 + 20 = ₹220
    // Quantity = 2 => Subtotal = ₹440
    // Tax (5%) = 440 * 0.05 = ₹22
    // Total = ₹462
    const firstItem = placedOrder.items[0];
    assert(firstItem.unitPrice === 220, `Unit price correctly verified as ₹220 (Large ₹200 + Cheese ₹20), got: ₹${firstItem.unitPrice}`);
    assert(placedOrder.subtotal === 440, `Subtotal calculated genuinely on server as ₹440, got: ₹${placedOrder.subtotal}`);
    assert(placedOrder.total === 462, `Total amount genuinely calculated on server as ₹462 (440 + 5% tax), got: ₹${placedOrder.total}`);
    assert(firstItem.selectedVariant?.name === largeVar.name, `Variant snapshot '${firstItem.selectedVariant?.name}' preserved in order`);
    assert(firstItem.selectedAddOns?.length === 1 && firstItem.selectedAddOns[0].name === "Cheese", "Add-on snapshot preserved in order");

    // TEST 4: Loyalty Points Rule 8 & Idempotent Crediting
    console.log("\n[TEST GROUP 4] Loyalty Points (Awarded Only on 'served' & Duplicate Protection)");
    assert(placedOrder.pointsEarned === 0, "Rule 8: 0 points credited upon order creation");
    assert(placedOrder.pointsCredited === false, "pointsCredited is false on initial order");

    // Intermediate status: preparing
    let updateReq = {
      params: { id: placedOrder._id.toString() },
      body: { status: "preparing" },
    };
    capturedResponse = {};
    // Allowed transitions: pending -> accepted -> preparing
    await updateOrderStatus({ ...updateReq, body: { status: "accepted" } }, mockRes, () => {});
    await updateOrderStatus({ ...updateReq, body: { status: "preparing" } }, mockRes, () => {});
    
    let orderAfterPrep = await Order.findById(placedOrder._id);
    assert(orderAfterPrep.status === "preparing", "Order successfully transitioned to 'preparing'");
    assert(orderAfterPrep.pointsCredited === false, "Points NOT credited on 'preparing' status");

    // Transition to 'ready'
    await updateOrderStatus({ ...updateReq, body: { status: "ready" } }, mockRes, () => {});
    let orderAfterReady = await Order.findById(placedOrder._id);
    assert(orderAfterReady.status === "ready", "Order transitioned to 'ready'");
    assert(orderAfterReady.pointsCredited === false, "Points NOT credited on 'ready' status");

    // Transition to 'served' -> Points MUST be awarded!
    await updateOrderStatus({ ...updateReq, body: { status: "served" } }, mockRes, () => {});
    let orderAfterServed = await Order.findById(placedOrder._id);
    assert(orderAfterServed.status === "served", "Order transitioned to 'served'");
    const expectedPoints = Math.floor(orderAfterServed.total / 10);
    assert(orderAfterServed.pointsEarned === expectedPoints, `Loyalty points correctly awarded (${expectedPoints} points based on 1 pt per ₹10 rule)`);

    // Verify Customer record received the points
    const customer = await User.findOne({ phone: mockCustomerPhone });
    assert(customer !== null, "Customer record exists");
    const pointsAfterFirstServe = customer.points;
    assert(pointsAfterFirstServe >= expectedPoints, `Customer received points in account (balance: ${pointsAfterFirstServe})`);

    // IDEMPOTENCY CHECK: Attempt duplicate update to 'served'
    await updateOrderStatus({ ...updateReq, body: { status: "served" } }, mockRes, () => {});
    const customerAfterDuplicate = await User.findOne({ phone: mockCustomerPhone });
    assert(customerAfterDuplicate.points === pointsAfterFirstServe, "Duplicate Protection: Re-triggering 'served' DOES NOT double credit points");

    const txCount = await CustomerPointsTransaction.countDocuments({ orderId: placedOrder._id, type: "earned" });
    assert(txCount === 1, `Exactly 1 transaction recorded in ledger for order (found: ${txCount})`);

    // TEST 5: Clean up test order
    await Order.findByIdAndDelete(placedOrder._id);
    await CustomerPointsTransaction.deleteMany({ orderId: placedOrder._id });
    await User.findByIdAndDelete(customer._id);
    console.log("\n  ✓ Test sandbox data cleaned up safely without affecting production records.");

    console.log("\n========================================================");
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("========================================================\n");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  }
};

runSuite();
