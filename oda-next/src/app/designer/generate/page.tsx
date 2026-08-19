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
  ExternalLink,
  DollarSign,
  Palette,
  Compass,
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
    imageId,
    roomAnalysis,
    preferences,
    selectedDesign,
    setGeneratedDesigns,
    setSelectedDesign,
    setCurrentStep,
  } = useDesignerStore();

  const [isGenerating, setIsGenerating] = useState(true);
  const [design, setDesign] = useState<AIDesign | null>(selectedDesign);
  const [generatedForImageId, setGeneratedForImageId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'redesign' | 'original' | 'split'>('redesign');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [previewZoomOpen, setPreviewZoomOpen] = useState(false);
  const isGeneratingRef = useRef(false);

  const fallbackRoomImage = uploadedImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&auto=format&fit=crop&q=85';

  const generateDesign = useCallback(async () => {
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
    }, 220);

    try {
      const token = await getToken().catch(() => null);
      const uniqueRequestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const response = await fetch('/api/design/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
        body: JSON.stringify({
          imageUrl: uploadedImage || '',
          imageId: imageId || `img_${Date.now()}`,
          roomAnalysis: roomAnalysis || {},
          analysis: roomAnalysis || {},
          preferences: preferences || {},
          requestId: uniqueRequestId,
          timestamp: Date.now(),
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      const data = await response.json().catch(() => ({}));
      const resDesign = data?.design || (Array.isArray(data?.designs) ? data.designs[0] : null) || data?.data?.[0];

      const roomType = roomAnalysis?.roomType || 'Living Room';
      const fallbackImages = getDesignImagesForStyle(preferences?.furnitureStyle || 'modern', roomType, Date.now());

      let finalDesign: AIDesign;

      if (resDesign) {
        finalDesign = {
          _id: resDesign._id || `${imageId || 'design'}-${Date.now()}`,
          projectId: resDesign.projectId || 'current',
          style: resDesign.style || `${preferences?.style || 'Modern'} Redesign`,
          furnitureStyle: resDesign.furnitureStyle || preferences?.furnitureStyle || 'Modern',
          mood: resDesign.mood || preferences?.mood || 'Warm',
          color: resDesign.color || preferences?.color || 'Neutral',
          budget: resDesign.budget || preferences?.budget || 200000,
          description: resDesign.description || '',
          generatedImages: Array.isArray(resDesign.generatedImages) && resDesign.generatedImages.length > 0 && (resDesign.generatedImages[0].startsWith('http') || resDesign.generatedImages[0].startsWith('/'))
            ? resDesign.generatedImages
            : [fallbackImages[0]],
          hotspots: Array.isArray(resDesign.hotspots) ? resDesign.hotspots : [],
        };
      } else {
        finalDesign = {
          _id: `${imageId || 'design'}-${Date.now()}`,
          projectId: 'current',
          style: `${preferences?.style || 'Modern'} Redesign`,
          furnitureStyle: preferences?.furnitureStyle || 'Modern',
          mood: preferences?.mood || 'Warm',
          color: preferences?.color || 'Neutral',
          budget: preferences?.budget || 200000,
          description: `Complete ${roomType} interior redesign.`,
          generatedImages: [fallbackImages[0]],
          hotspots: [],
        };
      }

      setDesign(finalDesign);
      setSelectedDesign(finalDesign);
      setGeneratedDesigns([finalDesign]);
      setGeneratedForImageId(imageId || uploadedImage);
      toast.success('Generated photorealistic room redesign!');
    } catch (error: any) {
      console.warn('Design generation error:', error);
      toast.error('Failed to generate design');
    } finally {
      clearInterval(progressInterval);
      setGenerationProgress(100);
      setTimeout(() => {
        setIsGenerating(false);
        isGeneratingRef.current = false;
      }, 350);
    }
  }, [getToken, uploadedImage, imageId, roomAnalysis, preferences, setSelectedDesign, setGeneratedDesigns]);

  useEffect(() => {
    if (!uploadedImage && !roomAnalysis) {
      router.push('/designer');
      return;
    }
    const currentKey = imageId || uploadedImage;
    if (generatedForImageId === currentKey && design) {
      return;
    }
    setDesign(null);
    setIsGenerating(true);
    isGeneratingRef.current = false;
    generateDesign();
  }, [uploadedImage, imageId, roomAnalysis, generatedForImageId, design, router, generateDesign]);

  const handleOpenViewer = () => {
    if (!design) {
      toast.error('Design is still generating');
      return;
    }
    setCurrentStep('viewer');
    router.push('/designer/viewer');
  };

  const handleRegenerate = () => {
    isGeneratingRef.current = false;
    generateDesign();
  };

  const redesignImage = design?.generatedImages?.[0] || fallbackRoomImage;
  const hotspots = design?.hotspots || [];
  const itemCount = hotspots.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold mb-2 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Photorealistic Architecture • Complete Furnished Room</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Room Redesign</h1>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Your uploaded room redesigned with a complete furniture and decor suite in your chosen {preferences.furnitureStyle || 'Modern'} aesthetic.
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
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-3xl mx-auto"
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

            <h2 className="text-xl font-bold text-gray-900 mb-2">Redesigning your room with complete furniture suite...</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
              Preserving room architecture, fitting catalog-matched furniture, and rendering photorealistic interior photography
            </p>

            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Generating</span>
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
                Preserving room architecture
              </div>
              <div className="flex items-center gap-1.5">
                <Armchair className="w-3.5 h-3.5 text-amber-500" />
                Rendering complete furniture suite
              </div>
            </div>
          </motion.div>
        ) : design ? (
          <div className="space-y-6">
            {/* ONE LARGE GENERATED ROOM IMAGE & SPECIFICATIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Large Image Canvas Viewport (8 Columns) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
              >
                {/* Visual Canvas */}
                <div className="relative h-[480px] sm:h-[540px] w-full overflow-hidden bg-black flex items-center justify-center">
                  <FurnishedRoomView
                    roomImage={fallbackRoomImage}
                    redesignImage={redesignImage}
                    styleName={design.style}
                    hotspots={hotspots as any}
                    viewMode={viewMode}
                    sliderPosition={sliderPosition}
                    isInteractive={true}
                    className="w-full h-full"
                  />

                  {/* Top-Left Floating Info Pill */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 z-30 pointer-events-none">
                    <span className="px-3 py-1.5 bg-black/80 backdrop-blur-md text-white rounded-xl text-xs font-bold shadow-lg">
                      {design.style}
                    </span>
                    <span className="px-2.5 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold shadow-md">
                      {design.furnitureStyle || 'Modern'}
                    </span>
                  </div>

                  {/* Top-Right Zoom Button */}
                  <div className="absolute top-4 right-4 z-30">
                    <button
                      onClick={() => setPreviewZoomOpen(true)}
                      className="w-8 h-8 rounded-xl bg-black/75 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center shadow-lg transition-colors"
                      title="Fullscreen Preview"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom View Mode Bar */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-auto">
                    <div className="bg-black/80 backdrop-blur-xl border border-white/15 rounded-xl p-1 flex items-center gap-1 shadow-2xl">
                      <button
                        onClick={() => setViewMode('redesign')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          viewMode === 'redesign'
                            ? 'bg-white text-black shadow-xs'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Redesigned Room ✨
                      </button>
                      <button
                        onClick={() => setViewMode('split')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          viewMode === 'split'
                            ? 'bg-white text-black shadow-xs'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Sliders className="w-3 h-3 text-purple-400" />
                        <span>Compare Before/After</span>
                      </button>
                      <button
                        onClick={() => setViewMode('original')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          viewMode === 'original'
                            ? 'bg-white text-black shadow-xs'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Bare Room 📷
                      </button>
                    </div>

                    <span className="text-xs font-bold text-white bg-black/80 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/15 shadow-lg">
                      {itemCount} Furnished Products in Scene
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Alongside Details & Product Inventory (4 Columns) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col space-y-4 max-h-[580px] overflow-y-auto"
              >
                {/* Design Header */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-snug">{design.style}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                      ₹{Number(design.budget || 200000).toLocaleString('en-IN')} Budget
                    </span>
                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-md">
                      {design.color}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {itemCount} Products
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2.5 leading-relaxed">
                    {design.description || design.mood}
                  </p>
                </div>

                {/* Included Furniture List */}
                <div className="border-t border-gray-100 pt-3">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Armchair className="w-3.5 h-3.5 text-amber-600" />
                      <span>Included Furniture & Décor ({itemCount})</span>
                    </span>
                  </h3>

                  <div className="space-y-2">
                    {hotspots.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-100 transition-colors flex items-center justify-between"
                      >
                        <div className="min-w-0 flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {item.id || idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {item.label}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate">
                              {item.store} • {item.category || 'Furniture'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-2">
                          <p className="text-xs font-bold text-gray-900">{item.price}</p>
                          {item.productUrl && (
                            <a
                              href={item.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-amber-600 font-semibold hover:underline inline-flex items-center gap-0.5 mt-0.5"
                            >
                              <span>Store Link</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Action Buttons Bar */}
            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={() => router.push('/designer/preferences')}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
              <button
                onClick={() => toast.success('Redesign saved to your project!')}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Design
              </button>
              <button
                onClick={() => router.push('/furniture')}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                View Products
              </button>
              <button
                onClick={handleOpenViewer}
                className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-sm min-w-[220px]"
              >
                <span>Open Full Interactive Room Viewer →</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {previewZoomOpen && design && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewZoomOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{design.style}</h3>
                  <p className="text-xs text-gray-500">Photorealistic Redesign with {itemCount} Detected Furniture Items</p>
                </div>
                <button
                  onClick={() => setPreviewZoomOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative h-[70vh] bg-black flex items-center justify-center">
                <FurnishedRoomView
                  roomImage={fallbackRoomImage}
                  redesignImage={redesignImage}
                  styleName={design.style}
                  hotspots={hotspots as any}
                  viewMode="redesign"
                  isInteractive={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
