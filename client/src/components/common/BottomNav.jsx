import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Utensils, ShoppingBag, Receipt, Gift, Tag, User } from "lucide-react";
import { useCart } from "../../context/CartContext";

const BottomNav = () => {
  const { totalItemsCount } = useCart();

  const navItems = [
    { label: "Home", to: "/", icon: Home, exact: true },
    { label: "Menu", to: "/menu", icon: Utensils },
    { label: "Cart", to: "/cart", icon: ShoppingBag, badge: totalItemsCount },
    { label: "Orders", to: "/orders", icon: Receipt },
    { label: "Rewards", to: "/rewards", icon: Gift },
    { label: "Offers", to: "/offers", icon: Tag },
    { label: "Profile", to: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE0D5] py-2 px-2 shadow-xl md:hidden">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "text-[#C8752A] font-bold bg-[#FAF2E9] border border-[#E8D4C0] shadow-xs"
                    : "text-[#765F4D] hover:text-[#24160F]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-transform ${
                        isActive ? "text-[#C8752A] stroke-[2.4] scale-110" : "stroke-[1.8]"
                      }`}
                    />
                    {item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 bg-[#C8752A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
