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
  Check,
  CheckCircle2,
  Maximize,
  Compass,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useDesignerStore } from '@/store/useDesignerStore';
import { useAuth } from '@/contexts/AuthContext';
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
    setCurrentStep,
  } = useDesignerStore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<RoomAnalysis | null>(roomAnalysis);
  const [analyzedForImageId, setAnalyzedForImageId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newFurnitureInput, setNewFurnitureInput] = useState('');
  const [showAddFurniture, setShowAddFurniture] = useState(false);

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

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server returned invalid response (${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data?.error || `Analysis failed (${response.status})`);
      }

      if (!data.success || !data.data) {
        throw new Error(data?.error || 'Analysis failed - no data returned');
      }

      setAnalysis(data.data);
      setRoomAnalysis(data.data);
      setAnalyzedForImageId(imageId || uploadedImage);
      toast.success('Room and furniture analyzed successfully!');
    } catch (error: unknown) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze room');
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploadedImage, imageId, getToken, setRoomAnalysis]);

  useEffect(() => {
    if (!uploadedImage) {
      router.push('/designer');
      return;
    }
    const currentKey = imageId || uploadedImage;
    if (roomAnalysis && analyzedForImageId === currentKey) {
      setAnalysis(roomAnalysis);
      return;
    }
    setAnalysis(null);
    setAnalyzedForImageId(null);
    analyzeImage();
  }, [uploadedImage, imageId, roomAnalysis, analyzedForImageId, router, analyzeImage]);

  const handleEditStart = (key: string, value: any) => {
    setEditingField(key);
    if (Array.isArray(value)) {
      setEditValue(value.join(', '));
    } else if (typeof value === 'object' && value !== null) {
      setEditValue(JSON.stringify(value));
    } else {
      setEditValue(String(value || ''));
    }
  };

  const handleEditSave = (key: string) => {
    if (!analysis) return;
    const newValue =
      key === 'furniture' || key === 'windows' || key === 'doors' || key === 'emptyAreas'
        ? editValue.split(',').map((s) => s.trim()).filter(Boolean)
        : editValue;

    const updated = { ...analysis, [key]: newValue };
    setAnalysis(updated);
    setRoomAnalysis(updated);
    setEditingField(null);
    toast.success('Updated successfully');
  };

  const handleRemoveExistingFurniture = (index: number) => {
    if (!analysis) return;
    const updatedFurniture = [...(analysis.furniture || [])];
    const removedItem = updatedFurniture.splice(index, 1)[0];
    const updated = {
      ...analysis,
      furniture: updatedFurniture,
      isEmptyRoom: updatedFurniture.length === 0,
    };
    setAnalysis(updated);
    setRoomAnalysis(updated);
    toast.success(`Removed "${removedItem}"`);
  };

  const handleAddFurniture = () => {
    if (!analysis || !newFurnitureInput.trim()) return;
    const item = newFurnitureInput.trim();
    const updatedFurniture = [...(analysis.furniture || []), item];
    const updated = {
      ...analysis,
      furniture: updatedFurniture,
      isEmptyRoom: false,
    };
    setAnalysis(updated);
    setRoomAnalysis(updated);
    setNewFurnitureInput('');
    setShowAddFurniture(false);
    toast.success(`Added "${item}" to room furniture`);
  };

  const handleAddSuggestedToFurniture = (item: string) => {
    if (!analysis) return;
    const existing = analysis.furniture || [];
    if (existing.includes(item)) {
      toast('Item already in furniture list');
      return;
    }
    const updatedFurniture = [...existing, item];
    const updatedSuggested = (analysis.suggestedFurniture || []).filter((s) => s !== item);
    const updated = {
      ...analysis,
      furniture: updatedFurniture,
      suggestedFurniture: updatedSuggested,
      isEmptyRoom: false,
    };
    setAnalysis(updated);
    setRoomAnalysis(updated);
    toast.success(`Added "${item}" to furniture list`);
  };

  const handleConfirm = () => {
    if (!analysis) {
      toast.error('Please wait for analysis to complete');
      return;
    }
    setRoomAnalysis(analysis);
    setCurrentStep('preferences');
    router.push('/designer/preferences');
  };

  if (!uploadedImage) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold mb-2 shadow-2xs">
            <Armchair className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Furniture Detection & Spatial Analysis</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Room & Furniture Analysis</h1>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Review the detected existing furniture, spatial architecture, and AI recommendations before customizing your design preferences.
          </p>
        </div>

        {/* Steps Tracker */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-1">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      index <= 1
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-medium ${
                      index <= 1 ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-1 mb-5 ${
                      index < 1 ? 'bg-gray-900' : 'bg-gray-200'
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
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <span>Uploaded Source Room</span>
                <span className="text-[11px] font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Active Source
                </span>
              </h2>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-center">
              <img
                src={uploadedImage}
                alt="Uploaded room"
                className="w-full h-80 object-cover rounded-xl shadow-xs border border-gray-100"
              />
              <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Architecture Retention Engine:</strong> The AI will preserve your exact walls, window placements, floor perspective, and detected furniture while applying your selected style and furniture suite.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Analysis & Furniture Manager */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Armchair className="w-4 h-4 text-amber-600" />
                <span>Detected Architecture & Furniture</span>
              </h2>
              {analysis && (
                <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                  {analysis.roomType || 'Living Room'}
                </span>
              )}
            </div>

            {isAnalyzing ? (
              <div className="p-12 text-center my-auto">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <motion.div
                    className="absolute inset-0 border-4 border-amber-200 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute inset-2 border-4 border-amber-400 border-t-transparent rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Armchair className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  AI is analyzing room & furniture...
                </h3>
                <p className="text-sm text-gray-500">
                  Detecting existing furniture pieces, spatial bounds, lighting, and placement opportunities
                </p>
              </div>
            ) : analysis ? (
              <div className="p-4 space-y-4 max-h-[560px] overflow-y-auto">
                {/* 1. DETECTED EXISTING FURNITURE SECTION */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Armchair className="w-4 h-4 text-amber-700" />
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                        Detected Existing Furniture ({analysis.furniture?.length || 0})
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowAddFurniture(!showAddFurniture)}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-100/80 px-2 py-0.5 rounded transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Item
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-600 mb-3">
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
                        className="flex-1 px-3 py-1.5 text-xs border border-amber-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none bg-white"
                        autoFocus
                      />
                      <button
                        onClick={handleAddFurniture}
                        className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors"
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
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-semibold text-gray-900 shadow-2xs group"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Preserve
                          </span>
                          <button
                            onClick={() => handleRemoveExistingFurniture(i)}
                            className="text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors ml-1"
                            title="Remove from room"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-white/80 rounded-lg border border-dashed border-amber-300 text-center">
                      <p className="text-xs font-medium text-gray-700">Empty / Bare Room Detected</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        The AI will generate a complete, realistic furniture suite tailored for this {analysis.roomType || 'room'}.
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. AI SUGGESTED COMPLEMENTARY FURNITURE */}
                {analysis.suggestedFurniture && analysis.suggestedFurniture.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <h4 className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">
                          AI Recommended Additions to Complete Room
                        </h4>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 mb-2.5">
                      Click any item to include it in the generated furniture layout:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.suggestedFurniture.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleAddSuggestedToFurniture(item)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-amber-50 border border-gray-200 hover:border-amber-300 rounded-md text-xs font-medium text-gray-700 hover:text-amber-900 transition-all shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-gray-400 group-hover:text-amber-600" />
                          <span>{item}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. ARCHITECTURAL CHARACTERISTICS */}
                <div className="space-y-2 pt-1">
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wide px-1">
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
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 group hover:bg-gray-100/80 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            {label}
                          </p>
                          {editingField === key ? (
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleEditSave(key)}
                                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-amber-500 outline-none bg-white"
                                autoFocus
                              />
                              <button
                                onClick={() => handleEditSave(key)}
                                className="text-xs text-amber-600 font-bold px-2 py-1 bg-amber-50 rounded"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-900 font-medium truncate mt-0.5">
                              {displayValue}
                            </p>
                          )}
                        </div>
                        {editingField !== key && (
                          <button
                            onClick={() => handleEditStart(key, rawValue)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600"
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
            className="flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={!analysis || isAnalyzing}
            className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-bold text-sm hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Proceed to Style & Furniture Preferences</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
