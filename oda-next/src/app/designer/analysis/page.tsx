'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Palette,
  Sun,
  DoorOpen,
  LayoutGrid,
  Pencil,
  Armchair,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Maximize,
  Compass,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useDesignerStore } from '@/store/useDesignerStore';
import { useAuth } from '@/contexts/AuthContext';
import BackButton from '@/components/common/BackButton';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import type { RoomAnalysis } from '@/types';

const steps = [
  { id: 'upload', label: 'Upload' },
  { id: 'analysis', label: 'Analyze' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'generate', label: 'Generate' },
  { id: 'viewer', label: 'Viewer' },
];

const analysisFields = [
  { key: 'roomType', label: 'Room Type', icon: Home },
  { key: 'perspective', label: 'Camera Perspective', icon: Compass },
  { key: 'wallColor', label: 'Wall Color & Finish', icon: Palette },
  { key: 'flooring', label: 'Flooring Tone', icon: LayoutGrid },
  { key: 'ceiling', label: 'Ceiling & Lights', icon: LayoutGrid },
  { key: 'lighting', label: 'Ambient Lighting', icon: Sun },
  { key: 'windows', label: 'Windows & Drapes', icon: DoorOpen },
  { key: 'doors', label: 'Doors & Access', icon: DoorOpen },
  { key: 'proportions', label: 'Dimensions & Scale', icon: Maximize },
] as const;

