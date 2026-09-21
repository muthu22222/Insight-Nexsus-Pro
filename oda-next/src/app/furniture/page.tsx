"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Menu,
  Sofa,
  X,
  Sparkles,
} from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
import BackButton from "@/components/common/BackButton";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { getAmazonProductUrl, getFlipkartProductUrl } from "@/lib/store-links";
import type { FurnitureItem } from "@/types";
import { formatCurrency } from "@/utils/helpers";

const categories = [
  "All",
  "Sofa",
  "Chair",
  "Table",
  "Bed",
  "Cabinet",
  "Shelf",
  "Lighting",
  "Decor",
  "Curtains",
  "Mattress",
];

const styles = [
  "All",
  "Modern",
  "Contemporary",
  "Traditional",
  "Minimalist",
  "Industrial",
  "Bohemian",
  "Scandinavian",
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 20 } },
};

export default function FurniturePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<FurnitureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [style, setStyle] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 12;

  useEffect(() => {
    fetchProducts();
  }, [page, sort]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        sort,
      });
      if (search) params.set("search", search);
      if (category !== "All") params.set("category", category);
      if (style !== "All") params.set("style", style);
      if (minPrice > 0) params.set("minPrice", minPrice.toString());
      if (maxPrice < 1000000) params.set("maxPrice", maxPrice.toString());

      const res = await fetch(`/api/furniture/list?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const items = data.data?.products || data.data?.items || (Array.isArray(data.data) ? data.data : []);
        const total = data.data?.total ?? data.data?.pagination?.total ?? items.length;
        setProducts(items);
        setTotalPages(Math.ceil(total / perPage) || 1);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleFilterChange = () => {
    setPage(1);
    fetchProducts();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${
          i < Math.floor(rating)
            ? "text-amber-400 fill-amber-400"
            : i < rating
            ? "text-amber-400 fill-amber-400/50"
            : "text-gray-700"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-white text-[#0F172A]">
      <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#E2E8F0] bg-white/90 backdrop-blur-md px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-10 w-10 rounded-lg flex items-center justify-center hover:bg-[#F1F3F5] transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5 text-[#0F172A]" />
            </button>
            <BackButton fallbackHref="/dashboard" label="Back to Dashboard" variant="subtle" />
            <div>
              <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Furniture Catalog</h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                Explore verified furniture with instant Amazon and Flipkart links
              </p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
          {/* Top search & sorting bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search furniture, brands, decor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0F172A]"
              />
            </form>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#0F172A] hover:bg-[#F8F9FA] cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4 text-[#64748B]" />
                Filters
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#0F172A] focus:outline-none focus:border-[#0F172A] cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white text-[#0F172A]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Left sidebar filters */}
            <aside
              className={`${
                showFilters
                  ? "fixed inset-0 z-40 bg-black/50 backdrop-blur-xs p-6 overflow-y-auto"
                  : "hidden lg:block lg:w-64 shrink-0"
              }`}
            >
              {showFilters && (
                <div className="flex items-center justify-between mb-6 lg:hidden">
                  <h3 className="text-lg font-bold text-[#0F172A]">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-[#F1F3F5] rounded-lg cursor-pointer">
                    <X className="h-5 w-5 text-[#64748B]" />
                  </button>
                </div>
              )}

              <div className="space-y-6 bg-[#F8F9FA] border border-[#E2E8F0] p-5 rounded-2xl">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0F172A] cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} className="bg-white text-[#0F172A]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 block">
                    Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => {
                      setStyle(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0F172A] cursor-pointer"
                  >
                    {styles.map((s) => (
                      <option key={s} value={s} className="bg-white text-[#0F172A]">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 block">
                    Price Range
                  </label>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-[#64748B]">
                        Min: {formatCurrency(minPrice)}
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={500000}
                        step={5000}
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="w-full h-1.5 mt-1 bg-[#E2E8F0] rounded-full appearance-none cursor-pointer accent-[#0F172A]"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-[#64748B]">
                        Max: {formatCurrency(maxPrice)}
                      </span>
                      <input
                        type="range"
                        min={10000}
                        max={1000000}
                        step={5000}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full h-1.5 mt-1 bg-[#E2E8F0] rounded-full appearance-none cursor-pointer accent-[#0F172A]"
                      />
                    </div>
                    <button
                      onClick={handleFilterChange}
                      className="w-full py-2 text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] border border-[#0F172A] rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      Apply Price Filter
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Product catalog grid */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0F172A]" />
                </div>
              ) : products.length === 0 ? (
                <div className="bg-[#F8F9FA] rounded-2xl border border-[#E2E8F0] p-12 text-center">
                  <Sofa className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
                  <p className="text-[#0F172A] font-bold">
                    No furniture items found
                  </p>
                  <p className="text-sm text-[#64748B] mt-1">
                    Try adjusting your filters or search keywords
                  </p>
                </div>
              ) : (
                <>
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  >
                    {products.map((product) => (
                      <motion.div
                        key={product._id}
                        variants={item}
                        className="bg-[#F8F9FA] rounded-2xl border border-[#E2E8F0] overflow-hidden hover:border-[#CBD5E1] hover:shadow-xl hover:bg-white transition-all group flex flex-col justify-between"
                      >
                        <div className="aspect-square bg-slate-100 relative overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.productName}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Sofa className="h-10 w-10 text-[#94A3B8]" />
                            </div>
                          )}
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-bold bg-white/90 backdrop-blur-md rounded-md text-[#0F172A] border border-[#E2E8F0]">
                            {product.category}
                          </span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wide">
                              {product.brand}
                            </p>
                            <h3 className="font-bold text-[#0F172A] text-sm mt-1 truncate">
                              {product.productName}
                            </h3>
                            <div className="flex items-center gap-1 mt-1.5">
                              {renderStars(product.rating)}
                              <span className="text-xs text-[#64748B] ml-1">
                                ({product.rating})
                              </span>
                            </div>
                            <p className="text-base font-black text-[#0F172A] mt-2">
                              {formatCurrency(product.price)}
                            </p>
                            <p className="text-xs text-[#64748B] mt-0.5">
                              {product.storeName}
                            </p>
                          </div>

                          <div className="mt-3 flex flex-col gap-1.5 pt-2.5 border-t border-[#E2E8F0]">
                            <a
                              href={getAmazonProductUrl(product.productName, product.amazonUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-extrabold rounded-xl border border-[#0F172A] shadow-2xs transition-colors"
                            >
                              <span>Buy on Amazon</span>
                              <span className="text-xs">→</span>
                            </a>
                            <a
                              href={getFlipkartProductUrl(product.productName, product.flipkartUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-white hover:bg-[#F1F3F5] text-[#0F172A] border border-[#E2E8F0] text-xs font-bold rounded-xl shadow-2xs transition-colors"
                            >
                              <span>Buy on Flipkart</span>
                              <span className="text-xs">→</span>
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="h-10 w-10 rounded-xl flex items-center justify-center border border-[#C7B7A3]/20 bg-[#45161D] text-[#E8D8C4] hover:bg-[#63242C] disabled:opacity-30 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - page) <= 2
                        )
                        .reduce<(number | string)[]>((acc, p, i, arr) => {
                          if (i > 0 && (arr[i - 1] as number) < p - 1)
                            acc.push("...");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          typeof p === "string" ? (
                            <span
                              key={`ellipsis-${i}`}
                              className="px-2 text-[#C7B7A3]"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setPage(p)}
                              className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                                page === p
                                  ? "bg-[#6D2932] text-[#E8D8C4] border border-[#C7B7A3]/30"
                                  : "border border-[#C7B7A3]/20 bg-[#45161D] text-[#C7B7A3] hover:bg-[#63242C]"
                              }`}
                            >
                              {p}
                            </button>
                          )
                        )}
                      <button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className="h-10 w-10 rounded-xl flex items-center justify-center border border-[#C7B7A3]/20 bg-[#45161D] text-[#E8D8C4] hover:bg-[#63242C] disabled:opacity-30 transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      <AIAssistant />
    </div>
  );
}
