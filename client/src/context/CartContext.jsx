import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("bb_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedOffer, setAppliedOffer] = useState(null);
  const [appliedReward, setAppliedReward] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  useEffect(() => {
    localStorage.setItem("bb_cart", JSON.stringify(cart));
  }, [cart]);

  // Add item to cart with variant & add-on support
  const addItem = (product, quantity = 1, notes = "", selectedVariant = null, selectedAddOns = []) => {
    // 1. Prevent unavailable items
    if (product.isAvailable === false) {
      alert("This item is currently unavailable and cannot be added to the cart.");
      return false;
    }

    // 2. Prevent quantity below 1
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    // 3. Prevent mixing items from different cafes
    if (cart.length > 0 && product.cafeId && cart[0].product?.cafeId) {
      if (cart[0].product.cafeId.toString() !== product.cafeId.toString()) {
        alert("You cannot add items from a different café to the same cart. Please finish your order or clear the cart first.");
        return false;
      }
    }

    // Calculate unit price
    const basePrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
    const addOnsTotal = Array.isArray(selectedAddOns)
      ? selectedAddOns.reduce((sum, a) => sum + (Number(a.price) || 0), 0)
      : 0;
    const unitPrice = Number((basePrice + addOnsTotal).toFixed(2));

    const getAddOnsSignature = (addOns) => {
      if (!Array.isArray(addOns) || addOns.length === 0) return "";
      return addOns.map((a) => a.name).sort().join("|");
    };

    const addOnsKey = getAddOnsSignature(selectedAddOns);
    const variantName = selectedVariant?.name || "";

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => {
        const itemVariantName = item.selectedVariant?.name || "";
        const itemAddOnsKey = getAddOnsSignature(item.selectedAddOns);
        return (
          item.product._id === product._id &&
          itemVariantName === variantName &&
          itemAddOnsKey === addOnsKey &&
          item.notes === notes
        );
      });

      const itemKey = `${product._id}-${variantName}-${addOnsKey}-${notes || ""}`;

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += qty;
        if (!updated[existingIndex].key) updated[existingIndex].key = itemKey;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            key: itemKey,
            product,
            name: product.name,
            selectedVariant: selectedVariant
              ? {
                  variantId: selectedVariant.variantId || selectedVariant._id,
                  name: selectedVariant.name,
                  price: Number(selectedVariant.price),
                }
              : null,
            selectedAddOns: Array.isArray(selectedAddOns)
              ? selectedAddOns.map((a) => ({
                  addOnId: a.addOnId || a._id,
                  name: a.name,
                  price: Number(a.price),
                }))
              : [],
            unitPrice,
            price: unitPrice,
            quantity: qty,
            notes,
          },
        ];
      }
    });
    return true;
  };

  // Remove item by index or key/id
  const removeItem = (target) => {
    setCart((prevCart) => {
      if (typeof target === "number") {
        return prevCart.filter((_, i) => i !== target);
      }
      return prevCart.filter((item, i) => {
        const itemKey = item.key || item._id || item.product?._id;
        return itemKey !== target && i !== target;
      });
    });
  };

  // Update item quantity safely (supports index or key, and delta or absolute qty)
  const updateQuantity = (target, deltaOrNewQty) => {
    setCart((prevCart) => {
      let index = -1;
      if (typeof target === "number") {
        index = target;
      } else if (target) {
        index = prevCart.findIndex(
          (item) => (item.key || item._id || item.product?._id) === target
        );
      }

      // If still not found and target was undefined, fallback to index 0 if single item
      if ((index === -1 || !prevCart[index]) && prevCart.length === 1) {
        index = 0;
      }

      if (index === -1 || !prevCart[index]) return prevCart;

      const updated = [...prevCart];
      const currentQty = updated[index].quantity || 1;

      let newQty;
      if (deltaOrNewQty === 1 || deltaOrNewQty === -1) {
        newQty = currentQty + deltaOrNewQty;
      } else if (typeof deltaOrNewQty === "number") {
        newQty = deltaOrNewQty;
      } else {
        newQty = currentQty + 1;
      }

      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }

      updated[index] = {
        ...updated[index],
        quantity: newQty,
      };
      return updated;
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setAppliedOffer(null);
    setAppliedReward(null);
    setPointsToRedeem(0);
    localStorage.removeItem("bb_cart");
  };

  // Apply discount offer (coupon)
  const applyOffer = (offerData) => {
    setAppliedOffer(offerData);
    setAppliedReward(null); // one discount type at a time for clean calculations
  };

  // Remove offer
  const removeOffer = () => {
    setAppliedOffer(null);
  };

  // Apply loyalty reward
  const applyReward = (rewardData) => {
    setAppliedReward(rewardData);
    setAppliedOffer(null);
  };

  // Remove reward
  const removeReward = () => {
    setAppliedReward(null);
  };

  // Apply direct points discount (1 point = ₹1 discount)
  const applyPointsDiscount = (points) => {
    const validPoints = Math.max(0, parseInt(points, 10) || 0);
    setPointsToRedeem(validPoints);
  };

  const removePointsDiscount = () => {
    setPointsToRedeem(0);
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedOffer) {
    discountAmount = appliedOffer.discountAmount || 0;
  } else if (appliedReward) {
    if (appliedReward.rewardType === "free_item") {
      discountAmount = appliedReward.discountValue || 0;
    } else if (appliedReward.rewardType === "percentage_discount") {
      discountAmount = (subtotal * appliedReward.discountValue) / 100;
    } else {
      discountAmount = appliedReward.discountValue || 0;
    }
  }

  // 1 point = ₹1 discount
  const pointsDiscount = pointsToRedeem > 0 ? pointsToRedeem : 0;
  discountAmount += pointsDiscount;
  discountAmount = Math.min(discountAmount, subtotal);

  const taxRate = 5; // 5%
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number(((taxableAmount * taxRate) / 100).toFixed(2));
  const totalAmount = Number((taxableAmount + taxAmount).toFixed(2));
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal: Number(subtotal.toFixed(2)),
        discountAmount: Number(discountAmount.toFixed(2)),
        taxAmount,
        totalAmount,
        totalItemsCount,
        appliedOffer,
        applyOffer,
        removeOffer,
        appliedReward,
        applyReward,
        removeReward,
        pointsToRedeem,
        applyPointsDiscount,
        removePointsDiscount,
        pointsDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
