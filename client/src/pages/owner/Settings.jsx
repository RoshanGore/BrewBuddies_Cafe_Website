import React, { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, Check, Coffee, Shield, Wifi, Percent } from "lucide-react";
import OwnerHeader from "../../components/owner/OwnerHeader";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Settings = () => {
  const { isOwner } = useAuth();
  const [formData, setFormData] = useState({
    cafeName: "BrewBuddies Cafe",
    tagline: "Artisan Coffee & Cozy Moments",
    currency: "₹",
    taxRate: 5,
    pointsPerDollar: 10,
    pointsRedemptionRatio: 100,
    wifiSsid: "BrewBuddies_Guest",
    wifiPassword: "CoffeeVibes2026",
    address: "124 Artisan Alley, Downtown",
    phone: "+1 (555) 345-BREW",
  });

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        if (res.success && res.settings) {
          setFormData(res.settings);
        }
      } catch (err) {
        console.warn("[Settings] Error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwner) {
      setError("Forbidden: Only cafe owners can modify cafe settings.");
      return;
    }
    setError("");
    setSaved(false);

    try {
      await api.updateSettings({
        ...formData,
        taxRate: Number(formData.taxRate),
        pointsPerDollar: Number(formData.pointsPerDollar),
        pointsRedemptionRatio: Number(formData.pointsRedemptionRatio),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <OwnerHeader
        title="Cafe & Platform Settings"
        subtitle="Configure cafe branding, tax rates, loyalty points rules, and guest Wi-Fi"
      />

      <form onSubmit={handleSubmit} className="max-w-2xl bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] p-6 sm:p-7 shadow-card space-y-6 text-xs">
        {!isOwner && (
          <div className="p-3.5 bg-[#EFE0CB]/50 border border-[#DCC9B3] rounded-2xl text-[#24160F] flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-[#C8752A] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Read-Only Staff View</p>
              <p className="text-[11px] text-[#765F4D] mt-0.5">
                Access Restricted: Only cafe owners can modify cafe branding, tax rates, loyalty points rules, and Wi-Fi credentials.
              </p>
            </div>
          </div>
        )}

        {saved && (
          <div className="p-3.5 bg-[#4F8061]/15 border border-[#4F8061]/30 rounded-2xl text-[#4F8061] flex items-center gap-2">
            <Check className="w-4 h-4 text-[#4F8061]" />
            <span className="font-semibold">Settings updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-[#B8543E]/15 border border-[#B8543E]/30 rounded-2xl text-[#B8543E]">
            {error}
          </div>
        )}

        <fieldset disabled={!isOwner} className="space-y-6 disabled:opacity-85">
          {/* Section 1: Cafe Identity */}
          <div>
            <h3 className="text-xs font-bold text-[#24160F] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-[#C8752A]" />
              <span>Cafe Branding</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Cafe Name</label>
                <input
                  type="text"
                  value={formData.cafeName}
                  onChange={(e) => setFormData({ ...formData, cafeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-[#24160F] mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Financial & Loyalty Rules */}
          <div className="pt-4 border-t border-[#DCC9B3]/40">
            <h3 className="text-xs font-bold text-[#24160F] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-[#C8752A]" />
              <span>Taxes & Loyalty Point Rules</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Dine-in Tax (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Pts Earned per ₹10</label>
                <input
                  type="number"
                  min="1"
                  value={formData.pointsPerDollar}
                  onChange={(e) => setFormData({ ...formData, pointsPerDollar: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Pts for ₹10 Value</label>
                <input
                  type="number"
                  min="1"
                  value={formData.pointsRedemptionRatio}
                  onChange={(e) => setFormData({ ...formData, pointsRedemptionRatio: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Guest Wi-Fi */}
          <div className="pt-4 border-t border-[#DCC9B3]/40">
            <h3 className="text-xs font-bold text-[#24160F] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-[#C8752A]" />
              <span>Table Guest Wi-Fi (Printed on QR Cards)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Wi-Fi Network Name (SSID)</label>
                <input
                  type="text"
                  value={formData.wifiSsid}
                  onChange={(e) => setFormData({ ...formData, wifiSsid: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Wi-Fi Password</label>
                <input
                  type="text"
                  value={formData.wifiPassword}
                  onChange={(e) => setFormData({ ...formData, wifiPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Contact & Address */}
          <div className="pt-4 border-t border-[#DCC9B3]/40">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Cafe Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24160F] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FBF6EE] border border-[#DCC9B3] text-[#24160F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8752A]/40 focus:border-[#C8752A]"
                />
              </div>
            </div>
          </div>
        </fieldset>

        {isOwner && (
          <div className="pt-4 border-t border-[#DCC9B3]/40 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#C8752A] hover:bg-[#6B3515] text-[#FFFDFC] rounded-xl font-bold flex items-center gap-2 shadow-card transition-colors"
            >
              <Save className="w-4 h-4 text-[#FFFDFC]" />
              <span>Save Cafe Settings</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Settings;