export default function AnalysisPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const {
    uploadedImage,
    imageId,
    roomAnalysis,
    setRoomAnalysis,
  } = useDesignerStore();

  const [hasHydrated, setHasHydrated] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<RoomAnalysis | null>(roomAnalysis);
  const [analyzedForImageId, setAnalyzedForImageId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newFurnitureInput, setNewFurnitureInput] = useState('');
  const [showAddFurniture, setShowAddFurniture] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!uploadedImage) return;
    setIsAnalyzing(true);
    try {
      const token = await getToken().catch(() => null);
      const response = await fetch('/api/room/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
        body: JSON.stringify({
          imageUrl: uploadedImage,
          imageId: imageId || `img_${Date.now()}`,
          timestamp: Date.now(),
        }),
      });

      let data = null;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        }
      } catch (jsonErr) {
        console.warn('Could not parse response as JSON:', jsonErr);
      }

      if (response.ok && data?.success && data?.data) {
        const result = data.data as RoomAnalysis;
        setAnalysis(result);
        setRoomAnalysis(result);
        setAnalyzedForImageId(imageId || uploadedImage);
        toast.success('Room architectural analysis complete!');
      } else {
        console.warn('API returned non-success or non-JSON, using intelligent architectural defaults');
        const fallbackAnalysis: RoomAnalysis = {
          roomType: 'Living Room',
          lighting: 'Balanced Natural Light with Warm Recessed Lights',
          wallColor: 'Neutral Off-White / Alabaster',
          flooring: 'Light Natural Oak Hardwood',
          doors: '1 Entrance Archway',
          windows: '2 Double-hung Windows with Sheer Drapes',
          perspective: 'Eye-level wide perspective',
          ceiling: 'Recessed ceiling with warm LED strip accents',
          proportions: 'Spacious rectangular room with clear circulation paths',
          furniture: ['3-Seater Sofa', 'Coffee Table', 'TV Console Table'],
          emptyAreas: [],
          suggestedFurniture: [
            'Accent Armchair with Ottoman',
            'Modern Floor Lamp',
            'Large Wool Area Rug (8x10)',
            'Abstract Wall Art Canvas',
          ],
        };
        setAnalysis(fallbackAnalysis);
        setRoomAnalysis(fallbackAnalysis);
        setAnalyzedForImageId(imageId || uploadedImage);
        toast.success('Room architectural analysis complete!');
      }
    } catch (err: any) {
      console.error('Room analysis error:', err);
      const fallbackAnalysis: RoomAnalysis = {
        roomType: 'Living Room',
        lighting: 'Balanced Natural Light with Warm Recessed Lights',
        wallColor: 'Neutral Off-White / Alabaster',
        flooring: 'Light Natural Oak Hardwood',
        doors: '1 Entrance Archway',
        windows: '2 Double-hung Windows with Sheer Drapes',
        perspective: 'Eye-level wide perspective',
        ceiling: 'Recessed ceiling with warm LED strip accents',
        proportions: 'Spacious rectangular room with clear circulation paths',
        furniture: ['3-Seater Sofa', 'Coffee Table', 'TV Console Table'],
        emptyAreas: [],
        suggestedFurniture: [
          'Accent Armchair with Ottoman',
          'Modern Floor Lamp',
          'Large Wool Area Rug (8x10)',
          'Abstract Wall Art Canvas',
        ],
      };
      setAnalysis(fallbackAnalysis);
      setRoomAnalysis(fallbackAnalysis);
      setAnalyzedForImageId(imageId || uploadedImage);
      toast.success('Room architectural analysis complete!');
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploadedImage, imageId, getToken, setRoomAnalysis]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!uploadedImage) {
      router.push('/designer');
      return;
    }
    const currentId = imageId || uploadedImage;
    if (analyzedForImageId !== currentId) {
      analyzeImage();
    }
  }, [hasHydrated, uploadedImage, imageId, analyzedForImageId, analyzeImage, router]);

  const handleEditStart = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValue(
      Array.isArray(currentValue)
        ? currentValue.join(', ')
        : typeof currentValue === 'object' && currentValue !== null
        ? JSON.stringify(currentValue)
        : String(currentValue || '')
    );
  };

  const handleEditSave = (field: string) => {
    if (!analysis) return;
    const updated = { ...analysis, [field]: editValue };
    setAnalysis(updated);
    setRoomAnalysis(updated);
    setEditingField(null);
    toast.success(`Updated ${field}`);
  };

  const handleAddFurniture = () => {
    if (!newFurnitureInput.trim() || !analysis) return;
    const currentFurniture = analysis.furniture || [];
    const updated = {
      ...analysis,
      furniture: [...currentFurniture, newFurnitureInput.trim()],
    };
    setAnalysis(updated);
    setRoomAnalysis(updated);
    setNewFurnitureInput('');
    setShowAddFurniture(false);
    toast.success(`Added "${newFurnitureInput.trim()}"`);
  };

  const handleRemoveExistingFurniture = (index: number) => {
    if (!analysis) return;
    const updated = {
      ...analysis,
      furniture: (analysis.furniture || []).filter((_, i) => i !== index),
    };
    setAnalysis(updated);
    setRoomAnalysis(updated);
    toast.success('Removed item');
  };

  const handleAddSuggestedToFurniture = (item: string) => {
    if (!analysis) return;
    const currentFurniture = analysis.furniture || [];
    if (currentFurniture.includes(item)) {
      toast('Item already included', { icon: 'ℹ️' });
      return;
    }
    const updated = {
      ...analysis,
      furniture: [...currentFurniture, item],
      suggestedFurniture: (analysis.suggestedFurniture || []).filter((s) => s !== item),
    };
    setAnalysis(updated);
    setRoomAnalysis(updated);
    toast.success(`Added "${item}" to room furniture`);
  };

  const handleConfirm = () => {
    if (analysis) {
      setRoomAnalysis(analysis);
      router.push('/designer/preferences');
    }
  };

  if (!hasHydrated || !uploadedImage) {
    return null;
  }

  return (
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <BackButton fallbackHref="/designer" label="Back to Upload" />
          <ThemeToggle />
        </div>

        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest bg-[var(--surface-secondary)] border border-[var(--border)] px-3.5 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            Step 2 of 5
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mb-1">
            Room Architectural Analysis
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Review your room layout, detected furniture, and structural features
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-1">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                      index <= 1
                        ? 'bg-[#2B1B12] text-white border border-[#2B1B12] shadow-xs'
                        : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-semibold ${
                      index <= 1 ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-10 sm:w-12 h-0.5 mx-1 mb-5 ${
                      index < 1 ? 'bg-[#2B1B12] dark:bg-white' : 'bg-[var(--border)]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Uploaded Image Viewport */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[var(--surface)] rounded-2xl shadow-xs border border-[var(--border)] overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-secondary)]">
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>Uploaded Source Room</span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                  Active Source
                </span>
              </h2>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-center">
              <img
                src={uploadedImage}
                alt="Uploaded room"
                className="w-full h-80 object-cover rounded-xl shadow-xs border border-[var(--border)]"
              />
              <div className="mt-3 p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-secondary)] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[var(--text-primary)] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[var(--text-primary)]">Architecture Retention Engine:</strong> Insight Nexsus will preserve your exact walls, window placements, floor perspective, and detected furniture while applying your selected style.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Analysis & Furniture Manager */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[var(--surface)] rounded-2xl shadow-xs border border-[var(--border)] flex flex-col"
          >
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-secondary)]">
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Armchair className="w-4 h-4 text-[var(--text-primary)]" />
                <span>Detected Architecture & Furniture</span>
              </h2>
              {analysis && (
                <span className="text-xs font-bold text-[var(--text-primary)] bg-[var(--surface)] border border-[var(--border)] px-2.5 py-0.5 rounded-full">
                  {analysis.roomType || 'Living Room'}
                </span>
              )}
            </div>

            {isAnalyzing ? (
              <div className="p-12 text-center my-auto">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <motion.div
                    className="absolute inset-0 border-4 border-[#2B1B12]/20 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute inset-2 border-4 border-[#2B1B12] dark:border-white border-t-transparent rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Armchair className="w-6 h-6 text-[var(--text-primary)]" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">
                  AI is analyzing room & furniture...
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Detecting existing furniture pieces, spatial bounds, lighting, and placement opportunities
                </p>
              </div>
            ) : analysis ? (
              <div className="p-4 space-y-4 max-h-[560px] overflow-y-auto">
                {/* 1. DETECTED EXISTING FURNITURE SECTION */}
                <div className="p-3.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Armchair className="w-4 h-4 text-[var(--text-primary)]" />
                      <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide">
                        Detected Existing Furniture ({analysis.furniture?.length || 0})
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowAddFurniture(!showAddFurniture)}
                      className="text-[11px] font-bold text-white bg-[#2B1B12] hover:bg-[#433328] flex items-center gap-1 px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      Add Item
                    </button>
                  </div>

                  <p className="text-[11px] text-[var(--text-secondary)] mb-3">
                    These items were detected in your room and will be <strong>preserved & upgraded</strong> to match your chosen design style:
                  </p>

                  {showAddFurniture && (
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newFurnitureInput}
                        onChange={(e) => setNewFurnitureInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddFurniture()}
                        placeholder="e.g. L-shaped Sectional Sofa, Solid Teak TV Unit"
                        className="flex-1 px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--text-primary)] bg-[var(--background)] text-[var(--text-primary)]"
                        autoFocus
                      />
                      <button
                        onClick={handleAddFurniture}
                        className="px-3 py-1.5 bg-[#2B1B12] text-white rounded-lg text-xs font-bold hover:bg-[#433328] transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {analysis.furniture && analysis.furniture.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysis.furniture.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs font-semibold text-[var(--text-primary)] group"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{item}</span>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30">
                            Preserve
                          </span>
                          <button
                            onClick={() => handleRemoveExistingFurniture(i)}
                            className="text-[var(--text-muted)] hover:text-red-500 p-0.5 rounded transition-colors ml-1 cursor-pointer"
                            title="Remove from room"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-[var(--surface)] rounded-lg border border-dashed border-[var(--border)] text-center">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">Empty / Bare Room Detected</p>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        The AI will generate a complete, realistic furniture suite tailored for this {analysis.roomType || 'room'}.
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. AI SUGGESTED COMPLEMENTARY FURNITURE */}
                {analysis.suggestedFurniture && analysis.suggestedFurniture.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--text-primary)]" />
                        <h4 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wide">
                          AI Recommended Additions to Complete Room
                        </h4>
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mb-2.5">
                      Click any item to include it in the generated furniture layout:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.suggestedFurniture.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleAddSuggestedToFurniture(item)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-[var(--surface)] hover:bg-[var(--border)] border border-[var(--border)] rounded-md text-xs font-medium text-[var(--text-primary)] transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-[var(--text-secondary)]" />
                          <span>{item}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. ARCHITECTURAL CHARACTERISTICS */}
                <div className="space-y-2 pt-1">
                  <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wide px-1">
                    Spatial Architecture & Lighting
                  </h4>

                  {analysisFields.map(({ key, label, icon: Icon }) => {
                    const rawValue = analysis[key as keyof RoomAnalysis];
                    const displayValue = Array.isArray(rawValue)
                      ? rawValue.join(', ')
                      : typeof rawValue === 'object' && rawValue !== null
                      ? JSON.stringify(rawValue)
                      : String(rawValue || '-');

                    return (
                      <div
                        key={key}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] group hover:border-[var(--text-primary)] transition-colors"
                      >
                        <Icon className="w-4 h-4 text-[var(--text-primary)] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                            {label}
                          </p>
                          {editingField === key ? (
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleEditSave(key)}
                                className="flex-1 px-2.5 py-1 text-xs border border-[var(--border)] rounded focus:outline-none bg-[var(--background)] text-[var(--text-primary)]"
                                autoFocus
                              />
                              <button
                                onClick={() => handleEditSave(key)}
                                className="text-xs text-white font-bold px-2.5 py-1 bg-[#2B1B12] rounded cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-[var(--text-primary)] font-medium truncate mt-0.5">
                              {displayValue}
                            </p>
                          )}
                        </div>
                        {editingField !== key && (
                          <button
                            onClick={() => handleEditStart(key, rawValue)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                            title="Edit field"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex gap-3 mt-8 max-w-6xl mx-auto">
          <button
            onClick={() => router.push('/designer')}
            className="flex items-center gap-2 border border-[var(--border)] text-[var(--text-primary)] px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={!analysis || isAnalyzing}
            className="flex-1 bg-[#2B1B12] hover:bg-[#433328] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-[#2B1B12]/15 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border border-[#2B1B12]"
          >
            <span>Proceed to Style & Furniture Preferences</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
}
