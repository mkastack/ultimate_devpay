import { create } from "zustand";

interface JobFilters {
  category?: string;
  search?: string;
  budget_min?: number;
  budget_max?: number;
}

interface JobStore extends JobFilters {
  setFilter: <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => void;
  clearFilters: () => void;
}

export const useJobStore = create<JobStore>((set) => ({
  category: undefined,
  search: undefined,
  budget_min: undefined,
  budget_max: undefined,
  
  setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),
  
  clearFilters: () => set({
    category: undefined,
    search: undefined,
    budget_min: undefined,
    budget_max: undefined,
  })
}));
