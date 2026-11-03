import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Sparkles, Copy, Check, ArrowRight, Calendar, AlertCircle, Award } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useTable } from "../../context/TableContext";
import api from "../../services/api";

const Offers = () => {
  const navigate = useNavigate();
  const { applyOffer, subtotal } = useCart();
  const { cafe } = useTable();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState("");
  const [appliedCode, setAppliedCode] = useState("");

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const res = await api.getOffers();
        if (res.success && Array.isArray(res.offers)) {
          const now = new Date();
          const validOffers = res.offers.filter((offer) => {
            if (!offer.isActive) return false;
            if (offer.endDate && new Date(offer.endDate) < now) return false;
            return true;
          });
          setOffers(validOffers);
        }
      } catch (err) {
        console.warn("[Offers] Load error:", err.message);
      } finally {
        if (isMounted => isMounted) setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const handleApplyOffer = (offer) => {
    let calculatedDiscount = 0;
    const currentSubtotal = Number(subtotal) || 0;

    if (offer.discountType === "percentage") {
      calculatedDiscount = (currentSubtotal * offer.discountValue) / 100;
      if (offer.maxDiscount) calculatedDiscount = Math.min(calculatedDiscount, offer.maxDiscount);
    } else {
      calculatedDiscount = offer.discountValue;
    }

    applyOffer({
      code: offer.code,
      title: offer.title,
      discountAmount: calculatedDiscount,
    });

    setAppliedCode(offer.code);
    setTimeout(() => {
      navigate("/cart");
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#C8752A] block">
          Special Discounts & Vouchers
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#24160F] mt-1">
          Exclusive Offers
        </h1>
        <p className="text-xs sm:text-sm text-[#6E5545]">
          Exclusive handcrafted specials, coupon vouchers, and seasonal dine-in savings
        </p>
      </div>

      {loading ? (
        <div className="space-y-3.5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-[#FAF5EF] rounded-3xl animate-pulse border border-[#EAE0D5]"></div>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EAE0D5] p-10 text-center text-xs text-[#6E5545] space-y-2 shadow-sm">
          <Tag className="w-8 h-8 text-[#9C8472] mx-auto" />
          <p className="font-serif font-bold text-base text-[#24160F]">No active offers right now</p>
          <p className="text-[11px] text-[#765F4D]">
            Check back soon for upcoming weekend specials and holiday promo codes!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => {
            const endDateStr = offer.endDate
              ? new Date(offer.endDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : null;

            return (
              <div
                key={offer._id}
                className="relative overflow-hidden bg-white rounded-3xl border border-[#EAE0D5] p-5 sm:p-6 shadow-sm hover:border-[#C8752A] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Header: Discount Badge, Promo Code & Croissant visual */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF5EF] border border-[#EAE0D5] text-[#C8752A] flex items-center justify-center shrink-0 shadow-xs">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-sm font-extrabold uppercase tracking-wider text-[#C8752A] block">
                        {offer.discountType === "percentage"
                          ? `${offer.discountValue}% OFF`
                          : `₹${offer.discountValue} FLAT OFF`}
                      </span>
                      <h3 className="text-base sm:text-lg font-serif font-bold text-[#24160F] leading-tight mt-0.5">
                        {offer.title}
                      </h3>
                      <p className="text-xs text-[#6E5545] mt-0.5">
                        {offer.description || "Limited time dine-in coupon voucher."}
                      </p>
                    </div>
                  </div>

                  {/* Promo Code with Copy */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(offer.code)}
                      title="Click to copy promo code"
                      className="group shrink-0 font-mono text-xs font-extrabold px-3.5 py-2 bg-[#FAF2E9] hover:bg-[#F3ECE1] text-[#964B00] border-2 border-dashed border-[#C8752A] rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <span>{offer.code}</span>
                      {copiedCode === offer.code ? (
                        <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#C8752A] opacity-70 group-hover:opacity-100" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Validity, Min Spend and Apply button */}
                <div className="pt-3.5 border-t border-[#EAE0D5] flex items-center justify-between mt-2 text-[11px]">
                  <div className="space-y-0.5">
                    {endDateStr ? (
                      <span className="text-[#6E5545] flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#C8752A]" />
                        <span>Valid until {endDateStr}</span>
                      </span>
                    ) : (
                      <span className="text-[#6E5545] font-medium">Ongoing Cafe Offer</span>
                    )}

                    {offer.minOrderAmount > 0 && (
                      <p className="text-[10px] text-[#C8752A] font-semibold">
                        Min. order: ₹{offer.minOrderAmount}
                      </p>
                    )}
                  </div>

                  {/* Apply / Go to Checkout */}
                  <button
                    onClick={() => handleApplyOffer(offer)}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#C8752A]/20 transition-all active:scale-95 cursor-pointer"
                  >
                    {appliedCode === offer.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Applied!</span>
                      </>
                    ) : (
                      <>
                        <span>Apply Offer</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Offers;
