import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Coffee,
  Utensils,
  Gift,
  Tag,
  Sparkles,
  ArrowRight,
  Clock,
  Receipt,
  ChevronRight,
  QrCode,
  MapPin,
  Phone,
  CheckCircle2,
  Flame,
  Star,
  Award,
} from "lucide-react";
import MenuItemCard from "../../components/customer/MenuItemCard";
import { getCategoryImage } from "../../utils/categoryImages";
import { useAuth } from "../../context/AuthContext";
import { useTable } from "../../context/TableContext";
import api from "../../services/api";

const Home = () => {
  const { user } = useAuth();
  const { tableNumber } = useTable();
  const navigate = useNavigate();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [pointsSummary, setPointsSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategoryTab, setActiveCategoryTab] = useState("all");

  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        const fetchTasks = [
          api.getProducts(),
          api.getCategories().catch(() => ({ success: false, categories: [] })),
          api.getOffers().catch(() => ({ success: false, offers: [] })),
        ];

        // Fetch user-specific data only when authenticated
        if (user) {
          fetchTasks.push(
            api.getMyOrders(user?.phone).catch(() => ({ success: false, orders: [] })),
            api.getPointsSummary().catch(() => ({ success: false }))
          );
        } else {
          // For guests, check if they recently placed an order on this device
          const lastOrderId = localStorage.getItem("bb_last_order");
          if (lastOrderId) {
            fetchTasks.push(
              api
                .getOrderById(lastOrderId)
                .then((res) => ({ success: true, orders: res.order ? [res.order] : [] }))
                .catch(() => ({ success: false, orders: [] }))
            );
          }
        }

        const [prodRes, catRes, offerRes, ordersRes, pointsRes] = await Promise.all(fetchTasks);

        if (isMounted) {
          if (prodRes?.success && prodRes.products) {
            setFeaturedProducts(prodRes.products);
          }
          if (catRes?.success && catRes.categories) {
            setCategories(catRes.categories);
          }
          if (offerRes?.success && offerRes.offers) {
            setOffers(offerRes.offers.filter((o) => o.isActive !== false).slice(0, 3));
          }
          if (ordersRes?.success && ordersRes.orders && ordersRes.orders.length > 0) {
            const lastOrderId = localStorage.getItem("bb_last_order");
            let targetOrder = null;
            // 1. Try matching the saved active order if still ongoing
            if (lastOrderId) {
              targetOrder = ordersRes.orders.find(
                (o) => (o._id === lastOrderId || o.orderNumber === lastOrderId) &&
                       o.status !== "served" && o.status !== "cancelled"
              );
            }
            // 2. Try matching active table if sitting at a specific table
            if (!targetOrder && tableNumber) {
              targetOrder = ordersRes.orders.find(
                (o) => Number(o.tableNumber) === Number(tableNumber) &&
                       o.status !== "served" && o.status !== "cancelled"
              );
            }
            // 3. Fall back to first ongoing order
            if (!targetOrder) {
              targetOrder = ordersRes.orders.find(
                (o) => o.status !== "served" && o.status !== "cancelled"
              );
            }
            if (targetOrder) {
              setActiveOrder(targetOrder);
            }
          }
          if (pointsRes && pointsRes.success) {
            setPointsSummary(pointsRes);
          }
        }
      } catch (err) {
        console.warn("[Home] Data load error:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHomeData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const currentPoints = pointsSummary?.points ?? (user?.points || user?.loyaltyPoints || 0);

  // Filter products for the featured section
  const displayedProducts =
    activeCategoryTab === "all"
      ? featuredProducts.slice(0, 8)
      : featuredProducts
          .filter((p) => {
            const catName = p.category?.name || p.category;
            return catName?.toLowerCase() === activeCategoryTab.toLowerCase();
          })
          .slice(0, 8);

  const galleryImages = [
    {
      url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
      title: "Chilled Frappes & Cold Brews",
    },
    {
      url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
      title: "Stone-Baked Pizzas",
    },
    {
      url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
      title: "Boiled Kadak & Masala Chaai",
    },
    {
      url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
      title: "Artisan Gourmet Burgers",
    },
    {
      url: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80",
      title: "Crunchy Fried Chicken",
    },
    {
      url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
      title: "Refreshing Coolers & Mojitos",
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FBF7F0] via-[#F7EFE4] to-[#FAF8F5] pt-4 sm:pt-6 pb-8 sm:pb-12 border-b border-[#EAE0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Active Kitchen Order Notification if any */}
          {activeOrder && (
            <div className="mb-6 bg-white border-2 border-[#C8752A] rounded-3xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse-soft">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#FAF2E9] border border-[#E8D4C0] flex items-center justify-center text-[#C8752A] shrink-0">
                  <Receipt className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C8752A]">
                      Live Kitchen Order #{activeOrder.orderNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#C8752A] text-white uppercase shadow-xs">
                      {activeOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#6E5545] mt-1 font-medium">
                    Table #{activeOrder.tableNumber} • {activeOrder.items?.length || 0} item(s) • Total: ₹{Number(activeOrder.total || 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <Link
                to="/orders"
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#C8752A] to-[#D98738] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#C8752A]/20 transition-all hover:scale-105 active:scale-95"
              >
                <span>Track Progress</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Seated Table Notification Banner */}
          {tableNumber && !activeOrder && (
            <div className="mb-6 bg-gradient-to-r from-[#FAF2E9] to-[#FFFDF9] border border-[#E8D4C0] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white border border-[#E8D4C0] flex items-center justify-center text-[#C8752A] shadow-xs shrink-0">
                  <QrCode className="w-5 h-5 text-[#C8752A]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C8752A]">
                      Dine-In Table #{tableNumber} Confirmed
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
                  </div>
                  <p className="text-xs text-[#6E5545] mt-0.5">
                    Your table is set! Any items you add will be delivered directly to Table #{tableNumber}.
                  </p>
                </div>
              </div>
              <Link
                to="/menu"
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white text-xs font-bold transition-all shadow-md shadow-[#C8752A]/20 flex items-center justify-center gap-1.5"
              >
                <span>Browse Menu & Order</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Hero Main Card */}
          <div className="relative rounded-3xl overflow-hidden bg-white border border-[#EAE0D5] p-6 sm:p-10 lg:p-14 shadow-xl">
            {/* Background ambient lighting */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#C8752A]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#E5A04B]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Headlines & CTAs */}
              <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF2E9] border border-[#E8D4C0] text-[#964B00] text-xs font-bold shadow-xs">
                  <Flame className="w-4 h-4 text-[#C8752A]" />
                  <span>Kopargaon’s Favourite Artisan Cafe</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-[#24160F] leading-[1.15] tracking-tight">
                  Handcrafted Brews, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8752A] via-[#E5A04B] to-[#964B00]">
                    Fresh Gourmet Bites.
                  </span>
                </h1>

                <p className="text-xs sm:text-sm lg:text-base text-[#6E5545] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  Welcome to BrewBuddies. From authentic Kadak Chaai and frothy cold coffees to hand-stretched stone pizzas, crispy chicken, and wraps—order right from your table for a seamless dine-in experience.
                </p>

                {/* CTAs */}
                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
                  <Link
                    to="/menu"
                    className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#C8752A]/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    <span>Explore Full Menu</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/rewards"
                    className="px-6 py-3.5 rounded-full bg-[#FAF5EF] hover:bg-[#F3ECE1] text-[#24160F] hover:text-[#C8752A] border border-[#EAE0D5] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs"
                  >
                    <Gift className="w-4 h-4 text-[#C8752A]" />
                    <span>Loyalty Rewards ({currentPoints} pts)</span>
                  </Link>
                </div>

                {/* Feature Pills */}
                <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-[#765F4D] font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span>Table QR Ordering</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span>100% Fresh Ingredients</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span>Pure Veg & Non-Veg Kitchen</span>
                  </div>
                </div>
              </div>

              {/* Right Column: High Quality Imagery Collage */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border-2 border-[#EAE0D5] group bg-[#FAF5EF]">
                  <img
                    src="/images/hero-chaai-affair.jpg"
                    alt="Chaai Affair Kopargaon Special Food Menu"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none"></div>

                  {/* Floating table status card on the image */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-[#EAE0D5] rounded-2xl p-3 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF2E9] flex items-center justify-center text-[#C8752A]">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#765F4D] uppercase tracking-wider block font-bold">
                          Dine-in Status
                        </span>
                        <span className="text-xs font-bold text-[#24160F]">
                          {tableNumber ? `Seated at Table #${tableNumber}` : "Scan table QR or tap to select"}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/menu"
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#C8752A] to-[#D98738] text-white text-[11px] font-bold shadow-xs"
                    >
                      Order
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ACTIONS CENTER / ORDER MODES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#EAE0D5] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#EAE0D5]">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#C8752A]">
                How would you like to order today?
              </p>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#24160F] mt-1">
                BREWBUDDIES CAFE <span className="text-xs font-normal text-[#765F4D] ml-2 font-sans">Kopargaon, Ahilyanagar</span>
              </h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF5EF] border border-[#EAE0D5] text-xs font-semibold text-[#16A34A]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
              <span>Open now • till 10:00 PM</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Action 1: Table Dine-In */}
            <Link
              to="/menu"
              className="p-5 rounded-2xl bg-[#FAF5EF] border border-[#EAE0D5] hover:border-[#C8752A] hover:bg-white hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE0D5] text-[#C8752A] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Utensils className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF2E9] text-[#964B00] border border-[#E8D4C0]">
                  Dine-in
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#24160F] group-hover:text-[#C8752A] transition-colors">
                  Dine-in Order
                </h4>
                <p className="text-xs text-[#765F4D] mt-1 font-normal">
                  {tableNumber ? `Ready for Table #${tableNumber}` : "Browse menu & order from table"}
                </p>
              </div>
            </Link>

            {/* Action 2: Loyalty Club */}
            <Link
              to="/rewards"
              className="p-5 rounded-2xl bg-[#FAF5EF] border border-[#EAE0D5] hover:border-[#C8752A] hover:bg-white hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE0D5] text-[#C8752A] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Gift className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#16A34A] border border-[#A7F3D0]">
                  Loyalty
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#24160F] group-hover:text-[#C8752A] transition-colors">
                  Rewards Club
                </h4>
                <p className="text-xs text-[#765F4D] mt-1 font-normal">
                  {currentPoints} Points Available • Redeem discounts
                </p>
              </div>
            </Link>

            {/* Action 3: Offers & Promo Codes */}
            <Link
              to="/offers"
              className="p-5 rounded-2xl bg-[#FAF5EF] border border-[#EAE0D5] hover:border-[#C8752A] hover:bg-white hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE0D5] text-[#C8752A] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Tag className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF2E9] text-[#964B00] border border-[#E8D4C0]">
                  {offers.length} Active
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#24160F] group-hover:text-[#C8752A] transition-colors">
                  Exclusive Deals
                </h4>
                <p className="text-xs text-[#765F4D] mt-1 font-normal">
                  Coupons, combo discounts & specials
                </p>
              </div>
            </Link>

            {/* Action 4: Track Past & Active Orders */}
            <Link
              to="/orders"
              className="p-5 rounded-2xl bg-[#FAF5EF] border border-[#EAE0D5] hover:border-[#C8752A] hover:bg-white hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE0D5] text-[#C8752A] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF2E9] text-[#964B00] border border-[#E8D4C0]">
                  Orders
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#24160F] group-hover:text-[#C8752A] transition-colors">
                  Kitchen Orders
                </h4>
                <p className="text-xs text-[#765F4D] mt-1 font-normal">
                  View past receipts & track live orders
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. MENU CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C8752A] block">
              Handcrafted Menu
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#24160F] mt-1">
              Explore Our Categories
            </h2>
          </div>
          <Link
            to="/menu"
            className="text-xs font-bold text-[#C8752A] hover:text-[#964B00] flex items-center gap-1 transition-colors"
          >
            <span>View All ({categories.length || 23})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
          {(categories.length > 0
            ? categories.slice(0, 16)
            : [
                { name: "Chaai" },
                { name: "Hot Coffee" },
                { name: "Cold Coffee" },
                { name: "Veg Pizza" },
                { name: "Chicken Pizza" },
                { name: "Veg Burger" },
                { name: "Chicken Burger" },
                { name: "Fried Chicken" },
              ]
          ).map((cat, idx) => (
            <Link
              key={cat._id || cat.name || idx}
              to={`/menu?category=${encodeURIComponent(cat.name)}`}
              className="p-3.5 rounded-3xl bg-white border border-[#EAE0D5] hover:border-[#C8752A] hover:shadow-md transition-all flex flex-col items-center text-center group hover:scale-105"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#EAE0D5] group-hover:border-[#C8752A] group-hover:scale-105 transition-all shadow-sm mb-2 relative bg-[#FAF5EF] shrink-0">
                <img
                  src={getCategoryImage(cat.name, cat.image)}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <h4 className="text-xs font-bold text-[#24160F] group-hover:text-[#C8752A] transition-colors line-clamp-1">
                {cat.name}
              </h4>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED BESTSELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#C8752A] fill-[#C8752A]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#C8752A]">
                House Favorites
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#24160F] mt-1">
              Popular Bestsellers
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {["all", "Chaai", "Veg Pizza", "Chicken Pizza", "Fries", "Hot Coffee"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCategoryTab(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategoryTab.toLowerCase() === tab.toLowerCase()
                    ? "bg-[#C8752A] text-white shadow-xs"
                    : "bg-white text-[#765F4D] hover:text-[#24160F] border border-[#EAE0D5] hover:bg-[#FAF5EF]"
                }`}
              >
                {tab === "all" ? "All Favorites" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-72 bg-[#FAF5EF] rounded-3xl animate-pulse border border-[#EAE0D5]"></div>
            ))}
          </div>
        ) : displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.map((product) => (
              <MenuItemCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#EAE0D5] p-8 shadow-sm">
            <Coffee className="w-10 h-10 text-[#C8752A] mx-auto mb-3" />
            <p className="text-sm text-[#24160F] font-semibold">No products found in this category</p>
            <Link to="/menu" className="mt-3 inline-block text-xs font-bold text-[#C8752A]">
              Browse all items in menu →
            </Link>
          </div>
        )}
      </section>

      {/* 5. ABOUT THE CAFE & BRAND STORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#EAE0D5] rounded-3xl overflow-hidden p-6 sm:p-10 lg:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 relative aspect-[4/3] rounded-3xl overflow-hidden border border-[#EAE0D5] shadow-md">
            <img
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80"
              alt="Inside BrewBuddies Cafe"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-[#EAE0D5] text-xs text-[#24160F] shadow-sm">
              <span className="font-bold text-[#C8752A]">BrewBuddies Kopargaon: </span>
              A cozy space where great conversations and rich flavors brew together.
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C8752A] block">
              About BrewBuddies
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24160F] leading-tight">
              Every Sip & Slice <br />
              <span className="text-[#C8752A]">Tells a Story.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#6E5545] leading-relaxed">
              Welcome to BrewBuddies—Kopargaon’s favorite destination for refreshing drinks, authentic teas, stone-baked pizzas, and memorable moments.
            </p>
            <p className="text-xs sm:text-sm text-[#765F4D] leading-relaxed">
              Whether you’re catching up with friends over a steaming cup of Adrak Chai, recharging with our thick Choco Cold Coffee, or sharing a Chatpata Paneer Pizza with loved ones, our warm ambiance and authentic kitchen ensure every visit is exceptional.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#EAE0D5]">
              <div className="p-3 rounded-2xl bg-[#FAF5EF] border border-[#EAE0D5] text-center">
                <span className="font-serif text-lg font-bold text-[#C8752A] block">90+</span>
                <span className="text-[10px] text-[#765F4D] font-medium">Menu Delights</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF5EF] border border-[#EAE0D5] text-center">
                <span className="font-serif text-lg font-bold text-[#C8752A] block">100%</span>
                <span className="text-[10px] text-[#765F4D] font-medium">Freshly Baked</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF5EF] border border-[#EAE0D5] text-center">
                <span className="font-serif text-lg font-bold text-[#C8752A] block">10 pts</span>
                <span className="text-[10px] text-[#765F4D] font-medium">Per ₹1 Spent</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LOYALTY AND REWARDS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FAF2E9] via-[#F7EAE0] to-[#FAF2E9] border border-[#E8D4C0] p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8752A]/15 text-[#964B00] text-xs font-bold border border-[#E8D4C0]">
              <Award className="w-3.5 h-3.5" />
              <span>BrewBuddies Club</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#24160F]">
              Earn Points Every Time You Dine.
            </h3>
            <p className="text-xs sm:text-sm text-[#6E5545] leading-relaxed">
              Earn 1 loyalty point for every ₹10 spent. Directly apply your accumulated points at checkout for instant bill discounts (1 Point = ₹1 Off)!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/rewards"
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#C8752A]/20 transition-all active:scale-95"
            >
              View Rewards Catalog
            </Link>
            <Link
              to="/menu"
              className="px-6 py-3.5 rounded-full bg-white hover:bg-[#FAF5EF] border border-[#EAE0D5] text-[#24160F] font-bold text-xs sm:text-sm transition-all shadow-xs"
            >
              Order & Earn Points
            </Link>
          </div>
        </div>
      </section>

      {/* 7. PHOTO GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C8752A] block">
            Visual Highlights
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#24160F] mt-1">
            Crafted for Taste & Aesthetics
          </h2>
          <p className="text-xs text-[#765F4D] mt-1">
            Glimpse into our handcrafted drinks, crunchy snacks, and oven-baked pizzas.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {galleryImages.map((img, i) => (
            <div
              key={i}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-[#EAE0D5] bg-[#FAF5EF] shadow-sm hover:border-[#C8752A] hover:shadow-md transition-all"
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                <span className="text-[11px] font-bold text-white leading-tight">
                  {img.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. LOCATION & CONTACT HIGHLIGHT SECTION */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white border border-[#EAE0D5] rounded-3xl p-6 sm:p-10 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center md:items-start gap-4 flex-col md:flex-row">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF5EF] border border-[#EAE0D5] text-[#C8752A] flex items-center justify-center shrink-0 shadow-xs">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#24160F] mb-1">Our Cafe Address</h4>
              <p className="text-xs text-[#6E5545] leading-relaxed">
                Sanika Plaza, Dharangaon Road, Kopargaon, Ahilyanagar, Maharashtra – 423601
              </p>
            </div>
          </div>

          <div className="flex items-center md:items-start gap-4 flex-col md:flex-row">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF5EF] border border-[#EAE0D5] text-[#C8752A] flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#24160F] mb-1">Hours of Service</h4>
              <p className="text-xs text-[#765F4D]">Monday – Sunday</p>
              <p className="text-xs font-semibold text-[#C8752A] mt-0.5">9:30 AM – 10:00 PM</p>
            </div>
          </div>

          <div className="flex items-center md:items-start gap-4 flex-col md:flex-row">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF5EF] border border-[#EAE0D5] text-[#C8752A] flex items-center justify-center shrink-0 shadow-xs">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#24160F] mb-1">Direct Inquiries</h4>
              <a href="tel:+918275115011" className="text-xs text-[#6E5545] hover:text-[#C8752A] block font-medium">
                +91 8275115011
              </a>
              <a href="tel:+918275155355" className="text-xs text-[#6E5545] hover:text-[#C8752A] block mt-0.5 font-medium">
                +91 8275155355
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
