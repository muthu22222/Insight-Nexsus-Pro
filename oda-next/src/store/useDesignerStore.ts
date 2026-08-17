import { create } from "zustand";
import type { RoomAnalysis, AIDesign, DesignPreferences } from "@/types";

interface DesignerState {
  uploadedImage: string | null;
  roomAnalysis: RoomAnalysis | null;
  preferences: DesignPreferences;
  generatedDesigns: AIDesign[];
  selectedDesign: AIDesign | null;
  currentStep: "upload" | "analysis" | "preferences" | "generate" | "viewer";

  setUploadedImage: (image: string | null) => void;
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
  uploadedImage: null,
  roomAnalysis: null,
  preferences: { ...defaultPreferences },
  generatedDesigns: [],
  selectedDesign: null,
  currentStep: "upload",

  setUploadedImage: (image) => set({ uploadedImage: image }),
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
      uploadedImage: null,
      roomAnalysis: null,
      preferences: { ...defaultPreferences },
      generatedDesigns: [],
      selectedDesign: null,
      currentStep: "upload",
    }),
}));
