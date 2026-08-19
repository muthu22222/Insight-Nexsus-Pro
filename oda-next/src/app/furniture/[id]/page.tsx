"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  ExternalLink,
  Bookmark,
  Loader2,
  Menu,
  ChevronDown,
  Check,
  Sofa,
} from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
import BackButton from "@/components/common/BackButton";
import type { FurnitureItem, Project } from "@/types";
import { formatCurrency } from "@/utils/helpers";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [product, setProduct] = useState<FurnitureItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [savingToProject, setSavingToProject] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<FurnitureItem[]>([]);

  useEffect(() => {
    fetchProduct();
    fetchProjects();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/furniture/list?id=${productId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const p = Array.isArray(data.data)
            ? data.data.find((i: FurnitureItem) => i._id === productId)
            : data.data.product || data.data;
          setProduct(p);

          if (p?.category) {
            const relRes = await fetch(
              `/api/furniture/list?category=${p.category}&limit=4`
            );
            if (relRes.ok) {
              const relData = await relRes.json();
              if (relData.success && relData.data) {
                const relList = Array.isArray(relData.data)
                  ? relData.data
                  : relData.data.products || [];
                setRelatedProducts(
                  relList
                    .filter((i: FurnitureItem) => i._id !== productId)
                    .slice(0, 4)
                );
              }
            }
          }
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const list = Array.isArray(data.data)
            ? data.data
            : data.data.projects || [];
          setProjects(list);
        }
      }
    } catch {
      // silently fail
    }
  };

  const handleSaveToProject = async (projectId: string) => {
    if (!product) return;
    setSavingToProject(projectId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          furniture: [
            ...(projects.find((p) => p._id === projectId)?.furniture || []),
            product,
          ],
        }),
      });
      if (res.ok) {
        setSaved(projectId);
        setShowProjectDropdown(false);
      }
    } catch {
      // silently fail
    } finally {
      setSavingToProject(null);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.round(rating)
            ? "fill-amber-400 text-amber-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

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
          <BackButton fallbackHref="/furniture" label="Back to Catalog" variant="subtle" />
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            Product Details
          </h1>
        </header>

        <main className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              <div className="aspect-square bg-gray-100">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Sofa className="h-16 w-16 text-gray-300" />
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                  {product.brand}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                  {product.productName}
                </h1>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-0.5">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({product.rating} rating)
                  </span>
                </div>
              </div>

              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Sold by <span className="font-medium">{product.storeName}</span>
                </p>
              </div>

              {product.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
                >
                  Buy Now
                  <ExternalLink className="h-4 w-4" />
                </a>

                <div className="relative">
                  <button
                    onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Bookmark className="h-4 w-4" />
                    Save to Project
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {showProjectDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full mt-2 left-0 right-0 sm:left-auto sm:right-auto sm:w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden"
                    >
                      <div className="p-2 max-h-64 overflow-y-auto">
                        {projects.length === 0 ? (
                          <p className="text-sm text-gray-500 p-3 text-center">
                            No projects yet. Create one first.
                          </p>
                        ) : (
                          projects.map((p) => (
                            <button
                              key={p._id}
                              onClick={() => handleSaveToProject(p._id)}
                              disabled={savingToProject === p._id}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {p.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {p.designs?.length || 0} designs
                                </p>
                              </div>
                              {saved === p._id ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : savingToProject === p._id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                              ) : null}
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {product.category}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Style</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {product.style}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Availability</p>
                  <p
                    className={`text-sm font-medium mt-0.5 ${
                      product.inStock ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Store</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {product.storeName}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">
                Related Products
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedProducts.map((rp) => (
                  <Link
                    key={rp._id}
                    href={`/furniture/${rp._id}`}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {rp.image ? (
                        <img
                          src={rp.image}
                          alt={rp.productName}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Sofa className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-400">{rp.brand}</p>
                      <p className="text-sm font-medium text-gray-900 truncate mt-0.5">
                        {rp.productName}
                      </p>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {formatCurrency(rp.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <AIAssistant />
    </div>
  );
}
