import React, { useState, useEffect } from "react";
import { X, Plus, Minus, Check, Sparkles, Coffee } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { getCategoryImage } from "../../utils/categoryImages";

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    if (product) {
      if (product.variants && product.variants.length > 0) {
        // Default to first available variant
        const firstAvail = product.variants.find((v) => v.isAvailable !== false) || product.variants[0];
        setSelectedVariant(firstAvail);
      } else {
        setSelectedVariant(null);
      }
      setSelectedAddOns([]);
      setQuantity(1);
      setNotes("");
      setAddedAnimation(false);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  // Calculate live item price
  const basePrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price || 0);
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + Number(a.price || 0), 0);
  const unitPrice = basePrice + addOnsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddOn = (addOn) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => (a.addOnId || a._id) === (addOn._id || addOn.addOnId));
      if (exists) {
        return prev.filter((a) => (a.addOnId || a._id) !== (addOn._id || addOn.addOnId));
      } else {
        return [...prev, { addOnId: addOn._id, name: addOn.name, price: addOn.price }];
      }
    });
  };

  const isAddOnSelected = (addOn) => {
    return selectedAddOns.some((a) => (a.addOnId || a._id) === (addOn._id || addOn.addOnId));
  };

  const handleAddToCart = () => {
    const success = addItem(product, quantity, notes, selectedVariant, selectedAddOns);
    if (success) {
      setAddedAnimation(true);
      setTimeout(() => {
        setAddedAnimation(false);
        onClose();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-all duration-300">
      <div
        className="w-full max-w-lg bg-white border border-[#EAE0D5] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image & Badges */}
        <div className="relative h-48 sm:h-56 w-full shrink-0 overflow-hidden bg-[#FAF5EF]">
          <img
            src={getCategoryImage(product.category?.name || product.category, product.image, product.name)}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors shadow-sm"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Veg/Non-Veg Indicator & Category */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            {product.isVegetarian ? (
              <span className="w-5 h-5 border-[1.5px] border-[#16A34A] bg-white rounded-sm flex items-center justify-center shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></span>
              </span>
            ) : (
              <span className="w-5 h-5 border-[1.5px] border-[#DC2626] bg-white rounded-sm flex items-center justify-center shadow-xs">
                <span className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-[#DC2626]"></span>
              </span>
            )}
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/95 text-[#964B00] border border-[#EAE0D5] shadow-xs">
              {product.category?.name || "Artisan Specialty"}
            </span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#24160F] leading-snug">
                {product.name}
              </h3>
              <span className="font-serif text-xl font-extrabold text-[#C8752A] whitespace-nowrap">
                ₹{unitPrice.toFixed(2)}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6E5545] mt-2 leading-relaxed">
              {product.description || "Freshly handcrafted to order using premium quality ingredients."}
            </p>
          </div>

          {/* Size / Variant Options */}
          {product.variants && product.variants.length > 0 && (
            <div className="pt-2 border-t border-[#EAE0D5]">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#C8752A]">
                  Select Size / Option <span className="text-[#DC2626]">*</span>
                </label>
                <span className="text-[11px] text-[#8C786B]">Choose one</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant && (selectedVariant._id === v._id || selectedVariant.name === v.name);
                  return (
                    <button
                      key={v._id || v.name}
                      type="button"
                      disabled={v.isAvailable === false}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? "bg-[#FAF2E9] border-[#C8752A] text-[#24160F] shadow-xs"
                          : v.isAvailable === false
                          ? "opacity-40 cursor-not-allowed bg-[#FAF5EF] border-[#EAE0D5]"
                          : "bg-[#FAF5EF] border-[#EAE0D5] text-[#5A4031] hover:bg-white hover:border-[#C8752A]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold block">{v.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#C8752A]" />}
                      </div>
                      <span className="text-xs font-semibold text-[#C8752A] block mt-1">
                        ₹{Number(v.price).toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons Section */}
          {product.addOns && product.addOns.length > 0 && (
            <div className="pt-2 border-t border-[#EAE0D5]">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#C8752A]">
                  Optional Add-ons
                </label>
                <span className="text-[11px] text-[#8C786B]">Custom extras</span>
              </div>
              <div className="space-y-2">
                {product.addOns.map((addOn) => {
                  const selected = isAddOnSelected(addOn);
                  return (
                    <button
                      key={addOn._id || addOn.name}
                      type="button"
                      disabled={addOn.isAvailable === false}
                      onClick={() => toggleAddOn(addOn)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        selected
                          ? "bg-[#FAF2E9] border-[#C8752A] text-[#24160F]"
                          : "bg-[#FAF5EF] border-[#EAE0D5] text-[#5A4031] hover:bg-white hover:border-[#C8752A]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            selected
                              ? "bg-[#C8752A] border-[#C8752A] text-white"
                              : "border-[#DCC9B3] bg-white"
                          }`}
                        >
                          {selected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-xs font-semibold">{addOn.name}</span>
                      </div>
                      <span className="text-xs font-bold text-[#C8752A]">
                        +₹{Number(addOn.price).toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions Note */}
          <div className="pt-2 border-t border-[#EAE0D5]">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#C8752A] mb-2">
              Chef Instructions (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Extra hot, crisp crust, no onion, less sugar..."
              rows={2}
              className="w-full text-xs p-3 rounded-2xl bg-[#FAF5EF] border border-[#EAE0D5] text-[#24160F] placeholder-[#9C8472] focus:outline-none focus:border-[#C8752A] resize-none"
            />
          </div>
        </div>

        {/* Modal Bottom Footer with Quantity and Add Button */}
        <div className="p-4 sm:p-5 bg-[#FAF5EF] border-t border-[#EAE0D5] flex items-center justify-between gap-4 shrink-0">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#EAE0D5]">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xl bg-[#FAF5EF] hover:bg-[#F3ECE1] border border-[#EAE0D5] disabled:opacity-40 text-[#24160F] flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-[#24160F]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl bg-[#C8752A] hover:bg-[#B45E1B] text-white flex items-center justify-center transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm text-white flex items-center justify-between transition-all active:scale-95 shadow-md shadow-[#C8752A]/20 ${
              addedAnimation ? "bg-[#16A34A]" : "bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A]"
            }`}
          >
            <span>{addedAnimation ? "Added to Order!" : "Add to Order"}</span>
            <span className="font-serif font-extrabold text-sm sm:text-base">
              ₹{totalPrice.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
