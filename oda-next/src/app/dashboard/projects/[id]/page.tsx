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
  ExternalLink,
  Image as ImageIcon,
  Wand2,
  CheckCircle,
  Tag,
  Star,
} from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import BackButton from "@/components/common/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import { getAmazonProductUrl, getFlipkartProductUrl } from "@/lib/store-links";
import type { Project, AIDesign, ShoppingListItem } from "@/types";
import { formatCurrency, formatDate } from "@/utils/helpers";
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
  "Kitchen": "bg-green-500",
  "Lighting & Decor": "bg-amber-500",
  "Lighting": "bg-amber-500",
  "Decor": "bg-pink-500",
  "Textiles & Rugs": "bg-teal-500",
  "Accessories": "bg-indigo-500",
  "Miscellaneous": "bg-gray-500",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
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
    const token = await getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setProject(data.data);
          setNewName(data.data.name);
          const checked: Record<number, boolean> = {};
          data.data.shoppingList?.forEach(
            (item: any, i: number) => {
              checked[i] = item.checked || false;
            }
          );
          setCheckedItems(checked);
        }
      } else {
        toast.error("Project not found");
      }
    } catch {
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!newName.trim() || newName === project?.name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setProject((prev: any) =>
          prev ? { ...prev, name: newName.trim() } : prev
        );
        toast.success("Project renamed");
      }
    } catch {
      toast.error("Failed to rename project");
    } finally {
      setSavingName(false);
      setEditingName(false);
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
      }
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleCheck = async (index: number) => {
    const updatedStatus = !checkedItems[index];
    setCheckedItems((prev) => ({ ...prev, [index]: updatedStatus }));

    if (project?.shoppingList) {
      const updatedList = [...project.shoppingList];
      if (updatedList[index]) {
        updatedList[index] = { ...updatedList[index], checked: updatedStatus };
      }
      try {
        const token = await getToken();
        await fetch(`/api/projects/${projectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ shoppingList: updatedList }),
        });
      } catch {}
    }
  };

  const handleDownloadPDF = () => {
    if (!project) return;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(`ODA NEXT - ${project.name}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Room Type: ${project.roomType || project.roomAnalysis?.roomType || 'Living Room'}`, 20, 30);
    doc.text(`Status: ${project.status || 'Completed'}`, 20, 38);
    doc.text(`Created: ${formatDate(project.createdAt)}`, 20, 46);

    let y = 60;
    if (project.budgetPlan) {
      doc.setFontSize(16);
      doc.text("Budget Plan", 20, y);
      doc.setFontSize(11);
      y += 8;
      doc.text(
        `Total Budget: ${formatCurrency(project.budgetPlan.totalBudget || project.budget || 200000)}`,
        20,
        y
      );
      y += 7;
      if (Array.isArray(project.budgetPlan.allocations)) {
        project.budgetPlan.allocations.forEach((alloc: any) => {
          doc.text(
            `${alloc.category}: ${formatCurrency(alloc.amount)} (${alloc.percentage}%)`,
            20,
            y
          );
          y += 7;
        });
      }
    }

    if (project.furniture?.length) {
      y += 10;
      doc.setFontSize(16);
      doc.text(`Furniture Catalog (${project.furniture.length} items)`, 20, y);
      doc.setFontSize(11);
      y += 8;
      project.furniture.forEach((f: any, i: number) => {
        doc.text(
          `${i + 1}. ${f.name || f.productName} - ${formatCurrency(f.price)} (${f.storeName || 'Store'})`,
          20,
          y
        );
        y += 7;
      });
    }

    doc.save(`${project.name.replace(/\s+/g, "_")}_interior_design.pdf`);
    toast.success("Project PDF downloaded");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white space-y-4">
        <p className="text-gray-500 font-medium">Project not found or unauthorized</p>
        <Link
          href="/dashboard/projects"
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  const origImage = project.originalImage || project.roomImage || '';
  const genImage =
    project.generatedImage ||
    project.designs?.[0]?.generatedImages?.[0] ||
    project.selectedDesign?.generatedImages?.[0] ||
    '';

  const furnitureList = project.furniture || [];
  const designsList = project.designs || (project.selectedDesign ? [project.selectedDesign] : []);
  const shoppingItems = project.shoppingList || [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-center" />
        <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-gray-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-10 w-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <BackButton fallbackHref="/dashboard/projects" label="Back to Projects" variant="subtle" />

            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="text-lg sm:text-xl font-bold bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="h-8 w-8 rounded-lg flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-100"
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
                    className="h-8 w-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900 truncate">
                    {project.name}
                  </h1>
                  <button
                    onClick={() => setEditingName(true)}
                    className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/designer?projectId=${project._id}`}
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold rounded-xl hover:shadow-md transition-shadow"
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>Open in Studio</span>
              </Link>
              <button
                onClick={handleDownloadPDF}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
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
            <div className="flex gap-1 overflow-x-auto pb-1 mb-6 border-b border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
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
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                          <Wand2 className="w-4 h-4 text-purple-600" />
                          <span>AI Redesign Preview</span>
                        </h3>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-full">
                          {project.selectedStyle || project.style || 'Modern'}
                        </span>
                      </div>
                      <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                        {genImage ? (
                          <img
                            src={genImage}
                            alt="Generated Design"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Original Room Image */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                      <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        <span>Original Uploaded Room</span>
                      </h3>
                      <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                        {origImage ? (
                          <img
                            src={origImage}
                            alt="Original Room"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Room Analysis Breakdown */}
                  {project.roomAnalysis && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                      <h3 className="font-bold text-gray-900 mb-4 text-base">
                        Room Architectural Analysis
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                          <span className="text-xs text-gray-500 font-semibold block">Room Type</span>
                          <span className="text-sm font-bold text-gray-900 mt-1 block">
                            {project.roomAnalysis.roomType || project.roomType || 'Living Room'}
                          </span>
                        </div>
                        <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                          <span className="text-xs text-gray-500 font-semibold block">Wall Tone / Finish</span>
                          <span className="text-sm font-bold text-gray-900 mt-1 block truncate">
                            {project.roomAnalysis.wallColor || 'Neutral Warm Finish'}
                          </span>
                        </div>
                        <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                          <span className="text-xs text-gray-500 font-semibold block">Flooring Material</span>
                          <span className="text-sm font-bold text-gray-900 mt-1 block truncate">
                            {project.roomAnalysis.flooring || 'Hardwood / Tiles'}
                          </span>
                        </div>
                        <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                          <span className="text-xs text-gray-500 font-semibold block">Lighting Setup</span>
                          <span className="text-sm font-bold text-gray-900 mt-1 block truncate">
                            {project.roomAnalysis.lighting || 'Natural + Warm Ambient'}
                          </span>
                        </div>
                      </div>

                      {project.roomAnalysis.furniture && project.roomAnalysis.furniture.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <span className="text-xs font-semibold text-gray-500 block mb-2">
                            Detected Room Elements
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {project.roomAnalysis.furniture.map((f: string, i: number) => (
                              <span
                                key={i}
                                className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full"
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
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                      <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No designs saved yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {designsList.map((design: any, idx: number) => (
                        <div
                          key={design._id || idx}
                          className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-md"
                        >
                          <div className="aspect-[4/3] bg-gray-100 relative">
                            {design.generatedImages?.[0] || genImage ? (
                              <img
                                src={design.generatedImages?.[0] || genImage}
                                alt={design.style || 'Design'}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-gray-300" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-md">
                              <Check className="h-3 w-3" />
                              Saved Design
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 rounded-full">
                                {design.style || project.selectedStyle || 'Modern'}
                              </span>
                              <span className="px-2.5 py-0.5 text-xs font-bold bg-violet-50 text-violet-700 rounded-full">
                                {design.mood || project.mood || 'Warm'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-medium">
                              Budget: {formatCurrency(design.budget || project.budget || 200000)}
                            </p>
                            <Link
                              href={`/designer?projectId=${project._id}`}
                              className="mt-3 w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
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
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                      <Sofa className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No furniture items catalogued in this project</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {furnitureList.map((item: any, idx: number) => {
                        const itemName = item.name || item.productName || `Furniture Item ${idx + 1}`;
                        const itemPrice = typeof item.price === 'number' ? item.price : parseInt(String(item.price || '0').replace(/[^\d]/g, ''), 10) || 15000;

                        return (
                          <div
                            key={item._id || idx}
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
                          >
                            <div className="aspect-[4/3] bg-gray-100 relative">
                              {item.image || genImage ? (
                                <img
                                  src={item.image || genImage}
                                  alt={itemName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Sofa className="h-8 w-8 text-gray-300" />
                                </div>
                              )}
                              <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold bg-white/90 backdrop-blur-md rounded-md text-gray-800 shadow-xs">
                                {item.storeName || item.store || 'Retailer'}
                              </span>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm truncate">
                                  {itemName}
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {item.brand || 'Designer Brand'} · {item.category || 'Furniture'}
                                </p>
                                <p className="text-base font-black text-gray-900 mt-2">
                                  {formatCurrency(itemPrice)}
                                </p>
                              </div>

                              {/* Direct Live Amazon & Flipkart Purchase Links */}
                              <div className="mt-4 flex flex-col gap-1.5 pt-3 border-t border-gray-100">
                                <a
                                  href={getAmazonProductUrl(itemName, item.amazonUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                                >
                                  <span>Buy on Amazon</span>
                                  <span className="text-xs">→</span>
                                </a>
                                <a
                                  href={getFlipkartProductUrl(itemName, item.flipkartUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
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
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
                      <p className="text-xs text-gray-500 font-semibold">Total Target Budget</p>
                      <p className="text-2xl font-black text-gray-900 mt-1">
                        {formatCurrency(project.budgetPlan?.totalBudget || project.budget || 200000)}
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
                      <p className="text-xs text-gray-500 font-semibold">Estimated Furniture Spend</p>
                      <p className="text-2xl font-black text-blue-600 mt-1">
                        {formatCurrency(
                          furnitureList.reduce(
                            (acc: number, cur: any) =>
                              acc + (typeof cur.price === 'number' ? cur.price : parseInt(String(cur.price || 0).replace(/[^\d]/g, ''), 10) || 0),
                            0
                          ) || project.budgetPlan?.spent || 0
                        )}
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
                      <p className="text-xs text-gray-500 font-semibold">Allocated Balance</p>
                      <p className="text-2xl font-black text-emerald-600 mt-1">
                        {formatCurrency(project.budgetPlan?.remaining || 0)}
                      </p>
                    </div>
                  </div>

                  {project.budgetPlan?.allocations && project.budgetPlan.allocations.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                      <h3 className="font-bold text-gray-900 mb-4 text-base">
                        Budget Allocation Breakdown
                      </h3>
                      <div className="space-y-4">
                        {project.budgetPlan.allocations.map((alloc: any, idx: number) => (
                          <div key={idx}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-semibold text-gray-800">
                                {alloc.category}
                              </span>
                              <span className="text-sm font-bold text-gray-600">
                                {formatCurrency(alloc.amount)} ({alloc.percentage}%)
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${categoryColors[alloc.category] || "bg-blue-500"}`}
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
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                      <ShoppingCart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Shopping list is empty</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 text-base">
                          Shopping List ({shoppingItems.length} items)
                        </h3>
                        <button
                          onClick={handleDownloadPDF}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Export PDF</span>
                        </button>
                      </div>

                      <div className="divide-y divide-gray-100">
                        {shoppingItems.map((item: any, i: number) => {
                          const isChecked = !!checkedItems[i];
                          const itemName = item.productName || item.name || `Product ${i + 1}`;
                          const itemPrice = typeof item.price === 'number' ? item.price : parseInt(String(item.price || 0).replace(/[^\d]/g, ''), 10) || 0;

                          return (
                            <div
                              key={i}
                              className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50/80 transition-colors"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <button
                                  onClick={() => handleToggleCheck(i)}
                                  className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
                                    isChecked
                                      ? "bg-blue-600 border-blue-600"
                                      : "border-gray-300 hover:border-blue-400"
                                  }`}
                                >
                                  {isChecked && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </button>
                                <div className="min-w-0">
                                  <p
                                    className={`text-sm font-bold ${
                                      isChecked
                                        ? "line-through text-gray-400"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {itemName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Store: {item.store || 'Retailer'} · Qty: {item.quantity || 1}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <p
                                  className={`text-sm font-black ${
                                    isChecked
                                      ? "line-through text-gray-400"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {formatCurrency(itemPrice * (item.quantity || 1))}
                                </p>

                                <div className="flex items-center gap-2">
                                  <a
                                    href={getAmazonProductUrl(itemName, item.amazonUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                                  >
                                    Amazon
                                  </a>
                                  <a
                                    href={getFlipkartProductUrl(itemName, item.flipkartUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
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
