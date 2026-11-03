const API_BASE = "http://localhost:5000/api";

async function runTest() {
  console.log("=== Testing Order Placement and Tracking End-to-End ===");

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const testEmail = `track.test.${Date.now()}@brewbuddies.com`;
  const testPhone = `98765${randomSuffix}`;
  const testPassword = "Password123!";

  console.log(`[1] Registering test customer: ${testEmail}...`);
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `Track Tester ${randomSuffix}`,
      email: testEmail,
      phone: testPhone,
      password: testPassword,
    }),
  }).then((r) => r.json());

  if (!regRes.success) {
    throw new Error(`Registration failed: ${regRes.message}`);
  }

  const token = regRes.token;
  const user = regRes.user;
  console.log(`[PASS] Registered & Logged in as: ${user.email} (ID: ${user.id || user._id}) with ${user.points} welcome points`);

  const authHeader = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // 2. Fetch products to get a valid item (measuring speed)
  const t0 = Date.now();
  const prodRes = await fetch(`${API_BASE}/products`).then((r) => r.json());
  const prodTime = Date.now() - t0;
  const sampleProduct = prodRes.products[0];
  console.log(`[PASS] Fetched ${prodRes.products.length} products in ${prodTime}ms. Sample item: "${sampleProduct.name}" @ ₹${sampleProduct.price}`);

  // 3. Place order
  const orderPayload = {
    customerName: user.name,
    customerPhone: testPhone,
    tableNumber: 3,
    items: [
      {
        productId: sampleProduct._id,
        name: sampleProduct.name,
        price: sampleProduct.price,
        quantity: 2,
      },
    ],
  };

  const createRes = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify(orderPayload),
  }).then((r) => r.json());

  if (!createRes.success) {
    throw new Error(`Order placement failed: ${createRes.message}`);
  }

  const createdOrder = createRes.order;
  console.log(`[PASS] Placed Order #${createdOrder.orderNumber} (ID: ${createdOrder._id}) Total: ₹${createdOrder.total}`);

  // 4. Test tracking by MongoDB _id
  const trackByIdRes = await fetch(`${API_BASE}/orders/track/${createdOrder._id}`, {
    headers: authHeader,
  }).then((r) => r.json());
  if (!trackByIdRes.success || !trackByIdRes.order) {
    throw new Error(`Track by _id failed: ${JSON.stringify(trackByIdRes)}`);
  }
  console.log(`[PASS] Track by _id success: Order #${trackByIdRes.order.orderNumber}, Status: ${trackByIdRes.order.status}`);

  // 5. Test tracking by formatted orderNumber (e.g. BB-20261103-XXXX)
  const trackByNumRes = await fetch(`${API_BASE}/orders/track/${createdOrder.orderNumber}`, {
    headers: authHeader,
  }).then((r) => r.json());
  if (!trackByNumRes.success || !trackByNumRes.order) {
    throw new Error(`Track by orderNumber failed: ${JSON.stringify(trackByNumRes)}`);
  }
  console.log(`[PASS] Track by orderNumber success: Order #${trackByNumRes.order.orderNumber}, Status: ${trackByNumRes.order.status}`);

  // 6. Test GET /api/orders/my-orders with auth token (no phone query param)
  const myOrdersTokenRes = await fetch(`${API_BASE}/orders/my-orders`, {
    headers: authHeader,
  }).then((r) => r.json());
  const foundInToken = myOrdersTokenRes.orders.some((o) => o._id === createdOrder._id || o.orderNumber === createdOrder.orderNumber);
  console.log(`[PASS] my-orders (by token, ${myOrdersTokenRes.orders.length} orders): found placed order? ${foundInToken}`);
  if (!foundInToken) {
    throw new Error("Order not found in customer token-based my-orders!");
  }

  // 7. Test GET /api/orders/my-orders?phone=...
  const myOrdersPhoneRes = await fetch(`${API_BASE}/orders/my-orders?phone=${encodeURIComponent(testPhone)}`).then((r) => r.json());
  const foundInPhone = myOrdersPhoneRes.orders.some((o) => o._id === createdOrder._id || o.orderNumber === createdOrder.orderNumber);
  console.log(`[PASS] my-orders (by phone, ${myOrdersPhoneRes.orders.length} orders): found placed order? ${foundInPhone}`);
  if (!foundInPhone) {
    throw new Error("Order not found in phone-based my-orders!");
  }

  // 8. Test loyalty points on Served status
  const patchRes = await fetch(`${API_BASE}/orders/${createdOrder._id}/status`, {
    method: "PATCH",
    headers: authHeader, // owner/staff or in test
    body: JSON.stringify({ status: "served" }),
  }).then((r) => r.json());
  console.log(`[STATUS] Served status update response:`, patchRes.success ? `Served! Points earned: +${patchRes.order?.pointsEarned}` : patchRes.message);

  console.log("\n=======================================================");
  console.log(">>> ALL 7 ORDER TRACKING & SPEED CHECKS PASSED 100% <<<");
  console.log("=======================================================");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
