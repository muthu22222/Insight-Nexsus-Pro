"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
} from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
import { useAuth } from "@/contexts/AuthContext";
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

export default function DashboardPage() {
  const { userData, loading: authLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setProjects(data.data);
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    if (userData) {
      fetchProjects();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [userData, authLoading]);

  const totalSavedDesigns = projects.reduce(
    (acc, p) => acc + (p.designs?.length || 0),
    0
  );

  const totalBudget = projects.reduce(
    (acc, p) => acc + (p.budgetPlan?.totalBudget || 0),
    0
  );

  const totalShoppingItems = projects.reduce(
    (acc, p) => acc + (p.shoppingList?.length || 0),
    0
  );

  const recentDesigns = projects
    .flatMap((p) =>
      (p.designs || []).map((d) => ({
        ...d,
        projectName: p.name,
        projectId: p._id,
      }))
    )
    .slice(-4)
    .reverse();

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-white/10 bg-[#0a0a0a]/85 backdrop-blur-md px-4 sm:px-6 py-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden h-10 w-10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Welcome back, {userData?.name?.split(" ")[0] || "Designer"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Here&apos;s an overview of your AI interior design studio
            </p>
          </div>
          <Link
            href="/designer"
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 hover:from-amber-400 hover:to-amber-300 text-black text-sm font-extrabold rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all active:scale-98"
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
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div variants={item}>
                <Link
                  href="/dashboard/projects"
                  className="block bg-[#121215] rounded-2xl border border-white/10 p-5 hover:border-amber-500/40 hover:bg-white/[0.04] transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <FolderOpen className="h-5 w-5 text-amber-400" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <p className="mt-4 text-2xl font-black text-white">
                    {projects.length}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium">My Projects</p>
                </Link>
              </motion.div>

              <motion.div variants={item}>
                <div className="bg-[#121215] rounded-2xl border border-white/10 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                      <Bookmark className="h-5 w-5 text-violet-400" />
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-black text-white">
                    {totalSavedDesigns}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium">Saved AI Designs</p>
                </div>
              </motion.div>

              <motion.div variants={item}>
                <Link
                  href="/budget"
                  className="block bg-[#121215] rounded-2xl border border-white/10 p-5 hover:border-emerald-500/40 hover:bg-white/[0.04] transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Calculator className="h-5 w-5 text-emerald-400" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <p className="mt-4 text-2xl font-black text-white">
                    {formatCurrency(totalBudget)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium">Total Budget Managed</p>
                </Link>
              </motion.div>

              <motion.div variants={item}>
                <div className="bg-[#121215] rounded-2xl border border-white/10 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-black text-white">
                    {totalShoppingItems}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium">Shopping List Items</p>
                </div>
              </motion.div>
            </div>

            {/* Quick Action Banner Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5">
              <Link
                href="/designer"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 hover:from-amber-400 hover:to-amber-300 text-black text-sm font-extrabold rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-all"
              >
                <Wand2 className="h-4 w-4 stroke-[2.5]" />
                Start New AI Design
              </Link>
              <Link
                href="/furniture"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 border border-white/15 text-white text-sm font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                <Sofa className="h-4 w-4 text-amber-400" />
                Browse Catalog Furniture
              </Link>
            </div>

            {/* Recent AI Designs Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Recent AI Designs
                </h2>
                <Link
                  href="/dashboard/projects"
                  className="text-xs sm:text-sm text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  View All Projects
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {recentDesigns.length === 0 ? (
                <div className="bg-[#121215] rounded-2xl border border-white/10 p-12 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                    <Wand2 className="h-7 w-7 text-amber-400" />
                  </div>
                  <p className="text-white font-bold mb-1">
                    No designs yet
                  </p>
                  <p className="text-sm text-gray-400 mb-5 max-w-sm mx-auto">
                    Upload a room photo and let Insight Nexsus AI create tailored photorealistic designs for you.
                  </p>
                  <Link
                    href="/designer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm font-extrabold rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-transform"
                  >
                    <Wand2 className="h-4 w-4 stroke-[2.5]" />
                    Start Designing
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentDesigns.map((design) => (
                    <motion.div
                      key={design._id}
                      variants={item}
                      className="bg-[#121215] rounded-2xl border border-white/10 overflow-hidden hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 transition-all group"
                    >
                      <div className="aspect-[4/3] bg-black relative overflow-hidden">
                        {design.generatedImages?.[0] ? (
                          <img
                            src={design.generatedImages[0]}
                            alt={`${design.style} design`}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Wand2 className="h-8 w-8 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="font-bold text-white text-sm truncate">
                          {design.projectName}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {design.style} · {design.mood}
                        </p>
                        <Link
                          href={`/dashboard/projects/${design.projectId}`}
                          className="mt-3 inline-flex items-center text-xs font-bold text-amber-400 hover:text-amber-300"
                        >
                          View Project
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>

      <AIAssistant />
    </div>
  );
}
