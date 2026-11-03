import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import BottomNav from "../components/common/BottomNav";
import Footer from "../components/common/Footer";

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#24160F] flex flex-col justify-between selection:bg-[#C8752A] selection:text-white">
      <Navbar />
      <main className="flex-1 w-full pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default CustomerLayout;