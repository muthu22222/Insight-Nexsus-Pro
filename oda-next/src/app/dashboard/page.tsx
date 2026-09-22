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
      if (!token) {
        toast.error("Please sign in to save raw data to your MongoDB database.");
        return;
      }
      const res = await fetch("/api/projects/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Successfully seeded 4 raw projects!");
        if (data.data) {
          setProjects(data.data);
          setShowRawOverride(false);
        }
      } else {
        toast.error(data.error || "Failed to seed raw projects.");
      }
    } catch {
      toast.error("Network error while seeding raw projects.");
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
      <div className="min-h-screen bg-white text-[#0F172A]">
        <Toaster position="top-center" />
        <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md px-4 sm:px-6 py-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-10 w-10 rounded-lg flex items-center justify-center hover:bg-[#F1F3F5] transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5 text-[#0F172A]" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
                  Welcome back, {userData?.name?.split(" ")[0] || "Designer"} 👋
                </h1>
                {isRawDataActive && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Database className="h-3 w-3" />
                    Studio Raw Data Active
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                Here&apos;s an overview of your AI interior design studio
              </p>
            </div>
            <ThemeToggle />
            <Link
              href="/designer"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-bold rounded-xl shadow-md shadow-[#0F172A]/15 border border-[#0F172A] hover:scale-[1.02] transition-all active:scale-98"
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
                    className="block bg-[#F8F9FA] rounded-2xl border border-[#E2E8F0] p-5 hover:border-[#CBD5E1] hover:bg-white transition-all group shadow-xs relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center shadow-xs">
                        <FolderOpen className="h-5 w-5 text-[#0F172A]" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-[#64748B] group-hover:text-[#0F172A] transition-colors" />
                    </div>
                    <p className="mt-4 text-2xl font-black text-[#0F172A]">
                      {effectiveProjects.length}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs sm:text-sm text-[#64748B] font-medium">My Projects</p>
                      {isRawDataActive && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Raw Data
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>

                <motion.div variants={item}>
                  <div className="bg-[#F8F9FA] rounded-2xl border border-[#E2E8F0] p-5 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center shadow-xs">
                        <Bookmark className="h-5 w-5 text-[#0F172A]" />
                      </div>
                      <Sparkles className="h-4 w-4 text-amber-500" />
                    </div>
                    <p className="mt-4 text-2xl font-black text-[#0F172A]">
                      {totalSavedDesigns}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs sm:text-sm text-[#64748B] font-medium">Saved AI Designs</p>
                      {isRawDataActive && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Curated
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={item}>
                  <Link
                    href="/budget"
                    className="block bg-[#F8F9FA] rounded-2xl border border-[#E2E8F0] p-5 hover:border-[#CBD5E1] hover:bg-white transition-all group shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center shadow-xs">
                        <Calculator className="h-5 w-5 text-[#0F172A]" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-[#64748B] group-hover:text-[#0F172A] transition-colors" />
                    </div>
                    <p className="mt-4 text-2xl font-black text-[#0F172A]">
                      {formatCurrency(totalBudget)}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs sm:text-sm text-[#64748B] font-medium">Total Budget Managed</p>
                      {isRawDataActive && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Estimated
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>

                <motion.div variants={item}>
                  <div className="bg-[#F8F9FA] rounded-2xl border border-[#E2E8F0] p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center shadow-xs">
                        <ShoppingCart className="h-5 w-5 text-[#0F172A]" />
                      </div>
                    </div>
                    <p className="mt-4 text-2xl font-black text-[#0F172A]">
                      {totalShoppingItems}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs sm:text-sm text-[#64748B] font-medium">Shopping List Items</p>
                      {isRawDataActive && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
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
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                      Showing {effectiveProjects.length} curated design projects with photorealistic renders,
                      room analysis proportions, spatial hotspots, and live catalog store links.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
                    <button
                      onClick={() => setJsonModal({ title: "Studio Raw Projects Dataset", data: effectiveProjects })}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
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
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-600 transition-colors"
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
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-bold rounded-xl shadow-md shadow-[#0F172A]/15 border border-[#0F172A] hover:scale-[1.01] transition-all"
                >
                  <Wand2 className="h-4 w-4 stroke-[2.5]" />
                  Start New AI Design
                </Link>
                <Link
                  href="/furniture"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#F1F3F5] border border-[#E2E8F0] text-[#0F172A] text-sm font-semibold rounded-xl hover:bg-[#E2E8F0] transition-colors"
                >
                  <Sofa className="h-4 w-4 text-[#0F172A]" />
                  Browse Catalog Furniture
                </Link>
              </div>

              {/* Recent AI Designs Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#0F172A]" />
                      Recent AI Designs
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {recentDesigns.length} active
                    </span>
                  </div>
                  <Link
                    href="/dashboard/projects"
                    className="text-xs sm:text-sm text-[#64748B] hover:text-[#0F172A] font-semibold flex items-center gap-1 group"
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
                      className="bg-[#F8F9FA] rounded-2xl border border-[#E2E8F0] overflow-hidden hover:border-[#CBD5E1] hover:shadow-xl hover:bg-white transition-all group flex flex-col"
                    >
                      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                        {design.generatedImages?.[0] ? (
                          <img
                            src={design.generatedImages[0]}
                            alt={`${design.style} design`}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Wand2 className="h-8 w-8 text-[#94A3B8]" />
                          </div>
                        )}
                        <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider">
                          {design.roomType}
                        </div>
                        {design.hotspotsCount > 0 && (
                          <div className="absolute bottom-2.5 left-2.5 bg-emerald-500/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-white flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            {design.hotspotsCount} Hotspots
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-[#0F172A] text-sm truncate" title={design.projectName}>
                            {design.projectName}
                          </p>
                          <p className="text-xs text-[#64748B] mt-1 line-clamp-1">
                            {design.style} · {design.mood}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                          <Link
                            href={`/dashboard/projects/${design.projectId}`}
                            className="inline-flex items-center text-xs font-bold text-[#0F172A] hover:text-[#334155]"
                          >
                            View Project
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Link>
                          <button
                            onClick={() => setJsonModal({ title: `${design.projectName} Design Object`, data: design })}
                            className="text-[11px] font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
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
                className="bg-[#F8F9FA] rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                        <Layers className="h-5 w-5 text-[#0F172A]" />
                        Studio Raw Data Records
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                        {filteredProjects.length} records
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-1">
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-bold rounded-xl border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer"
                    >
                      <FileJson className="h-3.5 w-3.5 text-indigo-600" />
                      View All Raw JSON
                    </button>
                  </div>
                </div>

                {/* Search & Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter raw records by project name, room, or style..."
                      className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/10 focus:border-[#0F172A] transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                        className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          roomFilter === r
                            ? "bg-[#0F172A] text-white shadow-xs"
                            : "bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Raw Data Records Table */}
                <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA]/80 text-[#64748B] font-semibold text-[11px] uppercase tracking-wider">
                          <th className="py-3 px-4">Project & Room</th>
                          <th className="py-3 px-4">Aesthetic & Mood</th>
                          <th className="py-3 px-4">Budget & Spend</th>
                          <th className="py-3 px-4">Catalog Inventory</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Raw Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {filteredProjects.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-500">
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
                              <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                                      <img
                                        src={p.generatedImage || p.roomImage || p.designs?.[0]?.generatedImages?.[0] || ""}
                                        alt={p.name}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <Link
                                        href={`/dashboard/projects/${p._id}`}
                                        className="font-bold text-[#0F172A] hover:underline flex items-center gap-1"
                                      >
                                        {p.name}
                                        <ExternalLink className="h-3 w-3 text-slate-400" />
                                      </Link>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                          {p.roomType || "Room"}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                          ID: {p._id.slice(-6)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="space-y-0.5">
                                    <p className="font-semibold text-[#0F172A] text-xs">
                                      {p.selectedStyle || p.designs?.[0]?.style || "Modern"}
                                    </p>
                                    <p className="text-[11px] text-[#64748B]">
                                      {p.mood || p.designs?.[0]?.mood || "Balanced"}
                                    </p>
                                    {p.color && (
                                      <span className="inline-block text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200">
                                        {p.color}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="space-y-1.5 min-w-[130px]">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-bold text-[#0F172A]">
                                        {formatCurrency(budgetTotal)}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-medium">
                                        {spendPercent}% allocated
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{ width: `${spendPercent}%` }}
                                      />
                                    </div>
                                    <p className="text-[10px] text-slate-400">
                                      Remaining: {formatCurrency(budgetTotal - spentAmount)}
                                    </p>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="space-y-0.5">
                                    <p className="font-semibold text-xs text-[#0F172A]">
                                      {furnitureCount} Furniture Items
                                    </p>
                                    <p className="text-[11px] text-[#64748B]">
                                      {shoppingCount} in Shopping Manifest
                                    </p>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                      p.status === "completed"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-blue-50 text-blue-700 border border-blue-200"
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
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                                      title="Inspect Project JSON"
                                    >
                                      <Code2 className="h-3.5 w-3.5 text-indigo-600" />
                                      JSON
                                    </button>
                                    <Link
                                      href={`/dashboard/projects/${p._id}`}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-colors"
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
