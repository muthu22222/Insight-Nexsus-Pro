'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useDesignerStore } from '@/store/useDesignerStore';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import BackButton from '@/components/common/BackButton';

import { compressImageFile } from '@/utils/helpers';

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
  const { setUploadedImage, clearPreviousUpload, loadProjectState } = useDesignerStore();
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (!selected) return;

    // Reset previous upload state on selecting a new image
    clearPreviousUpload();
    try {
      const { file: compressedFile, dataUrl } = await compressImageFile(selected);
      setFile(compressedFile);
      setPreview(dataUrl);
    } catch {
      setFile(selected);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
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

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 15;
        });
      }, 200);

      const formData = new FormData();
      formData.append('image', file);

      const token = await getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/room/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (res.ok) {
        const data = await res.json();
        const uploadedUrl = data.data?.imageUrl || data.data?.url || preview;
        const uploadedId = data.data?.imageId || `room_${Date.now()}`;
        setUploadedImage(uploadedUrl, uploadedId);
        toast.success('Room photo uploaded successfully!');
        router.push('/designer/analysis');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to upload image. Using local preview.');
        setUploadedImage(preview, `room_${Date.now()}`);
        router.push('/designer/analysis');
      }
    } catch {
      toast.error('Network error during upload. Continuing with local preview.');
      setUploadedImage(preview, `room_${Date.now()}`);
      router.push('/designer/analysis');
    } finally {
      setIsUploading(false);
    }
  };

  const handleContinue = handleUpload;

  if (isLoadingProject) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#2B1B12] text-[#F5EFE7] space-y-4">
        <Loader2 className="h-9 w-9 animate-spin text-[#C9A66B]" />
        <p className="text-sm font-bold text-[#D8C3A5]">Loading your project from MongoDB...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2B1B12] text-[#F5EFE7]">
      <Toaster position="top-center" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <BackButton fallbackHref="/dashboard" label="Back to Dashboard" />
          <ThemeToggle />
        </div>

        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D8C3A5] uppercase tracking-widest bg-[#8F5F4A]/20 border border-[#C9A66B]/30 px-3.5 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            AI Designer Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5EFE7] mb-1">
            Upload Your Room
          </h1>
          <p className="text-xs sm:text-sm text-[#CDBFB2]">
            Upload a photo of your empty or furnished room to begin AI generation
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
                      index === 0
                        ? 'bg-[#8F5F4A] text-[#F5EFE7] border border-[#C9A66B]/40 shadow-lg shadow-[#8F5F4A]/25'
                        : 'bg-[#37241A] text-[#CDBFB2] border border-[#D8C3A5]/20'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-semibold ${
                      index === 0 ? 'text-[#F5EFE7]' : 'text-[#CDBFB2]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-10 sm:w-12 h-0.5 bg-[#D8C3A5]/25 mx-1 mb-5" />
                )}
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#22150E] rounded-2xl shadow-2xl border border-[#D8C3A5]/20 p-6 sm:p-8"
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
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-[#C9A66B] bg-[#8F5F4A]/20'
                      : 'border-[#D8C3A5]/25 hover:border-[#C9A66B]/60 hover:bg-[#37241A]/40'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#8F5F4A]/20 border border-[#C9A66B]/30 rounded-2xl flex items-center justify-center mb-4 text-[#C9A66B]">
                      <Upload className="w-7 h-7" />
                    </div>
                    <p className="text-base font-bold text-[#F5EFE7] mb-1">
                      {isDragActive ? 'Drop your image here' : 'Drag & drop your room photo'}
                    </p>
                    <p className="text-xs text-[#CDBFB2] mb-4">
                      or click to browse from device
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#CDBFB2] bg-[#37241A] border border-[#D8C3A5]/20 px-3 py-1.5 rounded-lg">
                      <ImageIcon className="w-3.5 h-3.5 text-[#C9A66B]" />
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
                <div className="relative rounded-2xl overflow-hidden bg-black border border-[#D8C3A5]/20">
                  <img
                    src={preview}
                    alt="Room preview"
                    className="w-full h-80 object-cover"
                  />
                  {!isUploading && (
                    <button
                      onClick={handleRetake}
                      className="absolute top-3 right-3 w-8 h-8 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black text-[#CDBFB2] hover:text-[#F5EFE7] transition-colors border border-white/20 shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-10 h-10 text-[#C9A66B] animate-spin mx-auto mb-3" />
                        <p className="text-[#F5EFE7] text-sm font-bold">Uploading... {uploadProgress}%</p>
                      </div>
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div className="mt-4">
                    <div className="w-full bg-black rounded-full h-1.5 border border-[#D8C3A5]/20 overflow-hidden">
                      <motion.div
                        className="bg-[#C9A66B] h-1.5 rounded-full"
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
                    className="flex-1 border border-[#D8C3A5]/30 text-[#D8C3A5] py-3 rounded-xl font-semibold text-sm hover:bg-[#8F5F4A]/15 transition-colors disabled:opacity-50"
                  >
                    Retake
                  </button>
                  <button
                    onClick={handleContinue}
                    disabled={isUploading}
                    className="flex-1 bg-[#8F5F4A] hover:bg-[#A26E57] text-[#F5EFE7] py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#8F5F4A]/25 hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2 border border-[#C9A66B]/30"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Continue to Analysis
                        <CheckCircle className="w-4 h-4 stroke-[2.5] text-[#F5EFE7]" />
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
        <div className="flex h-screen items-center justify-center bg-[#2B1B12]">
          <Loader2 className="h-8 w-8 animate-spin text-[#C9A66B]" />
        </div>
      }
    >
      <DesignerUploadContent />
    </Suspense>
  );
}
