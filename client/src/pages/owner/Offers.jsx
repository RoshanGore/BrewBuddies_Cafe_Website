import React, { useEffect, useState } from "react";
import { Plus, Trash2, Tag, Sparkles } from "lucide-react";
import OwnerHeader from "../../components/owner/OwnerHeader";
import api from "../../services/api";

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    discountType: "percentage",
    discountValue: 20,
    minOrderAmount: 10,
    maxDiscount: 5,
  });

  const fetchOffers = async () => {
    try {
      const res = await api.getOffers();
      if (res.success) setOffers(res.offers);
    } catch (err) {
      console.warn("[OwnerOffers] Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Delete this promo offer?")) {
      try {
        await api.deleteOffer(id);
        fetchOffers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createOffer({
        code: formData.code.trim().toUpperCase(),
        title: formData.title,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscount: Number(formData.maxDiscount) || 0,
      });
      setShowAddModal(false);
      setFormData({
        code: "",
        title: "",
        description: "",
        discountType: "percentage",
        discountValue: 20,
        minOrderAmount: 10,
        maxDiscount: 5,
      });
      fetchOffers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <OwnerHeader
        title="Promotional Offers & Coupons"
        subtitle="Create discount codes and seasonal deals for dine-in tables"
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#C8752A] hover:bg-[#6B3515] text-[#FFFDFC] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-card transition-colors"
          >
            <Plus className="w-4 h-4 text-[#FFFDFC]" />
            <span>Create Promo Offer</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs text-[#765F4D]">Loading offers...</div>
        ) : offers.length === 0 ? (
          <div className="col-span-full bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] p-12 text-center text-[#765F4D] text-xs shadow-card">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE0CB] border border-[#DCC9B3] flex items-center justify-center mx-auto mb-3 text-[#C8752A]">
              <Tag className="w-6 h-6" />
            </div>
            <p className="text-sm font-serif font-bold text-[#24160F]">No offers currently active</p>
            <p className="text-xs text-[#765F4D] mt-0.5">Click "Create Promo Offer" to add coupon discounts for diners.</p>
          </div>
        ) : (
          offers.map((offer) => (
            <div
              key={offer._id}
              className="bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-[#24130A] text-[#FFFDFC] border border-[#3B1F0F]">
                    {offer.code}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#C8752A] bg-[#EFE0CB] border border-[#DCC9B3] px-2.5 py-0.5 rounded-full">
                    {offer.discountType === "percentage" ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} FLAT`}
                  </span>
                </div>

                <h4 className="text-sm font-serif font-bold text-[#24160F] mt-2">{offer.title}</h4>
                <p className="text-xs text-[#765F4D] mt-0.5">{offer.description || "No description provided."}</p>

                <div className="mt-3 text-[11px] text-[#765F4D] flex items-center gap-1.5">
                  <span>Min Order: ₹{offer.minOrderAmount}</span>
                  {offer.maxDiscount > 0 && <span>• Max Cap: ₹{offer.maxDiscount}</span>}
                </div>
              </div>

              <div className="pt-3 border-t border-[#DCC9B3]/40 mt-4 flex justify-end">
                <button
                  onClick={() => handleDelete(offer._id)}
                  className="text-[#765F4D] hover:text-[#B8543E] hover:bg-[#F5EBDD] p-2 rounded-xl transition-colors"
                  title="Delete Offer"
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
            <h3 className="text-lg font-bold font-serif text-[#24160F] mb-3">Create Promo Offer</h3>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. MORNINGBREW"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full uppercase font-mono px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Offer Title</label>
                <input
                  type="text"
                  placeholder="e.g. 20% Off Breakfast & Brews"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#24160F] mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#24160F] mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#24160F] mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#24160F] mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Terms or promo description..."
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
                  Save Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;
