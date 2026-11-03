import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Utensils,
  Filter,
  Check,
  X,
  SlidersHorizontal,
  Coffee,
  Sparkles,
  ArrowUpDown,
  ShoppingBag,
  Flame,
} from "lucide-react";
import MenuItemCard from "../../components/customer/MenuItemCard";
import TableBanner from "../../components/customer/TableBanner";
import { getCategoryImage } from "../../utils/categoryImages";
import { useTable } from "../../context/TableContext";
import { useCart } from "../../context/CartContext";
import api from "../../services/api";

const Menu = () => {
  const { cafe, tableNumber } = useTable();
  const { totalItemsCount, totalAmount } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [dietFilter, setDietFilter] = useState("all"); // 'all' | 'veg' | 'non-veg'
  const [sortBy, setSortBy] = useState("default"); // 'default' | 'price-low' | 'price-high' | 'name'
  const [loading, setLoading] = useState(true);

  // Sync category from URL param if changed externally
  useEffect(() => {
    const urlCat = searchParams.get("category");
    if (urlCat) {
      setSelectedCategory(urlCat);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const fetchMenu = async () => {
      try {
        const prodParams = {};
        if (cafe?.id || cafe?._id) {
          prodParams.cafeId = cafe.id || cafe._id;
        }
        const [catRes, prodRes] = await Promise.all([
          api.getCategories(),
          api.getProducts(prodParams),
        ]);
        if (isMounted) {
          if (catRes.success) setCategories(catRes.categories);
          if (prodRes.success) setProducts(prodRes.products);
        }
      } catch (err) {
        console.warn("[Menu] Load error:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchMenu();
    return () => {
      isMounted = false;
    };
  }, [cafe]);

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    if (catName === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", catName);
    }
    setSearchParams(searchParams);
  };

  // Filter and Sort logic
  const filteredProducts = products
    .filter((product) => {
      // 1. Category Filter
      if (selectedCategory !== "all") {
        const catName = product.category?.name || product.category;
        const catId = product.category?._id || product.category;
        const matchesName =
          catName && catName.toLowerCase() === selectedCategory.toLowerCase();
        const matchesId = catId === selectedCategory;
        if (!matchesName && !matchesId) return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = product.name.toLowerCase().includes(query);
        const descMatch = product.description?.toLowerCase().includes(query);
        const tagMatch = product.tags?.some((t) => t.toLowerCase().includes(query));
        if (!nameMatch && !descMatch && !tagMatch) return false;
      }

      // 3. Dietary Filter
      if (dietFilter === "veg" && !product.isVegetarian) return false;
      if (dietFilter === "non-veg" && product.isVegetarian) return false;

      return true;
    })
    .sort((a, b) => {
      const priceA = a.variants?.length
        ? Math.min(...a.variants.map((v) => Number(v.price) || a.price))
        : a.price;
      const priceB = b.variants?.length
        ? Math.min(...b.variants.map((v) => Number(v.price) || b.price))
        : b.price;

      if (sortBy === "price-low") return priceA - priceB;
      if (sortBy === "price-high") return priceB - priceA;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Table Context Banner */}
      <TableBanner />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C8752A]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C8752A]">
              Handcrafted Selection
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#24160F] mt-1">
            Our Cafe Menu
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5545] mt-1.5 max-w-xl">
            Choose your favorites, select sizes & add-ons, and place your order directly for kitchen preparation.
          </p>
        </div>

        {/* Total Items Counter */}
        <div className="flex items-center gap-2 text-xs text-[#765F4D]">
          <span className="font-bold text-[#24160F] text-sm">{filteredProducts.length}</span>
          <span>products available</span>
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="bg-white border border-[#EAE0D5] rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#9C8472] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by dish name, pizza, beverage, momos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-[#FAF5EF] text-[#24160F] placeholder-[#9C8472] border border-[#EAE0D5] rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#C8752A] focus:ring-1 focus:ring-[#C8752A]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9C8472] hover:text-[#24160F]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto appearance-none pl-4 pr-9 py-3 bg-[#FAF5EF] text-[#5A4031] border border-[#EAE0D5] rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#C8752A]"
              >
                <option value="default">Sort: Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#9C8472] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Dietary Filter Segmented Control */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EAE0D5]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#765F4D] mr-1 hidden sm:inline">
              Dietary:
            </span>
            <button
              onClick={() => setDietFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                dietFilter === "all"
                  ? "bg-[#C8752A] text-white shadow-xs"
                  : "bg-[#FAF5EF] text-[#5A4031] border border-[#EAE0D5] hover:bg-white"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setDietFilter("veg")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                dietFilter === "veg"
                  ? "bg-[#16A34A] text-white shadow-xs"
                  : "bg-[#FAF5EF] text-[#5A4031] border border-[#EAE0D5] hover:bg-white"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#16A34A] border border-white"></span>
              <span>Veg Only</span>
            </button>
            <button
              onClick={() => setDietFilter("non-veg")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                dietFilter === "non-veg"
                  ? "bg-[#DC2626] text-white shadow-xs"
                  : "bg-[#FAF5EF] text-[#5A4031] border border-[#EAE0D5] hover:bg-white"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#DC2626] border border-white"></span>
              <span>Non-Veg Only</span>
            </button>
          </div>

          {(searchQuery || selectedCategory !== "all" || dietFilter !== "all") && (
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                setDietFilter("all");
                setSearchParams({});
              }}
              className="text-xs font-bold text-[#C8752A] hover:text-[#964B00] transition-colors"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Carousel Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => handleCategorySelect("all")}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            selectedCategory === "all"
              ? "bg-[#C8752A] text-white border border-[#C8752A] shadow-xs scale-105"
              : "bg-white text-[#5A4031] border border-[#EAE0D5] hover:bg-[#FAF5EF]"
          }`}
        >
          All Categories ({products.length})
        </button>

        {categories.map((cat) => {
          const isSelected =
            selectedCategory === cat._id ||
            selectedCategory.toLowerCase() === cat.name.toLowerCase();
          const count = products.filter(
            (p) =>
              p.category?._id === cat._id ||
              (p.category?.name && p.category.name.toLowerCase() === cat.name.toLowerCase())
          ).length;

          return (
            <button
              key={cat._id || cat.name}
              onClick={() => handleCategorySelect(cat.name)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                isSelected
                  ? "bg-[#C8752A] text-white border border-[#C8752A] shadow-xs scale-105"
                  : "bg-white text-[#5A4031] border border-[#EAE0D5] hover:bg-[#FAF5EF]"
              }`}
            >
              <span className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-black/10 bg-[#FAF5EF]">
                <img
                  src={getCategoryImage(cat.name, cat.image)}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </span>
              <span>{cat.name}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-black/20 text-white" : "bg-[#FAF5EF] text-[#765F4D]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="h-72 bg-[#FAF5EF] rounded-3xl animate-pulse border border-[#EAE0D5]"
            ></div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EAE0D5] p-12 text-center my-6 shadow-sm">
          <Utensils className="w-12 h-12 text-[#C8752A] mx-auto mb-3" />
          <h3 className="text-base font-serif font-bold text-[#24160F]">No dishes match your filter</h3>
          <p className="text-xs text-[#6E5545] mt-1.5 max-w-sm mx-auto">
            Try searching for something else or clearing your dietary/category filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
              setDietFilter("all");
              setSearchParams({});
            }}
            className="mt-4 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C8752A] to-[#D98738] text-white text-xs font-bold shadow-md shadow-[#C8752A]/20 hover:from-[#B45E1B] hover:to-[#C8752A]"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
          {filteredProducts.map((product) => (
            <MenuItemCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Floating Mobile Cart Summary Pill */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-16 md:bottom-6 left-4 right-4 z-30 max-w-md mx-auto">
          <Link
            to="/cart"
            className="w-full bg-gradient-to-r from-[#C8752A] to-[#D98738] hover:from-[#B45E1B] hover:to-[#C8752A] text-white p-3.5 rounded-2xl shadow-lg shadow-[#C8752A]/25 flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black/15 flex items-center justify-center font-bold text-xs">
                {totalItemsCount}
              </div>
              <span className="font-bold text-xs">View Dine-In Cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-extrabold text-sm">
                ₹{Number(totalAmount).toFixed(2)}
              </span>
              <ShoppingBag className="w-4 h-4" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Menu;
