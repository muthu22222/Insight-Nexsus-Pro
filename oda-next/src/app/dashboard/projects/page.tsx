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
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import BackButton from "@/components/common/BackButton";
import { useAuth } from "@/contexts/AuthContext";
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
  draft: "bg-white/10 text-gray-300 border border-white/15",
  analyzing: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  designing: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  completed: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
};

export default function ProjectsPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingRename, setSavingRename] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
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
          const list = Array.isArray(data.data)
            ? data.data
            : data.data.projects || [];
          setProjects(list);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project from MongoDB?")) return;
    setDeletingId(id);
    try {
      const token = await getToken();
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p._id !== id));
        toast.success("Project deleted successfully");
      } else {
        toast.error("Failed to delete project");
      }
    } catch {
      toast.error("Error deleting project");
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
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
        toast.error("Failed to rename project");
      }
    } catch {
      toast.error("Error renaming project");
    } finally {
      setSavingRename(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Toaster position="top-center" />
        <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-white/10 bg-[#0a0a0a]/85 backdrop-blur-md px-4 sm:px-6 py-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-10 w-10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-400" />
            </button>
            <BackButton fallbackHref="/dashboard" label="Back" variant="subtle" />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white tracking-tight">My Projects</h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Manage all your interior design projects ({projects.length} saved)
              </p>
            </div>
            <Link
              href="/designer"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 hover:from-amber-400 hover:to-amber-300 text-black text-sm font-extrabold rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              New Project
            </Link>
          </header>

          <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
            {projects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#121215] rounded-2xl border border-white/10 p-16 text-center shadow-xl"
              >
                <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-5">
                  <FolderOpen className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  No projects saved yet
                </h3>
                <p className="text-gray-400 mb-6 max-w-sm mx-auto text-sm">
                  Upload a photo of your room, let AI generate photorealistic interior designs with matched catalog furniture, and save your project!
                </p>
                <Link
                  href="/designer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm font-extrabold rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-transform"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  Start Your First Design
                </Link>
              </motion.div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {projects.map((project: any) => {
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
                      className="bg-[#121215] rounded-2xl border border-white/10 overflow-hidden hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 transition-all group flex flex-col"
                    >
                      <div className="aspect-[16/10] bg-black relative overflow-hidden">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={project.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="h-10 w-10 text-gray-700" />
                          </div>
                        )}
                        <span
                          className={`absolute top-3 right-3 px-2.5 py-1 text-[11px] font-bold rounded-full ${
                            statusColors[project.status] || "bg-white/10 text-gray-300 border border-white/15"
                          }`}
                        >
                          {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : "Completed"}
                        </span>
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[11px] font-bold text-amber-400 border border-white/10 shadow-md">
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
                                className="flex-1 px-3 py-1.5 text-sm font-semibold bg-black border border-amber-400 text-white rounded-lg outline-none"
                                autoFocus
                              />
                              <button
                                onClick={(e) => handleSaveRename(project._id, e)}
                                disabled={savingRename}
                                className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg border border-emerald-500/30"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(null);
                                }}
                                className="p-1.5 bg-white/10 hover:bg-white/20 text-gray-400 rounded-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-bold text-white text-base truncate">
                                {project.name}
                              </h3>
                              <button
                                onClick={(e) => handleStartRename(project, e)}
                                className="p-1 text-gray-400 hover:text-amber-400 rounded-md hover:bg-white/5 transition-colors"
                                title="Rename project"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-amber-400" />
                              <span>{formatDate(project.createdAt || project.updatedAt)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
                              <span>{project.designs?.length || 1} design</span>
                            </div>
                          </div>

                          {project.furniture && project.furniture.length > 0 && (
                            <p className="text-xs text-gray-300 mt-2 font-medium">
                              {project.furniture.length} Items · Budget: {formatCurrency(project.budget || project.budgetPlan?.totalBudget || 200000)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                          <Link
                            href={`/dashboard/projects/${project._id}`}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl hover:bg-amber-500/25 transition-colors shadow-2xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </Link>
                          <Link
                            href={`/designer?projectId=${project._id}`}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 text-gray-200 border border-white/15 text-xs font-semibold rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <Wand2 className="h-3.5 w-3.5 text-amber-400" />
                            <span>Open Studio</span>
                          </Link>
                          <button
                            onClick={(e) => handleDelete(project._id, e)}
                            disabled={deletingId === project._id}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50"
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
            )}
          </main>
        </div>

        <AIAssistant />
      </div>
    </ProtectedRoute>
  );
}
