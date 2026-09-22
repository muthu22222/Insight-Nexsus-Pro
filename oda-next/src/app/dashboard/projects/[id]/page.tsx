"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  Save,
  X,
  Trash2,
  Download,
  Eye,
  Sofa,
  Calculator,
  ShoppingCart,
  Check,
  Loader2,
  Menu,
  Image as ImageIcon,
  Wand2,
  Sparkles,
} from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import BackButton from "@/components/common/BackButton";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { getAmazonProductUrl, getFlipkartProductUrl } from "@/lib/store-links";
import { formatCurrency, formatDate } from "@/utils/helpers";
import { RAW_PROJECTS } from "@/data/raw-projects";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";

type Tab = "overview" | "designs" | "furniture" | "budget" | "shopping";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "designs", label: "Designs", icon: ImageIcon },
  { id: "furniture", label: "Furniture", icon: Sofa },
  { id: "budget", label: "Budget", icon: Calculator },
  { id: "shopping", label: "Shopping List", icon: ShoppingCart },
];

const categoryColors: Record<string, string> = {
  "Main Furniture": "bg-blue-500",
  "Living Room": "bg-blue-500",
  "Bedroom": "bg-violet-500",
  "Kitchen": "bg-emerald-500",
  "Lighting & Decor": "bg-yellow-500",
  "Lighting": "bg-yellow-500",
  "Decor": "bg-pink-500",
  "Textiles & Rugs": "bg-teal-500",
  "Accessories": "bg-indigo-500",
  "Miscellaneous": "bg-gray-500",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const { sidebarWidthClass } = useSidebar();
  const projectId = params.id as string;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      // 1. Instantly display if it's a raw studio project
      const raw = RAW_PROJECTS.find((p) => p._id === projectId);
      if (raw) {
        setProject(raw);
        setNewName(raw.name);
        const checked: Record<number, boolean> = {};
        raw.shoppingList?.forEach((item: any, i: number) => {
          checked[i] = item.checked || false;
        });
        setCheckedItems(checked);
        setLoading(false);
        return;
      }

      // 2. Otherwise fetch from API
      const token = await getToken().catch(() => null);
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/projects/${projectId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setProject(data.data);
          setNewName(data.data.name);
          const checked: Record<number, boolean> = {};
          data.data.shoppingList?.forEach((item: any, i: number) => {
            checked[i] = item.checked || false;
          });
          setCheckedItems(checked);
        } else {
          toast.error("Project not found");
        }
      } else {
        toast.error("Failed to load project");
      }
    } catch {
      toast.error("Error loading project");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSavingName(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setProject((prev: any) => ({ ...prev, name: newName.trim() }));
        setEditingName(false);
        toast.success("Project name updated");
      } else {
        toast.error("Failed to rename project");
      }
    } catch {
      toast.error("Error updating project name");
    } finally {
      setSavingName(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project from MongoDB?")) return;
    setDeleting(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Project deleted");
        router.push("/dashboard/projects");
      } else {
        toast.error("Failed to delete project");
        setDeleting(false);
      }
    } catch {
      toast.error("Error deleting project");
      setDeleting(false);
    }
  };

  const handleToggleCheck = async (index: number) => {
    const updated = { ...checkedItems, [index]: !checkedItems[index] };
    setCheckedItems(updated);

    try {
      const token = await getToken();
      const updatedList = project.shoppingList.map((item: any, i: number) => ({
        ...item,
        checked: i === index ? !checkedItems[index] : item.checked,
      }));
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shoppingList: updatedList }),
      });
    } catch {
      // ignore
    }
  };

  const handleDownloadPDF = () => {
    if (!project) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Insight Nexsus - " + project.name, 14, 22);

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Room Type: ${project.roomType || project.roomAnalysis?.roomType || "Living Room"}`, 14, 36);
      doc.text(`Target Budget: ${formatCurrency(project.budget || project.budgetPlan?.totalBudget || 200000)}`, 14, 42);

      let y = 55;
      doc.setFontSize(14);
      doc.text("Catalog Furniture & Shopping List", 14, y);
      y += 8;

      doc.setFontSize(9);
      const items = project.shoppingList || project.furniture || [];
      items.forEach((item: any, i: number) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const name = item.productName || item.name || `Item ${i + 1}`;
        const price = item.price ? formatCurrency(typeof item.price === 'number' ? item.price : parseInt(String(item.price).replace(/[^\d]/g, ''), 10) || 0) : 'N/A';
        const store = item.store || item.storeName || 'Amazon / Flipkart';
        doc.text(`${i + 1}. ${name} — ${price} (Store: ${store})`, 14, y);
        y += 7;
      });

      doc.save(`${project.name.replace(/\s+/g, "_")}_Insight_Nexsus.pdf`);
      toast.success("Project PDF downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F172A]" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[var(--background)] text-[var(--text-primary)]">
        <p className="text-[var(--text-secondary)] mb-4">Project not found</p>
        <Link
          href="/dashboard/projects"
          className="px-5 py-2.5 bg-[#2B1B12] hover:bg-[#433328] text-white text-sm font-extrabold rounded-xl border border-[#2B1B12]"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  const origImage = project.originalImage || project.roomImage || "";
  const genImage =
    project.generatedImage ||
    project.designs?.[0]?.generatedImages?.[0] ||
    project.selectedDesign?.generatedImages?.[0] ||
    "";

  const furnitureList = project.furniture || [];
  const designsList = project.designs || (project.selectedDesign ? [project.selectedDesign] : []);
  const shoppingItems = project.shoppingList || [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
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
            <BackButton fallbackHref="/dashboard/projects" label="Back to Projects" variant="subtle" />

            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="text-base sm:text-lg font-bold bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1 text-[var(--text-primary)] focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") {
                        setEditingName(false);
                        setNewName(project.name);
                      }
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="h-8 w-8 rounded-lg flex items-center justify-center bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/30 cursor-pointer"
                  >
                    {savingName ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setNewName(project.name);
                    }}
                    className="h-8 w-8 rounded-lg flex items-center justify-center bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[var(--text-primary)] truncate tracking-tight">
                    {project.name}
                  </h1>
                  <button
                    onClick={() => setEditingName(true)}
                    className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href={`/designer?projectId=${project._id}`}
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-[#2B1B12] hover:bg-[#433328] text-white text-xs font-bold rounded-xl shadow-xs border border-[#2B1B12] hover:scale-[1.02] transition-transform"
              >
                <Wand2 className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Open in Studio</span>
              </Link>
              <button
                onClick={handleDownloadPDF}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-semibold rounded-xl hover:border-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[var(--text-primary)]" />
                PDF
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Delete
              </button>
            </div>
          </header>

          <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
            {/* Tabs Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-6 border-b border-[var(--border)]">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                      active
                        ? "border-[#2B1B12] dark:border-white text-[#2B1B12] dark:text-white bg-[var(--surface-secondary)] rounded-t-lg"
                        : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-[#2B1B12] dark:text-white" : "text-[var(--text-secondary)]"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Generated AI Design Image */}
                    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-[var(--text-primary)] text-base flex items-center gap-2">
                          <Wand2 className="w-4 h-4 text-[var(--text-secondary)]" />
                          <span>AI Redesign Preview</span>
                        </h3>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-[var(--text-primary)] bg-[var(--surface-secondary)] border border-[var(--border)] rounded-full">
                          {project.selectedStyle || project.style || "Modern"}
                        </span>
                      </div>
                      <div className="aspect-video bg-[var(--surface-secondary)] rounded-xl overflow-hidden shadow-inner border border-[var(--border)]">
                        {genImage ? (
                          <img
                            src={genImage}
                            alt="Generated Design"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="h-10 w-10 text-[var(--text-muted)]" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Original Room Image */}
                    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-xs">
                      <h3 className="font-bold text-[var(--text-primary)] text-base mb-4 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span>Original Uploaded Room</span>
                      </h3>
                      <div className="aspect-video bg-[var(--surface-secondary)] rounded-xl overflow-hidden shadow-inner border border-[var(--border)]">
                        {origImage ? (
                          <img
                            src={origImage}
                            alt="Original Room"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="h-10 w-10 text-[var(--text-muted)]" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Room Analysis Breakdown */}
                  {project.roomAnalysis && (
                    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-xs">
                      <h3 className="font-bold text-[var(--text-primary)] mb-4 text-base flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[var(--text-secondary)]" />
                        Room Architectural Analysis
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-3.5 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)]">
                          <span className="text-xs text-[var(--text-secondary)] font-semibold block">Room Type</span>
                          <span className="text-sm font-bold text-[var(--text-primary)] mt-1 block">
                            {project.roomAnalysis.roomType || project.roomType || "Living Room"}
                          </span>
                        </div>
                        <div className="p-3.5 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)]">
                          <span className="text-xs text-[var(--text-secondary)] font-semibold block">Wall Tone / Finish</span>
                          <span className="text-sm font-bold text-[var(--text-primary)] mt-1 block truncate">
                            {project.roomAnalysis.wallColor || "Neutral Warm Finish"}
                          </span>
                        </div>
                        <div className="p-3.5 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)]">
                          <span className="text-xs text-[var(--text-secondary)] font-semibold block">Flooring Material</span>
                          <span className="text-sm font-bold text-[var(--text-primary)] mt-1 block truncate">
                            {project.roomAnalysis.flooring || "Hardwood / Tiles"}
                          </span>
                        </div>
                        <div className="p-3.5 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)]">
                          <span className="text-xs text-[var(--text-secondary)] font-semibold block">Lighting Setup</span>
                          <span className="text-sm font-bold text-[var(--text-primary)] mt-1 block truncate">
                            {project.roomAnalysis.lighting || "Natural + Warm Ambient"}
                          </span>
                        </div>
                      </div>

                      {project.roomAnalysis.furniture && project.roomAnalysis.furniture.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[var(--border)]">
                          <span className="text-xs font-semibold text-[var(--text-secondary)] block mb-2">
                            Detected Room Elements
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {project.roomAnalysis.furniture.map((f: string, i: number) => (
                              <span
                                key={i}
                                className="px-3 py-1 text-xs font-semibold bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-full"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 2: DESIGNS */}
              {activeTab === "designs" && (
                <motion.div
                  key="designs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {designsList.length === 0 ? (
                    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-12 text-center">
                      <ImageIcon className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3" />
                      <p className="text-[var(--text-secondary)]">No designs saved yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {designsList.map((design: any, idx: number) => (
                        <div
                          key={design._id || idx}
                          className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden hover:border-[var(--text-secondary)] transition-all shadow-xs"
                        >
                          <div className="aspect-[4/3] bg-[var(--surface-secondary)] relative">
                            {design.generatedImages?.[0] || genImage ? (
                              <img
                                src={design.generatedImages?.[0] || genImage}
                                alt={design.style || "Design"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-[var(--text-muted)]" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#2B1B12] text-white border border-[#2B1B12] text-xs font-black rounded-full flex items-center gap-1 shadow-md">
                              <Check className="h-3 w-3" />
                              Saved Design
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 text-xs font-bold bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-full">
                                {design.style || project.selectedStyle || "Modern"}
                              </span>
                              <span className="px-2.5 py-0.5 text-xs font-bold bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)] rounded-full">
                                {design.mood || project.mood || "Warm"}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] mt-2 font-medium">
                              Budget: {formatCurrency(design.budget || project.budget || 200000)}
                            </p>
                            <Link
                              href={`/designer?projectId=${project._id}`}
                              className="mt-3 w-full py-2 bg-[#2B1B12] hover:bg-[#433328] text-white text-xs font-extrabold rounded-xl border border-[#2B1B12] transition-transform flex items-center justify-center gap-1.5 shadow-xs hover:scale-[1.01]"
                            >
                              <Wand2 className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Open in Studio</span>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 3: FURNITURE */}
              {activeTab === "furniture" && (
                <motion.div
                  key="furniture"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {furnitureList.length === 0 ? (
                    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-12 text-center">
                      <Sofa className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3" />
                      <p className="text-[var(--text-secondary)]">No furniture items catalogued in this project</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {furnitureList.map((item: any, idx: number) => {
                        const itemName = item.name || item.productName || `Furniture Item ${idx + 1}`;
                        const itemPrice = typeof item.price === "number" ? item.price : parseInt(String(item.price || "0").replace(/[^\d]/g, ""), 10) || 15000;

                        return (
                          <div
                            key={item._id || idx}
                            className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden hover:border-[var(--text-secondary)] transition-all flex flex-col justify-between shadow-xs"
                          >
                            <div className="aspect-[4/3] bg-[var(--surface-secondary)] relative">
                              {item.image || genImage ? (
                                <img
                                  src={item.image || genImage}
                                  alt={itemName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Sofa className="h-8 w-8 text-[var(--text-muted)]" />
                                </div>
                              )}
                              <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold bg-[var(--surface)]/90 backdrop-blur-md rounded-md text-[var(--text-primary)] border border-[var(--border)] shadow-xs">
                                {item.storeName || item.store || "Retailer"}
                              </span>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="font-bold text-[var(--text-primary)] text-sm truncate">
                                  {itemName}
                                </h4>
                                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                  {item.brand || "Designer Brand"} · {item.category || "Furniture"}
                                </p>
                                <p className="text-base font-black text-[#F5A900] mt-2">
                                  {formatCurrency(itemPrice)}
                                </p>
                              </div>

                              {/* Direct Live Amazon & Flipkart Purchase Links */}
                              <div className="mt-4 flex flex-col gap-1.5 pt-3 border-t border-[var(--border)]">
                                <a
                                  href={getAmazonProductUrl(itemName, item.amazonUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-[#FF9900] hover:bg-[#F08E00] text-[#111111] text-xs font-extrabold rounded-xl border border-[#FF9900] shadow-xs transition-colors"
                                >
                                  <span>Buy on Amazon</span>
                                  <span className="text-xs">→</span>
                                </a>
                                <a
                                  href={getFlipkartProductUrl(itemName, item.flipkartUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-[#2874F0] hover:bg-[#1A65DC] text-white border border-[#2874F0] text-xs font-bold rounded-xl shadow-xs transition-colors"
                                >
                                  <span>Buy on Flipkart</span>
                                  <span className="text-xs">→</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 4: BUDGET */}
              {activeTab === "budget" && (
                <motion.div
                  key="budget"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 shadow-xs">
                      <p className="text-xs text-[var(--text-secondary)] font-semibold">Total Target Budget</p>
                      <p className="text-2xl font-black text-[var(--text-primary)] mt-1">
                        {formatCurrency(project.budgetPlan?.totalBudget || project.budget || 200000)}
                      </p>
                    </div>
                    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 shadow-xs">
                      <p className="text-xs text-[var(--text-secondary)] font-semibold">Estimated Furniture Spend</p>
                      <p className="text-2xl font-black text-[var(--text-primary)] mt-1">
                        {formatCurrency(
                          furnitureList.reduce(
                            (acc: number, cur: any) =>
                              acc + (typeof cur.price === "number" ? cur.price : parseInt(String(cur.price || 0).replace(/[^\d]/g, ""), 10) || 0),
                            0
                          ) || project.budgetPlan?.spent || 0
                        )}
                      </p>
                    </div>
                    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 shadow-xs">
                      <p className="text-xs text-[var(--text-secondary)] font-semibold">Allocated Balance</p>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {formatCurrency(project.budgetPlan?.remaining || 0)}
                      </p>
                    </div>
                  </div>

                  {project.budgetPlan?.allocations && project.budgetPlan.allocations.length > 0 && (
                    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-xs">
                      <h3 className="font-bold text-[var(--text-primary)] mb-4 text-base">
                        Budget Allocation Breakdown
                      </h3>
                      <div className="space-y-4">
                        {project.budgetPlan.allocations.map((alloc: any, idx: number) => (
                          <div key={idx}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-semibold text-[var(--text-primary)]">
                                {alloc.category}
                              </span>
                              <span className="text-sm font-bold text-[var(--text-secondary)]">
                                {formatCurrency(alloc.amount)} ({alloc.percentage}%)
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-[var(--surface-secondary)] rounded-full overflow-hidden border border-[var(--border)]">
                              <div
                                className={`h-full rounded-full ${categoryColors[alloc.category] || "bg-[#2B1B12]"}`}
                                style={{ width: `${alloc.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 5: SHOPPING LIST */}
              {activeTab === "shopping" && (
                <motion.div
                  key="shopping"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {shoppingItems.length === 0 ? (
                    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-12 text-center">
                      <ShoppingCart className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3" />
                      <p className="text-[var(--text-secondary)]">Shopping list is empty</p>
                    </div>
                  ) : (
                    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xs overflow-hidden">
                      <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-secondary)]">
                        <h3 className="font-bold text-[var(--text-primary)] text-base">
                          Shopping List ({shoppingItems.length} items)
                        </h3>
                        <button
                          onClick={handleDownloadPDF}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[var(--text-primary)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl transition-all shadow-xs"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Export PDF</span>
                        </button>
                      </div>

                      <div className="divide-y divide-[var(--border)]">
                        {shoppingItems.map((item: any, i: number) => {
                          const isChecked = !!checkedItems[i];
                          const itemName = item.productName || item.name || `Product ${i + 1}`;
                          const itemPrice = typeof item.price === "number" ? item.price : parseInt(String(item.price || 0).replace(/[^\d]/g, ""), 10) || 0;

                          return (
                            <div
                              key={i}
                              className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 hover:bg-[var(--surface-secondary)]/50 transition-colors"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <button
                                  onClick={() => handleToggleCheck(i)}
                                  className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                                    isChecked
                                      ? "bg-[#00C98D] border-[#00C98D]"
                                      : "border-[var(--border)] hover:border-[var(--text-primary)]"
                                  }`}
                                >
                                  {isChecked && (
                                    <Check className="h-3 w-3 text-white stroke-[3]" />
                                  )}
                                </button>
                                <div className="min-w-0">
                                  <p
                                    className={`text-sm font-bold ${
                                      isChecked
                                        ? "line-through text-[var(--text-muted)]"
                                        : "text-[var(--text-primary)]"
                                    }`}
                                  >
                                    {itemName}
                                  </p>
                                  <p className="text-xs text-[var(--text-secondary)]">
                                    Store: {item.store || "Retailer"} · Qty: {item.quantity || 1}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <p
                                  className={`text-sm font-black ${
                                    isChecked
                                      ? "line-through text-[var(--text-muted)]"
                                      : "text-[var(--text-primary)]"
                                  }`}
                                >
                                  {formatCurrency(itemPrice * (item.quantity || 1))}
                                </p>

                                <div className="flex items-center gap-2">
                                  <a
                                    href={getAmazonProductUrl(itemName, item.amazonUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 bg-[#FF9900] hover:bg-[#F08E00] text-[#111111] border border-[#FF9900] text-xs font-extrabold rounded-lg transition-colors shadow-2xs"
                                  >
                                    Amazon
                                  </a>
                                  <a
                                    href={getFlipkartProductUrl(itemName, item.flipkartUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 bg-[#2874F0] hover:bg-[#1A65DC] text-white border border-[#2874F0] text-xs font-bold rounded-lg transition-colors shadow-2xs"
                                  >
                                    Flipkart
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        <AIAssistant />
      </div>
    </ProtectedRoute>
  );
}
