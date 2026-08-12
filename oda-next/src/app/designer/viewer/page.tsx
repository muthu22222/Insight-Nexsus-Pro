'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useDesignerStore } from '@/store/useDesignerStore';

const steps = [
  { id: 'upload', label: 'Upload' },
  { id: 'analysis', label: 'Analyze' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'generate', label: 'Generate' },
  { id: 'viewer', label: 'Viewer' },
];

const sampleHotspots = [
  {
    id: 1,
    x: 18,
    y: 35,
    label: 'Contemporary Sofa',
    price: '₹45,000',
    match: 95,
    store: 'Urban Ladder',
    description: '3-seater fabric sofa in charcoal gray',
  },
  {
    id: 2,
    x: 62,
    y: 28,
    label: 'Coffee Table',
    price: '₹12,500',
    match: 88,
    store: 'Pepperfry',
    description: 'Minimalist oak wood coffee table',
  },
  {
    id: 3,
    x: 42,
    y: 68,
    label: 'Area Rug',
    price: '₹8,200',
    match: 92,
    store: 'IKEA',
    description: 'Handwoven jute area rug, 5x7 ft',
  },
  {
    id: 4,
    x: 82,
    y: 55,
    label: 'Floor Lamp',
    price: '₹6,800',
    match: 85,
    store: 'HomeLane',
    description: 'Arc floor lamp with brass finish',
  },
  {
    id: 5,
    x: 30,
    y: 15,
    label: 'Wall Art',
    price: '₹3,500',
    match: 78,
    store: 'Fabindia',
    description: 'Abstract canvas print set of 3',
  },
];

const bottomActions = [
  { id: 'budget', label: 'Budget Planner', icon: DollarSign },
  { id: 'shopping', label: 'Shopping List', icon: ListChecks },
  { id: 'stores', label: 'Find Stores', icon: MapPin },
  { id: 'save', label: 'Save Project', icon: Save },
];

export default function ViewerPage() {
  const router = useRouter();
  const { uploadedImage, selectedDesign, setCurrentStep } = useDesignerStore();
  const [activeHotspot, setActiveHotspot] = useState<typeof sampleHotspots[0] | null>(null);
  const [savedItems, setSavedItems] = useState<number[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!uploadedImage) {
      router.push('/designer');
    }
  }, [uploadedImage]);

  const handleHotspotClick = (hotspot: typeof sampleHotspots[0]) => {
    setActiveHotspot(hotspot);
  };

  const handleClosePanel = () => {
    setActiveHotspot(null);
  };

  const handleSaveItem = (id: number) => {
    setSavedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    toast.success('Item saved to favorites');
  };

  const handleViewProducts = () => {
    router.push('/furniture');
  };

  const handleBottomAction = (actionId: string) => {
    switch (actionId) {
      case 'budget':
        toast.success('Budget planner coming soon!');
        break;
      case 'shopping':
        toast.success('Shopping list created!');
        break;
      case 'stores':
        router.push('/stores');
        break;
      case 'save':
        toast.success('Project saved successfully!');
        break;
    }
  };

  const totalBudget = sampleHotspots.reduce((sum, h) => {
    return sum + parseInt(h.price.replace(/[₹,]/g, ''));
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-center" />

      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/designer/generate')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <div>
              <h1 className="text-sm font-semibold text-gray-900">Design Viewer</h1>
              <p className="text-[11px] text-gray-400">
                {selectedDesign?.style || 'Modern'} • {selectedDesign?.mood || 'Warm'} theme
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px] text-gray-400">Estimated Budget</p>
              <p className="text-sm font-bold text-gray-900">
                ₹{totalBudget.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              <span className="font-medium">{sampleHotspots.length} items</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            {uploadedImage ? (
              <div className="relative w-full h-full">
                <img
                  src={uploadedImage}
                  alt="Designed room"
                  className="w-full h-full object-contain"
                  onLoad={() => setImageLoaded(true)}
                />
                {imageLoaded && (
                  <div className="absolute inset-0">
                    {sampleHotspots.map((hotspot) => (
                      <motion.button
                        key={hotspot.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: hotspot.id * 0.1, type: 'spring' }}
                        onClick={() => handleHotspotClick(hotspot)}
                        className="absolute group"
                        style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                      >
                        <span className="relative flex h-5 w-5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 border-2 border-white shadow-lg items-center justify-center">
                            <span className="text-[8px] font-bold text-white">
                              {hotspot.id}
                            </span>
                          </span>
                        </span>
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="bg-gray-900 text-white text-[10px] font-medium px-2 py-1 rounded whitespace-nowrap shadow-lg">
                            {hotspot.label} • {hotspot.price}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No design image available</p>
                <button
                  onClick={() => router.push('/designer/generate')}
                  className="mt-3 text-sm text-amber-600 font-medium hover:text-amber-700"
                >
                  Generate a design first
                </button>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {activeHotspot && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {activeHotspot.id}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900">{activeHotspot.label}</h3>
                </div>
                <button
                  onClick={handleClosePanel}
                  className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <ShoppingCart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-[11px] text-gray-400">Product Image</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4">{activeHotspot.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Price</span>
                    <span className="text-base font-bold text-gray-900">{activeHotspot.price}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Style Match</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${activeHotspot.match}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-amber-600">
                        {activeHotspot.match}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Store</span>
                    <span className="text-xs font-medium text-gray-700">{activeHotspot.store}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-gray-400 ml-1">4.0</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 space-y-2">
                <button
                  onClick={handleViewProducts}
                  className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Products
                </button>
                <button
                  onClick={() => handleSaveItem(activeHotspot.id)}
                  className={`w-full border py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    savedItems.includes(activeHotspot.id)
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      savedItems.includes(activeHotspot.id) ? 'fill-amber-500 text-amber-500' : ''
                    }`}
                  />
                  {savedItems.includes(activeHotspot.id) ? 'Saved' : 'Save'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white border-t border-gray-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {bottomActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleBottomAction(action.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <action.icon className="w-4 h-4" />
                <span className="font-medium">{action.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              Click hotspots on the image to explore furniture details
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
