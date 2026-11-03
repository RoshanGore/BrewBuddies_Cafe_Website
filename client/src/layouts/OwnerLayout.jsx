import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import OwnerSidebar from "../components/owner/OwnerSidebar";
import { useAuth } from "../context/AuthContext";

const OwnerLayout = () => {
  const { user, ownerUser, isStaffOrOwner, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#24130A] flex items-center justify-center text-[#C8752A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#C8752A] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#DCC9B3]">Loading Cafe Hub...</span>
        </div>
      </div>
    );
  }

  const hasStaffAccess = isStaffOrOwner || ownerUser?.role === "owner" || ownerUser?.role === "staff";

  if (!hasStaffAccess) {
    return <Navigate to="/owner/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#F5EBDD] text-[#24160F]">
      <OwnerSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet context={{ mobileOpen, setMobileOpen }} />
      </main>
    </div>
  );
};

export default OwnerLayout;
