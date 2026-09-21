import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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
  cartItemIds: string[];

  setUploadedImage: (image: string | null, imageId?: string) => void;
  clearPreviousUpload: () => void;
  setRoomAnalysis: (analysis: RoomAnalysis | null) => void;
  setPreferences: (prefs: Partial<DesignPreferences>) => void;
  setGeneratedDesigns: (designs: AIDesign[]) => void;
  setSelectedDesign: (design: AIDesign | null) => void;
  setCurrentStep: (step: DesignerState["currentStep"]) => void;
  setActiveProject: (id: string | null, name?: string | null) => void;
  loadProjectState: (project: any) => void;
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  toggleCartItem: (id: string) => void;
  addAllToCart: (ids: string[]) => void;
  clearCart: () => void;
  reset: () => void;
}

const defaultPreferences: DesignPreferences = {
  style: "modern",
  furnitureStyle: "modern",
  mood: "warm",
  color: "neutral",
  budget: 200000,
};

const safeSessionStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(name, value);
    } catch (e) {
      console.warn("Storage quota exceeded or unavailable:", e);
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(name);
    } catch {}
  },
};

export const useDesignerStore = create<DesignerState>()(
  persist(
    (set) => ({
      activeProjectId: null,
      activeProjectName: null,
      imageId: null,
      uploadedImage: null,
      roomAnalysis: null,
      preferences: { ...defaultPreferences },
      generatedDesigns: [],
      selectedDesign: null,
      currentStep: "upload",
      cartItemIds: [],

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
          cartItemIds: [],
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

      addToCart: (id: string) =>
        set((state) => ({
          cartItemIds: state.cartItemIds.includes(id)
            ? state.cartItemIds
            : [...state.cartItemIds, id],
        })),

      removeFromCart: (id: string) =>
        set((state) => ({
          cartItemIds: state.cartItemIds.filter((itemId) => itemId !== id),
        })),

      toggleCartItem: (id: string) =>
        set((state) => ({
          cartItemIds: state.cartItemIds.includes(id)
            ? state.cartItemIds.filter((itemId) => itemId !== id)
            : [...state.cartItemIds, id],
        })),

      addAllToCart: (ids: string[]) =>
        set((state) => {
          const combined = Array.from(new Set([...state.cartItemIds, ...ids]));
          return { cartItemIds: combined };
        }),

      clearCart: () => set({ cartItemIds: [] }),

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
          cartItemIds: [],
        }),
    }),
    {
      name: "insight_nexus_designer_storage",
      storage: createJSONStorage(() => safeSessionStorage),
      partialize: (state) => ({
        activeProjectId: state.activeProjectId,
        activeProjectName: state.activeProjectName,
        imageId: state.imageId,
        uploadedImage: state.uploadedImage,
        roomAnalysis: state.roomAnalysis,
        preferences: state.preferences,
        generatedDesigns: state.generatedDesigns,
        selectedDesign: state.selectedDesign,
        currentStep: state.currentStep,
        cartItemIds: state.cartItemIds,
      }),
    }
  )
);
