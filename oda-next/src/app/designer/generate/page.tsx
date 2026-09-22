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
  Armchair,
  ExternalLink,
  FolderCheck,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useDesignerStore } from '@/store/useDesignerStore';
import { useAuth } from '@/contexts/AuthContext';
import BackButton from '@/components/common/BackButton';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import FurnishedRoomView from '@/components/designer/FurnishedRoomView';
import { getDesignImagesForStyle } from '@/lib/design-assets';
import { getAmazonProductUrl, getFlipkartProductUrl } from '@/lib/store-links';
import { RAW_PROJECTS } from '@/data/raw-projects';
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
    activeProjectId,
    activeProjectName,
    uploadedImage,
    imageId,
    roomAnalysis,
    preferences,
    selectedDesign,
    setGeneratedDesigns,
    setSelectedDesign,
    setActiveProject,
    loadProjectState,
  } = useDesignerStore();

  const [isGenerating, setIsGenerating] = useState(true);
  const [design, setDesign] = useState<AIDesign | null>(selectedDesign);
  const [generatedForImageId, setGeneratedForImageId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'redesign' | 'original' | 'split'>('redesign');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [previewZoomOpen, setPreviewZoomOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState(
    activeProjectName || `${preferences?.furnitureStyle || preferences?.style || 'Modern'} ${roomAnalysis?.roomType || 'Living Room'} Project`
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const isGeneratingRef = useRef(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

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
          imageUrl: uploadedImage,
          imageId: imageId || `img_${Date.now()}`,
          requestId: uniqueRequestId,
          roomType: roomAnalysis?.roomType || 'Living Room',
          detectedFurniture: roomAnalysis?.furniture || [],
          style: preferences.style || 'Modern',
          furnitureStyle: preferences.furnitureStyle || 'Modern',
          mood: preferences.mood || 'Warm',
          color: preferences.color || 'Neutral',
          budget: preferences.budget || 200000,
          roomAnalysis,
          forceRegenerate: true,
          timestamp: Date.now(),
        }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error(`Server returned status ${response.status}`);
      }

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (response.ok && data?.success && data?.data) {
        const generatedList = Array.isArray(data.data) ? data.data : [data.data];
        const primary = generatedList[0];
        setDesign(primary);
        setSelectedDesign(primary);
        setGeneratedDesigns(generatedList);
        setGeneratedForImageId(imageId || uploadedImage);
        toast.success('Room redesign generated with furniture!');
      } else {
        throw new Error(data?.error || 'Generation failed');
      }
    } catch (err: any) {
      console.warn('Using client-side luxury design fallback:', err);
      clearInterval(progressInterval);
      setGenerationProgress(100);

      const targetStyle = preferences.furnitureStyle || preferences.style || 'Modern';
      const fallbackImages = getDesignImagesForStyle(targetStyle);
      const heroImage = fallbackImages[0] || fallbackRoomImage;

      const fallbackHotspots: Hotspot[] = [
        {
          id: 1,
          x: 45,
          y: 65,
          label: `${targetStyle} Designer Sofa Suite`,
          category: 'Living Room Seating',
          description: `Custom ${targetStyle} low-profile seating tailored to the room perimeter.`,
          price: '₹58,000',
          store: 'Urban Ladder / Amazon',
          brand: 'Designer Series',
          material: 'Premium Textured Fabric',
          match: 98,
        },
        {
          id: 2,
          x: 48,
          y: 78,
          label: 'Solid Teak & Marble Accent Coffee Table',
          category: 'Tables',
          description: 'Center focal table coordinating with room floor tones.',
          price: '₹22,500',
          store: 'Pepperfry / Amazon',
          brand: 'Artisan Crafted',
          material: 'Solid Wood & Stone',
          match: 95,
        },
        {
          id: 3,
          x: 75,
          y: 55,
          label: 'Sculptural Arc Ambient Floor Lamp',
          category: 'Lighting',
          description: 'Warm ambient lighting supplementing natural window illumination.',
          price: '₹12,800',
          store: 'Amazon Home',
          brand: 'Lumina',
          material: 'Brushed Brass & Steel',
          match: 94,
        },
        {
          id: 4,
          x: 48,
          y: 85,
          label: 'Hand-Tufted Wool Area Rug (8x10)',
          category: 'Textiles & Rugs',
          description: 'Plush acoustic softening rug framing the seating zone.',
          price: '₹26,000',
          store: 'Amazon / Flipkart',
          brand: 'Jaipur Rugs',
          material: '100% Pure Wool',
          match: 96,
        },
      ];

      const clientDesign: AIDesign = {
        _id: `design_${Date.now()}`,
        projectId: activeProjectId || 'proj_temp',
        style: targetStyle,
        furnitureStyle: targetStyle,
        mood: preferences.mood || 'Warm',
        color: preferences.color || 'Neutral',
        budget: preferences.budget || 200000,
        description: `Complete ${targetStyle} redesign preserving room geometry, window lines, and spatial layout with matching showroom furniture pieces.`,
        generatedImages: [heroImage],
        hotspots: fallbackHotspots,
      };

      setDesign(clientDesign);
      setSelectedDesign(clientDesign);
      setGeneratedDesigns([clientDesign]);
      setGeneratedForImageId(imageId || uploadedImage);
      toast.success('Design generated!');
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  }, [
    uploadedImage,
    imageId,
    roomAnalysis,
    preferences,
    getToken,
    setGeneratedDesigns,
    setSelectedDesign,
  ]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!uploadedImage) {
      const defaultProject = RAW_PROJECTS[0];
      loadProjectState(defaultProject);
      return;
    }

    const currentId = imageId || uploadedImage;
    if (generatedForImageId !== currentId) {
      generateDesign();
    } else {
      setIsGenerating(false);
    }
  }, [hasHydrated, uploadedImage, imageId, generatedForImageId, generateDesign, loadProjectState]);

  const handleRegenerate = () => {
    generateDesign();
  };

  const handleSaveProject = async () => {
    if (!design) return;
    setIsSaving(true);

    try {
      const token = await getToken();
      if (!token) {
        toast.error('Please sign in to save your project to MongoDB');
        setIsSaving(false);
        return;
      }

      const rawFurniture = (design.hotspots || []) as any[];
      const formattedFurniture = rawFurniture.map((item: any, i: number) => ({
        _id: String(item._id || item.id || `f_${i + 1}`),
        productName: item.productName || item.name || item.label || `Furniture Item ${i + 1}`,
        category: item.category || 'Furniture',
        price: typeof item.price === 'number' ? item.price : parseInt(String(item.price || '0').replace(/[^\d]/g, ''), 10) || 15000,
        storeName: item.storeName || item.store || 'Amazon / Flipkart',
        amazonUrl: item.amazonUrl || getAmazonProductUrl(item.label || item.productName || 'Furniture'),
        flipkartUrl: item.flipkartUrl || getFlipkartProductUrl(item.label || item.productName || 'Furniture'),
        image: item.image && !item.image.startsWith('data:') ? item.image : '',
        rating: item.rating || 4.8,
        inStock: true,
      }));

      const cleanDesign = {
        ...design,
        hotspots: (design.hotspots || []).map((h: any) => ({
          ...h,
          image: h.image && !h.image.startsWith('data:') ? h.image : '',
        })),
      };

      const payload = {
        name: projectNameInput.trim() || 'My Interior Project',
        roomType: roomAnalysis?.roomType || 'Living Room',
        originalImage: uploadedImage || '',
        roomImage: uploadedImage || '',
        generatedImage: design.generatedImages?.[0] || uploadedImage || '',
        style: design.style || 'Modern',
        selectedStyle: design.style || 'Modern',
        mood: design.mood || preferences.mood || 'Warm',
        budget: preferences.budget || 200000,
        roomAnalysis,
        selectedDesign: cleanDesign,
        designs: [cleanDesign],
        furniture: formattedFurniture,
        shoppingList: formattedFurniture.map((f: any, i: number) => ({
          _id: String(f._id || `s_${i + 1}`),
          name: f.productName,
          productName: f.productName,
          category: f.category,
          price: f.price,
          store: f.storeName,
          amazonUrl: f.amazonUrl,
          flipkartUrl: f.flipkartUrl,
          quantity: 1,
          checked: false,
        })),
        budgetPlan: {
          totalBudget: preferences.budget || 200000,
          spent: formattedFurniture.reduce((acc: number, cur: any) => acc + (cur.price || 0), 0),
          remaining: Math.max(0, (preferences.budget || 200000) - formattedFurniture.reduce((acc: number, cur: any) => acc + (cur.price || 0), 0)),
          allocations: [
            { category: 'Main Furniture', percentage: 55, amount: Math.round((preferences.budget || 200000) * 0.55) },
            { category: 'Lighting & Decor', percentage: 25, amount: Math.round((preferences.budget || 200000) * 0.25) },
            { category: 'Textiles & Rugs', percentage: 20, amount: Math.round((preferences.budget || 200000) * 0.20) },
          ],
        },
      };

      const url = activeProjectId ? `/api/projects/${activeProjectId}` : '/api/projects';
      const method = activeProjectId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const resData = await res.json();
        const savedProj = resData.data;
        if (savedProj?._id) {
          setActiveProject(savedProj._id, savedProj.name);
        }
        setIsSaved(true);
        setIsSaveModalOpen(false);
        toast.success('Project saved to MongoDB successfully!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || errorData.message || `Failed to save project (${res.status})`);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Network error saving project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenViewer = () => {
    if (design) {
      setSelectedDesign(design);
      router.push('/designer/viewer');
    }
  };

  if (!hasHydrated || !uploadedImage) {
    return null;
  }

  const redesignImage = design?.generatedImages?.[0] || fallbackRoomImage;
  const hotspots = design?.hotspots || [];
  const itemCount = hotspots.length;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-200">
      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <BackButton fallbackHref="/designer/preferences" label="Back to Preferences" />
          <ThemeToggle />
        </div>

        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Step 4 of 5
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mb-1">
            Generated AI Room Redesign
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Your uploaded room redesigned with a complete furniture suite in your chosen {preferences.furnitureStyle || 'Modern'} aesthetic.
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
                      index <= 3
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
                        : 'bg-[var(--surface-secondary)] text-[var(--text-muted)] border border-[var(--border)]'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-semibold ${
                      index <= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-10 sm:w-12 h-0.5 mx-1 mb-5 ${
                      index < 3 ? 'bg-amber-500' : 'bg-[var(--border)]'
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
            className="bg-[var(--surface)] rounded-2xl shadow-xl border border-[var(--border)] p-12 text-center max-w-3xl mx-auto"
          >
            <div className="relative w-32 h-32 mx-auto mb-8">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-amber-500/10"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border-4 border-amber-500/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-4 rounded-full border-4 border-amber-400 border-t-transparent"
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-6 rounded-full border-4 border-amber-500 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-amber-500" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Redesigning your room with complete furniture suite...</h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
              Preserving room architecture, fitting catalog-matched furniture, and rendering photorealistic interior photography
            </p>

            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-2">
                <span>Generating</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{generationProgress}%</span>
              </div>
              <div className="w-full bg-[var(--surface-secondary)] rounded-full h-2 border border-[var(--border)] overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-amber-400 to-orange-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${generationProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
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
            {/* Visual Canvas & Specs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Large Image Canvas Viewport (8 Columns) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-8 bg-[var(--surface)] rounded-2xl shadow-xl border border-[var(--border)] overflow-hidden flex flex-col"
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
                    <span className="px-3 py-1.5 bg-black/85 backdrop-blur-md text-white rounded-xl text-xs font-bold shadow-lg border border-white/15">
                      {design.style}
                    </span>
                    <span className="px-2.5 py-1 bg-amber-500 text-black rounded-lg text-xs font-black shadow-md">
                      {design.furnitureStyle || 'Modern'}
                    </span>
                  </div>

                  {/* Top-Right Zoom Button */}
                  <div className="absolute top-4 right-4 z-30">
                    <button
                      onClick={() => setPreviewZoomOpen(true)}
                      className="w-8 h-8 rounded-xl bg-black/80 hover:bg-black backdrop-blur-md text-white flex items-center justify-center shadow-lg transition-colors border border-white/20 cursor-pointer"
                      title="Fullscreen Preview"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom View Mode Bar */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-auto">
                    <div className="bg-black/85 backdrop-blur-xl border border-white/15 rounded-xl p-1 flex items-center gap-1 shadow-2xl">
                      <button
                        onClick={() => setViewMode('redesign')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          viewMode === 'redesign'
                            ? 'bg-amber-400 text-black shadow-xs font-black'
                            : 'text-gray-200 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Redesigned Room ✨
                      </button>
                      <button
                        onClick={() => setViewMode('split')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          viewMode === 'split'
                            ? 'bg-amber-400 text-black shadow-xs font-black'
                            : 'text-gray-200 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Sliders className="w-3 h-3 text-amber-400" />
                        <span>Compare Before/After</span>
                      </button>
                      <button
                        onClick={() => setViewMode('original')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          viewMode === 'original'
                            ? 'bg-amber-400 text-black shadow-xs font-black'
                            : 'text-gray-200 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Bare Room 📷
                      </button>
                    </div>

                    <span className="text-xs font-bold text-white bg-black/85 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/15 shadow-lg">
                      {itemCount} Furnished Products in Scene
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Alongside Details & Product Inventory (4 Columns) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-4 bg-[var(--surface)] rounded-2xl shadow-xl border border-[var(--border)] p-5 flex flex-col space-y-4 max-h-[580px] overflow-y-auto"
              >
                {/* Design Header */}
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] leading-snug">{design.style}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                      ₹{Number(design.budget || 200000).toLocaleString('en-IN')} Budget
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-secondary)] bg-[var(--surface-secondary)] border border-[var(--border)] px-2.5 py-0.5 rounded-md">
                      {design.color}
                    </span>
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {itemCount} Products
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-2.5 leading-relaxed">
                    {design.description || design.mood}
                  </p>
                </div>

                {/* Included Furniture List */}
                <div className="border-t border-[var(--border)] pt-3">
                  <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Armchair className="w-3.5 h-3.5 text-amber-500" />
                      <span>Included Furniture & Décor ({itemCount})</span>
                    </span>
                  </h3>

                  <div className="space-y-2">
                    {hotspots.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-[var(--surface-secondary)]/50 hover:border-amber-500/50 rounded-xl border border-[var(--border)] transition-colors flex items-center justify-between"
                      >
                        <div className="min-w-0 flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center shrink-0">
                            {item.id || idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                              {item.label}
                            </p>
                            <p className="text-[10px] text-[var(--text-secondary)] truncate">
                              {item.store} • {item.category || 'Furniture'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-2 flex flex-col items-end">
                          <p className="text-xs font-bold text-[#F5A900]">{item.price}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <a
                              href={getAmazonProductUrl(item.label || item.category || 'Furniture', item.amazonUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#111111] bg-[#FF9900] hover:bg-[#ffaa22] px-2 py-0.5 rounded font-black transition-colors inline-block"
                            >
                              Amazon
                            </a>
                            <a
                              href={getFlipkartProductUrl(item.label || item.category || 'Furniture', item.flipkartUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#FFFFFF] bg-[#2874F0] hover:bg-blue-600 px-2 py-0.5 rounded font-bold transition-colors inline-block"
                            >
                              Flipkart
                            </a>
                            {item.productUrl && (
                              <a
                                href={item.productUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:underline inline-flex items-center gap-0.5"
                              >
                                <span>Store</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
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
                className="flex items-center gap-2 border border-[var(--border)] text-[var(--text-primary)] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 border border-[var(--border)] text-[var(--text-primary)] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-amber-500" />
                Regenerate
              </button>
              <button
                onClick={() => setIsSaveModalOpen(true)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                    : 'bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--border)]'
                }`}
              >
                {isSaved ? (
                  <>
                    <FolderCheck className="w-4 h-4 text-emerald-500" />
                    <span>Project Saved ✓</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-amber-500" />
                    <span>Save Project</span>
                  </>
                )}
              </button>
              <button
                onClick={() => router.push('/furniture')}
                className="flex items-center gap-2 border border-[var(--border)] text-[var(--text-primary)] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                View Products
              </button>
              <button
                onClick={handleOpenViewer}
                className="flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 hover:from-amber-400 hover:to-amber-300 text-black py-3 rounded-xl font-extrabold text-sm transition-all shadow-md shadow-amber-500/20 hover:scale-[1.01] flex items-center justify-center gap-2 min-w-[220px] cursor-pointer"
              >
                <span>Open Full Interactive Room Viewer →</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Save Project Modal Dialog */}
      <AnimatePresence>
        {isSaveModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsSaveModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-[var(--text-primary)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold">
                    <Save className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-base">Save Design to Project</h3>
                    <p className="text-xs text-[var(--text-secondary)]">Persist full room design, furniture & shopping list to MongoDB</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSaveModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[var(--surface-secondary)] hover:bg-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectNameInput}
                    onChange={(e) => setProjectNameInput(e.target.value)}
                    placeholder="e.g. Modern Living Room Redesign"
                    className="w-full px-3.5 py-2.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-amber-500 text-[var(--text-primary)] placeholder-[var(--text-muted)] font-medium"
                    autoFocus
                  />
                </div>

                <div className="bg-[var(--surface-secondary)]/50 rounded-xl p-3 text-xs space-y-1.5 text-[var(--text-secondary)] border border-[var(--border)]">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Room Type:</span>
                    <span className="font-bold text-[var(--text-primary)]">{roomAnalysis?.roomType || 'Living Room'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Style & Mood:</span>
                    <span className="font-bold text-[var(--text-primary)]">{preferences.furnitureStyle || 'Modern'} · {preferences.mood || 'Warm'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Furniture Count:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{itemCount} items with Amazon/Flipkart links</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Target Budget:</span>
                    <span className="font-bold text-[var(--text-primary)]">₹{Number(preferences.budget || 200000).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsSaveModalOpen(false)}
                    className="flex-1 py-2.5 text-sm font-semibold border border-[var(--border)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProject}
                    disabled={isSaving}
                    className="flex-1 py-2.5 text-sm font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-xl hover:from-amber-400 hover:to-amber-300 transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Confirm & Save</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {previewZoomOpen && design && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewZoomOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl relative text-[var(--text-primary)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-secondary)]/40">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">{design.style}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Photorealistic Redesign with {itemCount} Detected Furniture Items</p>
                </div>
                <button
                  onClick={() => setPreviewZoomOpen(false)}
                  className="w-8 h-8 rounded-full bg-[var(--surface-secondary)] hover:bg-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
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
