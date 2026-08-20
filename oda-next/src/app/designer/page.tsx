'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useDesignerStore } from '@/store/useDesignerStore';
import { useAuth } from '@/contexts/AuthContext';
import BackButton from '@/components/common/BackButton';

const steps = [
  { id: 'upload', label: 'Upload' },
  { id: 'analysis', label: 'Analyze' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'generate', label: 'Generate' },
  { id: 'viewer', label: 'Viewer' },
];

function DesignerUploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get('projectId');
  const { getToken } = useAuth();
  const { setUploadedImage, clearPreviousUpload, setCurrentStep, loadProjectState } = useDesignerStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load project from MongoDB if projectId is present in query parameters
  useEffect(() => {
    if (!projectIdParam) return;

    const loadProject = async () => {
      setIsLoadingProject(true);
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch(`/api/projects/${projectIdParam}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            loadProjectState(data.data);
            toast.success(`Loaded project "${data.data.name}"`);
            router.push('/designer/generate');
          }
        }
      } catch (e) {
        console.warn('Failed to load project into designer:', e);
      } finally {
        setIsLoadingProject(false);
      }
    };

    loadProject();
  }, [projectIdParam, getToken, loadProjectState, router]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (!selected) return;

    // Reset previous upload state on selecting a new image
    clearPreviousUpload();
    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  }, [clearPreviousUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDropRejected: () => {
      toast.error('Please upload a JPG, PNG, or WEBP image under 10MB');
    },
  });

  const handleRemove = () => {
    setPreview(null);
    setFile(null);
    setUploadProgress(0);
    clearPreviousUpload();
  };

  const handleRetake = handleRemove;

  const handleUpload = async () => {
    if (!file || !preview) {
      toast.error('Please select an image first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = await getToken();
      const response = await fetch('/api/room/upload', {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setUploadProgress(100);
      const imageUrl = data.data?.imageUrl || data.imageUrl || preview;
      const imageId = data.data?.imageId || `img_${Date.now()}`;

      setUploadedImage(imageUrl, imageId);
      setCurrentStep('analysis');

      toast.success('New image uploaded successfully!');
      router.push('/designer/analysis');
    } catch (error: any) {
      toast.error(error.message || 'Upload failed. Please try again.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleContinue = handleUpload;

  if (isLoadingProject) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white space-y-4">
        <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-gray-700">Loading your project from MongoDB...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <BackButton fallbackHref="/" label="Back to Home" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Room Designer</h1>
          <p className="text-sm text-gray-500">Upload a photo of your room to get started</p>
        </div>

        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-1">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      index === 0
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-medium ${
                      index === 0 ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-12 h-0.5 bg-gray-200 mx-1 mb-5" />
                )}
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-7 h-7 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {isDragActive ? 'Drop your image here' : 'Drag & drop your room photo'}
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      or click to browse
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>JPG, PNG, WEBP • Max 10MB</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="relative rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={preview}
                    alt="Room preview"
                    className="w-full h-80 object-cover"
                  />
                  {!isUploading && (
                    <button
                      onClick={handleRetake}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-3" />
                        <p className="text-white text-sm font-medium">Uploading... {uploadProgress}%</p>
                      </div>
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <motion.div
                        className="bg-amber-500 h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleRetake}
                    disabled={isUploading}
                    className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Retake
                  </button>
                  <button
                    onClick={handleContinue}
                    disabled={isUploading}
                    className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Continue
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default function DesignerUploadPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <DesignerUploadContent />
    </Suspense>
  );
}
