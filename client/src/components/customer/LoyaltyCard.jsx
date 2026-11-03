import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Sparkles, ChevronRight, Gift, Tag } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const LoyaltyCard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api.getPointsSummary()
      .then((res) => {
        if (isMounted && res.success) {
          setSummary(res);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [user?.points, user?.loyaltyPoints]);

  const points = summary?.points ?? (user?.points ?? user?.loyaltyPoints ?? 0);
  const nextTierGoal = 250;
  const progress = Math.min(100, Math.round((points / nextTierGoal) * 100));

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF2E9] to-[#F5E6D3] text-[#24160F] p-5 sm:p-6 shadow-md border border-[#E8D4C0]">
      {/* Decorative silky caramel watermark glow */}
      <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-[#C8752A]/10 blur-2xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#E8D4C0] flex items-center justify-center text-[#C8752A] shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#964B00] font-bold block leading-none">
                BrewBuddies Club
              </span>
              <span className="text-xs text-[#24160F] font-semibold mt-0.5 block">
                {user?.name || "Guest Diner"}
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 bg-white text-[#964B00] text-[11px] font-semibold px-3 py-1 rounded-full border border-[#E8D4C0] shadow-xs">
            <Sparkles className="w-3 h-3 text-[#C8752A]" />
            VIP Member
          </span>
        </div>

        {/* Balance */}
        <div className="mb-4">
          <span className="text-xs text-[#6E5545] block font-medium">Loyalty Points Balance</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl sm:text-4xl font-extrabold font-serif text-[#24160F] tracking-tight">
              {points.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-[#C8752A] tracking-wide">Points</span>
          </div>
        </div>

        {/* Available Rewards & Offers Count Summary */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <Link
            to="/rewards"
            className="p-2.5 bg-white/90 hover:bg-white rounded-2xl border border-[#E8D4C0] hover:border-[#C8752A] flex items-center justify-between transition-all group shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#C8752A]" />
              <span className="text-xs text-[#24160F] font-medium">Rewards</span>
            </div>
            <span className="text-xs font-bold text-[#C8752A] group-hover:text-[#964B00]">
              {summary?.availableRewardsCount !== undefined ? `${summary.availableRewardsCount} avail.` : "View"}
            </span>
          </Link>

          <Link
            to="/offers"
            className="p-2.5 bg-white/90 hover:bg-white rounded-2xl border border-[#E8D4C0] hover:border-[#C8752A] flex items-center justify-between transition-all group shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#C8752A]" />
              <span className="text-xs text-[#24160F] font-medium">Offers</span>
            </div>
            <span className="text-xs font-bold text-[#C8752A] group-hover:text-[#964B00]">
              {summary?.activeOffersCount !== undefined ? `${summary.activeOffersCount} active` : "View"}
            </span>
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 bg-white/80 p-3 rounded-2xl border border-[#E8D4C0]">
          <div className="flex items-center justify-between text-xs text-[#6E5545] mb-1.5 font-medium">
            <span>Goal: Free Artisan Drink</span>
            <span className="font-bold text-[#C8752A]">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-[#FAF5EF] rounded-full overflow-hidden border border-[#EAE0D5]">
            <div
              className="h-full bg-gradient-to-r from-[#C8752A] to-[#D98738] rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <Link
          to="/rewards"
          className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#C8752A]/20 active:scale-95"
        >
          <span>Open Rewards Vault</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default LoyaltyCard;
