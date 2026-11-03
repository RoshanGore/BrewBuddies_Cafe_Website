import React, { useEffect, useState } from "react";
import { Plus, Trash2, Gift, Sparkles, AlertCircle } from "lucide-react";
import OwnerHeader from "../../components/owner/OwnerHeader";
import api from "../../services/api";

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pointsCost: 100,
    rewardType: "fixed_discount",
    discountValue: 5,
  });

  const fetchRewards = async () => {
    try {
      const res = await api.getRewards();
      if (res.success) setRewards(res.rewards);
    } catch (err) {
      console.warn("[OwnerRewards] Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Delete this loyalty reward?")) {
      try {
        await api.deleteReward(id);
        fetchRewards();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createReward({
        title: formData.title,
        description: formData.description,
        pointsCost: Number(formData.pointsCost),
        rewardType: formData.rewardType,
        discountValue: Number(formData.discountValue),
      });
      setShowAddModal(false);
      setFormData({
        title: "",
        description: "",
        pointsCost: 100,
        rewardType: "fixed_discount",
        discountValue: 5,
      });
      fetchRewards();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <OwnerHeader
        title="Loyalty Rewards Management"
        subtitle="Configure redeemable perks and point thresholds for diners"
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#C8752A] hover:bg-[#6B3515] text-[#FFFDFC] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-card transition-colors"
          >
            <Plus className="w-4 h-4 text-[#FFFDFC]" />
            <span>Create New Reward</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs text-[#765F4D]">Loading rewards...</div>
        ) : rewards.length === 0 ? (
          <div className="col-span-full bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] p-12 text-center text-[#765F4D] text-xs shadow-card">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE0CB] border border-[#DCC9B3] flex items-center justify-center mx-auto mb-3 text-[#C8752A]">
              <Gift className="w-6 h-6" />
            </div>
            <p className="text-sm font-serif font-bold text-[#24160F]">No rewards created yet</p>
            <p className="text-xs text-[#765F4D] mt-0.5">Click "Create New Reward" to configure point redemption perks.</p>
          </div>
        ) : (
          rewards.map((reward) => (
            <div
              key={reward._id}
              className="bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-serif font-bold text-[#24160F]">{reward.title}</h4>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-[#EFE0CB] text-[#C8752A] border border-[#DCC9B3] shrink-0 font-serif">
                    {reward.pointsCost} pts
                  </span>
                </div>
                <p className="text-xs text-[#765F4D]">{reward.description || "No description provided."}</p>

                <div className="mt-3 text-[11px] text-[#765F4D] flex items-center gap-1.5">
                  <span className="font-semibold text-[#24160F] capitalize">
                    {reward.rewardType.replace("_", " ")}
                  </span>
                  <span>•</span>
                  <span>Value: ₹{reward.discountValue}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#DCC9B3]/40 mt-4 flex justify-end">
                <button
                  onClick={() => handleDelete(reward._id)}
                  className="text-[#765F4D] hover:text-[#B8543E] hover:bg-[#F5EBDD] p-2 rounded-xl transition-colors"
                  title="Delete Reward"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#24130A]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDFC] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#DCC9B3] animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold font-serif text-[#24160F] mb-3">Create Loyalty Reward</h3>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Reward Title</label>
                <input
                  type="text"
                  placeholder="e.g. Free Classic Cappuccino"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#24160F] mb-1">Points Cost</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.pointsCost}
                    onChange={(e) => setFormData({ ...formData, pointsCost: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#24160F] mb-1">Discount Value (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details on what customer receives..."
                  className="w-full px-3.5 py-2 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A] resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-[#DCC9B3]/40">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[#765F4D] font-semibold hover:bg-[#FBF6EE] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#C8752A] hover:bg-[#6B3515] text-[#FFFDFC] font-semibold rounded-xl shadow-card transition-colors"
                >
                  Save Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;
