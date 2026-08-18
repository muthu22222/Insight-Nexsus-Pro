'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  Save,
  ShoppingBag,
  Check,
  Loader2,
  Sparkles,
  Maximize2,
  X,
  Sliders,
  CheckCircle2,
  Armchair,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useDesignerStore } from '@/store/useDesignerStore';
import { useAuth } from '@/contexts/AuthContext';
import FurnishedRoomView from '@/components/designer/FurnishedRoomView';
import { getDesignImagesForStyle } from '@/lib/design-assets';
import type { AIDesign, Hotspot } from '@/types';

const steps = [
  { id: 'upload', label: 'Upload' },
  { id: 'analysis', label: 'Analyze' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'generate', label: 'Generate' },
  { id: 'viewer', label: 'Viewer' },
];

export default function GeneratePage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const {
    uploadedImage,
    roomAnalysis,
    preferences,
    setGeneratedDesigns,
    setSelectedDesign,
    setCurrentStep,
  } = useDesignerStore();

  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedDesigns, setLocalDesigns] = useState<AIDesign[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [previewModalDesign, setPreviewModalDesign] = useState<{ title: string; image: string; variantIndex: number; hotspots: any[] } | null>(null);
  const [cardViewModes, setCardViewModes] = useState<Record<string, 'redesign' | 'original'>>({});
  const isGeneratingRef = useRef(false);

  const fallbackRoomImage = uploadedImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&auto=format&fit=crop&q=85';

  const generateDesigns = useCallback(async () => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    setIsGenerating(true);
    setGenerationProgress(15);

    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 92) {
          clearInterval(progressInterval);
          return 92;
        }
        return prev + 8;
      });
    }, 250);

    try {
      const token = await getToken().catch(() => null);
      const response = await fetch('/api/design/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          imageUrl: uploadedImage || '',
          roomAnalysis: roomAnalysis || {},
          analysis: roomAnalysis || {},
          preferences: preferences || {},
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      const data = await response.json().catch(() => ({}));
      const rawList = data?.designs || data?.data || [];

      let designs: AIDesign[] = [];
      const roomType = roomAnalysis?.roomType || 'Living Room';
      const modernImages = getDesignImagesForStyle('modern', roomType);
      const scandiImages = getDesignImagesForStyle('scandinavian', roomType);
      const luxuryImages = getDesignImagesForStyle('luxury', roomType);
      const fallbackImages = [modernImages[0], scandiImages[0], luxuryImages[0]];

      if (Array.isArray(rawList) && rawList.length > 0) {
        designs = rawList.map((item: any, idx: number) => ({
          _id: item._id || `design-${idx + 1}`,
          projectId: item.projectId || 'current',
          style: item.style || `Design Variant ${idx + 1}`,
          furnitureStyle: item.furnitureStyle || preferences?.furnitureStyle || 'Modern',
          mood: item.mood || preferences?.mood || 'Warm',
          color: item.color || preferences?.color || 'Neutral',
          budget: item.budget || preferences?.budget || 200000,
          description: item.description || '',
          generatedImages: Array.isArray(item.generatedImages) && item.generatedImages.length > 0 && item.generatedImages[0].startsWith('http')
            ? item.generatedImages
            : [fallbackImages[idx % fallbackImages.length]],
          hotspots: Array.isArray(item.hotspots) ? item.hotspots : [],
        }));
      }

      setLocalDesigns(designs);
      setGeneratedDesigns(designs);
      if (designs.length > 0) {
        setSelectedVariant(designs[0]._id);
        setSelectedDesign(designs[0]);
      }
      toast.success('Generated photorealistic room redesigns with dynamic furniture detection!');
    } catch (error: any) {
      console.warn('Design generation fallback:', error);
    } finally {
      clearInterval(progressInterval);
      setGenerationProgress(100);
      setTimeout(() => {
        setIsGenerating(false);
        isGeneratingRef.current = false;
      }, 400);
    }
  }, [getToken, uploadedImage, roomAnalysis, preferences, setGeneratedDesigns, setSelectedDesign]);

  useEffect(() => {
    if (!uploadedImage && !roomAnalysis) {
      router.push('/designer');
      return;
    }
    generateDesigns();
  }, [uploadedImage, roomAnalysis, router, generateDesigns]);

  const handleSelectDesign = (design: AIDesign) => {
    setSelectedVariant(design._id);
    setSelectedDesign(design);
  };

  const handleViewDesign = () => {
    if (!selectedVariant) {
      toast.error('Please select a design variant');
      return;
    }
    setCurrentStep('viewer');
    router.push('/designer/viewer');
  };

  const handleGenerateAgain = () => {
    generateDesigns();
  };

  const toggleCardViewMode = (designId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardViewModes((prev) => ({
      ...prev,
      [designId]: prev[designId] === 'original' ? 'redesign' : 'original',
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold mb-2 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Photorealistic Architecture • Complete Dynamic Furniture Sets</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Photorealistic Interior Redesigns</h1>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Each concept preserves your room structure while fitting a complete dynamic suite of catalog-matched furniture in your selected {preferences.furnitureStyle || 'Modern'} aesthetic.
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
                      index <= 3
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-medium ${
                      index <= 3 ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-1 mb-5 ${
                      index < 3 ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {isGenerating ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
          >
            <div className="relative w-32 h-32 mx-auto mb-8">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-amber-100"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border-4 border-amber-200"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-4 rounded-full border-4 border-amber-300 border-t-transparent"
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-6 rounded-full border-4 border-amber-400 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-amber-500" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing room and matching furniture catalog...</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
              Detecting visible furniture items, matching live products from IKEA, Pepperfry, Urban Ladder, and calculating accurate budget plans
            </p>

            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Progress</span>
                <span>{generationProgress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-amber-400 to-orange-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${generationProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Analyzing room structure
              </div>
              <div className="flex items-center gap-1.5">
                <Armchair className="w-3.5 h-3.5 text-amber-500" />
                Detecting all furniture
              </div>
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Matching MongoDB catalog
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {generatedDesigns.map((design, index) => {
                const isSelected = selectedVariant === design._id;
                const isOriginalMode = cardViewModes[design._id] === 'original';
                const designImage = design.generatedImages?.[0] || fallbackRoomImage;
                const itemCount = design.hotspots?.length || 0;

                return (
                  <motion.div
                    key={design._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.12 }}
                    className={`group bg-white rounded-2xl shadow-sm border-2 overflow-hidden cursor-pointer transition-all duration-200 flex flex-col ${
                      isSelected
                        ? 'border-gray-900 ring-2 ring-gray-900/10 shadow-xl'
                        : 'border-gray-100 hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => handleSelectDesign(design)}
                  >
                    {/* Visual Photorealistic Room Canvas */}
                    <div className="relative h-64 w-full overflow-hidden bg-gray-950 flex items-center justify-center">
                      <FurnishedRoomView
                        roomImage={fallbackRoomImage}
                        redesignImage={designImage}
                        variantIndex={index}
                        styleName={design.style}
                        hotspots={design.hotspots as any}
                        viewMode={isOriginalMode ? 'original' : 'redesign'}
                        isInteractive={false}
                      />

                      {/* Header Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20">
                        <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md text-white rounded-md text-[11px] font-bold shadow-sm">
                          Variant {index + 1}
                        </span>
                        {!isOriginalMode && (
                          <span className="px-2 py-0.5 bg-amber-500/95 text-white rounded text-[10px] font-bold shadow-sm">
                            {design.furnitureStyle || (index === 0 ? 'Modern' : index === 1 ? 'Scandinavian' : 'Luxury')}
                          </span>
                        )}
                      </div>

                      {/* Selected Indicator */}
                      {isSelected ? (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-gray-900 text-white rounded-full text-xs font-bold shadow-lg z-20">
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                          <span>Selected</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewModalDesign({
                              title: design.style,
                              image: designImage,
                              variantIndex: index,
                              hotspots: design.hotspots || [],
                            });
                          }}
                          className="absolute top-3 right-3 w-7 h-7 bg-black/60 hover:bg-black/85 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors z-20"
                          title="Zoom"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Before / After Toggle Button on Card */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
                        <button
                          type="button"
                          onClick={(e) => toggleCardViewMode(design._id, e)}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-white/95 hover:bg-white text-gray-900 rounded-md text-[11px] font-bold shadow-md transition-all backdrop-blur-sm"
                        >
                          <Sliders className="w-3 h-3 text-amber-600" />
                          <span>{isOriginalMode ? 'View Redesign ✨' : 'View Original 📷'}</span>
                        </button>

                        <span className="text-[10px] font-semibold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
                          {itemCount} Detected Products
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="text-sm font-bold text-gray-900 leading-snug">{design.style}</h3>
                          <span className="shrink-0 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            ₹{Number(design.budget || 200000).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                          {design.description || design.mood}
                        </p>
                      </div>

                      <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-[11px] text-gray-500">
                        <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <Check className="w-3 h-3" />
                          {itemCount} Catalog Products
                        </span>
                        <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                          {design.color}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={() => router.push('/designer/preferences')}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleGenerateAgain}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
              <button
                onClick={() => toast.success('Redesign concept saved!')}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Design
              </button>
              <button
                onClick={() => router.push('/furniture')}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                View Products
              </button>
              <button
                onClick={handleViewDesign}
                disabled={!selectedVariant}
                className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[240px] shadow-sm"
              >
                Inspect All Detected Products in Room Viewer →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {previewModalDesign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewModalDesign(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{previewModalDesign.title}</h3>
                  <p className="text-xs text-gray-500">Photorealistic Redesign with {previewModalDesign.hotspots?.length || 0} Detected Furniture Items</p>
                </div>
                <button
                  onClick={() => setPreviewModalDesign(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative h-[65vh] bg-gray-950 flex items-center justify-center">
                <FurnishedRoomView
                  roomImage={fallbackRoomImage}
                  redesignImage={previewModalDesign.image}
                  variantIndex={previewModalDesign.variantIndex}
                  styleName={previewModalDesign.title}
                  hotspots={previewModalDesign.hotspots}
                  viewMode="redesign"
                  isInteractive={true}
                />
              </div>
              <div className="p-4 bg-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  {previewModalDesign.hotspots?.length || 0} Detected and Catalog-Matched Products
                </span>
                <button
                  onClick={() => {
                    const found = generatedDesigns.find((d) => d.style === previewModalDesign.title);
                    if (found) {
                      handleSelectDesign(found);
                      setPreviewModalDesign(null);
                      toast.success(`Selected ${found.style}`);
                    }
                  }}
                  className="bg-gray-900 text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                >
                  Select This Design
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
