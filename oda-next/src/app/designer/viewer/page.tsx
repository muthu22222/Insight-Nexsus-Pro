'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  X,
  ShoppingCart,
  Heart,
  Save,
  ExternalLink,
  Star,
  Sliders,
  Image as ImageIcon,
  CheckCircle,
  Armchair,
  AlertTriangle,
  Package,
  Download,
  Send,
  Plus,
  FolderCheck,
  Loader2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useDesignerStore } from '@/store/useDesignerStore';
import { useAuth } from '@/contexts/AuthContext';
import FurnishedRoomView, { HotspotItem } from '@/components/designer/FurnishedRoomView';
import { getDesignImagesForStyle } from '@/lib/design-assets';
import BackButton from '@/components/common/BackButton';
import { getAmazonProductUrl, getFlipkartProductUrl } from '@/lib/store-links';

export default function ViewerPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const {
    activeProjectId,
    activeProjectName,
    uploadedImage,
    selectedDesign,
    preferences,
    roomAnalysis,
    setActiveProject,
  } = useDesignerStore();
  const [activeHotspot, setActiveHotspot] = useState<HotspotItem | null>(null);
  const [savedItems, setSavedItems] = useState<(string | number)[]>([]);
  const [viewMode, setViewMode] = useState<'redesign' | 'original' | 'split'>('redesign');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [promptText, setPromptText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const baseRoomImage = uploadedImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&auto=format&fit=crop&q=85';
  const fallbackFurnished = getDesignImagesForStyle(selectedDesign?.style || selectedDesign?.furnitureStyle || 'Modern', undefined, Date.now())[0];
  const redesignImage = (selectedDesign?.generatedImages?.[0] && selectedDesign.generatedImages[0] !== uploadedImage && (selectedDesign.generatedImages[0].startsWith('http') || selectedDesign.generatedImages[0].startsWith('/')))
    ? selectedDesign.generatedImages[0]
    : fallbackFurnished;

  useEffect(() => {
    if (!uploadedImage && !selectedDesign) {
      router.push('/designer');
    }
  }, [uploadedImage, selectedDesign, router]);

  const activeHotspots: HotspotItem[] = (selectedDesign?.hotspots && selectedDesign.hotspots.length > 0)
    ? selectedDesign.hotspots.map((h: any, idx: number) => ({
        id: h.id !== undefined && h.id !== null ? h.id : (idx + 1),
        x: typeof h.x === 'number' ? h.x : 50,
        y: typeof h.y === 'number' ? h.y : 50,
        label: h.label || `Product ${idx + 1}`,
        price: typeof h.price === 'string' ? h.price : `₹${Math.round(Number(h.price || 15000)).toLocaleString('en-IN')}`,
        match: typeof h.match === 'number' ? h.match : 96,
        store: h.store || 'Urban Ladder',
        brand: h.brand || 'Retail Brand',
        productUrl: h.productUrl || 'https://www.urbanladder.com',
        amazonUrl: h.amazonUrl || null,
        flipkartUrl: h.flipkartUrl || null,
        material: h.material || 'Premium Finish',
        description: h.description || 'Configured to fit the exact floor and walls of your room.',
      }))
    : [];

  const currentItem = activeHotspot || activeHotspots[0] || null;

  const handleHotspotClick = (hotspot: HotspotItem) => {
    setActiveHotspot(hotspot);
    setIsSidebarOpen(true);
    const el = itemRefs.current[String(hotspot.id)];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || viewMode !== 'split' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (viewMode !== 'split' || !containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleSaveItem = (id: string | number) => {
    if (savedItems.includes(id)) {
      setSavedItems(savedItems.filter((i) => i !== id));
      toast('Item removed from favorites', { icon: '🗑️' });
    } else {
      setSavedItems([...savedItems, id]);
      toast.success('Saved to project favorites!');
    }
  };

  const handleAddAllToCart = () => {
    toast.success(`Added all ${activeHotspots.length} products to project shopping list!`);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    toast.success(`Applying instruction: "${promptText}"`);
    setPromptText('');
  };

  const handleExport = () => {
    const link = document.createElement('a');
    link.href = redesignImage;
    link.download = `Insight_Nexsus_${selectedDesign?.style || 'Room'}_Design.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exporting high-resolution design render!');
  };

  const handleSaveProject = async () => {
    if (!selectedDesign) return;
    setIsSaving(true);

    try {
      const token = await getToken();
      if (!token) {
        toast.error('Please sign in to save your project');
        setIsSaving(false);
        return;
      }

      const formattedFurniture = activeHotspots.map((item, i) => {
        const numPrice = typeof item.price === 'number'
          ? item.price
          : parseInt(String(item.price || '0').replace(/[^\d]/g, ''), 10) || 15000;

        return {
          _id: String(item.id || `f_${i + 1}`),
          name: item.label || `Furniture Item ${i + 1}`,
          productName: item.label,
          category: item.category || 'Furniture',
          price: numPrice,
          storeName: item.store || 'Amazon / Flipkart',
          amazonUrl: item.amazonUrl || getAmazonProductUrl(item.label),
          flipkartUrl: item.flipkartUrl || getFlipkartProductUrl(item.label),
          image: item.image && !item.image.startsWith('data:') ? item.image : '',
          rating: 4.8,
          inStock: true,
        };
      });

      // Clean design hotspots to prevent huge duplicated base64 payload
      const cleanSelectedDesign = {
        ...selectedDesign,
        hotspots: (selectedDesign.hotspots || []).map((h: any) => ({
          ...h,
          image: h.image && !h.image.startsWith('data:') ? h.image : '',
        })),
      };

      const targetBudget = Number(preferences?.budget || selectedDesign.budget || 200000);
      const spentTotal = formattedFurniture.reduce((acc, cur) => acc + (cur.price || 0), 0);

      const payload = {
        name: activeProjectName || `${selectedDesign.style || 'Modern'} Room Redesign`,
        roomType: roomAnalysis?.roomType || 'Living Room',
        originalImage: uploadedImage || '',
        roomImage: uploadedImage || '',
        generatedImage: redesignImage || '',
        style: selectedDesign.style || 'Modern',
        selectedStyle: selectedDesign.style || 'Modern',
        mood: selectedDesign.mood || preferences.mood || 'Warm',
        budget: targetBudget,
        roomAnalysis,
        selectedDesign: cleanSelectedDesign,
        designs: [cleanSelectedDesign],
        furniture: formattedFurniture,
        shoppingList: formattedFurniture.map((f, i) => ({
          _id: String(`s_${i + 1}`),
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
          totalBudget: targetBudget,
          spent: spentTotal,
          remaining: Math.max(0, targetBudget - spentTotal),
          allocations: [
            { category: 'Main Furniture', percentage: 55, amount: Math.round(targetBudget * 0.55) },
            { category: 'Lighting & Decor', percentage: 25, amount: Math.round(targetBudget * 0.25) },
            { category: 'Textiles & Rugs', percentage: 20, amount: Math.round(targetBudget * 0.20) },
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
        toast.success('Project saved to MongoDB successfully!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || `Failed to save project (${res.status})`);
      }
    } catch (e: any) {
      toast.error(e?.message || 'Network error saving project');
    } finally {
      setIsSaving(false);
    }
  };

  const totalCalculatedBudget = activeHotspots.reduce((acc, h) => {
    const p = typeof h.price === 'number'
      ? h.price
      : parseInt(String(h.price || '0').replace(/[^\d]/g, ''), 10) || 0;
    return acc + p;
  }, 0);

  const userTargetBudget = Number(preferences?.budget || selectedDesign?.budget || 200000);
  const budgetDifference = totalCalculatedBudget - userTargetBudget;
  const isOverBudget = budgetDifference > 0;

  const styleLower = (selectedDesign?.style || '').toLowerCase();
  const variantIndex = styleLower.includes('lux') ? 2 : styleLower.includes('minimal') || styleLower.includes('japan') || styleLower.includes('scandi') ? 1 : 0;

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden relative select-none">
      <Toaster position="top-center" />

      {/* MAIN FULL-CANVAS ROOM VIEWPORT */}
      <div className="flex-1 flex overflow-hidden relative w-full h-full">
        {/* ROOM VIEWER AREA */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onMouseDown={() => { isDraggingRef.current = true; }}
          onMouseUp={() => { isDraggingRef.current = false; }}
          onMouseLeave={() => { isDraggingRef.current = false; }}
          className="flex-1 h-full relative flex items-center justify-center bg-black overflow-hidden"
        >
          <FurnishedRoomView
            roomImage={baseRoomImage}
            redesignImage={redesignImage}
            variantIndex={variantIndex}
            styleName={selectedDesign?.style || 'Modern'}
            hotspots={activeHotspots}
            viewMode={viewMode}
            sliderPosition={sliderPosition}
            activeHotspotId={currentItem?.id}
            onHotspotClick={handleHotspotClick}
            isInteractive={true}
            className="w-full h-full"
          />

          {/* FLOATING TOP-LEFT CONTROL PILL */}
          <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
            <BackButton fallbackHref="/designer/generate" label="Back to Generate" variant="floating" />
            <div className="bg-black/85 backdrop-blur-xl border border-white/15 rounded-2xl px-2.5 py-1.5 flex items-center gap-2 shadow-2xl text-white">
              <button
                onClick={handleSaveProject}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isSaved ? (
                  <FolderCheck className="w-3.5 h-3.5 text-black" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-black" />
                )}
                <span>{isSaved ? 'Saved in MongoDB' : 'Save Project'}</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-white/15 rounded-xl text-xs font-semibold text-gray-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export HD</span>
              </button>
            </div>
            <div className="bg-black/85 backdrop-blur-xl border border-white/15 rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-2xl text-white text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{selectedDesign?.style || 'Photorealistic Design'}</span>
            </div>
          </div>

          {/* FLOATING TOP-RIGHT TOGGLE SIDEBAR BUTTON */}
          <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="bg-black/85 backdrop-blur-xl border border-white/15 rounded-2xl px-3.5 py-1.5 flex items-center gap-2 shadow-2xl text-white text-xs font-bold hover:bg-black transition-all cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSidebarOpen ? 'Hide Products' : `View Products (${activeHotspots.length})`}</span>
            </button>
          </div>

          {/* FLOATING BOTTOM-LEFT: SHOPPING CART PILL */}
          <div className="absolute bottom-5 left-5 z-40 flex items-center gap-2">
            <div className="bg-black/85 backdrop-blur-xl border border-white/20 rounded-2xl px-3.5 py-2 flex items-center gap-3 shadow-2xl text-white">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">Shopping cart ({activeHotspots.length})</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <button
                onClick={handleAddAllToCart}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 rounded-xl text-xs font-extrabold text-black transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add all</span>
              </button>
            </div>
          </div>

          {/* FLOATING BOTTOM-CENTER: PROMPT BAR */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 hidden sm:block w-full max-w-md">
            <form
              onSubmit={handlePromptSubmit}
              className="bg-black/85 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-2xl"
            >
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Describe changes to the room design..."
                className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 outline-none"
              />
              <button
                type="submit"
                className="p-1.5 hover:bg-white/15 rounded-xl text-white transition-colors"
                title="Send instruction"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </form>
          </div>

          {/* FLOATING BOTTOM-RIGHT: COMPARE IMAGES PILL */}
          <div className="absolute bottom-5 right-5 z-40 flex items-center gap-2">
            <div className="bg-black/85 backdrop-blur-xl border border-white/20 rounded-2xl p-1.5 flex items-center gap-1 shadow-2xl text-white">
              <button
                onClick={() => setViewMode(viewMode === 'split' ? 'redesign' : 'split')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'split'
                    ? 'bg-amber-400 text-black shadow font-extrabold'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Compare Images</span>
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'original' ? 'redesign' : 'original')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'original'
                    ? 'bg-amber-400 text-black shadow font-extrabold'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                title="Toggle Bare Room"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>
          </div>
        </div>

        {/* EXPANDABLE PRODUCT SPECIFICATIONS & CATALOG DRAWER */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="w-80 sm:w-96 bg-[#0c0c0e] border-l border-white/10 flex flex-col h-full shadow-2xl z-50 shrink-0 text-white"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/50 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-black shadow-xs">
                    {currentItem?.id || 1}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-white leading-tight">
                      {currentItem?.label || 'Selected Product'}
                    </h3>
                    <p className="text-[10px] text-gray-400">{currentItem?.category || 'Furniture'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                    {currentItem?.price}
                  </span>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Budget Alert Banner */}
              <div className="px-4 py-2 border-b border-white/10 bg-black/30 flex items-center justify-between text-xs shrink-0">
                <span className="text-gray-400 text-[11px]">Budget: <strong className="text-white">₹{userTargetBudget.toLocaleString('en-IN')}</strong></span>
                {isOverBudget ? (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    ₹{budgetDifference.toLocaleString('en-IN')} OVER
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    ₹{Math.abs(budgetDifference).toLocaleString('en-IN')} REMAINING
                  </span>
                )}
              </div>

              {/* Scrollable Content */}
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                {/* Active Product Card */}
                {currentItem && (
                  <div className="space-y-3 bg-[#121215] p-3.5 rounded-2xl border border-white/10 shadow-xl">
                    <div>
                      <h2 className="text-sm font-bold text-white leading-snug">{currentItem.label}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-gray-300 bg-black/60 px-2 py-0.5 rounded border border-white/10 shadow-2xs">
                          {currentItem.store}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-700'
                              }`}
                            />
                          ))}
                          <span className="text-[10px] text-gray-400 font-bold ml-0.5">4.8</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/50 p-3 rounded-xl border border-white/10">
                      <h4 className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Placement & Location</h4>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {currentItem.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-black/50 p-2.5 rounded-xl border border-white/10">
                        <p className="text-[10px] text-gray-400 font-semibold">Estimated Price</p>
                        <p className="text-xs font-black text-amber-400 mt-0.5">{currentItem.price}</p>
                      </div>
                      <div className="bg-black/50 p-2.5 rounded-xl border border-white/10">
                        <p className="text-[10px] text-gray-400 font-semibold">Style Match</p>
                        <p className="text-xs font-bold text-emerald-400 mt-0.5">{currentItem.match || 96}% Match</p>
                      </div>
                    </div>

                    {/* Purchase & Store Buttons */}
                    <div className="space-y-2 pt-1">
                      <a
                        href={getAmazonProductUrl(currentItem.label || 'Furniture', currentItem.amazonUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-amber-500 hover:bg-amber-400 text-black py-2.5 rounded-xl text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <span>Buy on Amazon</span>
                        <span className="text-xs">→</span>
                      </a>

                      <a
                        href={getFlipkartProductUrl(currentItem.label || 'Furniture', currentItem.flipkartUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <span>Buy on Flipkart</span>
                        <span className="text-xs">→</span>
                      </a>

                      {currentItem.productUrl && currentItem.productUrl.startsWith('http') && (
                        <a
                          href={currentItem.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-white/5 hover:bg-white/10 border border-white/15 text-white py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                          <span>View on {currentItem.store || 'Store'}</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleSaveItem(currentItem.id)}
                        className={`w-full border py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          savedItems.includes(currentItem.id)
                            ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                            : 'border-white/10 text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            savedItems.includes(currentItem.id) ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                        />
                        {savedItems.includes(currentItem.id) ? 'Saved in Project' : 'Save to Favorites'}
                      </button>
                    </div>
                  </div>
                )}

                {/* All Furniture List */}
                <div className="border-t border-white/10 pt-3">
                  <h4 className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2 flex items-center gap-1.5">
                    <Armchair className="w-3.5 h-3.5 text-amber-400" />
                    <span>All Furniture In Room ({activeHotspots.length})</span>
                  </h4>

                  <div className="space-y-1.5">
                    {activeHotspots.map((item) => {
                      const isSelected = currentItem && String(item.id) === String(currentItem.id);
                      return (
                        <button
                          key={String(item.id)}
                          ref={(el) => {
                            itemRefs.current[String(item.id)] = el;
                          }}
                          onClick={() => handleHotspotClick(item)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400/30'
                              : 'border-white/10 hover:border-amber-500/30 bg-black/40'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-amber-500 text-black'
                                  : 'bg-white/10 text-gray-300'
                              }`}
                            >
                              {item.id}
                            </span>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold truncate ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                                {item.label}
                              </p>
                              <p className="text-[10px] text-gray-400">{item.store}</p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-amber-400 shrink-0 ml-2">{item.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
