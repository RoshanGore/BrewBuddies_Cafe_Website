import React, { useState } from "react";
import { Plus, Minus, Check, Sparkles } from "lucide-react";
import { useCart } from "../../context/CartContext";
import ProductDetailModal from "./ProductDetailModal";
import { getCategoryImage } from "../../utils/categoryImages";

const MenuItemCard = ({ product }) => {
  const { cart, addItem, updateQuantity } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if product has customizable options (variants or addOns)
  const hasVariants = product.variants && product.variants.length > 0;
  const hasAddOns = product.addOns && product.addOns.length > 0;
  const isCustomizable = hasVariants || hasAddOns;

  // Calculate total quantity of this base product in cart across all variant combinations
  const totalQuantity = cart
    .filter((item) => (item.product?._id || item.product?.id) === product._id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const handleActionClick = (e) => {
    e.stopPropagation();
    if (isCustomizable) {
      setIsModalOpen(true);
    } else {
      addItem(product, 1, "");
    }
  };

  const displayPrice = hasVariants
    ? Math.min(...product.variants.map((v) => Number(v.price) || product.price))
    : product.price;

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group relative bg-white rounded-3xl border border-[#EAE0D5] p-3.5 sm:p-4 shadow-sm hover:border-[#C8752A] hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
      >
        <div>
          {/* Product Image & Badges */}
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#FAF5EF] mb-3">
            <img
              src={getCategoryImage(product.category?.name || product.category, product.image, product.name)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />

            {/* Subtle light gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none"></div>

            {/* Top Left: Authentic Veg/Non-Veg symbol */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              {product.isVegetarian ? (
                <div
                  className="w-5 h-5 bg-white/95 border-[1.5px] border-[#16A34A] rounded-sm flex items-center justify-center shadow-xs"
                  title="Vegetarian"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></div>
                </div>
              ) : (
                <div
                  className="w-5 h-5 bg-white/95 border-[1.5px] border-[#DC2626] rounded-sm flex items-center justify-center shadow-xs"
                  title="Non-Vegetarian"
                >
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-[#DC2626]"></div>
                </div>
              )}

              {/* Tag pill */}
              {product.tags && product.tags[0] && (
                <span className="bg-[#FAF2E9] text-[#964B00] border border-[#F0D6BC] text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs tracking-tight">
                  {product.tags[0]}
                </span>
              )}
            </div>

            {/* Sold out overlay */}
            {!product.isAvailable && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-[#DC2626] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="mb-2">
            <h3 className="font-serif font-bold text-[#24160F] text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-[#C8752A] transition-colors">
              {product.name}
            </h3>
            <p className="text-[#6E5545] text-xs line-clamp-2 leading-relaxed mt-1 font-normal">
              {product.description || "Crafted fresh with authentic ingredients."}
            </p>
          </div>
        </div>

        {/* Bottom Row: Price & Action */}
        <div className="pt-2.5 border-t border-[#EAE0D5] flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C786B] block">
              {hasVariants ? "From" : "Price"}
            </span>
            <span className="text-sm sm:text-base font-serif font-extrabold text-[#24160F]">
              ₹{Number(displayPrice).toFixed(2)}
            </span>
          </div>

          {product.isAvailable ? (
            isCustomizable ? (
              <button
                type="button"
                onClick={handleActionClick}
                className="px-3.5 py-1.5 rounded-full bg-[#FAF2E9] hover:bg-[#C8752A] text-[#964B00] hover:text-white border border-[#E8D4C0] text-xs font-bold transition-all shadow-2xs flex items-center gap-1 active:scale-95"
              >
                <span>Customize</span>
                <Plus className="w-3.5 h-3.5" />
              </button>
            ) : totalQuantity > 0 ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 bg-[#FAF5EF] rounded-full p-1 border border-[#EAE0D5]"
              >
                <button
                  type="button"
                  onClick={() => {
                    const itemIndex = cart.findIndex((i) => (i.product?._id || i.product?.id) === product._id);
                    if (itemIndex > -1) updateQuantity(itemIndex, -1);
                  }}
                  className="w-6 h-6 rounded-full bg-white text-[#24160F] hover:bg-[#F3ECE1] border border-[#EAE0D5] flex items-center justify-center font-bold text-xs transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-4 text-center font-bold text-xs text-[#24160F]">
                  {totalQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => addItem(product, 1, "")}
                  className="w-6 h-6 rounded-full bg-[#C8752A] text-white hover:bg-[#D48328] flex items-center justify-center font-bold text-xs transition-colors shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleActionClick}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white flex items-center justify-center shadow-md shadow-[#C8752A]/20 hover:scale-105 active:scale-95 transition-all"
                aria-label={`Add ${product.name} to cart`}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            )
          ) : (
            <span className="text-[11px] text-[#8C786B] italic font-medium">Unavailable</span>
          )}
        </div>
      </div>

      {/* Variant & Add-on Modal */}
      <ProductDetailModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default MenuItemCard;
