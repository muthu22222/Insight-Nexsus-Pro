'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Home,
  Palette,
  Armchair,
  Sun,
  DoorOpen,
  LayoutGrid,
  Pencil,
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
  { key: 'wallColor', label: 'Wall Color', icon: Palette },
  { key: 'flooring', label: 'Flooring', icon: LayoutGrid },
  { key: 'ceiling', label: 'Ceiling', icon: LayoutGrid },
  { key: 'lighting', label: 'Lighting', icon: Sun },
  { key: 'windows', label: 'Windows', icon: DoorOpen },
  { key: 'doors', label: 'Doors', icon: DoorOpen },
] as const;

export default function AnalysisPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const {
    uploadedImage,
    roomAnalysis,
    setRoomAnalysis,
    setCurrentStep,
  } = useDesignerStore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<RoomAnalysis | null>(roomAnalysis);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (!uploadedImage) {
      router.push('/designer');
      return;
    }
    if (roomAnalysis) {
      setAnalysis(roomAnalysis);
      return;
    }
    analyzeImage();
  }, [uploadedImage]);

  const analyzeImage = async () => {
    setIsAnalyzing(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/room/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ imageUrl: uploadedImage }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      setRoomAnalysis(data.analysis);
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze room');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEditStart = (key: string, value: string | string[]) => {
    setEditingField(key);
    setEditValue(Array.isArray(value) ? value.join(', ') : value);
  };

  const handleEditSave = (key: string) => {
    if (!analysis) return;
    const newValue = key === 'furniture' || key === 'windows' || key === 'doors'
      ? editValue.split(',').map((s) => s.trim()).filter(Boolean)
      : editValue;

    const updated = { ...analysis, [key]: newValue };
    setAnalysis(updated);
    setRoomAnalysis(updated);
    setEditingField(null);
    toast.success('Updated successfully');
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
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Room Analysis</h1>
          <p className="text-sm text-gray-500">AI is analyzing your room details</p>
        </div>

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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Uploaded Image</h2>
            </div>
            <div className="p-4">
              <img
                src={uploadedImage}
                alt="Uploaded room"
                className="w-full h-72 object-cover rounded-lg"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Analysis Results</h2>
            </div>

            {isAnalyzing ? (
              <div className="p-12 text-center">
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
                    <LayoutGrid className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  AI is analyzing your room...
                </h3>
                <p className="text-sm text-gray-500">
                  Detecting room features, furniture, and design elements
                </p>
              </div>
            ) : analysis ? (
              <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                {analysisFields.map(({ key, label, icon: Icon }) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 group"
                  >
                    <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                        {label}
                      </p>
                      {editingField === key ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleEditSave(key)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-amber-500 outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleEditSave(key)}
                            className="text-xs text-amber-600 font-medium"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-900 font-medium truncate">
                          {Array.isArray(analysis[key as keyof RoomAnalysis])
                            ? (analysis[key as keyof RoomAnalysis] as string[]).join(', ')
                            : String(analysis[key as keyof RoomAnalysis] || '-')}
                        </p>
                      )}
                    </div>
                    {editingField !== key && (
                      <button
                        onClick={() =>
                          handleEditStart(
                            key,
                            analysis[key as keyof RoomAnalysis] as string | string[]
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                ))}

                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-2">
                    Detected Furniture
                  </p>
                  {analysis.furniture.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysis.furniture.map((item, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No furniture detected</p>
                  )}
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>

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
            className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Confirm & Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
