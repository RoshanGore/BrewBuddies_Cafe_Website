import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Gift,
  Award,
  Sparkles,
  Check,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  X,
  Loader2,
  TrendingUp,
  History,
  Tag,
  Coffee,
  Crown,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "../../context/AuthContext";
import { useTable } from "../../context/TableContext";
import api from "../../services/api";

const Rewards = () => {
  const { user, setCustomerSession, refreshUser } = useAuth();
  const { cafe } = useTable();

  const [activeTab, setActiveTab] = useState("available"); // "available" | "history" | "transactions"
  const [pointsSummary, setPointsSummary] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const currentPoints = pointsSummary?.points ?? (user?.points ?? user?.loyaltyPoints ?? 0);
  const currencySymbol = pointsSummary?.currency || "₹";
  const pointsRate = pointsSummary?.pointsPerSpend || 10;
  const nextTierGoal = 1500;
  const progressPercent = Math.min(100, Math.round((currentPoints / nextTierGoal) * 100));

  const loadAllData = async () => {
    try {
      setLoading(true);
      if (refreshUser) refreshUser();
      const [pointsRes, rewardsRes, historyRes] = await Promise.all([
        api.getPointsSummary().catch(() => ({ success: false })),
        api.getRewards().catch(() => ({ success: false, rewards: [] })),
        api.getRedemptionHistory().catch(() => ({ success: false, redemptions: [] })),
      ]);

      if (pointsRes.success) {
        setPointsSummary(pointsRes);
      }
      if (rewardsRes.success && Array.isArray(rewardsRes.rewards)) {
        setRewards(rewardsRes.rewards);
      }
      if (historyRes.success && Array.isArray(historyRes.redemptions)) {
        setRedemptions(historyRes.redemptions);
      }
    } catch (err) {
      console.warn("[Rewards] Load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user]);

  const handleConfirmRedeem = async () => {
    if (!selectedReward) return;

    setRedeeming(true);
    setErrorMessage("");
    setRedeemSuccess(null);

    try {
      const res = await api.redeemReward(selectedReward._id);

      if (res.success) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        setRedeemSuccess({
          title: selectedReward.name || selectedReward.title,
          pointsUsed: selectedReward.pointsRequired || selectedReward.pointsCost,
          transaction: res.transaction,
        });

        if (res.newBalance !== undefined) {
          setPointsSummary((prev) => ({
            ...prev,
            points: res.newBalance,
            totalRedeemed: (prev?.totalRedeemed || 0) + (selectedReward.pointsRequired || selectedReward.pointsCost),
          }));
          if (user) {
            setCustomerSession(localStorage.getItem("bb_token") || "", {
              ...user,
              loyaltyPoints: res.newBalance,
            });
          }
        }

        setSelectedReward(null);
        api.getRedemptionHistory().then((h) => {
          if (h.success) setRedemptions(h.redemptions);
        });
      } else {
        setErrorMessage(res.message || "Failed to redeem reward");
      }
    } catch (err) {
      setErrorMessage(err.message || "Server error while redeeming perk");
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#C8752A] block">
          Loyalty & Membership
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#24160F] mt-1">
          Rewards & Perks Club
        </h1>
        <p className="text-xs sm:text-sm text-[#6E5545]">
          Earn points on handcrafted drinks & bites, and redeem exclusive cafe perks
        </p>
      </div>

      {/* Main VIP Loyalty Club Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF2E9] to-[#F5E6D3] text-[#24160F] p-6 sm:p-8 shadow-md border border-[#E8D4C0]">
        <div className="absolute -right-8 -bottom-8 w-56 h-56 rounded-full bg-[#C8752A]/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-[#C8752A]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#964B00]">
                BREWBUDDIES CLUB
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#964B00] bg-white px-3.5 py-1 rounded-full border border-[#E8D4C0] shadow-xs">
              <Crown className="w-3.5 h-3.5 text-[#C8752A]" />
              Gold Diner
            </span>
          </div>

          <div className="mb-4">
            <span className="text-3xl sm:text-5xl font-extrabold font-serif tracking-tight text-[#24160F] block">
              {currentPoints.toLocaleString()} Points
            </span>
          </div>

          {/* Progress Bar & Subtext */}
          <div className="space-y-1.5">
            <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-[#E8D4C0]">
              <div
                className="h-full bg-gradient-to-r from-[#C8752A] to-[#D98738] rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#6E5545] font-medium">
              <span>{Math.max(0, nextTierGoal - currentPoints)} points to next reward</span>
              <span className="font-mono text-[#C8752A] font-bold">{nextTierGoal}</span>
            </div>
          </div>

          {/* Lifetime Metrics */}
          <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-[#E8D4C0] mt-4 text-center">
            <div className="bg-white/80 border border-[#E8D4C0] rounded-2xl p-2.5 shadow-2xs">
              <span className="block text-[10px] text-[#765F4D] uppercase font-semibold">Earned</span>
              <span className="text-xs sm:text-sm font-bold text-[#16A34A] mt-0.5 block">
                +{pointsSummary?.totalEarned?.toLocaleString() || 0}
              </span>
            </div>
            <div className="bg-white/80 border border-[#E8D4C0] rounded-2xl p-2.5 shadow-2xs">
              <span className="block text-[10px] text-[#765F4D] uppercase font-semibold">Redeemed</span>
              <span className="text-xs sm:text-sm font-bold text-[#C8752A] mt-0.5 block">
                -{pointsSummary?.totalRedeemed?.toLocaleString() || 0}
              </span>
            </div>
            <div className="bg-white/80 border border-[#E8D4C0] rounded-2xl p-2.5 shadow-2xs">
              <span className="block text-[10px] text-[#765F4D] uppercase font-semibold">Perks Claimed</span>
              <span className="text-xs sm:text-sm font-bold text-[#24160F] mt-0.5 block">
                {pointsSummary?.redemptionsCount || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {redeemSuccess && (
        <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-3xl text-xs text-[#065F46] flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#16A34A] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#16A34A]">Reward Redeemed Successfully!</p>
              <p className="text-[11px] text-[#047857] mt-0.5">
                '{redeemSuccess.title}' has been claimed. {redeemSuccess.pointsUsed} points deducted. Show your screen to cafe staff or apply at checkout!
              </p>
            </div>
          </div>
          <button
            onClick={() => setRedeemSuccess(null)}
            className="text-[#065F46] hover:text-[#047857] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-3xl text-xs text-[#DC2626] flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Redemption Failed</p>
            <p className="text-[11px] text-[#B91C1C] mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage("")}
            className="text-[#DC2626] hover:text-[#7F1D1D] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white border border-[#EAE0D5] rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab("available")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "available"
              ? "bg-gradient-to-r from-[#C8752A] to-[#D98738] text-white shadow-xs"
              : "text-[#6E5545] hover:text-[#24160F]"
          }`}
        >
          Perks ({rewards.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "history"
              ? "bg-gradient-to-r from-[#C8752A] to-[#D98738] text-white shadow-xs"
              : "text-[#6E5545] hover:text-[#24160F]"
          }`}
        >
          Redemptions ({redemptions.length})
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "transactions"
              ? "bg-gradient-to-r from-[#C8752A] to-[#D98738] text-white shadow-xs"
              : "text-[#6E5545] hover:text-[#24160F]"
          }`}
        >
          Points Ledger
        </button>
      </div>

      {/* TAB 1: Available Rewards */}
      {activeTab === "available" && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#765F4D]">
              Available Cafe Perks
            </h3>
            <span className="text-[11px] text-[#765F4D]">
              {rewards.length} {rewards.length === 1 ? "perk" : "perks"} listed
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-32 bg-[#FAF5EF] rounded-3xl animate-pulse border border-[#EAE0D5]"></div>
              ))}
            </div>
          ) : rewards.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#EAE0D5] p-10 text-center text-xs text-[#6E5545] space-y-2 shadow-sm">
              <Gift className="w-8 h-8 text-[#9C8472] mx-auto" />
              <p className="font-serif font-bold text-base text-[#24160F]">No active perks found</p>
              <p className="text-[11px] text-[#765F4D]">
                Check back soon as new seasonal rewards and artisan treats are added!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rewards.map((reward) => {
                const cost = reward.pointsRequired || reward.pointsCost || 0;
                const canAfford = currentPoints >= cost;
                const progress = cost > 0 ? Math.min(100, Math.round((currentPoints / cost) * 100)) : 100;
                const remaining = Math.max(0, cost - currentPoints);

                return (
                  <div
                    key={reward._id}
                    className={`bg-white rounded-3xl border p-5 shadow-sm transition-all ${
                      canAfford
                        ? "border-[#C8752A] hover:shadow-md"
                        : "border-[#EAE0D5]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF2E9] text-[#964B00] border border-[#E8D4C0]">
                            <Sparkles className="w-2.5 h-2.5 text-[#C8752A]" />
                            <span>{cost} PTS</span>
                          </span>

                          {reward.rewardType === "fixed_discount" && (
                            <span className="text-[10px] font-bold text-[#16A34A] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                              ₹{reward.discountValue || reward.rewardValue} Discount
                            </span>
                          )}
                          {reward.rewardType === "percentage_discount" && (
                            <span className="text-[10px] font-bold text-[#16A34A] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                              {reward.discountValue || reward.rewardValue}% OFF
                            </span>
                          )}
                          {reward.rewardType === "free_item" && (
                            <span className="text-[10px] font-bold text-[#964B00] bg-[#FAF2E9] px-2.5 py-0.5 rounded-full border border-[#E8D4C0]">
                              Complimentary Item
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-serif font-bold text-[#24160F]">
                          {reward.name || reward.title}
                        </h4>
                        <p className="text-xs text-[#6E5545] mt-0.5">
                          {reward.description || "Exclusive loyalty perk for dine-in guests."}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedReward(reward)}
                        disabled={!canAfford}
                        className={`shrink-0 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs ${
                          canAfford
                            ? "bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white active:scale-95 cursor-pointer shadow-md shadow-[#C8752A]/20"
                            : "bg-[#FAF5EF] text-[#9C8472] cursor-not-allowed border border-[#EAE0D5]"
                        }`}
                      >
                        {canAfford ? "Redeem" : "Locked"}
                      </button>
                    </div>

                    {/* Dynamic Progress Bar */}
                    <div className="mt-3 pt-3 border-t border-[#EAE0D5]">
                      <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium">
                        <span className="text-[#6E5545]">
                          {currentPoints} / {cost} points
                        </span>
                        <span className={canAfford ? "text-[#16A34A] font-bold" : "text-[#C8752A] font-semibold"}>
                          {canAfford ? "Ready to Redeem!" : `${remaining} points to go`}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#FAF5EF] overflow-hidden border border-[#EAE0D5]">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            canAfford ? "bg-[#16A34A]" : "bg-gradient-to-r from-[#C8752A] to-[#D98738]"
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Redemption History */}
      {activeTab === "history" && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#765F4D]">
              Claimed Perks History
            </h3>
            <span className="text-[11px] text-[#765F4D]">
              {redemptions.length} claimed
            </span>
          </div>

          {redemptions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#EAE0D5] p-8 text-center text-xs text-[#6E5545] space-y-2 shadow-sm">
              <History className="w-8 h-8 text-[#9C8472] mx-auto" />
              <p className="font-serif font-bold text-base text-[#24160F]">No rewards redeemed yet.</p>
              <p className="text-[11px] text-[#765F4D]">
                Start earning points from your dine-in orders to claim free drinks & discounts!
              </p>
              <Link
                to="/menu"
                className="inline-block mt-2 px-5 py-2.5 bg-gradient-to-r from-[#C8752A] to-[#D98738] text-white rounded-2xl text-xs font-bold shadow-xs hover:from-[#B45E1B] hover:to-[#C8752A] transition-colors"
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {redemptions.map((redemption) => {
                const rewardItem = redemption.rewardId;
                const dateStr = new Date(redemption.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={redemption._id}
                    className="bg-white rounded-2xl border border-[#EAE0D5] p-4 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-[#FAF2E9] text-[#C8752A] flex items-center justify-center shrink-0 border border-[#E8D4C0]">
                        <Gift className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-serif font-bold text-[#24160F] truncate">
                          {rewardItem?.name || rewardItem?.title || "Redeemed Perk"}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-[#765F4D] mt-0.5">
                          <span>{dateStr}</span>
                          <span>•</span>
                          <span>{redemption.cafeId?.name || "BrewBuddies Cafe"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-[#C8752A] block font-mono">
                        -{redemption.pointsUsed} pts
                      </span>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#ECFDF5] text-[#16A34A] border border-[#A7F3D0] mt-0.5">
                        Claimed
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Points Transaction History */}
      {activeTab === "transactions" && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#765F4D]">
              Points Ledger
            </h3>
            <span className="text-[11px] text-[#765F4D]">
              {pointsSummary?.transactions?.length || 0} records
            </span>
          </div>

          {!pointsSummary?.transactions || pointsSummary.transactions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#EAE0D5] p-8 text-center text-xs text-[#6E5545] space-y-2 shadow-sm">
              <TrendingUp className="w-8 h-8 text-[#9C8472] mx-auto" />
              <p className="font-serif font-bold text-base text-[#24160F]">No points transactions yet.</p>
              <p className="text-[11px] text-[#765F4D]">
                Order handcrafted food & drinks to earn points automatically when served!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pointsSummary.transactions.map((tx) => {
                const isEarned = tx.type === "earned";
                const isRedeemed = tx.type === "redeemed";
                const dateStr = new Date(tx.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <div
                    key={tx._id}
                    className="bg-white rounded-2xl border border-[#EAE0D5] p-3.5 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                          isEarned
                            ? "bg-[#ECFDF5] text-[#16A34A] border-[#A7F3D0]"
                            : isRedeemed
                            ? "bg-[#FAF2E9] text-[#C8752A] border-[#E8D4C0]"
                            : "bg-[#FAF5EF] text-[#6E5545] border-[#EAE0D5]"
                        }`}
                      >
                        {isEarned ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#24160F] truncate">
                          {tx.description || (isEarned ? "Dine-In Order Points" : "Reward Redemption")}
                        </p>
                        <p className="text-[10px] text-[#765F4D] mt-0.5">{dateStr}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono text-xs font-extrabold ${
                          isEarned ? "text-[#16A34A]" : "text-[#C8752A]"
                        }`}
                      >
                        {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONFIRMATION DIALOG MODAL */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#EAE0D5] max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150 text-[#24160F]">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF2E9] text-[#C8752A] flex items-center justify-center mx-auto border border-[#E8D4C0]">
              <Gift className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-serif font-bold text-[#24160F]">
                Redeem {selectedReward.name || selectedReward.title}?
              </h3>
              <p className="text-xs text-[#6E5545]">
                {selectedReward.pointsRequired || selectedReward.pointsCost} points will be deducted from your balance.
              </p>
            </div>

            {/* Balance Preview Card */}
            <div className="bg-[#FAF5EF] rounded-2xl p-4 border border-[#EAE0D5] text-xs space-y-2">
              <div className="flex justify-between text-[#6E5545]">
                <span>Current Balance:</span>
                <span className="font-semibold text-[#24160F]">{currentPoints} pts</span>
              </div>
              <div className="flex justify-between text-[#DC2626] font-semibold">
                <span>Points to Deduct:</span>
                <span>-{selectedReward.pointsRequired || selectedReward.pointsCost} pts</span>
              </div>
              <div className="pt-2 border-t border-[#EAE0D5] flex justify-between font-bold text-[#24160F]">
                <span>Remaining Balance:</span>
                <span className="font-mono text-[#C8752A]">
                  {currentPoints - (selectedReward.pointsRequired || selectedReward.pointsCost)} pts
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReward(null)}
                disabled={redeeming}
                className="flex-1 py-2.5 rounded-2xl border border-[#EAE0D5] text-[#5A4031] text-xs font-bold hover:bg-[#FAF5EF] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRedeem}
                disabled={redeeming}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white text-xs font-bold transition-all shadow-md shadow-[#C8752A]/20 flex items-center justify-center gap-1.5 disabled:opacity-75"
              >
                {redeeming ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Redeeming...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Redeem Perk</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;
