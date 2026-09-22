"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Bookmark,
  Calculator,
  ShoppingCart,
  Wand2,
  Sofa,
  Plus,
  ArrowRight,
  Loader2,
  Menu,
  Sparkles,
  Database,
  Code2,
  Copy,
  Check,
  Download,
  Search,
  X,
  FileJson,
  Layers,
  ExternalLink,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { RAW_PROJECTS } from "@/data/raw-projects";
import type { Project } from "@/types";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const ROOM_FILTERS = ["All", "Living Room", "Bedroom", "Home Office", "Dining Room"];

export default function DashboardPage() {
  const { userData, loading: authLoading, getToken } = useAuth();
  const { sidebarWidthClass } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showRawOverride, setShowRawOverride] = useState<boolean | null>(null);

  // Search & Filter state for raw data records
  const [searchQuery, setSearchQuery] = useState("");
  const [roomFilter, setRoomFilter] = useState("All");

  // Raw JSON modal state
  const [jsonModal, setJsonModal] = useState<{ title: string; data: any } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const token = await getToken();
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await fetch("/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const list = Array.isArray(data.data) ? data.data : data.data.projects || [];
            setProjects(list);
          }
        }
      } catch {
        // silently fail and fallback to raw data
      } finally {
        setLoading(false);
      }
    }

    if (userData) {
      fetchProjects();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [userData, authLoading, getToken]);

  // Determine active dataset (user database projects or RAW_PROJECTS)
  const isRawDataActive = showRawOverride !== null ? showRawOverride : projects.length === 0;
  const effectiveProjects: Project[] = isRawDataActive ? RAW_PROJECTS : projects;

  const totalSavedDesigns = effectiveProjects.reduce(
    (acc, p) => acc + (p.designs?.length || 0),
    0
  );

  const totalBudget = effectiveProjects.reduce(
    (acc, p) => acc + (p.budgetPlan?.totalBudget || 0),
    0
  );

  const totalShoppingItems = effectiveProjects.reduce(
    (acc, p) => acc + (p.shoppingList?.length || 0),
    0
  );

  const recentDesigns = effectiveProjects
    .flatMap((p) =>
      (p.designs || []).map((d) => ({
        ...d,
        projectName: p.name,
        projectId: p._id,
        roomType: p.roomType || p.roomAnalysis?.roomType || "Interior Space",
        hotspotsCount: d.hotspots?.length || 0,
      }))
    )
    .slice(-4)
    .reverse();

  // Filtered projects for the Raw Studio Data Records table
  const filteredProjects = effectiveProjects.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.roomType || "").toLowerCase().includes(q) ||
      (p.selectedStyle || p.designs?.[0]?.style || "").toLowerCase().includes(q);
    const matchesRoom =
      roomFilter === "All" ||
      (p.roomType || "").toLowerCase() === roomFilter.toLowerCase();
    return matchesSearch && matchesRoom;
  });

  // Seed raw data to MongoDB
  const handleSeedRawData = async () => {
    setSeeding(true);
    try {
      const token = await getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/projects/seed", {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // response was not JSON
      }

      if (res.ok && data?.success) {
        toast.success(data.message || "Successfully seeded 4 raw projects!");
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          setProjects(data.data);
          setShowRawOverride(false);
        }
      } else {
        const errorMsg =
          data?.error ||
          (res.status === 401
            ? "Please sign in to save raw projects."
            : `Database operation status: ${res.status}`);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not complete network request to seed database.");
    } finally {
      setSeeding(false);
    }
  };

  const handleCopyJson = async (data: any) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      toast.success("Raw JSON copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy JSON to clipboard.");
    }
  };

  const handleDownloadJson = (data: any, title: string) => {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_raw_data.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded raw data JSON file!");
    } catch {
      toast.error("Failed to download JSON file.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F172A]" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        <Toaster position="top-center" />
        <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <div className={`transition-all duration-300 ease-in-out ${sidebarWidthClass}`}>
          <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md px-4 sm:px-6 py-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-10 w-10 rounded-lg flex items-center justify-center hover:bg-[var(--surface-secondary)] text-[var(--text-primary)] transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5 text-[var(--text-primary)]" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                  Welcome back, {userData?.name?.split(" ")[0] || "Designer"} 👋
                </h1>
                {isRawDataActive && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    <Database className="h-3 w-3" />
                    Studio Raw Data Active
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 font-medium">
                Here&apos;s an overview of your AI interior design studio
              </p>
            </div>
            <ThemeToggle />
            <Link
              href="/designer"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#2B1B12] hover:bg-[#433328] dark:bg-white dark:hover:bg-[#F5EFE7] text-white dark:text-[#141210] text-sm font-bold rounded-xl shadow-md shadow-[#2B1B12]/15 border border-[#2B1B12] dark:border-white hover:scale-[1.02] transition-all active:scale-98"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              New Design
            </Link>
          </header>

          <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              {/* Stat Cards with Raw Data Telemetry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div variants={item}>
                  <Link
                    href="/dashboard/projects"
                    className="block bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 hover:border-[var(--text-secondary)] transition-all group shadow-xs relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center shadow-xs">
                        <FolderOpen className="h-5 w-5 text-[var(--text-primary)]" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                    </div>
                    <p className="mt-4 text-2xl font-black text-[var(--text-primary)]">
                      {effectiveProjects.length}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-semibold">My Projects</p>
                      {isRawDataActive && (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          Raw Data
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>

                <motion.div variants={item}>
                  <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center shadow-xs">
                        <Bookmark className="h-5 w-5 text-[var(--text-primary)]" />
                      </div>
                      <Sparkles className="h-4 w-4 text-[#F5A900]" />
                    </div>
                    <p className="mt-4 text-2xl font-black text-[var(--text-primary)]">
                      {totalSavedDesigns}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-semibold">Saved AI Designs</p>
                      {isRawDataActive && (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          Curated
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={item}>
                  <Link
                    href="/budget"
                    className="block bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 hover:border-[var(--text-secondary)] transition-all group shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center shadow-xs">
                        <Calculator className="h-5 w-5 text-[var(--text-primary)]" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                    </div>
                    <p className="mt-4 text-2xl font-black text-[var(--text-primary)]">
                      {formatCurrency(totalBudget)}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-semibold">Total Budget Managed</p>
                      {isRawDataActive && (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          Estimated
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>

                <motion.div variants={item}>
                  <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center shadow-xs">
                        <ShoppingCart className="h-5 w-5 text-[var(--text-primary)]" />
                      </div>
                    </div>
                    <p className="mt-4 text-2xl font-black text-[var(--text-primary)]">
                      {totalShoppingItems}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-semibold">Shopping List Items</p>
                      {isRawDataActive && (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          Catalog
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Studio Raw Data Banner & Seeding Quick Action */}
              <motion.div
                variants={item}
                className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-700/80 relative overflow-hidden"
              >
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                        Studio Raw Dataset Loaded
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Explore Raw Interior Models, Room Geometry & Furniture Telemetry
                    </h3>
                    <p className="text-xs sm:text-sm text-[#F5EFE7] max-w-2xl leading-relaxed">
                      Showing {effectiveProjects.length} curated design projects with photorealistic renders,
                      room analysis proportions, spatial hotspots, and live catalog store links.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
                    <button
                      onClick={() => setJsonModal({ title: "Studio Raw Projects Dataset", data: effectiveProjects })}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
                    >
                      <Code2 className="h-4 w-4 text-emerald-400" />
                      View Raw JSON
                    </button>

                    <button
                      onClick={handleSeedRawData}
                      disabled={seeding}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
                    >
                      {seeding ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Seeding Database...
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4" />
                          Seed to Cloud DB
                        </>
                      )}
                    </button>

                    {projects.length > 0 && (
                      <button
                        onClick={() => setShowRawOverride(!isRawDataActive)}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-[#F5EFE7] text-xs font-semibold rounded-xl border border-slate-600 transition-colors"
                      >
                        {isRawDataActive ? "Show My DB Data" : "Preview Raw Data"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Quick Action Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5">
                <Link
                  href="/designer"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#2B1B12] hover:bg-[#433328] dark:bg-white dark:hover:bg-[#F5EFE7] text-white dark:text-[#141210] text-sm font-bold rounded-xl shadow-md shadow-[#2B1B12]/15 border border-[#2B1B12] dark:border-white hover:scale-[1.01] transition-all"
                >
                  <Wand2 className="h-4 w-4 stroke-[2.5]" />
                  Start New AI Design
                </Link>
                <Link
                  href="/furniture"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--surface-secondary)] border border-[var(--border)] text-[#2B1B12] dark:text-white text-sm font-bold rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <Sofa className="h-4 w-4 text-[#2B1B12] dark:text-white" />
                  Browse Catalog Furniture
                </Link>
              </div>

              {/* Recent AI Designs Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#F5A900]" />
                      Recent AI Designs
                    </h2>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]">
                      {recentDesigns.length} active
                    </span>
                  </div>
                  <Link
                    href="/dashboard/projects"
                    className="text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold flex items-center gap-1 group"
                  >
                    View All Projects
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentDesigns.map((design) => (
                    <motion.div
                      key={design._id}
                      variants={item}
                      className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden hover:border-[var(--text-secondary)] hover:shadow-xl transition-all group flex flex-col"
                    >
                      <div className="aspect-[4/3] bg-[var(--surface-secondary)] relative overflow-hidden">
                        {design.generatedImages?.[0] ? (
                          <img
                            src={design.generatedImages[0]}
                            alt={`${design.style} design`}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Wand2 className="h-8 w-8 text-[var(--text-muted)]" />
                          </div>
                        )}
                        <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider">
                          {design.roomType}
                        </div>
                        {design.hotspotsCount > 0 && (
                          <div className="absolute bottom-2.5 left-2.5 bg-emerald-600/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-white flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            {design.hotspotsCount} Hotspots
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-[var(--text-primary)] text-sm truncate" title={design.projectName}>
                            {design.projectName}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-1 font-medium">
                            {design.style} · {design.mood}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                          <Link
                            href={`/dashboard/projects/${design.projectId}`}
                            className="inline-flex items-center text-xs font-bold text-[var(--text-primary)] hover:underline"
                          >
                            View Project
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Link>
                          <button
                            onClick={() => setJsonModal({ title: `${design.projectName} Design Object`, data: design })}
                            className="text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
                            title="Inspect Raw JSON"
                          >
                            <Code2 className="h-3 w-3" />
                            JSON
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Dedicated Section: Studio Raw Data Records Table */}
              <motion.div
                variants={item}
                className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 sm:p-6 shadow-xs space-y-5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Layers className="h-5 w-5 text-[var(--text-primary)]" />
                        Studio Raw Data Records
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]">
                        {filteredProjects.length} records
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
                      Comprehensive project inventory, room geometry telemetry, financial allocation, and shopping manifests.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      onClick={() =>
                        setJsonModal({
                          title: "Complete Studio Raw Data Records",
                          data: filteredProjects,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] text-xs font-bold rounded-xl border border-[var(--border)] shadow-2xs transition-colors cursor-pointer"
                    >
                      <FileJson className="h-3.5 w-3.5 text-indigo-500" />
                      View All Raw JSON
                    </button>
                  </div>
                </div>

                {/* Search & Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter raw records by project name, room, or style..."
                      className="w-full pl-9 pr-4 py-2.5 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#2B1B12] dark:focus:border-white transition-all font-medium"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {ROOM_FILTERS.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRoomFilter(r)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          roomFilter === r
                            ? "bg-[#2B1B12] dark:bg-white text-white dark:text-[#141210] shadow-xs"
                            : "bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Raw Data Records Table */}
                <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] font-bold text-[11px] uppercase tracking-wider">
                          <th className="py-3 px-4">Project & Room</th>
                          <th className="py-3 px-4">Aesthetic & Mood</th>
                          <th className="py-3 px-4">Budget & Spend</th>
                          <th className="py-3 px-4">Catalog Inventory</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Raw Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {filteredProjects.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-[var(--text-muted)] font-medium">
                              No raw projects match your filter. Try adjusting your search query.
                            </td>
                          </tr>
                        ) : (
                          filteredProjects.map((p) => {
                            const budgetTotal = p.budgetPlan?.totalBudget || p.budget || 0;
                            const spentAmount = p.budgetPlan?.spent || (budgetTotal - (p.budgetPlan?.remaining || 0));
                            const spendPercent = budgetTotal > 0 ? Math.min(100, Math.round((spentAmount / budgetTotal) * 100)) : 0;
                            const furnitureCount = p.furniture?.length || 0;
                            const shoppingCount = p.shoppingList?.length || 0;

                            return (
                              <tr key={p._id} className="hover:bg-[var(--surface-hover)] transition-colors">
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-[var(--surface-secondary)] border border-[var(--border)]">
                                      <img
                                        src={p.generatedImage || p.roomImage || p.designs?.[0]?.generatedImages?.[0] || ""}
                                        alt={p.name}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <Link
                                        href={`/dashboard/projects/${p._id}`}
                                        className="font-bold text-[var(--text-primary)] hover:underline flex items-center gap-1"
                                      >
                                        {p.name}
                                        <ExternalLink className="h-3 w-3 text-[var(--text-muted)]" />
                                      </Link>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]">
                                          {p.roomType || "Room"}
                                        </span>
                                        <span className="text-[10px] text-[var(--text-muted)] font-mono">
                                          ID: {p._id.slice(-6)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="space-y-0.5">
                                    <p className="font-bold text-[var(--text-primary)] text-xs">
                                      {p.selectedStyle || p.designs?.[0]?.style || "Modern"}
                                    </p>
                                    <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                                      {p.mood || p.designs?.[0]?.mood || "Balanced"}
                                    </p>
                                    {p.color && (
                                      <span className="inline-block text-[10px] font-semibold text-[var(--text-secondary)] bg-[var(--surface-secondary)] px-1.5 py-0.2 rounded border border-[var(--border)]">
                                        {p.color}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="space-y-1.5 min-w-[130px]">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-bold text-[var(--text-primary)]">
                                        {formatCurrency(budgetTotal)}
                                      </span>
                                      <span className="text-[10px] text-[var(--text-secondary)] font-semibold">
                                        {spendPercent}% allocated
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{ width: `${spendPercent}%` }}
                                      />
                                    </div>
                                    <p className="text-[10px] text-[var(--text-muted)] font-medium">
                                      Remaining: {formatCurrency(budgetTotal - spentAmount)}
                                    </p>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="space-y-0.5">
                                    <p className="font-bold text-xs text-[var(--text-primary)]">
                                      {furnitureCount} Furniture Items
                                    </p>
                                    <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                                      {shoppingCount} in Shopping Manifest
                                    </p>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                      p.status === "completed"
                                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                                        : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30"
                                    }`}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${
                                        p.status === "completed" ? "bg-emerald-500" : "bg-blue-500"
                                      }`}
                                    />
                                    {p.status || "completed"}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => setJsonModal({ title: `${p.name} Raw Record`, data: p })}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] text-xs font-bold transition-colors cursor-pointer border border-[var(--border)]"
                                      title="Inspect Project JSON"
                                    >
                                      <Code2 className="h-3.5 w-3.5 text-indigo-500" />
                                      JSON
                                    </button>
                                    <Link
                                      href={`/dashboard/projects/${p._id}`}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2B1B12] hover:bg-[#433328] dark:bg-white dark:hover:bg-[#F5EFE7] text-white dark:text-[#141210] text-xs font-bold transition-colors"
                                    >
                                      Open
                                      <ArrowRight className="h-3 w-3" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </main>
        </div>

        {/* Interactive Raw JSON Inspector Modal */}
        <AnimatePresence>
          {jsonModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setJsonModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0F172A] text-white rounded-2xl border border-slate-700 shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#162033]">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Code2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-white">
                        {jsonModal.title}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Raw Schema Payload & Telemetry Inspector
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyJson(jsonModal.data)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy JSON
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDownloadJson(jsonModal.data, jsonModal.title)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>

                    <button
                      onClick={() => setJsonModal(null)}
                      className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Modal Code Viewer */}
                <div className="flex-1 overflow-auto p-4 bg-[#090D16]">
                  <pre className="font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto whitespace-pre p-2">
                    {JSON.stringify(jsonModal.data, null, 2)}
                  </pre>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3 border-t border-slate-800 bg-[#162033] flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Format: Application/JSON · Schema: Insight Nexsus Studio v1.2
                  </span>
                  <button
                    onClick={() => setJsonModal(null)}
                    className="text-xs font-bold text-slate-300 hover:text-white"
                  >
                    Close Inspector
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AIAssistant />
      </div>
    </ProtectedRoute>
  );
}
