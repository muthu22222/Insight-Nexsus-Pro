import { create } from "zustand";
import type { RoomAnalysis, AIDesign, DesignPreferences } from "@/types";

interface DesignerState {
  activeProjectId: string | null;
  activeProjectName: string | null;
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
  setActiveProject: (id: string | null, name?: string | null) => void;
  loadProjectState: (project: any) => void;
  reset: () => void;
}

const defaultPreferences: DesignPreferences = {
  style: "modern",
  furnitureStyle: "modern",
  mood: "warm",
  color: "neutral",
  budget: 200000,
};

export const useDesignerStore = create<DesignerState>((set) => ({
  activeProjectId: null,
  activeProjectName: null,
  imageId: null,
  uploadedImage: null,
  roomAnalysis: null,
  preferences: { ...defaultPreferences },
  generatedDesigns: [],
  selectedDesign: null,
  currentStep: "upload",

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
      activeProjectId: null,
      activeProjectName: null,
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
  setActiveProject: (id, name = null) =>
    set({ activeProjectId: id, activeProjectName: name }),

  loadProjectState: (project: any) => {
    if (!project) return;
    const roomImg = project.originalImage || project.roomImage || null;
    const designs = Array.isArray(project.designs) && project.designs.length > 0
      ? project.designs
      : project.selectedDesign
      ? [project.selectedDesign]
      : [];

    const activeDesign =
      (typeof project.selectedDesign === 'object' && project.selectedDesign) ||
      designs[project.selectedDesignIndex || 0] ||
      designs[0] ||
      null;

    const prefs: DesignPreferences = {
      style: project.selectedStyle || project.style || 'modern',
      furnitureStyle: project.selectedStyle || project.style || 'modern',
      mood: project.mood || 'warm',
      color: project.colorPreference || project.color || 'neutral',
      budget: Number(project.budget || 200000),
    };

    set({
      activeProjectId: project._id,
      activeProjectName: project.name,
      uploadedImage: roomImg,
      imageId: project._id,
      roomAnalysis: project.roomAnalysis || null,
      preferences: prefs,
      generatedDesigns: designs,
      selectedDesign: activeDesign,
      currentStep: activeDesign ? 'viewer' : 'generate',
    });
  },

  reset: () =>
    set({
      activeProjectId: null,
      activeProjectName: null,
      imageId: null,
      uploadedImage: null,
      roomAnalysis: null,
      preferences: { ...defaultPreferences },
      generatedDesigns: [],
      selectedDesign: null,
      currentStep: "upload",
    }),
}));
