import React from "react";
import { Link } from "react-router-dom";
import {
  Coffee,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ArrowUp,
  ExternalLink,
} from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const aiQuery = encodeURIComponent(
    "Summarize BrewBuddies Cafe in Kopargaon: menu, bestsellers, dine-in ordering, prices, and location"
  );

  return (
    <footer className="bg-[#FAF5EF] border-t border-[#EAE0D5] text-[#6E5545] pt-12 pb-24 md:pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. AI Summary Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-[#FBF6EE] to-white border border-[#EAE0D5] p-5 sm:p-7 mb-12 shadow-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5 text-center lg:text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#C8752A]/10 border border-[#C8752A]/20 flex items-center justify-center text-[#C8752A] shrink-0 shadow-xs">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-[#24160F]">
                  Summarise BrewBuddies with AI
                </h4>
                <p className="text-xs text-[#765F4D] mt-0.5">
                  Menu, bestsellers, offers, and table dine-in info in one instant answer
                </p>
              </div>
            </div>

            {/* AI Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <a
                href={`https://chatgpt.com/?q=${aiQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-white hover:bg-[#F3ECE1] border border-[#EAE0D5] text-xs font-semibold text-[#24160F] flex items-center gap-1.5 transition-all hover:scale-105 shadow-xs"
              >
                <span>ChatGPT</span>
                <ExternalLink className="w-3 h-3 text-[#C8752A]" />
              </a>
              <a
                href={`https://claude.ai/new?q=${aiQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-white hover:bg-[#F3ECE1] border border-[#EAE0D5] text-xs font-semibold text-[#24160F] flex items-center gap-1.5 transition-all hover:scale-105 shadow-xs"
              >
                <span>Claude</span>
                <ExternalLink className="w-3 h-3 text-[#C8752A]" />
              </a>
              <a
                href={`https://www.perplexity.ai/search?q=${aiQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-white hover:bg-[#F3ECE1] border border-[#EAE0D5] text-xs font-semibold text-[#24160F] flex items-center gap-1.5 transition-all hover:scale-105 shadow-xs"
              >
                <span>Perplexity</span>
                <ExternalLink className="w-3 h-3 text-[#C8752A]" />
              </a>
              <a
                href={`https://www.google.com/search?q=${aiQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-white hover:bg-[#F3ECE1] border border-[#EAE0D5] text-xs font-semibold text-[#24160F] flex items-center gap-1.5 transition-all hover:scale-105 shadow-xs"
              >
                <span>Google AI</span>
                <ExternalLink className="w-3 h-3 text-[#C8752A]" />
              </a>
            </div>
          </div>
        </div>

        {/* 2. Main Footer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand & Story */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C8752A] to-[#E5A04B] text-white flex items-center justify-center shadow-md">
                <Coffee className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xl font-bold font-serif text-[#24160F] tracking-tight block">
                  BrewBuddies
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#C8752A]">
                  Artisan Cafe & Bites
                </span>
              </div>
            </Link>
            <p className="text-xs text-[#6E5545] leading-relaxed">
              Kopargaon’s premier destination for handcrafted specialty coffee, stone-baked pizzas, zesty mocktails, and gourmet snacks.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-[#C8752A]">
              <Clock className="w-4 h-4" />
              <span>Open Daily: 9:30 AM – 10:00 PM</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h5 className="font-serif text-sm font-bold text-[#24160F] uppercase tracking-wider mb-4">
              Explore
            </h5>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/menu" className="hover:text-[#C8752A] transition-colors flex items-center gap-1.5">
                  <span>Browse Full Menu</span>
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-[#C8752A] transition-colors flex items-center gap-1.5">
                  <span>Live Kitchen Tracking</span>
                </Link>
              </li>
              <li>
                <Link to="/rewards" className="hover:text-[#C8752A] transition-colors flex items-center gap-1.5">
                  <span>Loyalty Points & Rewards</span>
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-[#C8752A] transition-colors flex items-center gap-1.5">
                  <span>Special Deals & Coupons</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#C8752A] transition-colors flex items-center gap-1.5">
                  <span>Customer Account & History</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h5 className="font-serif text-sm font-bold text-[#24160F] uppercase tracking-wider mb-4">
              Get in Touch
            </h5>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#C8752A] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-[#24160F]">Phone Orders & Inquiries</span>
                  <a href="tel:+918275115011" className="hover:text-[#C8752A] transition-colors font-medium">
                    +91 8275115011
                  </a>
                  <span className="text-[#A69080] mx-1.5">/</span>
                  <a href="tel:+918275155355" className="hover:text-[#C8752A] transition-colors font-medium">
                    +91 8275155355
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#C8752A] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-[#24160F]">Customer Support</span>
                  <a href="mailto:contact@brewbuddies.com" className="hover:text-[#C8752A] transition-colors font-medium">
                    contact@brewbuddies.com
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Registered Cafe Location & Directions */}
          <div>
            <h5 className="font-serif text-sm font-bold text-[#24160F] uppercase tracking-wider mb-4">
              Visit Our Cafe
            </h5>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C8752A] shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[#6E5545]">
                  Sanika Plaza, Dharangaon Road, Kopargaon, Ahilyanagar, Maharashtra – 423601
                </p>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Sanika+Plaza+Dharangaon+Road+Kopargaon"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C8752A] hover:text-[#964B00] transition-colors"
              >
                <span>Get Driving Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Payment Badges */}
              <div className="pt-3 border-t border-[#EAE0D5]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#765F4D] block mb-2">
                  Payment Accepted
                </span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-[#5A4031]">
                  <span className="px-2 py-1 rounded-md bg-white border border-[#EAE0D5] shadow-2xs">UPI / QR</span>
                  <span className="px-2 py-1 rounded-md bg-white border border-[#EAE0D5] shadow-2xs">Google Pay</span>
                  <span className="px-2 py-1 rounded-md bg-white border border-[#EAE0D5] shadow-2xs">PhonePe</span>
                  <span className="px-2 py-1 rounded-md bg-white border border-[#EAE0D5] shadow-2xs">Cash at Counter</span>
                  <span className="px-2 py-1 rounded-md bg-white border border-[#EAE0D5] shadow-2xs">Cards</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Row & Back to Top */}
        <div className="pt-8 border-t border-[#EAE0D5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C786B]">
          <p>© {new Date().getFullYear()} BrewBuddies Cafe. All Rights Reserved. Dine-in & Loyalty Platform.</p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs font-bold text-[#C8752A] hover:text-[#964B00] transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
