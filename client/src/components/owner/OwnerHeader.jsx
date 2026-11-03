import React from "react";
import { Coffee, ShieldCheck, Menu } from "lucide-react";
import { useOutletContext } from "react-router-dom";

const OwnerHeader = ({ title, subtitle, actions }) => {
  const context = useOutletContext();
  const setMobileOpen = context?.setMobileOpen;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="bg-[#FBF6EE]/95 backdrop-blur-md border-b border-[#DCC9B3] px-4 sm:px-8 py-4 sticky top-0 z-30 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-2xl bg-[#EFE0CB] hover:bg-[#DCC9B3] text-[#24160F] border border-[#DCC9B3] md:hidden shadow-xs transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-lg sm:text-xl font-bold font-serif text-[#24160F] leading-tight">
            {title}
          </h1>
          <p className="text-xs text-[#765F4D] mt-0.5">{subtitle || today}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 bg-[#EFE0CB] text-[#24160F] border border-[#DCC9B3] px-3.5 py-1 rounded-full text-xs font-semibold shadow-cozy">
          <span className="w-2 h-2 rounded-full bg-[#4F8061] animate-pulse"></span>
          <span>Cafe Hub Live</span>
        </div>
        {actions}
      </div>
    </header>
  );
};

export default OwnerHeader;
