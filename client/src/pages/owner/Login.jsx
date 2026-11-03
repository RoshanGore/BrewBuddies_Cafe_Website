import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Coffee, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const Login = () => {
  const navigate = useNavigate();
  const { loginOwner } = useAuth();
  const [email, setEmail] = useState("owner@brewbuddies.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        loginOwner(res.token, res.user);
        navigate("/owner/dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to log in. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("owner@brewbuddies.com");
    setPassword("admin123");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative silky coffee glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#E5A04B]/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#C8752A]/10 blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-[#C8752A] text-white flex items-center justify-center mx-auto mb-3.5 shadow-caramel-glow group">
            <Coffee className="w-8 h-8 stroke-[2.3]" />
          </div>
          <h1 className="text-3xl font-bold font-serif text-[#24160F] tracking-tight">
            BrewBuddies
          </h1>
          <p className="text-xs text-[#C8752A] mt-1 uppercase tracking-widest font-bold">
            Staff & Owner Hub Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#EAE0D5] rounded-3xl p-7 shadow-cozy-lg space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B5A4E] mb-1.5">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@brewbuddies.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#EAE0D5] rounded-2xl text-xs text-[#24160F] placeholder-[#A69080] focus:outline-none focus:border-[#C8752A] focus:ring-1 focus:ring-[#C8752A]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B5A4E] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#EAE0D5] rounded-2xl text-xs text-[#24160F] placeholder-[#A69080] focus:outline-none focus:border-[#C8752A] focus:ring-1 focus:ring-[#C8752A]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#C8752A] hover:bg-[#B36420] disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-caramel-glow transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="pt-3.5 border-t border-[#EAE0D5] text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs text-[#C8752A] hover:underline font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C8752A]" />
              <span>Use Demo Credentials (owner@brewbuddies.com)</span>
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-xs text-[#6B5A4E] hover:text-[#24160F] transition-colors font-medium"
          >
            ← Back to Customer Dine-In Menu
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
