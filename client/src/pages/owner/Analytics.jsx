import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, TrendingUp, DollarSign, Award, Clock, ShoppingBag, Gift } from "lucide-react";
import OwnerHeader from "../../components/owner/OwnerHeader";
import StatCard from "../../components/owner/StatCard";
import api from "../../services/api";

const Analytics = () => {
  const [chartsData, setChartsData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);

  const fetchData = async (range = timeRange) => {
    setLoading(true);
    try {
      const [chartsRes, sumRes] = await Promise.all([
        api.getCharts({ range }),
        api.getSummary(),
      ]);
      if (chartsRes.success) setChartsData(chartsRes);
      if (sumRes.success) setSummary(sumRes.summary);
    } catch (err) {
      console.warn("[Analytics] Load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(timeRange);
  }, [timeRange]);

  const revenueTrends = chartsData?.revenueTrends || [];
  const popularItems = chartsData?.popularItems || [];
  const statusDistribution = chartsData?.statusDistribution || [];
  const loyaltyMetrics = chartsData?.loyaltyMetrics || { pointsEarned: 0, pointsRedeemed: 0 };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <OwnerHeader
        title="Sales & Cafe Analytics"
        subtitle="Real-time performance analytics, revenue trends, and ordering patterns"
        actions={
          <div className="flex items-center bg-[#FFFDFC] border border-[#DCC9B3] rounded-xl p-1 shadow-xs text-xs">
            {[
              { key: "today", label: "Today" },
              { key: "7d", label: "Last 7 Days" },
              { key: "30d", label: "Last 30 Days" },
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setTimeRange(btn.key)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  timeRange === btn.key
                    ? "bg-[#C8752A] text-white shadow-caramel-glow font-bold"
                    : "text-[#765F4D] hover:text-[#24160F]"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Lifetime Revenue"
          value={`₹${(summary?.totalRevenue ?? 0).toFixed(2)}`}
          subtext="Across all dine-in orders"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Total Dine-In Orders"
          value={summary?.totalOrdersCount ?? 0}
          subtext="Total table orders served"
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Average Order Value"
          value={`₹${(summary?.averageOrderValue ?? 0).toFixed(2)}`}
          subtext="Per dine-in order"
          icon={Award}
          color="blue"
        />
        <StatCard
          title="Total Diners"
          value={summary?.totalCustomers ?? 0}
          subtext="Enrolled loyalty members"
          icon={ShoppingBag}
          color="purple"
        />
      </div>

      {/* 2-Column Chart Grid: Revenue Trend & Orders Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] p-6 shadow-card space-y-4">
          <div>
            <h3 className="text-base font-bold font-serif text-[#24160F]">
              Sales Over Time
            </h3>
            <p className="text-xs text-[#765F4D]">Daily dine-in revenue (₹)</p>
          </div>

          <div className="h-64 w-full pt-2">
            {revenueTrends.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#765F4D]">
                No revenue recorded for this time range.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8752A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C8752A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DCC9B3" strokeOpacity={0.5} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#765F4D" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#765F4D" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#24130A",
                      borderRadius: "14px",
                      border: "1px solid #3B1F0F",
                      color: "#FFFDFC",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(36, 19, 10, 0.3)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue (₹)"
                    stroke="#C8752A"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Orders Over Time Chart */}
        <div className="bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] p-6 shadow-card space-y-4">
          <div>
            <h3 className="text-base font-bold font-serif text-[#24160F]">
              Orders Over Time
            </h3>
            <p className="text-xs text-[#765F4D]">Table order volume</p>
          </div>

          <div className="h-64 w-full pt-2">
            {revenueTrends.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#765F4D]">
                No orders recorded for this time range.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DCC9B3" strokeOpacity={0.5} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#765F4D" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#765F4D" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#24130A",
                      borderRadius: "14px",
                      border: "1px solid #3B1F0F",
                      color: "#FFFDFC",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(36, 19, 10, 0.3)",
                    }}
                  />
                  <Bar dataKey="orders" name="Orders Count" fill="#3B1F0F" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top-selling products, Status Distribution, Loyalty Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top-Selling Products */}
        <div className="bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] p-6 shadow-card space-y-4">
          <div>
            <h3 className="text-base font-bold font-serif text-[#24160F]">
              Top-Selling Products
            </h3>
            <p className="text-xs text-[#765F4D]">Highest volume items ordered</p>
          </div>

          {popularItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#765F4D]">
              No sales data recorded yet.
            </div>
          ) : (
            <div className="space-y-3 pt-2 text-xs">
              {popularItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FBF6EE] border border-[#DCC9B3]">
                  <div className="truncate mr-2">
                    <span className="font-bold text-[#24160F] block truncate">{item.name}</span>
                    <span className="text-[11px] text-[#765F4D]">{item.quantity} orders</span>
                  </div>
                  <span className="font-bold font-serif text-[#24160F] shrink-0">
                    ₹{(item.revenue ?? 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] p-6 shadow-card space-y-4">
          <div>
            <h3 className="text-base font-bold font-serif text-[#24160F]">
              Order Status Distribution
            </h3>
            <p className="text-xs text-[#765F4D]">Lifetime table order statuses</p>
          </div>

          {statusDistribution.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#765F4D]">
              No orders placed yet.
            </div>
          ) : (
            <div className="space-y-2.5 pt-2 text-xs">
              {statusDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FBF6EE] border border-[#DCC9B3]">
                  <span className="font-medium text-[#24160F] capitalize">{item.status}</span>
                  <span className="font-bold text-[#C8752A] font-mono px-2 py-0.5 rounded-md bg-[#EFE0CB] border border-[#DCC9B3]">
                    {item.count} orders
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loyalty Activity */}
        <div className="bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] p-6 shadow-card space-y-4">
          <div>
            <h3 className="text-base font-bold font-serif text-[#24160F]">
              Loyalty Points Activity
            </h3>
            <p className="text-xs text-[#765F4D]">Points earned and redeemed</p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 bg-[#FBF6EE] border border-[#DCC9B3] rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-[#765F4D] tracking-wider block">Total Points Earned</span>
              <span className="text-2xl font-bold font-serif text-[#C8752A]">
                {loyaltyMetrics.pointsEarned.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#765F4D] block mt-1">From completed served orders</span>
            </div>

            <div className="p-4 bg-[#EFE0CB]/60 border border-[#DCC9B3] rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-[#765F4D] tracking-wider block">Total Points Redeemed</span>
              <span className="text-2xl font-bold font-serif text-[#24160F]">
                {loyaltyMetrics.pointsRedeemed.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#765F4D] block mt-1">Perks claimed at checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
