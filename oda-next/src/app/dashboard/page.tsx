"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Menu,
  Plus,
  FolderOpen,
  Bookmark,
  Calculator,
  ShoppingCart,
  ArrowRight,
  Wand2,
  Sofa,
  Loader2,
} from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
import BackButton from "@/components/common/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import type { Project } from "@/types";
import { formatCurrency } from "@/utils/helpers";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 20 } },
};

export default function DashboardPage() {
  const { user, userData, loading: authLoading, getToken } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const projectsRes = await fetch("/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          if (projectsData.success && projectsData.data) {
            const projectList = Array.isArray(projectsData.data)
              ? projectsData.data
              : projectsData.data.projects || [];
            setProjects(projectList);
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, getToken]);

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
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              Welcome back, {userData?.name?.split(" ")[0] || "Designer"} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Here&apos;s an overview of your design projects
            </p>
          </div>
          <Link
            href="/designer"
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-shadow"
          >
            <Plus className="h-4 w-4" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div variants={item}>
                <Link
                  href="/dashboard/projects"
                  className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
                      <FolderOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <p className="mt-4 text-2xl font-bold text-gray-900">
                    {projects.length}
                  </p>
                  <p className="text-sm text-gray-500">My Projects</p>
                </Link>
              </motion.div>

              <motion.div variants={item}>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl bg-violet-50 flex items-center justify-center">
                      <Bookmark className="h-5 w-5 text-violet-600" />
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-bold text-gray-900">
                    {totalSavedDesigns}
                  </p>
                  <p className="text-sm text-gray-500">Saved Designs</p>
                </div>
              </motion.div>

              <motion.div variants={item}>
                <Link
                  href="/budget"
                  className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl bg-green-50 flex items-center justify-center">
                      <Calculator className="h-5 w-5 text-green-600" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-green-600 transition-colors" />
                  </div>
                  <p className="mt-4 text-2xl font-bold text-gray-900">
                    {formatCurrency(totalBudget)}
                  </p>
                  <p className="text-sm text-gray-500">Total Budget</p>
                </Link>
              </motion.div>

              <motion.div variants={item}>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-bold text-gray-900">
                    {totalShoppingItems}
                  </p>
                  <p className="text-sm text-gray-500">Shopping List Items</p>
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/designer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-shadow"
              >
                <Wand2 className="h-4 w-4" />
                Start New Design
              </Link>
              <Link
                href="/furniture"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Sofa className="h-4 w-4" />
                Browse Furniture
              </Link>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent AI Designs
                </h2>
                <Link
                  href="/dashboard/projects"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {recentDesigns.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Wand2 className="h-7 w-7 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-1">
                    No designs yet
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    Upload a room photo and let AI create beautiful designs for you
                  </p>
                  <Link
                    href="/designer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Wand2 className="h-4 w-4" />
                    Start Designing
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentDesigns.map((design) => (
                    <motion.div
                      key={design._id}
                      variants={item}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                    >
                      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                        {design.generatedImages?.[0] ? (
                          <img
                            src={design.generatedImages[0]}
                            alt={`${design.style} design`}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Wand2 className="h-8 w-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {design.projectName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {design.style} · {design.mood}
                        </p>
                        <Link
                          href={`/dashboard/projects/${design.projectId}`}
                          className="mt-3 inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700"
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
