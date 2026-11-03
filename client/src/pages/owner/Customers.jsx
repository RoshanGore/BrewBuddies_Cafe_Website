import React, { useEffect, useState } from "react";
import { Users, Search, Award, DollarSign, ShoppingBag, Phone, Mail, X, Clock, Calendar, Gift, RefreshCw } from "lucide-react";
import OwnerHeader from "../../components/owner/OwnerHeader";
import api from "../../services/api";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Detail Modal State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchCustomers = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.getCustomers({ search });
      if (res.success) setCustomers(res.customers);
    } catch (err) {
      console.warn("[Customers] Error:", err.message);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();

    // Auto-refresh when tab/window gains focus or orders are updated elsewhere
    const handleSync = () => fetchCustomers();
    window.addEventListener("focus", handleSync);
    window.addEventListener("bb:orders-updated", handleSync);

    return () => {
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("bb:orders-updated", handleSync);
    };
  }, [search]);

  const handleOpenDetail = async (customer) => {
    setSelectedCustomer(customer);
    setLoadingDetail(true);
    try {
      const res = await api.getCustomerById(customer._id);
      if (res.success) {
        setDetailData(res);
        if (res.customer) {
          setSelectedCustomer(res.customer);
          setCustomers((prev) =>
            prev.map((c) => (c._id === res.customer._id ? { ...c, ...res.customer } : c))
          );
        }
      }
    } catch (err) {
      alert("Error loading customer details: " + err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getTier = (points) => {
    const pts = points || 0;
    if (pts >= 300) return { label: "Gold Diner", color: "bg-[#EFE0CB] text-[#3B1F0F] border-[#E5A04B]" };
    if (pts >= 150) return { label: "Silver Diner", color: "bg-[#FBF6EE] text-[#6B3515] border-[#DCC9B3]" };
    return { label: "Bronze Diner", color: "bg-[#F5EBDD] text-[#765F4D] border-[#DCC9B3]" };
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <OwnerHeader
        title="Dine-in Customers & Loyalty"
        subtitle="Track customer visit frequencies, lifetime spend, and loyalty balances"
        actions={
          <button
            onClick={() => fetchCustomers(true)}
            className="px-3.5 py-2 bg-[#FFFDFC] hover:bg-[#FBF6EE] text-[#24160F] border border-[#DCC9B3] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C8752A] ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh Customers</span>
          </button>
        }
      />

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#C8752A] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by customer name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#FFFDFC] rounded-2xl border border-[#DCC9B3] text-xs text-[#24160F] focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A] shadow-xs placeholder-[#765F4D]"
        />
      </div>

      {/* Customer Directory Table */}
      <div className="bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] overflow-hidden shadow-card">
        <div className="p-4 bg-[#EFE0CB]/50 border-b border-[#DCC9B3] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#765F4D]">
            {customers.length} Registered Diners
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#765F4D]">Loading customer list...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-[#765F4D] text-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE0CB] border border-[#DCC9B3] flex items-center justify-center mx-auto mb-3 text-[#C8752A]">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-serif font-bold text-[#24160F]">No customers found</p>
            <p className="text-xs text-[#765F4D] mt-0.5">Customers will appear here automatically when they place dine-in orders.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF6EE] border-b border-[#DCC9B3] text-[#765F4D] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone / Contact</th>
                  <th className="py-3 px-4">Loyalty Tier</th>
                  <th className="py-3 px-4">Points Balance</th>
                  <th className="py-3 px-4">Total Orders</th>
                  <th className="py-3 px-4">Total Spend</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCC9B3]/40">
                {customers.map((c) => {
                  const pts = c.points ?? c.loyaltyPoints ?? 0;
                  const tier = getTier(pts);
                  return (
                    <tr key={c._id} className="hover:bg-[#FBF6EE]/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#24160F]">
                        {c.name || "Dine-in Guest"}
                      </td>
                      <td className="py-3.5 px-4 text-[#765F4D] font-mono">
                        {c.phone || c.email || "No contact"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tier.color}`}>
                          {tier.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#C8752A] font-serif text-sm">
                          {pts}
                        </span>{" "}
                        <span className="text-[10px] text-[#765F4D]">pts</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#765F4D] font-medium">
                        {c.ordersCount || 0} visits
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#24160F] font-serif">
                        ₹{(c.totalSpent || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(c)}
                          className="px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#24160F] border border-[#EAE0D5] rounded-xl text-xs font-semibold shadow-xs transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-[#EAE0D5] animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-[#DCC9B3] pb-3">
              <div>
                <h3 className="text-base font-bold font-serif text-[#24160F]">
                  {selectedCustomer.name || "Customer Profile"}
                </h3>
                <p className="text-[#765F4D] text-[11px] mt-0.5">
                  Phone: {selectedCustomer.phone || "N/A"} • Email: {selectedCustomer.email || "N/A"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => selectedCustomer && handleOpenDetail(selectedCustomer)}
                  title="Refresh Details"
                  className="p-1.5 rounded-lg text-[#765F4D] hover:text-[#24160F] hover:bg-[#FBF6EE] transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingDetail ? "animate-spin text-[#C8752A]" : ""}`} />
                </button>
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setDetailData(null);
                  }}
                  className="p-1.5 rounded-lg text-[#765F4D] hover:text-[#24160F] hover:bg-[#FBF6EE] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loadingDetail ? (
              <div className="py-12 text-center text-[#765F4D]">Loading customer history...</div>
            ) : (
              <div className="space-y-5">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 bg-[#FBF6EE] border border-[#DCC9B3] rounded-2xl">
                    <span className="text-[10px] text-[#765F4D] font-bold uppercase tracking-wider block">Loyalty Points</span>
                    <span className="text-lg font-bold text-[#C8752A] font-serif">
                      {detailData?.customer?.points ?? selectedCustomer.points ?? 0}
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#EFE0CB]/60 border border-[#DCC9B3] rounded-2xl">
                    <span className="text-[10px] text-[#765F4D] font-bold uppercase tracking-wider block">Total Visits</span>
                    <span className="text-lg font-bold text-[#24160F] font-serif">
                      {detailData?.customer?.ordersCount ?? selectedCustomer.ordersCount ?? 0}
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#FBF6EE] border border-[#DCC9B3] rounded-2xl">
                    <span className="text-[10px] text-[#765F4D] font-bold uppercase tracking-wider block">Total Spend</span>
                    <span className="text-lg font-bold text-[#24160F] font-serif">
                      ₹{(detailData?.customer?.totalSpent ?? selectedCustomer.totalSpent ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Order History */}
                <div>
                  <h4 className="font-bold text-[#24160F] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#C8752A]" />
                    <span>Order History ({detailData?.orders?.length || 0})</span>
                  </h4>

                  {(!detailData?.orders || detailData.orders.length === 0) ? (
                    <p className="text-[#765F4D] py-2">No past orders found.</p>
                  ) : (
                    <div className="divide-y divide-[#DCC9B3]/40 border border-[#DCC9B3] rounded-2xl max-h-48 overflow-y-auto">
                      {detailData.orders.map((o) => (
                        <div key={o._id} className="p-3 flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-[#24160F]">#{o.orderNumber}</span>
                            <span className="text-[#765F4D] ml-2">Table #{o.tableNumber}</span>
                            <span className="text-[#765F4D] block text-[11px] mt-0.5">
                              {o.items?.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold font-serif text-[#24160F]">₹{(o.total || 0).toFixed(2)}</span>
                            <span className="block text-[10px] capitalize text-[#C8752A] font-semibold">{o.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Points Transactions */}
                <div>
                  <h4 className="font-bold text-[#24160F] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#C8752A]" />
                    <span>Points Transactions ({detailData?.pointsTransactions?.length || 0})</span>
                  </h4>

                  {(!detailData?.pointsTransactions || detailData.pointsTransactions.length === 0) ? (
                    <p className="text-[#765F4D] py-2">No point transactions recorded.</p>
                  ) : (
                    <div className="divide-y divide-[#DCC9B3]/40 border border-[#DCC9B3] rounded-2xl max-h-40 overflow-y-auto">
                      {detailData.pointsTransactions.map((tx) => (
                        <div key={tx._id} className="p-3 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-medium text-[#24160F]">{tx.description || tx.type}</span>
                            <span className="text-[#765F4D] block text-[10px] mt-0.5">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span
                            className={`font-bold font-mono ${
                              tx.type === "earned" ? "text-[#4F8061]" : "text-[#B8543E]"
                            }`}
                          >
                            {tx.type === "earned" ? `+${tx.points}` : `-${tx.points}`} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rewards Redeemed */}
                <div>
                  <h4 className="font-bold text-[#24160F] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-[#C8752A]" />
                    <span>Redeemed Rewards ({detailData?.redemptions?.length || 0})</span>
                  </h4>

                  {(!detailData?.redemptions || detailData.redemptions.length === 0) ? (
                    <p className="text-[#765F4D] py-2">No rewards redeemed yet.</p>
                  ) : (
                    <div className="divide-y divide-[#DCC9B3]/40 border border-[#DCC9B3] rounded-2xl max-h-36 overflow-y-auto">
                      {detailData.redemptions.map((r) => (
                        <div key={r._id} className="p-3 flex items-center justify-between text-[11px]">
                          <span className="font-medium text-[#24160F]">{r.rewardId?.name || r.rewardId?.title || "Loyalty Perk"}</span>
                          <span className="text-[#C8752A] font-bold font-mono">{r.pointsSpent || 0} pts</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
