'use client';

import { useState } from 'react';
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
  { id: 'warm', label: 'Warm & Cozy', color: 'from-orange-100 to-amber-50', accent: 'bg-orange-100 text-orange-700' },
  { id: 'bright', label: 'Bright & Fresh', color: 'from-yellow-50 to-green-50', accent: 'bg-yellow-100 text-yellow-700' },
  { id: 'calm', label: 'Calm & Serene', color: 'from-blue-50 to-indigo-50', accent: 'bg-blue-100 text-blue-700' },
  { id: 'elegant', label: 'Elegant & Luxe', color: 'from-purple-50 to-pink-50', accent: 'bg-purple-100 text-purple-700' },
  { id: 'bold', label: 'Bold & Dramatic', color: 'from-red-50 to-orange-50', accent: 'bg-red-100 text-red-700' },
  { id: 'natural', label: 'Natural & Organic', color: 'from-green-50 to-emerald-50', accent: 'bg-green-100 text-green-700' },
];

const colors = [
  { id: 'light', label: 'Light Tones', gradient: 'from-gray-50 to-white', ring: 'ring-gray-200' },
  { id: 'dark', label: 'Dark & Moody', gradient: 'from-gray-800 to-gray-900', ring: 'ring-gray-700' },
  { id: 'neutral', label: 'Neutral & Warm', gradient: 'from-stone-100 to-stone-50', ring: 'ring-stone-300' },
  { id: 'warm', label: 'Amber & Terracotta', gradient: 'from-amber-100 to-orange-50', ring: 'ring-amber-300' },
  { id: 'cool', label: 'Cool Blue & Slate', gradient: 'from-blue-100 to-cyan-50', ring: 'ring-blue-300' },
  { id: 'ai', label: 'Let AI Harmonize', gradient: 'from-purple-100 to-pink-50', ring: 'ring-purple-300' },
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
  const { preferences, setPreferences, setCurrentStep } = useDesignerStore();
  const [currentSection, setCurrentSection] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState(preferences.style || 'modern');
  const [selectedFurnitureStyle, setSelectedFurnitureStyle] = useState(preferences.furnitureStyle || 'modern');
  const [selectedMood, setSelectedMood] = useState(preferences.mood || 'warm');
  const [selectedColor, setSelectedColor] = useState(preferences.color || 'neutral');
  const [selectedBudget, setSelectedBudget] = useState(preferences.budget || 200000);
  const [customBudget, setCustomBudget] = useState('');
  const [isCustomBudget, setIsCustomBudget] = useState(false);

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
    setPreferences({
      style: selectedStyle,
      furnitureStyle: selectedFurnitureStyle,
      mood: selectedMood,
      color: selectedColor,
      budget: isCustomBudget ? parseInt(customBudget) || 200000 : selectedBudget,
    });
    setCurrentStep('generate');
    router.push('/designer/generate');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Toaster position="top-center" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <BackButton fallbackHref="/designer/analysis" label="Back to Analysis" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Design & Furniture Preferences</h1>
          <p className="text-sm text-gray-500">Configure your style, furniture aesthetic, and budget for photorealistic redesign</p>
        </div>

        {/* Steps Tracker */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-1">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      index <= 2
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-medium ${
                      index <= 2 ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-1 mb-5 ${
                      index < 2 ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Section Navigation Tabs */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {sections.map((section, index) => (
              <button
                key={section}
                onClick={() => setCurrentSection(index)}
                className={`flex-1 py-3 px-4 text-xs font-semibold whitespace-nowrap transition-colors ${
                  currentSection === index
                    ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50/50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {section}
              </button>
            ))}
          </div>

          <div className="p-6 min-h-[420px]">
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
                    <h3 className="text-sm font-bold text-gray-900">Select Overall Room Design Style</h3>
                    <p className="text-xs text-gray-500">Defines the overarching spatial mood and architectural harmony</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {styles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                          selectedStyle === style.id
                            ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900/10'
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`}
                      >
                        {selectedStyle === style.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className="text-2xl mb-2">{style.icon}</div>
                        <h3 className="text-sm font-semibold text-gray-900">{style.label}</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">{style.desc}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 1. FURNITURE STYLE (REQUIRED 12 OPTIONS) */}
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
                      <Armchair className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-bold text-gray-900">Select Furniture & Product Aesthetic</h3>
                    </div>
                    <p className="text-xs text-gray-500">Directly dictates the materials, silhouettes, and catalog product matching</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {furnitureStyles.map((fStyle) => (
                      <button
                        key={fStyle.id}
                        onClick={() => setSelectedFurnitureStyle(fStyle.id)}
                        className={`relative p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                          selectedFurnitureStyle === fStyle.id
                            ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900/10'
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`}
                      >
                        {selectedFurnitureStyle === fStyle.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-gray-900">{fStyle.label}</h4>
                          <p className="text-[10px] text-gray-500 mt-1 leading-snug">{fStyle.desc}</p>
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
                    <h3 className="text-sm font-bold text-gray-900">Select Lighting & Atmosphere Mood</h3>
                    <p className="text-xs text-gray-500">Controls ambient illumination and emotional resonance</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {moods.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => setSelectedMood(mood.id)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                          selectedMood === mood.id
                            ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900/10'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {selectedMood === mood.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className={`w-full h-14 rounded-lg bg-gradient-to-br ${mood.color} mb-3 border border-black/5`} />
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${mood.accent}`}>
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
                    <h3 className="text-sm font-bold text-gray-900">Select Color Harmony</h3>
                    <p className="text-xs text-gray-500">Coordinates fabrics, rug tones, wall accents, and textures</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color.id)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                          selectedColor === color.id
                            ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900/10'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {selectedColor === color.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div
                          className={`w-full h-16 rounded-lg bg-gradient-to-br ${color.gradient} ring-1 ${color.ring} mb-2 shadow-xs`}
                        />
                        <h3 className="text-xs font-bold text-gray-900">{color.label}</h3>
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
                    <h3 className="text-sm font-bold text-gray-900">Set Redesign Budget Target</h3>
                    <p className="text-xs text-gray-500">The system calculates live item prices against this target</p>
                  </div>
                  {budgets.map((budget) => (
                    <button
                      key={budget.id}
                      onClick={() => {
                        setSelectedBudget(budget.id);
                        setIsCustomBudget(false);
                      }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                        !isCustomBudget && selectedBudget === budget.id
                          ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900/10'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{budget.label}</h3>
                        <p className="text-xs text-gray-400">{budget.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          !isCustomBudget && selectedBudget === budget.id
                            ? 'border-gray-900'
                            : 'border-gray-300'
                        }`}
                      >
                        {!isCustomBudget && selectedBudget === budget.id && (
                          <div className="w-2.5 h-2.5 bg-gray-900 rounded-full" />
                        )}
                      </div>
                    </button>
                  ))}

                  <button
                    onClick={() => setIsCustomBudget(true)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      isCustomBudget ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900">Custom Budget</h3>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isCustomBudget ? 'border-gray-900' : 'border-gray-300'
                        }`}
                      >
                        {isCustomBudget && (
                          <div className="w-2.5 h-2.5 bg-gray-900 rounded-full" />
                        )}
                      </div>
                    </div>
                    {isCustomBudget && (
                      <div className="mt-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={customBudget}
                            onChange={(e) => setCustomBudget(e.target.value)}
                            placeholder="Enter custom budget in ₹"
                            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-1 focus:ring-amber-500"
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
          <div className="p-6 border-t border-gray-100 flex gap-3">
            {currentSection > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {currentSection < sections.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-bold text-sm hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-200"
              >
                <Sparkles className="w-4 h-4" />
                GENERATE MY DESIGN →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
