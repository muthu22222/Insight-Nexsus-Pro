import { create } from "zustand";
import type { Project } from "@/types";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;

  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  loading: false,

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects],
    })),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p._id === id ? { ...p, ...updates } : p
      ),
      currentProject:
        state.currentProject?._id === id
          ? { ...state.currentProject, ...updates }
          : state.currentProject,
    })),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p._id !== id),
      currentProject:
        state.currentProject?._id === id ? null : state.currentProject,
    })),
  setLoading: (loading) => set({ loading }),
}));
