'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  X,
  ShoppingCart,
  Heart,
  DollarSign,
  ListChecks,
  MapPin,
  Save,
  ExternalLink,
  Star,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  CheckCircle,
  Armchair,
  AlertTriangle,
  Package,
  Download,
  Send,
  Plus,
  Maximize2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useDesignerStore } from '@/store/useDesignerStore';
import FurnishedRoomView, { HotspotItem } from '@/components/designer/FurnishedRoomView';

export default function ViewerPage() {
  const router = useRouter();
  const { uploadedImage, selectedDesign, preferences } = useDesignerStore();
  const [activeHotspot, setActiveHotspot] = useState<HotspotItem | null>(null);
  const [savedItems, setSavedItems] = useState<(string | number)[]>([]);
  const [viewMode, setViewMode] = useState<'redesign' | 'original' | 'split'>('redesign');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [promptText, setPromptText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const baseRoomImage = uploadedImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&auto=format&fit=crop&q=85';
  const redesignImage = selectedDesign?.generatedImages?.[0] || baseRoomImage;

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

  const handleSaveItem = (id: string | number) => {
    setSavedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    toast.success('Item added to saved project');
  };

  const handleAddAllToCart = () => {
    setSavedItems(activeHotspots.map((h) => h.id));
    toast.success(`All ${activeHotspots.length} products added to your project cart!`);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    toast.success(`Refining room concept: "${promptText}"`);
    setPromptText('');
  };

  const handleExport = () => {
    toast.success('High-resolution design exported!');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition(Math.round((x / rect.width) * 100));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    setSliderPosition(Math.round((x / rect.width) * 100));
  };

  const totalCalculatedBudget = activeHotspots.reduce((sum, h) => {
    const numeric = parseInt(String(h.price).replace(/[^\d]/g, ''), 10) || 0;
    return sum + numeric;
  }, 0) || Number(selectedDesign?.budget || preferences?.budget || 200000);

  const userTargetBudget = Number(preferences?.budget || selectedDesign?.budget || 200000);
  const budgetDifference = totalCalculatedBudget - userTargetBudget;
  const isOverBudget = budgetDifference > 0;

  const styleLower = (selectedDesign?.style || '').toLowerCase();
  const variantIndex = styleLower.includes('lux') ? 2 : styleLower.includes('minimal') || styleLower.includes('japan') || styleLower.includes('scandi') ? 1 : 0;

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden relative select-none">
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

          {/* FLOATING TOP-LEFT CONTROL PILL (Reference UI) */}
          <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
            <div className="bg-black/75 backdrop-blur-xl border border-white/15 rounded-2xl px-2.5 py-1.5 flex items-center gap-2 shadow-2xl text-white">
              <button
                onClick={() => router.push('/designer/generate')}
                className="p-1.5 hover:bg-white/15 rounded-xl transition-colors text-white/90"
                title="Back to Design"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-white/20" />
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-white/15 rounded-xl text-xs font-semibold text-white/90 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>

            <div className="bg-black/75 backdrop-blur-xl border border-white/15 rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-2xl text-white text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{selectedDesign?.style || 'Photorealistic Design'}</span>
            </div>
          </div>

          {/* FLOATING TOP-RIGHT TOGGLE SIDEBAR BUTTON */}
          <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="bg-black/75 backdrop-blur-xl border border-white/15 rounded-2xl px-3.5 py-1.5 flex items-center gap-2 shadow-2xl text-white text-xs font-semibold hover:bg-black/90 transition-all cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSidebarOpen ? 'Hide Products' : `View Products (${activeHotspots.length})`}</span>
            </button>
          </div>

          {/* FLOATING BOTTOM-LEFT: SHOPPING CART PILL (Reference UI) */}
          <div className="absolute bottom-5 left-5 z-40 flex items-center gap-2">
            <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl px-3.5 py-2 flex items-center gap-3 shadow-2xl text-white">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">Shopping cart ({activeHotspots.length})</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <button
                onClick={handleAddAllToCart}
                className="flex items-center gap-1 px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add all</span>
              </button>
            </div>
          </div>

          {/* FLOATING BOTTOM-CENTER: PROMPT BAR (Reference UI) */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 hidden sm:block w-full max-w-md">
            <form
              onSubmit={handlePromptSubmit}
              className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-2xl"
            >
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Describe changes to the design..."
                className="flex-1 bg-transparent text-xs text-white placeholder-white/50 outline-none"
              />
              <button
                type="submit"
                className="p-1.5 hover:bg-white/15 rounded-xl text-white/80 transition-colors"
                title="Send instruction"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </form>
          </div>

          {/* FLOATING BOTTOM-RIGHT: COMPARE IMAGES PILL (Reference UI) */}
          <div className="absolute bottom-5 right-5 z-40 flex items-center gap-2">
            <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-1.5 flex items-center gap-1 shadow-2xl text-white">
              <button
                onClick={() => setViewMode(viewMode === 'split' ? 'redesign' : 'split')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'split'
                    ? 'bg-white text-black shadow'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>Compare Images</span>
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'original' ? 'redesign' : 'original')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'original'
                    ? 'bg-white text-black shadow'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
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
              className="w-80 sm:w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-2xl z-50 shrink-0"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-black shadow-xs">
                    {currentItem?.id || 1}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 leading-tight">
                      {currentItem?.label || 'Selected Product'}
                    </h3>
                    <p className="text-[10px] text-gray-500">{currentItem?.category || 'Furniture'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    {currentItem?.price}
                  </span>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Budget Alert Banner */}
              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between text-xs shrink-0">
                <span className="text-gray-500 text-[11px]">Budget: <strong>₹{userTargetBudget.toLocaleString('en-IN')}</strong></span>
                {isOverBudget ? (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    ₹{budgetDifference.toLocaleString('en-IN')} OVER BUDGET
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    ₹{Math.abs(budgetDifference).toLocaleString('en-IN')} REMAINING
                  </span>
                )}
              </div>

              {/* Scrollable Content */}
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                {/* Active Product Card */}
                {currentItem && (
                  <div className="space-y-3 bg-gray-50/60 p-3.5 rounded-2xl border border-gray-200 shadow-xs">
                    <div>
                      <h2 className="text-sm font-bold text-gray-900 leading-snug">{currentItem.label}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                          {currentItem.store}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                              }`}
                            />
                          ))}
                          <span className="text-[10px] text-gray-500 font-bold ml-0.5">4.8</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-200/80">
                      <h4 className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Placement & Location</h4>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {currentItem.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-2.5 rounded-xl border border-gray-200/80">
                        <p className="text-[10px] text-gray-400 font-semibold">Estimated Price</p>
                        <p className="text-xs font-black text-gray-900 mt-0.5">{currentItem.price}</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-gray-200/80">
                        <p className="text-[10px] text-gray-400 font-semibold">Style Match</p>
                        <p className="text-xs font-bold text-emerald-600 mt-0.5">{currentItem.match || 96}% Match</p>
                      </div>
                    </div>

                    {/* Store Button */}
                    <div className="space-y-1.5 pt-1">
                      {currentItem.productUrl && currentItem.productUrl.startsWith('http') ? (
                        <a
                          href={currentItem.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View on {currentItem.store}</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => router.push('/furniture')}
                          className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Find in Furniture Catalog</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleSaveItem(currentItem.id)}
                        className={`w-full border py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                          savedItems.includes(currentItem.id)
                            ? 'border-amber-300 bg-amber-50 text-amber-700'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            savedItems.includes(currentItem.id) ? 'fill-amber-500 text-amber-500' : ''
                          }`}
                        />
                        {savedItems.includes(currentItem.id) ? 'Saved in Project' : 'Save to Favorites'}
                      </button>
                    </div>
                  </div>
                )}

                {/* All Furniture List */}
                <div className="border-t border-gray-100 pt-3">
                  <h4 className="text-[11px] uppercase tracking-wider text-gray-700 font-bold mb-2 flex items-center gap-1.5">
                    <Armchair className="w-3.5 h-3.5 text-amber-600" />
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
                              ? 'border-black bg-black/5 ring-1 ring-black/10'
                              : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-black text-white ring-2 ring-amber-400'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {item.id}
                            </span>
                            <div className="min-w-0">
                              <p className={`text-xs font-semibold truncate ${isSelected ? 'text-black' : 'text-gray-800'}`}>
                                {item.label}
                              </p>
                              <p className="text-[10px] text-gray-500">{item.store}</p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-gray-900 shrink-0 ml-2">{item.price}</span>
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
