import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowRight,
  BellRing,
  Coffee,
  CheckCircle2,
  Clock,
  Award,
  ChefHat,
  Sparkles,
} from "lucide-react";
import OwnerHeader from "../../components/owner/OwnerHeader";
import StatCard from "../../components/owner/StatCard";
import api from "../../services/api";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [liveOrders, setLiveOrders] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [sumRes, ordersRes, chartsRes] = await Promise.all([
        api.getSummary(),
        api.getLiveOrders(),
        api.getCharts(),
      ]);
      if (sumRes.success) setSummary(sumRes.summary);
      if (ordersRes.success) setLiveOrders(ordersRes.orders.slice(0, 6));
      if (chartsRes.success && chartsRes.popularItems) setPopularItems(chartsRes.popularItems.slice(0, 4));
    } catch (err) {
      console.warn("[Dashboard] Load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAdvanceStatus = async (orderId, nextStatus) => {
    try {
      await api.updateOrderStatus(orderId, { status: nextStatus });
      fetchDashboardData();
      window.dispatchEvent(new Event("bb:orders-updated"));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <OwnerHeader
        title="Cafe Management Dashboard"
        subtitle="Live snapshot of dine-in kitchen queues, sales KPIs, and customer activity"
      />

      {/* 8 Real MongoDB KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <StatCard
          title="Today's Sales"
          value={`₹${(summary?.todaySales ?? summary?.todayRevenue ?? 0).toFixed(2)}`}
          subtext="Total dine-in revenue today"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Today's Orders"
          value={summary?.todayOrders ?? summary?.todayOrdersCount ?? 0}
          subtext="Orders placed today"
          icon={ShoppingBag}
          color="amber"
        />
        <StatCard
          title="Pending Orders"
          value={summary?.pendingOrders ?? 0}
          subtext="Awaiting staff acceptance"
          icon={Clock}
          color="rose"
        />
        <StatCard
          title="Preparing Orders"
          value={summary?.preparingOrders ?? 0}
          subtext="In kitchen queue"
          icon={ChefHat}
          color="blue"
        />
        <StatCard
          title="Ready to Serve"
          value={summary?.readyOrders ?? 0}
          subtext="Prepared at kitchen counter"
          icon={BellRing}
          color="amber"
        />
        <StatCard
          title="Served Orders"
          value={summary?.servedOrders ?? 0}
          subtext="Completed table orders"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Total Customers"
          value={summary?.totalCustomers ?? 0}
          subtext="Registered diner accounts"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Loyalty Points Issued"
          value={summary?.loyaltyPointsIssued ?? 0}
          subtext="Earned across completed orders"
          icon={Award}
          color="amber"
        />
      </div>

      {/* Status Pipeline Summary */}
      <div className="bg-[#EFE0CB] rounded-3xl border border-[#DCC9B3] p-4 sm:p-5 shadow-cozy flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-[#24160F] uppercase tracking-wider text-xs">
          Kitchen Live Pipeline:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 bg-[#FFFDFC] border border-[#B8543E] text-[#B8543E] rounded-xl font-bold shadow-xs">
            {summary?.pendingOrders || 0} Pending
          </span>
          <span className="px-3 py-1 bg-[#3B1F0F] text-[#E5A04B] rounded-xl font-bold shadow-xs">
            {summary?.preparingOrders || 0} Preparing
          </span>
          <span className="px-3 py-1 bg-[#C8752A] text-white rounded-xl font-bold shadow-caramel-glow">
            {summary?.readyOrders || 0} Ready
          </span>
          <span className="px-3 py-1 bg-[#FFFDFC] border border-[#4F8061] text-[#4F8061] rounded-xl font-bold shadow-xs">
            {summary?.servedOrders || 0} Served
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Live Orders Queue (8 Cols) */}
        <div className="lg:col-span-8 bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] p-6 shadow-cozy space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCC9B3]/40 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4F8061] animate-pulse"></span>
              <div>
                <h2 className="text-lg font-bold font-serif text-[#24160F] leading-tight">
                  Active Table Queue
                </h2>
                <p className="text-xs text-[#765F4D]">Real-time dine-in orders</p>
              </div>
            </div>

            <Link
              to="/owner/orders"
              className="text-xs font-bold text-[#C8752A] hover:text-[#6B3515] flex items-center gap-1 transition-colors"
            >
              <span>View Kitchen Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {liveOrders.length === 0 ? (
            <div className="p-8 text-center text-[#765F4D] text-xs">
              <Coffee className="w-8 h-8 mx-auto text-[#DCC9B3] mb-2" />
              No active orders right now. Ready for dine-in orders!
            </div>
          ) : (
            <div className="divide-y divide-[#DCC9B3]/40">
              {liveOrders.map((order) => {
                let nextStatus = "accepted";
                let btnLabel = "Accept";
                if (order.status === "accepted") {
                  nextStatus = "preparing";
                  btnLabel = "Prepare";
                } else if (order.status === "preparing") {
                  nextStatus = "ready";
                  btnLabel = "Mark Ready";
                } else if (order.status === "ready") {
                  nextStatus = "served";
                  btnLabel = "Serve Table";
                }

                return (
                  <div key={order._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#3B1F0F] text-[#E5A04B] font-extrabold text-sm flex flex-col items-center justify-center border border-[#6B3515] shadow-cozy shrink-0">
                        <span className="text-[9px] uppercase font-bold text-[#DCC9B3]">Table</span>
                        <span>#{order.tableNumber}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#24160F]">
                            #{order.orderNumber}
                          </span>
                          <span className="text-xs font-semibold text-[#765F4D]">
                            • {order.customerName || "Dine-in Diner"}
                          </span>
                          <span className="text-[10px] capitalize px-2.5 py-0.5 rounded-full bg-[#EFE0CB] text-[#24160F] font-semibold border border-[#DCC9B3]">
                            {order.status}
                          </span>
                        </div>

                        <p className="text-xs text-[#765F4D] mt-1 font-medium">
                          {order.items?.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#DCC9B3]/40">
                      <span className="text-base font-bold text-[#C8752A] font-serif">
                        ₹{(order.total ?? order.totalAmount ?? 0).toFixed(2)}
                      </span>

                      {order.status !== "served" && order.status !== "cancelled" && (
                        <button
                          onClick={() => handleAdvanceStatus(order._id, nextStatus)}
                          className="px-4 py-2 bg-[#3B1F0F] hover:bg-[#24130A] text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-cozy transition-all active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E5A04B]" />
                          <span>{btnLabel}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Popular Items & Quick Shortcuts (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] p-6 shadow-cozy">
            <h3 className="text-xs font-bold text-[#24160F] uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C8752A]" />
              <span>Popular Products</span>
            </h3>

            {popularItems.length === 0 ? (
              <p className="text-xs text-[#765F4D] py-3">Popular products will appear as orders are served.</p>
            ) : (
              <div className="space-y-2.5">
                {popularItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-2xl bg-[#FBF6EE] border border-[#DCC9B3]">
                    <span className="font-semibold text-[#24160F] truncate mr-2">{item.name}</span>
                    <span className="font-mono text-[#24160F] font-bold bg-[#EFE0CB] border border-[#DCC9B3] px-2.5 py-0.5 rounded-xl text-[11px] shrink-0">
                      {item.quantity} sold
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <Link
              to="/owner/products"
              className="bg-[#FFFDFC] rounded-2xl border border-[#DCC9B3] p-4 hover:border-[#C8752A] transition-all flex items-center gap-3.5 shadow-cozy group"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#EFE0CB] text-[#C8752A] flex items-center justify-center border border-[#DCC9B3]">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-serif font-bold text-[#24160F] group-hover:text-[#C8752A] transition-colors">Manage Menu Items</h4>
                <p className="text-[11px] text-[#765F4D]">Add products & toggle availability</p>
              </div>
            </Link>

            <Link
              to="/owner/qr-codes"
              className="bg-[#FFFDFC] rounded-2xl border border-[#DCC9B3] p-4 hover:border-[#C8752A] transition-all flex items-center gap-3.5 shadow-cozy group"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#EFE0CB] text-[#6B3515] flex items-center justify-center border border-[#DCC9B3]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-serif font-bold text-[#24160F] group-hover:text-[#C8752A] transition-colors">Print Table QRs</h4>
                <p className="text-[11px] text-[#765F4D]">Download & print table cards</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
