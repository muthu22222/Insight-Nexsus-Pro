'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles, Armchair } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useDesignerStore } from '@/store/useDesignerStore';
import BackButton from '@/components/common/BackButton';

const steps = [
  { id: 'upload', label: 'Upload' },
  { id: 'analysis', label: 'Analyze' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'generate', label: 'Generate' },
  { id: 'viewer', label: 'Viewer' },
];

const styles = [
  { id: 'modern', label: 'Modern', icon: '◇', desc: 'Clean lines, minimal decor' },
  { id: 'minimalist', label: 'Minimalist', icon: '○', desc: 'Less is more' },
  { id: 'luxury', label: 'Luxury', icon: '◆', desc: 'Opulent & sophisticated' },
  { id: 'scandinavian', label: 'Scandinavian', icon: '△', desc: 'Functional & cozy' },
  { id: 'industrial', label: 'Industrial', icon: '□', desc: 'Raw & urban' },
  { id: 'traditional', label: 'Traditional', icon: '⬡', desc: 'Classic & timeless' },
  { id: 'contemporary', label: 'Contemporary', icon: '⬠', desc: 'Current trends' },
];

const furnitureStyles = [
  { id: 'modern', label: 'Modern', desc: 'Sleek, low-profile silhouettes, tailored upholstery' },
  { id: 'minimalist', label: 'Minimalist', desc: 'Essential functional pieces, concealed storage' },
  { id: 'scandinavian', label: 'Scandinavian', desc: 'Light oak, curved wood, cozy textured fabrics' },
  { id: 'japandi', label: 'Japandi', desc: 'Low plinth seating, organic ash, wabi-sabi balance' },
  { id: 'industrial', label: 'Industrial', desc: 'Black steel frames, reclaimed wood, distressed leather' },
  { id: 'luxury', label: 'Luxury', desc: 'Deep velvet tufting, Italian travertine, brass trims' },
  { id: 'contemporary', label: 'Contemporary', desc: 'Curved organic shapes, bouclé, sculptural forms' },
  { id: 'traditional', label: 'Traditional', desc: 'Carved solid teak, heritage rolled arms, rich polish' },
  { id: 'mid-century', label: 'Mid-Century Modern', desc: 'Tapered splayed legs, walnut veneers, retro curves' },
  { id: 'bohemian', label: 'Bohemian', desc: 'Rattan, cane weaving, layered textiles, relaxed feel' },
  { id: 'rustic', label: 'Rustic', desc: 'Heavy raw timber, natural stone, wrought iron' },
  { id: 'classic', label: 'Classic', desc: 'Symmetrical arrangements, timeless elegance, fine fabrics' },
];

const moods = [
  { id: 'warm', label: 'Warm & Cozy', color: 'from-orange-900/60 to-amber-800/40', accent: 'bg-amber-500/20 text-amber-300' },
  { id: 'bright', label: 'Bright & Fresh', color: 'from-yellow-900/50 to-emerald-900/40', accent: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'calm', label: 'Calm & Serene', color: 'from-blue-900/60 to-indigo-900/40', accent: 'bg-blue-500/20 text-blue-300' },
  { id: 'elegant', label: 'Elegant & Luxe', color: 'from-purple-900/60 to-pink-900/40', accent: 'bg-purple-500/20 text-purple-300' },
  { id: 'bold', label: 'Bold & Dramatic', color: 'from-red-900/60 to-orange-900/40', accent: 'bg-orange-500/20 text-orange-300' },
  { id: 'natural', label: 'Natural & Organic', color: 'from-emerald-900/60 to-teal-900/40', accent: 'bg-teal-500/20 text-teal-300' },
];

const colors = [
  { id: 'light', label: 'Light Tones', gradient: 'from-gray-300 to-gray-100', ring: 'ring-gray-400' },
  { id: 'dark', label: 'Dark & Moody', gradient: 'from-gray-950 to-gray-800', ring: 'ring-gray-600' },
  { id: 'neutral', label: 'Neutral & Warm', gradient: 'from-amber-100/40 to-stone-300/30', ring: 'ring-amber-400/40' },
  { id: 'warm', label: 'Amber & Terracotta', gradient: 'from-amber-600/60 to-orange-600/40', ring: 'ring-amber-500' },
  { id: 'cool', label: 'Cool Blue & Slate', gradient: 'from-blue-600/60 to-cyan-600/40', ring: 'ring-blue-500' },
  { id: 'ai', label: 'Let AI Harmonize', gradient: 'from-purple-600/60 to-pink-600/40', ring: 'ring-purple-400' },
];

