import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Bell,
  UtensilsCrossed,
  Receipt,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  ArrowRight,
  QrCode,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTable } from "../../context/TableContext";
import api from "../../services/api";

const Orders = () => {
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get("orderId");
  const { user } = useAuth();
  const { tableNumber } = useTable();

  const [activeOrder, setActiveOrder] = useState(null);
  const [pastOrders, setPastOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(() => {
    return orderIdFromUrl || localStorage.getItem("bb_last_order") || null;
  });
  const selectedOrderIdRef = useRef(selectedOrderId);
  selectedOrderIdRef.current = selectedOrderId;

  const [phoneLookup, setPhoneLookup] = useState(user?.phone || "");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchError, setSearchError] = useState("");

  const steps = [
    { key: "pending", label: "Received", icon: Clock },
    { key: "accepted", label: "Accepted", icon: CheckCircle2 },
    { key: "preparing", label: "In Kitchen", icon: ChefHat },
    { key: "ready", label: "Ready to Serve", icon: Bell },
    { key: "served", label: "Served", icon: UtensilsCrossed },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case "pending":
      case "placed":
        return 0;
      case "accepted":
        return 1;
      case "preparing":
        return 2;
      case "ready":
        return 3;
      case "served":
        return 4;
      case "cancelled":
        return -1;
      default:
        return 0;
    }
  };

  const handleSelectOrder = (order) => {
    const key = order._id || order.orderNumber;
    setActiveOrder(order);
    setSelectedOrderId(key);
    selectedOrderIdRef.current = key;
    localStorage.setItem("bb_last_order", key);
  };

  const fetchOrders = async (manualQuery = null) => {
    setSearchError("");
    try {
      const queryToUse = typeof manualQuery === "string" ? manualQuery.trim() : phoneLookup?.trim();

      // If user typed an order number or ID in the search box
      if (queryToUse && (queryToUse.toUpperCase().startsWith("BB-") || queryToUse.length === 24 || queryToUse.startsWith("#"))) {
        const cleanId = queryToUse.replace(/^#/, "");
        try {
          const directRes = await api.getOrderById(cleanId);
          if (directRes.success && directRes.order) {
            handleSelectOrder(directRes.order);
            return;
          }
        } catch (e) {
          // If direct track fails, fall through to orders list
        }
      }

      // Determine phone to query if not using customerId
      const phoneToUse = (queryToUse && /^\d+$/.test(queryToUse)) ? queryToUse : (user?.phone || undefined);

      let fetchedOrders = [];
      if (user || phoneToUse) {
        const res = await api.getMyOrders(phoneToUse);
        if (res.success && Array.isArray(res.orders)) {
          fetchedOrders = res.orders;
          setPastOrders(fetchedOrders);
        }
      }

      // Stable order resolution: strictly preserve the active selection
      const lockedTargetId = orderIdFromUrl || selectedOrderIdRef.current || localStorage.getItem("bb_last_order");

      let targetOrder = null;
      if (lockedTargetId) {
        targetOrder = fetchedOrders.find(
          (o) => o._id === lockedTargetId || o.orderNumber === lockedTargetId
        );
        if (!targetOrder) {
          try {
            const singleRes = await api.getOrderById(lockedTargetId);
            if (singleRes.success && singleRes.order) {
              targetOrder = singleRes.order;
            }
          } catch (e) {
            // ignore
          }
        }
      }

      // If no order is locked yet, choose the best candidate stably
      if (!targetOrder && fetchedOrders.length > 0) {
        // Prioritize order for current table if tableNumber is set
        if (tableNumber) {
          targetOrder = fetchedOrders.find(
            (o) => Number(o.tableNumber) === Number(tableNumber) && o.status !== "served" && o.status !== "cancelled"
          );
        }
        // Next prioritize any ongoing order
        if (!targetOrder) {
          targetOrder = fetchedOrders.find(
            (o) => o.status !== "served" && o.status !== "cancelled"
          );
        }
        // Fall back to most recent order
        if (!targetOrder) {
          targetOrder = fetchedOrders[0];
        }

        if (targetOrder) {
          const key = targetOrder._id || targetOrder.orderNumber;
          setSelectedOrderId(key);
          selectedOrderIdRef.current = key;
          localStorage.setItem("bb_last_order", key);
        }
      }

      if (targetOrder) {
        setActiveOrder(targetOrder);
        if (targetOrder.status === "served") {
          if (refreshUser) refreshUser();
          window.dispatchEvent(new Event("bb:points-updated"));
        }
      }
    } catch (err) {
      setSearchError(err.message || "Could not fetch orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), 4000);
    return () => clearInterval(interval);
  }, [orderIdFromUrl, user]);

  const currentStep = activeOrder ? getStepIndex(activeOrder.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C8752A] block">
            Kitchen Pipeline
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#24160F] mt-1">
            Order Status & History
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5545]">
            Real-time tracking of kitchen preparation and your past visits.
          </p>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchOrders();
          }}
          className="self-start sm:self-center px-4 py-2 bg-white hover:bg-[#FAF5EF] text-[#24160F] rounded-2xl border border-[#EAE0D5] text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          title="Refresh status"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#C8752A] ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Active Order Card */}
      {activeOrder ? (
        <div className="bg-white border border-[#EAE0D5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE0D5]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF5EF] border border-[#EAE0D5] flex items-center justify-center text-[#C8752A]">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono font-bold text-lg text-[#24160F] block">
                  Order #{activeOrder.orderNumber}
                </span>
                <span className="text-xs text-[#C8752A] font-semibold">
                  Table #{activeOrder.tableNumber} • Dine-in Service
                </span>
              </div>
            </div>

            <div className="self-start sm:self-auto">
              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                  activeOrder.status === "served"
                    ? "bg-[#ECFDF5] text-[#16A34A] border border-[#A7F3D0]"
                    : activeOrder.status === "cancelled"
                    ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]"
                    : "bg-[#FAF2E9] text-[#964B00] border border-[#E8D4C0]"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeOrder.status === "served"
                      ? "bg-[#16A34A]"
                      : activeOrder.status === "cancelled"
                      ? "bg-[#DC2626]"
                      : "bg-[#C8752A] animate-pulse"
                  }`}
                ></span>
                <span>{activeOrder.status}</span>
              </span>
            </div>
          </div>

          {/* Stepper Pipeline */}
          {activeOrder.status !== "cancelled" ? (
            <div className="py-4">
              <div className="relative flex items-center justify-between">
                {/* Connecting Track */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#FAF5EF] -z-0 rounded-full border border-[#EAE0D5]">
                  <div
                    className="h-full bg-[#C8752A] transition-all duration-500 rounded-full"
                    style={{
                      width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 100}%`,
                    }}
                  ></div>
                </div>

                {steps.map((step, idx) => {
                  const isPassed = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                          isCurrent
                            ? "bg-[#C8752A] text-white ring-4 ring-[#C8752A]/20 scale-110"
                            : isPassed
                            ? "bg-[#FAF2E9] text-[#964B00] border border-[#E8D4C0]"
                            : "bg-[#FAF5EF] text-[#9C8472] border border-[#EAE0D5]"
                        }`}
                      >
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs mt-2 font-medium tracking-tight ${
                          isCurrent
                            ? "font-bold text-[#C8752A]"
                            : isPassed
                            ? "text-[#24160F] font-semibold"
                            : "text-[#9C8472]"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl text-xs text-[#DC2626]">
              This order was cancelled. If you have questions, please speak to your server.
            </div>
          )}

          {/* Items Breakdown with Variants & Add-ons */}
          <div className="space-y-3 pt-2 border-t border-[#EAE0D5]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#765F4D]">
              Ordered Items
            </h4>
            <div className="divide-y divide-[#EAE0D5]">
              {activeOrder.items?.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-[#24160F]">
                      {item.quantity}x {item.name}
                    </span>
                    {item.selectedVariant && (
                      <span className="text-[11px] text-[#C8752A] ml-2 font-bold">
                        ({item.selectedVariant.name})
                      </span>
                    )}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <p className="text-[10px] text-[#6E5545] mt-0.5">
                        Add-ons: {item.selectedAddOns.map((a) => a.name).join(", ")}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-[10px] text-[#765F4D] italic">
                        Special: "{item.notes}"
                      </p>
                    )}
                  </div>
                  <span className="font-serif font-bold text-[#24160F]">
                    ₹{(Number(item.price || item.unitPrice || 0) * Number(item.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Loyalty Summary */}
          <div className="pt-3 border-t border-[#EAE0D5] space-y-2 text-xs">
            <div className="flex justify-between text-[#6E5545]">
              <span>Subtotal</span>
              <span>₹{Number(activeOrder.subtotal || 0).toFixed(2)}</span>
            </div>
            {Number(activeOrder.discount || 0) > 0 && (
              <div className="flex justify-between text-[#16A34A] font-bold">
                <span>Discount</span>
                <span>-₹{Number(activeOrder.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#6E5545]">
              <span>Tax (5%)</span>
              <span>₹{Number(activeOrder.tax || 0).toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-[#EAE0D5] flex justify-between text-base font-serif font-extrabold text-[#24160F]">
              <span>Total Bill</span>
              <span className="text-[#C8752A]">₹{Number(activeOrder.total || 0).toFixed(2)}</span>
            </div>

            {/* Loyalty Points Status Rule: Awarded only on served */}
            <div className="mt-3 p-3 rounded-2xl bg-[#FAF2E9] border border-[#E8D4C0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C8752A]" />
                <span className="text-xs font-semibold text-[#24160F]">Loyalty Points:</span>
              </div>
              <span
                className={`text-xs font-bold ${
                  activeOrder.pointsCredited || activeOrder.status === "served"
                    ? "text-[#16A34A]"
                    : "text-[#C8752A]"
                }`}
              >
                {activeOrder.pointsCredited || activeOrder.status === "served"
                  ? `+${activeOrder.pointsEarned ?? Math.floor(activeOrder.total / 10)} pts Credited!`
                  : `Pending (${Math.floor(activeOrder.total / 10)} pts upon service)`}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#EAE0D5] p-10 text-center text-[#24160F] shadow-sm">
          <Receipt className="w-10 h-10 text-[#C8752A] mx-auto mb-3" />
          <h3 className="font-serif font-bold text-lg text-[#24160F]">No Active Kitchen Order</h3>
          <p className="text-xs text-[#6E5545] mt-1 max-w-sm mx-auto">
            Place an order from the menu or lookup your previous visit history below.
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 mt-4 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white text-xs font-bold shadow-md shadow-[#C8752A]/20 transition-all"
          >
            <span>Explore Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Past Orders & Order Lookup Card */}
      <div className="bg-white rounded-3xl border border-[#EAE0D5] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#C8752A] flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span>Track by Order # or Mobile</span>
          </h3>
          <span className="text-[11px] text-[#765F4D] font-medium">{pastOrders.length} orders found</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchOrders(phoneLookup);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Enter Order # (e.g. BB-20261103-XXXX) or Phone..."
            value={phoneLookup}
            onChange={(e) => setPhoneLookup(e.target.value)}
            className="flex-1 text-xs px-4 py-3 bg-[#FAF5EF] border border-[#EAE0D5] text-[#24160F] rounded-2xl focus:outline-none focus:border-[#C8752A] placeholder-[#9C8472]"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white text-xs font-bold rounded-2xl shadow-xs transition-colors"
          >
            Track
          </button>
        </form>

        {searchError && (
          <p className="text-xs text-[#DC2626] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            <span>{searchError}</span>
          </p>
        )}

        {pastOrders.length > 0 ? (
          <div className="divide-y divide-[#EAE0D5] pt-2">
            {pastOrders.map((order) => {
              const isSelected =
                activeOrder &&
                (activeOrder._id === order._id || activeOrder.orderNumber === order.orderNumber);

              return (
                <div
                  key={order._id}
                  onClick={() => handleSelectOrder(order)}
                  className={`py-3.5 px-3 flex items-center justify-between text-xs cursor-pointer rounded-2xl transition-all ${
                    isSelected
                      ? "bg-[#FAF2E9] border border-[#E8D4C0] shadow-xs"
                      : "hover:bg-[#FAF5EF]"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#24160F]">
                        #{order.orderNumber}
                      </span>
                      <span className="text-[#C8752A] font-semibold">Table #{order.tableNumber}</span>
                      {isSelected && (
                        <span className="text-[9px] uppercase tracking-wider font-extrabold bg-[#C8752A] text-white px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6E5545] mt-0.5 line-clamp-1">
                      {order.items?.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                    </p>
                    <span className="text-[10px] text-[#8C786B]">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-[#24160F] block">
                      ₹{Number(order.total || 0).toFixed(2)}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold ${
                        order.status === "served" ? "text-[#16A34A]" : "text-[#C8752A]"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#765F4D] py-1 text-center">
            {user
              ? "No previous orders found for your account. Place an order to track live preparation!"
              : "Enter your Order # or mobile number to track live status and view past receipts."}
          </p>
        )}
      </div>
    </div>
  );
};

export default Orders;
