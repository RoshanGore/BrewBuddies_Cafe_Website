import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  Tag,
  Check,
  Sparkles,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  QrCode,
  User,
  Phone,
  ShieldCheck,
  Loader2,
  RotateCcw,
  X,
  Coffee,
  LogIn,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useCart } from "../../context/CartContext";
import { useTable } from "../../context/TableContext";
import { useAuth } from "../../context/AuthContext";
import { getCategoryImage } from "../../utils/categoryImages";
import api from "../../services/api";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cart,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    appliedOffer,
    applyOffer,
    removeOffer,
    appliedReward,
    removeReward,
    pointsToRedeem,
    applyPointsDiscount,
    removePointsDiscount,
    pointsDiscount,
  } = useCart();

  const { tableNumber, setTableNumber, tableToken, tableId, cafe } = useTable();
  const {
    user,
    setCustomerSession,
    updateCustomerPoints,
    signInWithGoogle,
    signInWithGoogleRedirect,
    loginWithEmail,
  } = useAuth();

  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  // Direct Loyalty Points States
  const [pointsInput, setPointsInput] = useState("");
  const [pointsError, setPointsError] = useState("");

  // Quick Login Modal States (Strictly Google & Email/Password)
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [modalEmail, setModalEmail] = useState("");
  const [modalPassword, setModalPassword] = useState("");
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  const userAvailablePoints = user ? (user.points ?? user.loyaltyPoints ?? 0) : 0;
  // Maximum points usable cannot exceed user balance and cannot exceed subtotal
  const maxRedeemablePoints = Math.min(userAvailablePoints, Math.floor(subtotal));

  // Synchronize customer details whenever user logs in
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
      setShowLoginModal(false);
    }
  }, [user]);

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");

    if (!promoCode.trim()) return;

    try {
      const res = await api.validateOffer({
        code: promoCode,
        subtotal,
        cafeId: cafe?.id || cafe?._id,
      });

      if (res.success) {
        applyOffer({
          code: res.code,
          title: res.title,
          discountAmount: res.discountAmount,
        });
        setPromoSuccess(res.message);
        setPromoCode("");
      }
    } catch (err) {
      setPromoError(err.message);
    }
  };

  const handleApplyPoints = (e) => {
    e.preventDefault();
    setPointsError("");
    const entered = parseInt(pointsInput, 10);

    if (isNaN(entered) || entered <= 0) {
      setPointsError("Please enter a valid number of points to redeem.");
      return;
    }

    if (entered > userAvailablePoints) {
      setPointsError(`You only have ${userAvailablePoints} points available.`);
      return;
    }

    if (entered > Math.floor(subtotal)) {
      setPointsError(`Maximum ${Math.floor(subtotal)} points can be applied for this subtotal.`);
      return;
    }

    applyPointsDiscount(entered);
    setPointsInput("");
  };

  const handleModalGoogleSignIn = async () => {
    try {
      setModalLoading(true);
      setModalError("");
      const res = await signInWithGoogle("/cart");
      if (res?.redirecting) {
        return;
      }
      setShowLoginModal(false);
    } catch (err) {
      setModalError(err.message || "Failed to sign in with Google. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalGoogleRedirectSignIn = async () => {
    try {
      setModalLoading(true);
      setModalError("");
      await signInWithGoogleRedirect("/cart");
    } catch (err) {
      setModalError(err.message || "Failed to redirect to Google sign-in.");
      setModalLoading(false);
    }
  };

  const handleModalEmailSignIn = async (e) => {
    e.preventDefault();
    const cleanEmail = modalEmail.trim();
    if (!cleanEmail || !modalPassword) {
      setModalError("Please provide your email address and password");
      return;
    }

    try {
      setModalLoading(true);
      setModalError("");
      setModalSuccess("");
      const res = await loginWithEmail(cleanEmail, modalPassword, "/cart");
      if (res.user) {
        setShowLoginModal(false);
      }
    } catch (err) {
      console.error("[Cart Modal] Email login error:", err);
      setModalError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError("");

    // Authentication Guard: Placing an order requires an active customer login
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!tableNumber) {
      setOrderError("Please select or specify your table number before placing order.");
      return;
    }

    const orderName = (customerName || user.name || "Dine-in Customer").trim();
    const orderPhone = (customerPhone || user.phone || "").trim();

    if (!orderName) {
      setOrderError("Please confirm your name for table service.");
      return;
    }

    if (cart.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customerName: orderName,
        customerPhone: orderPhone,
        tableNumber: Number(tableNumber),
        tableToken: tableToken || undefined,
        tableId: tableId || undefined,
        items: cart.map((item) => ({
          productId: item.product?._id || item.product?.id,
          product: item.product?._id || item.product?.id,
          name: item.name,
          price: item.unitPrice || item.price,
          quantity: item.quantity,
          selectedVariant: item.selectedVariant || null,
          selectedAddOns: item.selectedAddOns || [],
          notes: item.notes || "",
        })),
        appliedOffer: appliedOffer
          ? { code: appliedOffer.code, discount: appliedOffer.discountAmount || discountAmount }
          : null,
        appliedReward: appliedReward
          ? {
              title: appliedReward.title,
              pointsRedeemed: appliedReward.pointsCost,
              discount: discountAmount,
            }
          : null,
        pointsToRedeem: pointsToRedeem > 0 ? pointsToRedeem : 0,
        discountAmount,
      };

      const res = await api.createOrder(orderPayload);

      if (res.success && res.order) {
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        const newPoints = res.loyalty?.totalPoints ?? (user.points - (pointsToRedeem || 0));
        updateCustomerPoints(newPoints);

        if (res.order.customer || res.order.customerId) {
          setCustomerSession(localStorage.getItem("bb_token") || "", {
            ...user,
            id: res.order.customer || res.order.customerId,
            name: orderName,
            phone: orderPhone,
            loyaltyPoints: newPoints,
            points: newPoints,
            role: "customer",
          });
        }

        localStorage.setItem("bb_last_order", res.order._id || res.order.orderNumber);
        clearCart();
        navigate(`/orders?orderId=${res.order._id || res.order.orderNumber}`);
      }
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-[#EAE0D5] p-10 sm:p-14 text-center shadow-sm text-[#24160F]">
          <div className="w-16 h-16 bg-[#FAF2E9] text-[#C8752A] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#E8D4C0] shadow-xs">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-[#24160F]">Your Cart is Empty</h2>
          <p className="text-xs sm:text-sm text-[#6E5545] mt-2 max-w-sm mx-auto leading-relaxed">
            Explore our handcrafted coffees, kadak teas, stone-baked pizzas, and crispy snacks!
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 mt-6 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white font-bold text-xs transition-transform active:scale-95 shadow-md shadow-[#C8752A]/20"
          >
            <span>Explore Menu</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#C8752A] block">
          Review & Checkout
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#24160F] mt-1">
          Dine-In Cart
        </h1>
        <p className="text-xs sm:text-sm text-[#6E5545]">
          Verify item selections, sizes, add-ons, and table service details.
        </p>
      </div>

      {/* Table Context Banner */}
      <div className="bg-white rounded-3xl border border-[#EAE0D5] p-4 sm:p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF2E9] border border-[#E8D4C0] flex items-center justify-center text-[#C8752A]">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#765F4D] block">
              Dine-In Table
            </span>
            <span className="text-sm font-bold text-[#24160F]">
              {tableNumber ? `Table #${tableNumber}` : "Table Not Selected"}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            const num = prompt("Enter your Dine-in Table Number (1-50):", tableNumber || "");
            if (num && !isNaN(num)) {
              setTableNumber(Number(num));
            }
          }}
          className="text-xs font-bold text-[#C8752A] hover:underline px-3 py-1.5 rounded-xl hover:bg-[#FAF5EF]"
        >
          {tableNumber ? "Change Table" : "Select Table"}
        </button>
      </div>

      {/* Cart Items List */}
      <div className="bg-white rounded-3xl border border-[#EAE0D5] divide-y divide-[#EAE0D5] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 flex items-center justify-between bg-[#FAF5EF]/50">
          <h2 className="text-sm font-bold text-[#24160F]">Selected Items ({cart.length})</h2>
          <button
            onClick={clearCart}
            className="text-xs text-[#DC2626] hover:underline font-semibold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>

        {cart.map((item, index) => (
          <div key={item.key || `${item.product?._id || item.name}-${index}`} className="p-4 sm:p-5 flex gap-3.5 sm:gap-4 items-center">
            {/* Thumbnail */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#FAF5EF] border border-[#EAE0D5] shrink-0">
              <img
                src={getCategoryImage(item.product?.category?.name || item.product?.category, item.product?.image, item.name)}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-[#24160F] truncate">
                  {item.name}
                </h3>
                <span className="text-xs sm:text-sm font-bold text-[#24160F] shrink-0">
                  ₹{((item.unitPrice || item.price) * item.quantity).toFixed(2)}
                </span>
              </div>

              {item.selectedVariant && (
                <p className="text-[11px] text-[#765F4D] mt-0.5">
                  Size: <span className="font-semibold text-[#24160F]">{item.selectedVariant.name}</span>
                </p>
              )}

              {item.selectedAddOns?.length > 0 && (
                <p className="text-[11px] text-[#765F4D]">
                  Add-ons:{" "}
                  <span className="font-medium text-[#24160F]">
                    {item.selectedAddOns.map((a) => a.name).join(", ")}
                  </span>
                </p>
              )}

              {item.notes && (
                <p className="text-[11px] text-[#C8752A] italic mt-0.5 font-medium truncate">
                  "{item.notes}"
                </p>
              )}

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center border border-[#EAE0D5] rounded-xl bg-[#FAF5EF] p-0.5">
                  <button
                    onClick={() => updateQuantity(index, -1)}
                    className="p-1 hover:bg-white rounded-lg text-[#24160F] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-[#24160F]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(index, 1)}
                    className="p-1 hover:bg-white rounded-lg text-[#24160F] transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(index)}
                  className="p-1.5 text-[#9C8472] hover:text-[#DC2626] transition-colors"
                  aria-label="Remove item"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code & Rewards Application */}
      <div className="bg-white rounded-3xl border border-[#EAE0D5] p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#C8752A]" />
            <h3 className="text-xs font-bold text-[#24160F] uppercase tracking-wider">
              Coupons & Rewards
            </h3>
          </div>
          <Link to="/offers" className="text-xs font-bold text-[#C8752A] hover:underline">
            View Offers
          </Link>
        </div>

        {appliedOffer ? (
          <div className="flex items-center justify-between bg-[#FAF5EF] border border-[#EAE0D5] p-3.5 rounded-2xl text-xs">
            <div>
              <span className="font-bold text-[#24160F] font-mono">{appliedOffer.code}</span>
              <p className="text-[11px] text-[#16A34A] mt-0.5 font-medium">
                {appliedOffer.title || "Coupon Applied"} • Saved ₹{appliedOffer.discountAmount?.toFixed(2) || discountAmount.toFixed(2)}
              </p>
            </div>
            <button
              onClick={removeOffer}
              className="text-xs font-bold text-[#DC2626] hover:underline"
            >
              Remove
            </button>
          </div>
        ) : appliedReward ? (
          <div className="flex items-center justify-between bg-[#FAF5EF] border border-[#EAE0D5] p-3.5 rounded-2xl text-xs">
            <div>
              <span className="font-bold text-[#24160F]">{appliedReward.title}</span>
              <p className="text-[11px] text-[#16A34A] mt-0.5 font-medium">
                Redeemed {appliedReward.pointsCost} loyalty points
              </p>
            </div>
            <button
              onClick={removeReward}
              className="text-xs font-bold text-[#DC2626] hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyPromo} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. WELCOME50, CHAAI20"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 uppercase font-mono text-xs px-4 py-3 bg-[#FAF5EF] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#C8752A] text-[#24160F] placeholder-[#9C8472]"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white rounded-2xl text-xs font-bold transition-colors shadow-xs"
            >
              Apply
            </button>
          </form>
        )}

        {promoError && (
          <p className="text-xs text-[#DC2626] flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{promoError}</span>
          </p>
        )}
        {promoSuccess && (
          <p className="text-xs text-[#16A34A] flex items-center gap-1.5 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>{promoSuccess}</span>
          </p>
        )}
      </div>

      {/* Direct Loyalty Points Redemption Box */}
      {user && (
        <div className="bg-white rounded-3xl border border-[#EAE0D5] p-5 sm:p-6 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C8752A]" />
              <h3 className="text-xs font-bold text-[#24160F] uppercase tracking-wider">
                Redeem Loyalty Points for Discount
              </h3>
            </div>
            <span className="text-[11px] font-bold text-[#C8752A] bg-[#FAF2E9] border border-[#E8D4C0] px-3 py-1 rounded-full">
              Balance: {userAvailablePoints} pts
            </span>
          </div>

          <div className="text-[11px] text-[#765F4D] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C8752A]" />
            <span>
              <strong>1 Point = ₹1 Instant Discount.</strong> Earn 1 point for every ₹10 spent!
            </span>
          </div>

          {pointsToRedeem > 0 ? (
            <div className="flex items-center justify-between bg-[#ECFDF5] border border-[#A7F3D0] p-3.5 rounded-2xl text-xs">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#16A34A]" />
                <div>
                  <span className="font-bold text-[#065F46]">
                    {pointsToRedeem} Points Applied (-₹{pointsDiscount.toFixed(2)})
                  </span>
                  <p className="text-[11px] text-[#047857]">
                    ₹{pointsDiscount.toFixed(2)} deducted directly from your order total!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removePointsDiscount}
                className="text-xs font-bold text-[#DC2626] hover:underline"
              >
                Remove
              </button>
            </div>
          ) : userAvailablePoints > 0 ? (
            <form onSubmit={handleApplyPoints} className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={maxRedeemablePoints}
                  placeholder={`e.g. 50 (Max ${maxRedeemablePoints} pts)`}
                  value={pointsInput}
                  onChange={(e) => setPointsInput(e.target.value)}
                  className="w-44 text-xs px-3.5 py-2.5 bg-[#FAF5EF] border border-[#EAE0D5] rounded-xl focus:outline-none focus:border-[#C8752A] text-[#24160F] placeholder-[#9C8472]"
                />
                <button
                  type="submit"
                  disabled={!pointsInput || Number(pointsInput) <= 0}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  Apply Points
                </button>
                {maxRedeemablePoints > 0 && (
                  <button
                    type="button"
                    onClick={() => applyPointsDiscount(maxRedeemablePoints)}
                    className="px-3.5 py-2.5 bg-[#FAF5EF] hover:bg-[#F2ECE4] border border-[#EAE0D5] text-[#24160F] rounded-xl text-xs font-semibold transition-all"
                  >
                    Redeem All ({maxRedeemablePoints} pts = ₹{maxRedeemablePoints} off)
                  </button>
                )}
              </div>
              {pointsError && (
                <p className="text-xs text-[#DC2626] flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pointsError}</span>
                </p>
              )}
            </form>
          ) : (
            <p className="text-xs text-[#765F4D] italic">
              You currently have 0 loyalty points. Complete this order to start earning points (1 point per ₹10 spent)!
            </p>
          )}
        </div>
      )}

      {/* Customer Account / Login Guard Section */}
      {!user ? (
        <div className="bg-gradient-to-br from-[#FAF2E9] to-[#F5EBDD] border-2 border-dashed border-[#C8752A] rounded-3xl p-5 sm:p-6 text-[#24160F] space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#C8752A] text-white flex items-center justify-center shrink-0 shadow-md">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#24160F]">
                Login Required to Place Order
              </h3>
              <p className="text-xs text-[#6E5545] mt-1 leading-relaxed">
                You can freely browse the cafe menu and add items to your cart! To place your dine-in table order and earn loyalty points, please log into your account.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white text-xs font-bold transition-all shadow-md shadow-[#C8752A]/20 flex items-center gap-2 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Login via Google or Email</span>
            </button>
            <Link
              to="/login?redirect=/cart"
              className="px-4 py-3 rounded-2xl bg-white hover:bg-[#F3ECE1] border border-[#EAE0D5] text-[#24160F] text-xs font-bold transition-all"
            >
              Go to Login Page
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#EAE0D5] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#16A34A]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#16A34A] uppercase tracking-wider">
                  Verified Dine-In Account
                </h3>
                <p className="text-xs font-bold text-[#24160F] mt-0.5">
                  Logged in as {user.name || "Customer"} {user.phone ? `(${user.phone})` : user.email ? `(${user.email})` : ""}
                </p>
              </div>
            </div>

            <Link
              to="/login?redirect=/cart"
              className="text-[11px] font-bold text-[#C8752A] hover:underline"
            >
              Switch Account
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 border-t border-[#EAE0D5]">
            <div>
              <label className="block text-[11px] font-semibold text-[#5A4031] mb-1">
                Your Full Name <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Rajesh Kumar"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs px-4 py-3 bg-[#FAF5EF] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#C8752A] text-[#24160F] placeholder-[#9C8472]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#5A4031] mb-1">
                Mobile Number <span className="text-[#9C8472] font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210 (Optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                maxLength={10}
                className="w-full text-xs px-4 py-3 bg-[#FAF5EF] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#C8752A] text-[#24160F] placeholder-[#9C8472]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="bg-white rounded-3xl border border-[#EAE0D5] p-5 sm:p-6 shadow-sm space-y-3 text-xs text-[#24160F]">
        <div className="flex justify-between text-[#6E5545]">
          <span>Subtotal</span>
          <span className="font-semibold text-[#24160F]">₹{subtotal.toFixed(2)}</span>
        </div>

        {/* Promo discount */}
        {appliedOffer && (
          <div className="flex justify-between text-[#16A34A] font-bold">
            <span>Special Offer ({appliedOffer.code})</span>
            <span>-₹{(appliedOffer.discountAmount || 0).toFixed(2)}</span>
          </div>
        )}

        {/* Reward discount */}
        {appliedReward && (
          <div className="flex justify-between text-[#16A34A] font-bold">
            <span>Reward Discount ({appliedReward.title})</span>
            <span>-₹{(appliedReward.discountValue || 0).toFixed(2)}</span>
          </div>
        )}

        {/* Direct Points Discount */}
        {pointsDiscount > 0 && (
          <div className="flex justify-between text-[#16A34A] font-bold">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Points Discount ({pointsToRedeem} pts)</span>
            </span>
            <span>-₹{pointsDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-[#6E5545]">
          <span>GST / Cafe Tax (5%)</span>
          <span className="font-semibold text-[#24160F]">₹{taxAmount.toFixed(2)}</span>
        </div>
        <div className="pt-3 border-t border-[#EAE0D5] flex justify-between text-base sm:text-lg font-bold text-[#24160F] font-serif">
          <span>Total Payable</span>
          <span className="text-[#C8752A]">₹{totalAmount.toFixed(2)}</span>
        </div>

        {/* Points Earned on this order: 1 point on 10 rs */}
        <div className="pt-2 text-[11px] text-[#765F4D] bg-[#FAF2E9] p-3 rounded-2xl flex items-center justify-between border border-[#E8D4C0]">
          <span className="flex items-center gap-1.5 font-medium text-[#964B00]">
            <Sparkles className="w-3.5 h-3.5 text-[#C8752A]" />
            <span>Points Earned on this order (1 pt per ₹10):</span>
          </span>
          <span className="font-bold text-[#C8752A] text-xs">
            +{Math.floor(totalAmount / 10)} Points
          </span>
        </div>
      </div>

      {orderError && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl text-xs text-[#DC2626] flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      {/* Place Order CTA */}
      {!user ? (
        <button
          type="button"
          onClick={() => setShowLoginModal(true)}
          className="w-full py-4 px-6 bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white rounded-2xl font-bold text-sm sm:text-base shadow-md shadow-[#C8752A]/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <User className="w-4 h-4 text-white" />
          <span>Sign In to Place Order • ₹{totalAmount.toFixed(2)}</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      ) : (
        <button
          onClick={handlePlaceOrder}
          disabled={submitting}
          className="w-full py-4 px-6 bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] disabled:opacity-50 text-white rounded-2xl font-bold text-sm sm:text-base shadow-md shadow-[#C8752A]/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {submitting ? (
            <span>Sending order to kitchen...</span>
          ) : (
            <>
              <span>Confirm & Send to Kitchen • ₹{totalAmount.toFixed(2)}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </>
          )}
        </button>
      )}

      {/* Quick Login Modal (Google + Real SMS OTP) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-3xl border border-[#EAE0D5] p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 space-y-5">
            {/* Invisible container for modal reCAPTCHA */}
            <div id="cart-recaptcha-container"></div>

            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#FAF7F0] text-[#553B2D]/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-[#EAE0D5] flex items-center justify-center mx-auto text-[#A66B45] shadow-xs">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-[#553B2D]">
                Sign In to Place Order
              </h3>
              <p className="text-xs text-[#553B2D]/70">
                Verify your account with real SMS OTP or Google to complete your dine-in order.
              </p>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="font-medium">{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-medium">{modalSuccess}</span>
              </div>
            )}

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={handleModalGoogleSignIn}
              disabled={modalLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-neutral-50 text-[#553B2D] border border-[#EAE0D5] font-semibold text-xs transition-all flex items-center justify-center gap-3 shadow-xs hover:shadow-sm disabled:opacity-50"
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
              <span className="font-bold">Continue with Google</span>
            </button>

            <div className="text-center -mt-2">
              <button
                type="button"
                onClick={handleModalGoogleRedirectSignIn}
                disabled={modalLoading}
                className="text-[11px] text-[#A66B45] hover:text-[#8F5B39] hover:underline font-medium transition-colors cursor-pointer"
              >
                Pop-up blocked? Use direct Google sign-in
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 text-xs text-[#553B2D]/50">
              <div className="h-px flex-1 bg-[#EAE0D5]" />
              <span>or sign in with email</span>
              <div className="h-px flex-1 bg-[#EAE0D5]" />
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleModalEmailSignIn} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#553B2D] mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={modalEmail}
                    onChange={(e) => setModalEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF7F0] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#A66B45] text-[#553B2D] placeholder-[#553B2D]/40"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-[#553B2D]">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Link
                    to="/login?redirect=/cart&mode=forgot"
                    className="text-[10px] text-[#A66B45] hover:underline font-semibold cursor-pointer"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showModalPassword ? "text" : "password"}
                    value={modalPassword}
                    onChange={(e) => setModalPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF7F0] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#A66B45] text-[#553B2D] placeholder-[#553B2D]/40"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={modalLoading || !modalEmail.trim() || !modalPassword}
                className="w-full py-3 rounded-2xl bg-[#A66B45] hover:bg-[#8F5B39] text-white font-bold text-xs transition-all shadow-md shadow-[#A66B45]/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {modalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In & Continue Order</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1 flex items-center justify-center gap-3 text-[11px] text-[#553B2D]/70 font-medium">
                <Link
                  to="/login?redirect=/cart&mode=register"
                  className="text-[#A66B45] hover:underline font-semibold cursor-pointer"
                >
                  Create an account →
                </Link>
                <span>•</span>
                <Link
                  to="/login?redirect=/cart"
                  className="hover:underline cursor-pointer"
                >
                  Full Login Page
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
