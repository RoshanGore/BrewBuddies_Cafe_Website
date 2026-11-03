import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BellRing,
  Users,
  Coffee,
  Gift,
  Tag,
  BarChart3,
  QrCode,
  Settings,
  LogOut,
  ExternalLink,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const OwnerSidebar = ({ mobileOpen, setMobileOpen }) => {
  const { logoutOwner, logout, ownerUser, user } = useAuth();
  const currentStaff = ownerUser || user;
  const navigate = useNavigate();

  const menuItems = [
    { label: "Dashboard", to: "/owner/dashboard", icon: LayoutDashboard },
    { label: "Orders", to: "/owner/orders", icon: BellRing },
    { label: "Products", to: "/owner/products", icon: Coffee },
    { label: "Customers", to: "/owner/customers", icon: Users },
    { label: "Rewards", to: "/owner/rewards", icon: Gift },
    { label: "Offers", to: "/owner/offers", icon: Tag },
    { label: "QR Codes", to: "/owner/qr-codes", icon: QrCode },
    { label: "Analytics", to: "/owner/analytics", icon: BarChart3 },
    { label: "Settings", to: "/owner/settings", icon: Settings, ownerOnly: true },
  ];

  const handleLogout = () => {
    logoutOwner();
    navigate("/owner/login");
  };

  const handleLinkClick = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 w-64 bg-white text-[#6B5A4E] flex flex-col justify-between shrink-0 h-screen border-r border-[#EAE0D5] shadow-cozy-lg transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Brand */}
          <div className="p-5 border-b border-[#EAE0D5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C8752A] text-white flex items-center justify-center font-bold shadow-caramel-glow">
                <Coffee className="w-5 h-5 stroke-[2.3]" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-serif text-[#24160F] tracking-tight leading-none">
                  BrewBuddies
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C8752A] mt-1 block">
                  Staff & Owner Hub
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className="p-1.5 rounded-xl text-[#8C7A6B] hover:text-[#24160F] hover:bg-[#FAF7F2] md:hidden transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation items */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-230px)] no-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#C8752A] text-white shadow-caramel-glow font-bold"
                        : "text-[#6B5A4E] hover:text-[#24160F] hover:bg-[#FAF7F2]"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User profile & Customer View Switch */}
        <div className="p-4 border-t border-[#EAE0D5] space-y-2.5 bg-[#FAF7F2]/60">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-2xl bg-white hover:bg-[#FAF7F2] text-[#24160F] text-xs font-semibold transition-colors border border-[#EAE0D5] shadow-xs"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#C8752A]" />
              <span>Customer View</span>
            </span>
            <span className="text-[10px] bg-[#FAF7F2] border border-[#EAE0D5] px-2 py-0.5 rounded-lg text-[#8C7A6B]">Preview</span>
          </Link>

          <div className="flex items-center justify-between pt-1 px-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-2xl bg-white border border-[#EAE0D5] flex items-center justify-center text-[#C8752A] font-bold text-xs shadow-xs">
                {currentStaff?.name ? currentStaff.name[0].toUpperCase() : "O"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#24160F] truncate leading-none">
                  {currentStaff?.name || "Owner"}
                </p>
                <span className="text-[10px] text-[#8C7A6B] capitalize font-medium">{currentStaff?.role || "Staff"}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-xl text-[#8C7A6B] hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default OwnerSidebar;
