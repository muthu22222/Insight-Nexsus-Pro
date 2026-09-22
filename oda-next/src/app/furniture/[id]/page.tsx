"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  ExternalLink,
  Bookmark,
  Loader2,
  Menu,
  ChevronDown,
  Check,
  Sofa,
  Sparkles,
} from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
import BackButton from "@/components/common/BackButton";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { getAmazonProductUrl, getFlipkartProductUrl } from "@/lib/store-links";
import type { FurnitureItem, Project } from "@/types";
import { formatCurrency } from "@/utils/helpers";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const { sidebarWidthClass } = useSidebar();
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
    try {
      const token = await getToken();
      if (!token) return;
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

  const handleSaveToProject = async (projId: string) => {
    if (!product) return;
    setSavingToProject(projId);
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Please login to save to project");
        return;
      }
      const res = await fetch(`/api/projects/${projId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          addFurniture: [product],
        }),
      });

      if (res.ok) {
        setSaved(projId);
        toast.success("Product saved to project!");
        setTimeout(() => setSaved(null), 2500);
      }
    } catch {
      toast.error("Failed to save to project");
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
            : "text-gray-700"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--text-primary)]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)] text-[var(--text-secondary)]">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className={`transition-all duration-300 ease-in-out ${sidebarWidthClass}`}>
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md px-4 sm:px-6 py-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden h-10 w-10 rounded-lg flex items-center justify-center hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
          >
            <Menu className="h-5 w-5 text-[var(--text-primary)]" />
          </button>
          <BackButton fallbackHref="/furniture" label="Back to Catalog" variant="subtle" />
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight truncate">
              Product Details
            </h1>
          </div>
          <ThemeToggle />
        </header>

        <main className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-xs"
            >
              <div className="aspect-square bg-[var(--surface-secondary)] flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Sofa className="h-16 w-16 text-[var(--text-muted)]" />
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
                <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest bg-[var(--surface-secondary)] border border-[var(--border)] px-2.5 py-0.5 rounded-md">
                  {product.brand}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-2">
                  {product.productName}
                </h1>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-0.5">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-xs text-[var(--text-secondary)]">
                    ({product.rating} rating)
                  </span>
                </div>
              </div>

              <div>
                <p className="text-3xl font-black text-[#F5A900]">
                  {formatCurrency(product.price)}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Sold by <span className="font-semibold text-[var(--text-primary)]">{product.storeName}</span>
                </p>
              </div>

              {product.description && (
                <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
                  <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Description & Specifications
                  </h3>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Purchase Options */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Direct Retail Purchase Links</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={getAmazonProductUrl(product.productName, product.amazonUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-[#FF9900] hover:bg-[#F08E00] text-[#111111] font-extrabold text-sm rounded-xl border border-[#FF9900] shadow-xs hover:scale-[1.02] transition-all"
                  >
                    <span>Buy on Amazon</span>
                    <span>→</span>
                  </a>

                  <a
                    href={getFlipkartProductUrl(product.productName, product.flipkartUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-[#2874F0] hover:bg-[#1A65DC] text-white border border-[#2874F0] font-bold text-sm rounded-xl shadow-xs hover:scale-[1.02] transition-all"
                  >
                    <span>Buy on Flipkart</span>
                    <span>→</span>
                  </a>

                  {product.productUrl && (
                    <a
                      href={product.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sm:w-auto px-5 flex items-center justify-center gap-2 py-3.5 bg-[var(--surface-secondary)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] font-bold text-sm rounded-xl transition-all"
                    >
                      <span>Store</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="relative flex-1">
                  <button
                    onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] font-bold text-sm rounded-xl hover:border-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <Bookmark className="h-4 w-4 text-[var(--text-secondary)]" />
                    Save to Project
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {showProjectDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full mt-2 left-0 right-0 sm:left-auto sm:right-auto sm:w-72 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl z-10 overflow-hidden"
                    >
                      <div className="p-2 max-h-64 overflow-y-auto">
                        {projects.length === 0 ? (
                          <p className="text-xs text-[var(--text-secondary)] p-3 text-center">
                            No projects yet. Create one in Designer.
                          </p>
                        ) : (
                          projects.map((p) => (
                            <button
                              key={p._id}
                              onClick={() => handleSaveToProject(p._id)}
                              disabled={savingToProject === p._id}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--surface-secondary)] transition-colors text-left"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                  {p.name}
                                </p>
                                <p className="text-xs text-[var(--text-secondary)]">
                                  {p.designs?.length || 0} designs
                                </p>
                              </div>
                              {saved === p._id ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                              ) : savingToProject === p._id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-[var(--text-secondary)]" />
                              ) : null}
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
                <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)]">
                  <p className="text-xs text-[var(--text-secondary)]">Category</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                    {product.category}
                  </p>
                </div>
                <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)]">
                  <p className="text-xs text-[var(--text-secondary)]">Style</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                    {product.style}
                  </p>
                </div>
                <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)]">
                  <p className="text-xs text-[var(--text-secondary)]">Availability</p>
                  <p
                    className={`text-sm font-bold mt-0.5 ${
                      product.inStock ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </p>
                </div>
                <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)]">
                  <p className="text-xs text-[var(--text-secondary)]">Store</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                    {product.storeName}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--text-secondary)]" />
                Related Products
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedProducts.map((rp) => (
                  <Link
                    key={rp._id}
                    href={`/furniture/${rp._id}`}
                    className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden hover:border-[var(--text-secondary)] hover:shadow-xl transition-all group"
                  >
                    <div className="aspect-square bg-[var(--surface-secondary)] overflow-hidden">
                      {rp.image ? (
                        <img
                          src={rp.image}
                          alt={rp.productName}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Sofa className="h-8 w-8 text-[var(--text-muted)]" />
                        </div>
                      )}
                    </div>
                    <div className="p-3.5">
                      <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{rp.brand}</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate mt-0.5">
                        {rp.productName}
                      </p>
                      <p className="text-sm font-extrabold text-[#F5A900] mt-1">
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
