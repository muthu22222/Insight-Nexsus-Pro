import { create } from "zustand";
import type { RoomAnalysis, AIDesign, DesignPreferences } from "@/types";

interface DesignerState {
  imageId: string | null;
  uploadedImage: string | null;
  roomAnalysis: RoomAnalysis | null;
  preferences: DesignPreferences;
  generatedDesigns: AIDesign[];
  selectedDesign: AIDesign | null;
  currentStep: "upload" | "analysis" | "preferences" | "generate" | "viewer";

  setUploadedImage: (image: string | null, imageId?: string) => void;
  clearPreviousUpload: () => void;
  setRoomAnalysis: (analysis: RoomAnalysis | null) => void;
  setPreferences: (prefs: Partial<DesignPreferences>) => void;
  setGeneratedDesigns: (designs: AIDesign[]) => void;
  setSelectedDesign: (design: AIDesign | null) => void;
  setCurrentStep: (step: DesignerState["currentStep"]) => void;
  reset: () => void;
}

const defaultPreferences: DesignPreferences = {
  style: "modern",
  mood: "warm",
  color: "neutral",
  budget: 200000,
};

export const useDesignerStore = create<DesignerState>((set) => ({
  imageId: null,
  uploadedImage: null,
  roomAnalysis: null,
  preferences: { ...defaultPreferences },
  generatedDesigns: [],
  selectedDesign: null,
  currentStep: "upload",

  // Setting a new uploaded image automatically wipes old room analysis and generated designs
  // while preserving user design preferences (style, mood, color, budget)
  setUploadedImage: (image, imageId) =>
    set({
      uploadedImage: image,
      imageId: imageId || (image ? `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` : null),
      roomAnalysis: null,
      generatedDesigns: [],
      selectedDesign: null,
    }),

  clearPreviousUpload: () =>
    set({
      uploadedImage: null,
      imageId: null,
      roomAnalysis: null,
      generatedDesigns: [],
      selectedDesign: null,
    }),

  setRoomAnalysis: (analysis) => set({ roomAnalysis: analysis }),
  setPreferences: (prefs) =>
    set((state) => ({
      preferences: { ...state.preferences, ...prefs },
    })),
  setGeneratedDesigns: (designs) => set({ generatedDesigns: designs }),
  setSelectedDesign: (design) => set({ selectedDesign: design }),
  setCurrentStep: (step) => set({ currentStep: step }),
  reset: () =>
    set({
      imageId: null,
      uploadedImage: null,
      roomAnalysis: null,
      preferences: { ...defaultPreferences },
      generatedDesigns: [],
      selectedDesign: null,
      currentStep: "upload",
    }),
}));
