'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  Save,
  ShoppingBag,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useDesignerStore } from '@/store/useDesignerStore';
import { useAuth } from '@/contexts/AuthContext';
import type { AIDesign } from '@/types';

const steps = [
  { id: 'upload', label: 'Upload' },
  { id: 'analysis', label: 'Analyze' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'generate', label: 'Generate' },
  { id: 'viewer', label: 'Viewer' },
];

const designVariants = [
  {
    id: 'variant-1',
    style: 'Primary Design',
    gradient: 'from-amber-200 via-orange-200 to-rose-200',
    mood: 'Warm & inviting',
  },
  {
    id: 'variant-2',
    style: 'Alternative Design',
    gradient: 'from-blue-200 via-indigo-200 to-purple-200',
    mood: 'Cool & modern',
  },
  {
    id: 'variant-3',
    style: 'Bold Design',
    gradient: 'from-emerald-200 via-teal-200 to-cyan-200',
    mood: 'Fresh & natural',
  },
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

  useEffect(() => {
    if (!uploadedImage || !roomAnalysis) {
      router.push('/designer');
      return;
    }
    generateDesigns();
  }, []);

  const generateDesigns = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 2;
      });
    }, 300);

    try {
      const token = await getToken();
      const response = await fetch('/api/design/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          imageUrl: uploadedImage,
          analysis: roomAnalysis,
          preferences,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Design generation failed');
      }

      const data = await response.json();
      setGenerationProgress(100);

      const designs: AIDesign[] = data.designs || designVariants.map((v, i) => ({
        _id: `design-${i + 1}`,
        projectId: 'current',
        style: preferences.style,
        mood: preferences.mood,
        color: preferences.color,
        budget: preferences.budget,
        generatedImages: [v.gradient],
        hotspots: [
          { x: 20, y: 30, label: 'Sofa', description: 'Contemporary 3-seater sofa' },
          { x: 65, y: 25, label: 'Coffee Table', description: 'Minimalist coffee table' },
          { x: 40, y: 70, label: 'Area Rug', description: 'Textured area rug' },
          { x: 80, y: 60, label: 'Floor Lamp', description: 'Modern floor lamp' },
        ],
      }));

      setLocalDesigns(designs);
      setGeneratedDesigns(designs);
      setTimeout(() => setIsGenerating(false), 500);
    } catch (error: any) {
      clearInterval(progressInterval);
      toast.error(error.message || 'Failed to generate designs');
      setIsGenerating(false);
    }
  };

  const handleSelectDesign = (design: AIDesign) => {
    setSelectedVariant(design._id);
    setSelectedDesign(design);
  };

  const handleViewDesign = () => {
    if (!selectedVariant) {
      toast.error('Please select a design first');
      return;
    }
    setCurrentStep('viewer');
    router.push('/designer/viewer');
  };

  const handleGenerateAgain = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setSelectedVariant(null);
    generateDesigns();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Design Generation</h1>
          <p className="text-sm text-gray-500">AI is creating your personalized room designs</p>
        </div>

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

            <h2 className="text-xl font-bold text-gray-900 mb-2">Generating your designs...</h2>
            <p className="text-sm text-gray-500 mb-8">
              Our AI is analyzing your room and creating personalized designs
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
                Analyzing room layout
              </div>
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Matching furniture styles
              </div>
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Rendering designs
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {designVariants.map((variant, index) => {
                const design = generatedDesigns[index];
                const isSelected = selectedVariant === design?._id;

                return (
                  <motion.div
                    key={variant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15 }}
                    className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden cursor-pointer transition-all ${
                      isSelected
                        ? 'border-gray-900 shadow-md'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                    onClick={() => design && handleSelectDesign(design)}
                  >
                    <div className={`h-48 bg-gradient-to-br ${variant.gradient} relative`}>
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-xs font-medium text-gray-700">
                          Variant {index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">{variant.style}</h3>
                      <p className="text-xs text-gray-400">{variant.mood}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push('/designer/preferences')}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleGenerateAgain}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Generate Again
              </button>
              <button
                onClick={() => toast.success('Design saved!')}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Design
              </button>
              <button
                onClick={() => router.push('/furniture')}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                View Products
              </button>
              <button
                onClick={handleViewDesign}
                disabled={!selectedVariant}
                className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                View Selected Design →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
