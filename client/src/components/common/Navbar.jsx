import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Coffee,
  ShoppingBag,
  QrCode,
  Menu as MenuIcon,
  X,
  User,
  Phone,
  ArrowRight,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useTable } from "../../context/TableContext";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { totalItemsCount } = useCart();
  const { tableNumber, setTableNumber } = useTable();
  const { user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tempTableInput, setTempTableInput] = useState("");

  const handleTableSubmit = (e) => {
    e.preventDefault();
    if (tempTableInput && !isNaN(tempTableInput)) {
      setTableNumber(Number(tempTableInput));
      setShowTableModal(false);
      setTempTableInput("");
    }
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/menu", label: "Menu" },
    { to: "/rewards", label: "Rewards" },
    { to: "/offers", label: "Offers" },
    { to: "/orders", label: "Track Order" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE0D5] transition-colors shadow-xs">
        {/* Top Info Bar */}
        <div className="bg-[#FAF5EF] border-b border-[#EAE0D5] text-[11px] py-1.5 px-4 text-[#765F4D]">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
              <span className="font-semibold text-[#24160F]">Dine-in Open Now</span>
              <span className="hidden sm:inline text-[#DCC9B3]">•</span>
              <span className="hidden sm:inline font-medium">9:30 AM – 10:00 PM</span>
              <span className="hidden sm:inline text-[#DCC9B3]">•</span>
              <span className="hidden sm:inline font-medium">Kopargaon</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="tel:+918275115011" className="hover:text-[#C8752A] transition-colors hidden sm:flex items-center gap-1 font-medium">
                <Phone className="w-3 h-3 text-[#C8752A]" />
                <span>+91 8275115011</span>
              </a>
              <Link to="/owner/login" className="text-[#8C786B] hover:text-[#C8752A] transition-colors font-medium">
                Staff Portal
              </Link>
            </div>
          </div>
        </div>

        {/* Main Navigation Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C8752A] to-[#E5A04B] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Coffee className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-bold font-serif tracking-tight text-[#24160F] block leading-none">
                BrewBuddies
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#C8752A] mt-0.5 block">
                Premium Cafe
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#FAF5EF] p-1.5 rounded-full border border-[#EAE0D5]">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#C8752A] text-white shadow-sm"
                      : "text-[#5A4031] hover:text-[#24160F] hover:bg-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Table Badge, Cart, Profile, Order Now */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Table Identification Button */}
            <button
              onClick={() => setShowTableModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF5EF] border border-[#EAE0D5] text-xs font-semibold hover:border-[#C8752A] transition-all text-[#24160F]"
              title="Change or select table"
            >
              {tableNumber ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
                  <span className="text-[#24160F] font-bold">Table #{tableNumber}</span>
                </>
              ) : (
                <>
                  <QrCode className="w-3.5 h-3.5 text-[#C8752A]" />
                  <span className="text-[#6E5545]">Select Table</span>
                </>
              )}
            </button>

            {/* Profile / Login */}
            <Link
              to={user ? "/profile" : "/login"}
              className="p-2 rounded-2xl bg-[#FAF5EF] hover:bg-[#F3ECE1] text-[#24160F] transition-colors border border-[#EAE0D5] hidden sm:flex items-center justify-center"
              aria-label="Profile"
              title={user ? `Signed in as ${user.name}` : "Sign In with Google or Email"}
            >
              <User className="w-4 h-4 text-[#6E5545]" />
            </Link>

            {/* Cart Icon with Counter */}
            <Link
              to="/cart"
              className="relative p-2 sm:px-3 sm:py-2 rounded-2xl bg-[#FAF5EF] hover:bg-[#F3ECE1] text-[#24160F] transition-colors border border-[#EAE0D5] flex items-center gap-1.5"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#24160F]" />
              {totalItemsCount > 0 && (
                <span className="bg-[#C8752A] text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* Order Now CTA Button */}
            <Link
              to="/menu"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white text-xs font-bold shadow-md shadow-[#C8752A]/20 transition-all active:scale-95"
            >
              <span>Order Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger Burger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-2xl bg-[#FAF5EF] border border-[#EAE0D5] text-[#24160F]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#EAE0D5] px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2.5 rounded-2xl text-xs font-semibold text-center border ${
                    location.pathname === item.to
                      ? "bg-[#C8752A] text-white border-[#C8752A] shadow-xs"
                      : "bg-[#FAF5EF] text-[#5A4031] border-[#EAE0D5] hover:bg-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-[#EAE0D5] flex items-center justify-between">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-[#C8752A] flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>{user ? user.name : "Sign In / Account"}</span>
              </Link>
              <Link
                to="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-full bg-[#C8752A] text-white font-bold text-xs shadow-xs"
              >
                Order Now
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Table Selector Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE0D5] rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 text-[#24160F]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FAF5EF] flex items-center justify-center text-[#C8752A] border border-[#EAE0D5]">
                  <QrCode className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg font-bold text-[#24160F]">Dine-in Table</h4>
              </div>
              <button
                onClick={() => setShowTableModal(false)}
                className="p-1 rounded-full text-[#765F4D] hover:text-[#24160F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6E5545] mb-4">
              Enter the table number from your physical table stand or QR sticker to connect your cart.
            </p>

            <form onSubmit={handleTableSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#C8752A] uppercase tracking-wider mb-1.5">
                  Table Number (1 to 20)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={tempTableInput}
                  onChange={(e) => setTempTableInput(e.target.value)}
                  placeholder={tableNumber ? `Current: Table #${tableNumber}` : "e.g. 3"}
                  className="w-full text-sm p-3 rounded-2xl bg-[#FAF5EF] border border-[#EAE0D5] text-[#24160F] placeholder-[#9C8472] focus:outline-none focus:border-[#C8752A]"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                {tableNumber && (
                  <button
                    type="button"
                    onClick={() => {
                      setTableNumber(null);
                      setShowTableModal(false);
                    }}
                    className="px-4 py-2 rounded-2xl text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2]"
                  >
                    Clear Table
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-gradient-to-r from-[#C8752A] to-[#D98738] text-white text-xs font-bold shadow-md shadow-[#C8752A]/20"
                >
                  Set Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
