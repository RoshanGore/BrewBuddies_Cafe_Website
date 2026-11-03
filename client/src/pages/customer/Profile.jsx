import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Phone,
  Award,
  Shield,
  LogIn,
  Check,
  Coffee,
  LogOut,
  Edit2,
  Receipt,
  Gift,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LoyaltyCard from "../../components/customer/LoyaltyCard";
import api from "../../services/api";

const Profile = () => {
  const { user, setCustomerSession, logout, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");

  useEffect(() => {
    if (refreshUser) refreshUser();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    setCustomerSession(localStorage.getItem("bb_token") || "", {
      ...user,
      name,
      phone,
    });
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    if (!loginPhone.trim()) return;
    setLoginLoading(true);
    setLoginMessage("");

    try {
      const res = await api.customerSession({
        name: loginName.trim() || "Guest Diner",
        phone: loginPhone.trim(),
      });

      if (res.success && res.user) {
        setCustomerSession(res.token, res.user);
        setName(res.user.name);
        setPhone(res.user.phone);
        setLoginMessage("Welcome back! Signed in successfully.");
      }
    } catch (err) {
      setLoginMessage(err.message || "Sign in failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignOut = () => {
    logout();
    setName("");
    setPhone("");
  };

  const initial = (name || user?.name || "Guest").charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#C8752A] block">
          Customer Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#24160F] mt-1">
          Diner Profile & Loyalty
        </h1>
        <p className="text-xs sm:text-sm text-[#6B5A4E]">
          Manage your dine-in identity, view accumulated points, and access past visits.
        </p>
      </div>

      {user ? (
        <>
          {/* Profile Overview Card */}
          <div className="bg-white rounded-3xl border border-[#EAE0D5] p-5 sm:p-7 shadow-cozy flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C8752A] to-[#8B4A1D] text-white font-extrabold font-serif text-2xl flex items-center justify-center shadow-md shrink-0 border border-[#C8752A]/30">
                {initial}
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#24160F]">
                  {name || user.name || "Dine-in Guest"}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-[#C8752A]">Club Diner</span>
                  <span className="text-[#EAE0D5]">•</span>
                  <span className="text-xs text-[#8C7A6B]">{user.phone || phone}</span>
                  <span className="text-[#EAE0D5]">•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C8752A] bg-[#FDF9F3] px-2.5 py-0.5 rounded-full border border-[#EAE0D5]">
                    <Sparkles className="w-3 h-3 text-[#C8752A]" />
                    <span>{user.points ?? user.loyaltyPoints ?? 0} pts</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#24160F] text-xs font-semibold border border-[#EAE0D5] transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#C8752A]" />
              <span>{isEditing ? "Close" : "Edit"}</span>
            </button>
          </div>

          {/* Loyalty Status Card */}
          <LoyaltyCard />

          {/* Quick Links Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/orders"
              className="p-5 rounded-3xl bg-white border border-[#EAE0D5] hover:border-[#C8752A] transition-all flex items-center justify-between group shadow-cozy"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#EAE0D5] text-[#C8752A] flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#24160F] group-hover:text-[#C8752A] transition-colors">
                    Kitchen Orders
                  </h4>
                  <p className="text-xs text-[#8C7A6B]">View all receipts</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8C7A6B] group-hover:text-[#C8752A] group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/rewards"
              className="p-5 rounded-3xl bg-white border border-[#EAE0D5] hover:border-[#C8752A] transition-all flex items-center justify-between group shadow-cozy"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#EAE0D5] text-[#C8752A] flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#24160F] group-hover:text-[#C8752A] transition-colors">
                    Redeem Rewards
                  </h4>
                  <p className="text-xs text-[#8C7A6B]">Claim perks & drinks</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8C7A6B] group-hover:text-[#C8752A] group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/security"
              className="p-5 rounded-3xl bg-white border border-[#EAE0D5] hover:border-[#C8752A] transition-all flex items-center justify-between group shadow-cozy"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#EAE0D5] text-[#C8752A] flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#24160F] group-hover:text-[#C8752A] transition-colors">
                    Account & Security
                  </h4>
                  <p className="text-xs text-[#8C7A6B]">Google, Phone & Password</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8C7A6B] group-hover:text-[#C8752A] group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          {/* Account Edit Form */}
          {isEditing && (
            <div className="bg-white rounded-3xl border border-[#EAE0D5] p-6 shadow-cozy animate-in fade-in duration-200">
              <h3 className="text-xs font-bold text-[#C8752A] uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Update Contact Details</span>
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B5A4E] mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-4 py-3 bg-[#FAF7F2] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#C8752A] text-[#24160F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B5A4E] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-4 py-3 bg-[#FAF7F2] border border-[#EAE0D5] rounded-2xl focus:outline-none focus:border-[#C8752A] text-[#24160F]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#C8752A] hover:bg-[#D48328] text-white font-bold text-xs transition-all shadow-caramel-glow flex items-center justify-center gap-2 active:scale-95"
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Updated Successfully!</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full py-3.5 rounded-2xl border border-red-200 bg-white hover:bg-red-50 text-red-600 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out / Switch Account</span>
          </button>
        </>
      ) : (
        <div className="bg-white rounded-3xl border border-[#EAE0D5] p-6 sm:p-10 shadow-cozy space-y-6 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-[#FAF2E9] text-[#C8752A] border border-[#E8D4C0] flex items-center justify-center mx-auto shadow-inner">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#24160F]">
              Sign In to Your Loyalty Account
            </h3>
            <p className="text-xs text-[#8C7A6B] mt-2 leading-relaxed max-w-sm mx-auto">
              Sign in with your Google account or Email to view your accumulated loyalty points, redeem perks, and track dine-in orders.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/login?redirect=/profile"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white font-bold text-xs transition-all shadow-md shadow-[#C8752A]/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Google or Email</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register?redirect=/profile"
              className="w-full py-3 rounded-2xl bg-[#FAF5EF] hover:bg-[#F3ECE1] border border-[#EAE0D5] text-[#24160F] font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>Create New Account</span>
            </Link>
          </div>
        </div>
      )}

      {/* Cafe Staff / Owner Portal Quick Link */}
      <div className="bg-white rounded-3xl p-6 border border-[#EAE0D5] text-center shadow-cozy">
        <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] text-[#C8752A] border border-[#EAE0D5] flex items-center justify-center mx-auto mb-2.5">
          <Shield className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-bold text-[#24160F] uppercase tracking-wider font-serif">
          BrewBuddies Staff & Owner Portal
        </h4>
        <p className="text-xs text-[#8C7A6B] mt-1 max-w-xs mx-auto mb-4">
          Kitchen live orders, menu catalog management, and table QR configuration.
        </p>
        <Link
          to="/owner/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#24160F] text-xs font-bold border border-[#EAE0D5] transition-all"
        >
          <LogIn className="w-3.5 h-3.5 text-[#C8752A]" />
          <span>Staff Login</span>
        </Link>
      </div>
    </div>
  );
};

export default Profile;
