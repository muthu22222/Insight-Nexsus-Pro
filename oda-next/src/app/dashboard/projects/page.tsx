"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  FolderOpen,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
  Image as ImageIcon,
  Menu,
  Check,
  X,
  Wand2,
  Database,
  Sparkles,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import BackButton from "@/components/common/BackButton";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { RAW_PROJECTS } from "@/data/raw-projects";
import type { Project } from "@/types";
import { formatDate, formatCurrency } from "@/utils/helpers";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 20 } },
};

const statusColors: Record<string, string> = {
  draft: "bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]",
  analyzing: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30",
  designing: "bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30",
  completed: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30",
};

export default function ProjectsPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { sidebarWidthClass } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingRename, setSavingRename] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const isUsingRaw = projects.length === 0;
  const effectiveProjects: Project[] = isUsingRaw ? RAW_PROJECTS : projects;

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
        // response was not json
      }

      if (res.ok && data?.success) {
        toast.success(data.message || "Successfully saved raw projects to database!");
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          setProjects(data.data);
        } else {
          await fetchProjects();
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

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = await getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch("/api/projects", { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const list = Array.isArray(data.data)
            ? data.data
            : data.data.projects || [];
          if (list.length > 0) {
            setProjects(list);
          }
        }
      }
    } catch {
      // silently fail and use raw data fallback
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;
    setDeletingId(id);
    try {
      const token = await getToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p._id !== id));
        toast.success("Project deleted successfully");
      } else {
        // If it's a raw project that only exists in memory, filter it locally
        setProjects((prev) => prev.filter((p) => p._id !== id));
        toast.success("Project removed from view");
      }
    } catch {
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success("Project removed from view");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartRename = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(project._id);
    setEditName(project.name);
  };

  const handleSaveRename = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editName.trim()) {
      toast.error("Project name cannot be empty");
      return;
    }
    setSavingRename(true);
    try {
      const token = await getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setProjects((prev) =>
          prev.map((p) => (p._id === id ? { ...p, name: data.data?.name || editName.trim() } : p))
        );
        setEditingId(null);
        toast.success("Project renamed");
      } else {
        setProjects((prev) =>
          prev.map((p) => (p._id === id ? { ...p, name: editName.trim() } : p))
        );
        setEditingId(null);
        toast.success("Project renamed");
      }
    } catch {
      setProjects((prev) =>
        prev.map((p) => (p._id === id ? { ...p, name: editName.trim() } : p))
      );
      setEditingId(null);
      toast.success("Project renamed");
    } finally {
      setSavingRename(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--text-primary)]" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-200">
        <Toaster position="top-center" />
        <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <div className={`transition-all duration-300 ease-in-out ${sidebarWidthClass}`}>
          <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md px-4 sm:px-6 py-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-10 w-10 rounded-lg flex items-center justify-center hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5 text-[var(--text-primary)]" />
            </button>
            <BackButton fallbackHref="/dashboard" label="Back" variant="subtle" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">My Projects</h1>
                {isUsingRaw && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                    <Database className="h-3 w-3" />
                    Studio Raw Data
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                Manage all your interior design studio projects ({effectiveProjects.length} {isUsingRaw ? "raw records" : "saved"})
              </p>
            </div>
            <ThemeToggle />
            <Link
              href="/designer"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2B1B12] dark:bg-[#FFFFFF] dark:text-[#2B1B12] text-white text-sm font-bold rounded-xl shadow-md border border-black/10 dark:border-white/10 hover:opacity-90 hover:scale-[1.02] transition-all"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              New Project
            </Link>
          </header>

          <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
            {/* Raw Data Preview Banner */}
            {isUsingRaw && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Studio Raw Projects Active
                    </p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Displaying 4 curated studio projects with room analysis, photorealistic AI designs, and live vendor catalogs.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSeedRawData}
                    disabled={seeding}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-98"
                  >
                    {seeding ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Saving to DB...
                      </>
                    ) : (
                      <>
                        <Database className="h-3.5 w-3.5" />
                        Save to Cloud DB
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Projects Grid */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {effectiveProjects.map((project: any) => {
                const thumbnail =
                  project.generatedImage ||
                  project.designs?.[0]?.generatedImages?.[0] ||
                  project.roomImage ||
                  project.originalImage ||
                  "";

                const isEditingThis = editingId === project._id;

                return (
                  <motion.div
                    key={project._id}
                    variants={item}
                    className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden hover:border-amber-500/40 hover:shadow-xl transition-all group flex flex-col"
                  >
                    <div className="aspect-[16/10] bg-[var(--surface-secondary)] relative overflow-hidden">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={project.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-[var(--text-muted)]" />
                        </div>
                      )}
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 text-[11px] font-bold rounded-full ${
                          statusColors[project.status] || "bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)]"
                        }`}
                      >
                        {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : "Completed"}
                      </span>
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-[var(--surface)]/90 backdrop-blur-md rounded-lg text-[11px] font-bold text-[var(--text-primary)] border border-[var(--border)] shadow-xs">
                        {project.roomType || project.roomAnalysis?.roomType || "Living Room"}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {isEditingThis ? (
                          <div className="flex items-center gap-1.5 mb-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 px-3 py-1.5 text-sm font-semibold bg-[var(--background)] border border-amber-500 text-[var(--text-primary)] rounded-lg outline-none"
                              autoFocus
                            />
                            <button
                              onClick={(e) => handleSaveRename(project._id, e)}
                              disabled={savingRename}
                              className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-500/30 cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(null);
                              }}
                              className="p-1.5 bg-[var(--surface-secondary)] hover:bg-[var(--border)] text-[var(--text-muted)] rounded-lg cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-[var(--text-primary)] text-base truncate">
                              {project.name}
                            </h3>
                            <button
                              onClick={(e) => handleStartRename(project, e)}
                              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-md hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
                              title="Rename project"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-secondary)]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                            <span>{formatDate(project.createdAt || project.updatedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ImageIcon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                            <span>{project.designs?.length || 1} design</span>
                          </div>
                        </div>

                        {project.furniture && project.furniture.length > 0 && (
                          <p className="text-xs text-[var(--text-secondary)] mt-2 font-medium">
                            {project.furniture.length} Items · Budget: {formatCurrency(project.budget || project.budgetPlan?.totalBudget || 200000)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                        <Link
                          href={`/dashboard/projects/${project._id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2B1B12] dark:bg-[#FFFFFF] dark:text-[#2B1B12] text-white border border-black/10 dark:border-white/10 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity shadow-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Link>
                        <Link
                          href={`/designer?projectId=${project._id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)] text-xs font-semibold rounded-xl hover:bg-[var(--border)] transition-colors"
                        >
                          <Wand2 className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                          <span>Open Studio</span>
                        </Link>
                        <button
                          onClick={(e) => handleDelete(project._id, e)}
                          disabled={deletingId === project._id}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Delete project"
                        >
                          {deletingId === project._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </main>
        </div>

        <AIAssistant />
      </div>
    </ProtectedRoute>
  );
}
