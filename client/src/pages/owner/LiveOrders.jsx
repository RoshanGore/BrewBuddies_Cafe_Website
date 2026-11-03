import React, { useEffect, useState } from "react";
import {
  Bell,
  Clock,
  CheckCircle2,
  ChefHat,
  UtensilsCrossed,
  XCircle,
  RefreshCw,
  Phone,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import OwnerHeader from "../../components/owner/OwnerHeader";
import api from "../../services/api";

const LiveOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.getAllOrders();
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.warn("[LiveOrders] Error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      await api.updateOrderStatus(orderId, { status: nextStatus });
      fetchOrders();
      window.dispatchEvent(new Event("bb:orders-updated"));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "pending") return order.status === "pending" || order.status === "placed";
    return order.status === activeFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
      case "placed":
        return "bg-[#FFFDFC] text-[#D99A32] border-[#D99A32] animate-pulse";
      case "accepted":
        return "bg-[#EFE0CB] text-[#C8752A] border-[#DCC9B3]";
      case "preparing":
        return "bg-[#FFFDFC] text-[#D99A32] border-[#D99A32]";
      case "ready":
        return "bg-[#FFFDFC] text-[#E5A04B] border-[#E5A04B]";
      case "served":
        return "bg-[#FFFDFC] text-[#4F8061] border-[#4F8061]";
      case "cancelled":
        return "bg-[#FFFDFC] text-[#B8543E] border-[#B8543E]";
      default:
        return "bg-[#EFE0CB] text-[#765F4D] border-[#DCC9B3]";
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <OwnerHeader
        title="Live Dine-In Orders"
        subtitle="Manage kitchen queue and serve tables seamlessly"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchOrders();
            }}
            className="px-3.5 py-2 bg-[#FFFDFC] hover:bg-[#EFE0CB] text-[#24160F] border border-[#DCC9B3] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C8752A] ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh Queue</span>
          </button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#DCC9B3]/60 no-scrollbar">
        {[
          { key: "all", label: "All Orders", count: orders.length },
          { key: "pending", label: "Pending", count: orders.filter((o) => o.status === "pending" || o.status === "placed").length },
          { key: "accepted", label: "Accepted", count: orders.filter((o) => o.status === "accepted").length },
          { key: "preparing", label: "Preparing", count: orders.filter((o) => o.status === "preparing").length },
          { key: "ready", label: "Ready", count: orders.filter((o) => o.status === "ready").length },
          { key: "served", label: "Served", count: orders.filter((o) => o.status === "served").length },
          { key: "cancelled", label: "Cancelled", count: orders.filter((o) => o.status === "cancelled").length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === tab.key
                ? "bg-[#C8752A] text-white shadow-caramel-glow font-bold"
                : "bg-[#FFFDFC] text-[#765F4D] hover:bg-[#EFE0CB] border border-[#DCC9B3]"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeFilter === tab.key ? "bg-[#3B1F0F] text-white" : "bg-[#EFE0CB] text-[#765F4D]"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-[#EFE0CB] rounded-3xl animate-pulse border border-[#DCC9B3]"></div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] p-12 text-center text-[#765F4D] shadow-cozy">
          <div className="w-12 h-12 rounded-2xl bg-[#FBF6EE] border border-[#DCC9B3] flex items-center justify-center mx-auto mb-3 text-[#C8752A]">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <p className="text-sm font-serif font-bold text-[#24160F]">No orders in this category</p>
          <p className="text-xs text-[#765F4D] mt-0.5">Orders placed by customers at tables will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] shadow-cozy hover:shadow-cozy-md transition-all p-5 flex flex-col justify-between"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-[#EAE0D5] pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] text-[#C8752A] font-extrabold text-sm flex flex-col items-center justify-center border border-[#EAE0D5] shadow-xs shrink-0">
                      <span className="text-[9px] uppercase font-bold text-[#8C7A6B] leading-none">
                        Table
                      </span>
                      <span className="text-base font-serif font-bold">#{order.tableNumber}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[#24160F]">
                          #{order.orderNumber}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#24160F] mt-0.5">
                        {order.customerName}
                      </p>
                      <p className="text-[10px] text-[#8C7A6B] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[#C8752A]" />
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-2 py-1 text-xs">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-bold text-[#24160F] bg-[#FAF7F2] border border-[#EAE0D5] px-1.5 py-0.5 rounded-md text-[11px] mr-1.5">
                          {item.quantity}x
                        </span>
                        <span className="text-[#24160F] font-medium">{item.name}</span>
                        {item.selectedVariant && (
                          <span className="font-bold text-[#C8752A] text-[11px] ml-1">
                            ({item.selectedVariant.name})
                          </span>
                        )}
                        {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                          <span className="text-[10px] text-[#8C7A6B] block mt-0.5">
                            + {item.selectedAddOns.map((a) => a.name).join(", ")}
                          </span>
                        )}
                        {item.notes && (
                          <p className="text-[11px] text-[#8B4A1D] bg-[#FDF9F3] border border-[#EAE0D5] px-2 py-0.5 rounded-md mt-1 italic flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 shrink-0 text-[#C8752A]" />
                            <span>{item.notes}</span>
                          </p>
                        )}
                      </div>
                      <span className="font-semibold text-[#6B5A4E] whitespace-nowrap">
                        ₹{Number((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer with Price & Actions */}
              <div className="pt-4 border-t border-[#EAE0D5] mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B5A4E] font-medium">Order Total</span>
                  <span className="text-base font-bold text-[#24160F] font-serif">
                    ₹{Number(order.total ?? order.totalAmount ?? 0).toFixed(2)}
                  </span>
                </div>

                {/* Workflow Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {(order.status === "pending" || order.status === "placed") && (
                    <button
                      onClick={() => handleStatusChange(order._id, "accepted")}
                      className="col-span-2 py-2.5 bg-[#C8752A] hover:bg-[#B36420] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-caramel-glow transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept Order</span>
                    </button>
                  )}

                  {order.status === "accepted" && (
                    <button
                      onClick={() => handleStatusChange(order._id, "preparing")}
                      className="col-span-2 py-2.5 bg-[#C8752A] hover:bg-[#B36420] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-caramel-glow transition-colors"
                    >
                      <ChefHat className="w-3.5 h-3.5 text-white" />
                      <span>Start Preparing</span>
                    </button>
                  )}

                  {order.status === "preparing" && (
                    <button
                      onClick={() => handleStatusChange(order._id, "ready")}
                      className="col-span-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Bell className="w-3.5 h-3.5 text-white" />
                      <span>Mark Ready to Serve</span>
                    </button>
                  )}

                  {order.status === "ready" && (
                    <button
                      onClick={() => handleStatusChange(order._id, "served")}
                      className="col-span-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5 text-white" />
                      <span>Mark Order Served</span>
                    </button>
                  )}

                  {order.status !== "served" && order.status !== "cancelled" && (
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to cancel this order?")) {
                          handleStatusChange(order._id, "cancelled");
                        }
                      }}
                      className="col-span-2 py-1.5 text-[#8C7A6B] hover:text-red-600 hover:bg-red-50 rounded-xl text-[11px] font-medium transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveOrders;