const budgets = [
  { id: 50000, label: '₹50,000', desc: 'Essential decor & accents' },
  { id: 100000, label: '₹1 Lakh', desc: 'Moderate upgrade' },
  { id: 200000, label: '₹2 Lakh', desc: 'Complete room furnishings' },
  { id: 500000, label: '₹5 Lakh', desc: 'Full custom interior makeover' },
  { id: 1000000, label: '₹10 Lakh', desc: 'Luxury designer transformation' },
];

export default function PreferencesPage() {
  const router = useRouter();
  const { uploadedImage, preferences, setPreferences } = useDesignerStore();
  const [currentSection, setCurrentSection] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState(preferences.style || 'modern');
  const [selectedFurnitureStyle, setSelectedFurnitureStyle] = useState(preferences.furnitureStyle || 'modern');
  const [selectedMood, setSelectedMood] = useState(preferences.mood || 'warm');
  const [selectedColor, setSelectedColor] = useState(preferences.color || 'neutral');
  const [selectedBudget, setSelectedBudget] = useState(preferences.budget || 200000);
  const [customBudget, setCustomBudget] = useState('');
  const [isCustomBudget, setIsCustomBudget] = useState(false);

  useEffect(() => {
    if (!uploadedImage) {
      router.push('/designer');
    }
  }, [uploadedImage, router]);

  const sections = ['Style', 'Furniture Style', 'Mood', 'Color', 'Budget'];

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection((prev) => prev - 1);
    }
  };

  const handleGenerate = () => {
    const finalBudget = isCustomBudget
      ? parseInt(customBudget) || selectedBudget
      : selectedBudget;

    setPreferences({
      style: selectedStyle,
      furnitureStyle: selectedFurnitureStyle,
      mood: selectedMood,
      color: selectedColor,
      budget: finalBudget,
    });

    toast.success('Design preferences saved!');
    router.push('/designer/generate');
  };

  if (!uploadedImage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Toaster position="top-center" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <BackButton fallbackHref="/designer/analysis" label="Back to Analysis" />
        </div>

        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Step 3 of 5
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
            Design & Furniture Preferences
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Tailor your aesthetic, catalog furniture suite, and budget targets
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
                      index <= 2
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20'
                        : 'bg-white/10 text-gray-500 border border-white/10'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-semibold ${
                      index <= 2 ? 'text-amber-400' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-10 sm:w-12 h-0.5 mx-1 mb-5 ${
                      index < 2 ? 'bg-amber-500/80' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Preferences Container */}
        <div className="bg-[#121215] rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Section Tabs */}
          <div className="flex border-b border-white/10 overflow-x-auto bg-black/40">
            {sections.map((section, index) => (
              <button
                key={section}
                onClick={() => setCurrentSection(index)}
                className={`flex-1 min-w-[120px] py-3.5 px-4 text-xs font-bold text-center transition-colors border-b-2 cursor-pointer ${
                  currentSection === index
                    ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {section}
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* 0. ROOM STYLE */}
              {currentSection === 0 && (
                <motion.div
                  key="style"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="mb-2">
                    <h3 className="text-sm font-bold text-white">Select Interior Design Aesthetic</h3>
                    <p className="text-xs text-gray-400">Controls overall spatial theme and finishes</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {styles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          selectedStyle === style.id
                            ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400/30'
                            : 'border-white/10 hover:border-amber-500/30 bg-black/50'
                        }`}
                      >
                        {selectedStyle === style.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-black stroke-[3]" />
                          </div>
                        )}
                        <div className="text-2xl mb-2 text-amber-400">{style.icon}</div>
                        <h3 className="text-sm font-bold text-white">{style.label}</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">{style.desc}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 1. FURNITURE STYLE */}
              {currentSection === 1 && (
                <motion.div
                  key="furnitureStyle"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="mb-2">
                    <div className="flex items-center gap-2">
                      <Armchair className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-white">Select Furniture & Product Aesthetic</h3>
                    </div>
                    <p className="text-xs text-gray-400">Directly dictates materials, silhouettes, and catalog product matching</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {furnitureStyles.map((fStyle) => (
                      <button
                        key={fStyle.id}
                        onClick={() => setSelectedFurnitureStyle(fStyle.id)}
                        className={`relative p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                          selectedFurnitureStyle === fStyle.id
                            ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400/30'
                            : 'border-white/10 hover:border-amber-500/30 bg-black/50'
                        }`}
                      >
                        {selectedFurnitureStyle === fStyle.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 text-black stroke-[3]" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-white">{fStyle.label}</h4>
                          <p className="text-[10px] text-gray-400 mt-1 leading-snug">{fStyle.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 2. MOOD */}
              {currentSection === 2 && (
                <motion.div
                  key="mood"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="mb-2">
                    <h3 className="text-sm font-bold text-white">Select Lighting & Atmosphere Mood</h3>
                    <p className="text-xs text-gray-400">Controls ambient illumination and emotional resonance</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {moods.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => setSelectedMood(mood.id)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          selectedMood === mood.id
                            ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400/30'
                            : 'border-white/10 hover:border-amber-500/30 bg-black/50'
                        }`}
                      >
                        {selectedMood === mood.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-black stroke-[3]" />
                          </div>
                        )}
                        <div className={`w-full h-14 rounded-lg bg-gradient-to-br ${mood.color} mb-3 border border-white/10`} />
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${mood.accent}`}>
                          {mood.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 3. COLOR */}
              {currentSection === 3 && (
                <motion.div
                  key="color"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="mb-2">
                    <h3 className="text-sm font-bold text-white">Select Color Harmony</h3>
                    <p className="text-xs text-gray-400">Coordinates fabrics, rug tones, wall accents, and textures</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color.id)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          selectedColor === color.id
                            ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400/30'
                            : 'border-white/10 hover:border-amber-500/30 bg-black/50'
                        }`}
                      >
                        {selectedColor === color.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-black stroke-[3]" />
                          </div>
                        )}
                        <div
                          className={`w-full h-16 rounded-lg bg-gradient-to-br ${color.gradient} ring-1 ${color.ring} mb-2 shadow-sm`}
                        />
                        <h3 className="text-xs font-bold text-white">{color.label}</h3>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 4. BUDGET */}
              {currentSection === 4 && (
                <motion.div
                  key="budget"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  <div className="mb-2">
                    <h3 className="text-sm font-bold text-white">Set Redesign Budget Target</h3>
                    <p className="text-xs text-gray-400">The system calculates live item prices against this target</p>
                  </div>
                  {budgets.map((budget) => (
                    <button
                      key={budget.id}
                      onClick={() => {
                        setSelectedBudget(budget.id);
                        setIsCustomBudget(false);
                      }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                        !isCustomBudget && selectedBudget === budget.id
                          ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400/30'
                          : 'border-white/10 hover:border-amber-500/30 bg-black/50'
                      }`}
                    >
                      <div>
                        <h3 className="text-sm font-bold text-white">{budget.label}</h3>
                        <p className="text-xs text-gray-400">{budget.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          !isCustomBudget && selectedBudget === budget.id
                            ? 'border-amber-400'
                            : 'border-white/30'
                        }`}
                      >
                        {!isCustomBudget && selectedBudget === budget.id && (
                          <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                        )}
                      </div>
                    </button>
                  ))}

                  <button
                    onClick={() => setIsCustomBudget(true)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      isCustomBudget
                        ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400/30'
                        : 'border-white/10 hover:border-amber-500/30 bg-black/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">Custom Budget</h3>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isCustomBudget ? 'border-amber-400' : 'border-white/30'
                        }`}
                      >
                        {isCustomBudget && (
                          <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                        )}
                      </div>
                    </div>
                    {isCustomBudget && (
                      <div className="mt-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={customBudget}
                            onChange={(e) => setCustomBudget(e.target.value)}
                            placeholder="Enter custom budget in ₹"
                            className="w-full pl-8 pr-4 py-2 border border-white/15 rounded-lg text-sm text-white bg-black placeholder-gray-500 outline-none focus:border-amber-400"
                            autoFocus
                          />
                        </div>
                      </div>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Footer */}
          <div className="p-6 border-t border-white/10 flex gap-3 bg-black/40">
            {currentSection > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 border border-white/15 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {currentSection < sections.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                className="flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 hover:from-amber-400 hover:to-amber-300 text-black py-3 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.01]"
              >
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                GENERATE MY DESIGN →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
