"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
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
        if (data.success && data.data) {
          const list = Array.isArray(data.data)
            ? data.data
            : data.data.products || [];
          setProducts(list);
          setTotalPages(data.data.totalPages || Math.ceil(list.length / perPage) || 1);
        }
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
          i < Math.round(rating)
            ? "fill-amber-400 text-amber-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-gray-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden h-10 w-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Furniture Catalog</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Browse curated furniture for your space
            </p>
          </div>
        </header>

        <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search furniture..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>
            <div className="flex gap-3">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            <aside
              className={`${
                showFilters ? "fixed inset-0 z-50 bg-white p-6 overflow-y-auto lg:relative lg:w-64 lg:bg-transparent lg:p-0" 
                : "hidden lg:block lg:w-64"
              }`}
            >
              {showFilters && (
                <div className="flex items-center justify-between mb-6 lg:hidden">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => {
                      setStyle(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {styles.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Price Range
                  </label>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-500">
                        Min: {formatCurrency(minPrice)}
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={500000}
                        step={5000}
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="w-full h-2 mt-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">
                        Max: {formatCurrency(maxPrice)}
                      </span>
                      <input
                        type="range"
                        min={10000}
                        max={1000000}
                        step={5000}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full h-2 mt-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    <button
                      onClick={handleFilterChange}
                      className="w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Apply Price
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <Sofa className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">
                    No furniture found
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try adjusting your filters
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
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                      >
                        <div className="aspect-square bg-gray-100 relative overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.productName}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Sofa className="h-10 w-10 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                            {product.brand}
                          </p>
                          <h3 className="font-medium text-gray-900 text-sm mt-1 truncate">
                            {product.productName}
                          </h3>
                          <div className="flex items-center gap-1 mt-1.5">
                            {renderStars(product.rating)}
                            <span className="text-xs text-gray-500 ml-1">
                              ({product.rating})
                            </span>
                          </div>
                          <p className="text-lg font-bold text-gray-900 mt-2">
                            {formatCurrency(product.price)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {product.storeName}
                          </p>
                          <Link
                            href={`/furniture/${product._id}`}
                            className="mt-3 flex items-center justify-center w-full py-2.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          >
                            View Product
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="h-10 w-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
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
                              className="px-2 text-gray-400"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setPage(p)}
                              className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${
                                page === p
                                  ? "bg-blue-600 text-white"
                                  : "border border-gray-200 bg-white hover:bg-gray-50"
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
                        className="h-10 w-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
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
