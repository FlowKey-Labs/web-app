import { create } from 'zustand';

export interface SeriesLevel {
  label: string;
  value: string;
  progress?: number;
}

export interface Series {
  title: string;
  progress?: number;
  levels?: SeriesLevel[];
}

interface ProgressState {
  selectedLevel: {
    series: string;
    level: SeriesLevel;
  } | null;
  levelProgress: { [key: string]: number };
  expandedSeries: string | null;
  viewMode: 'details' | 'levels';
  // Actions
  setSelectedLevel: (level: ProgressState['selectedLevel']) => void;
  updateLevelProgress: (levelId: string, progress: number) => void;
  setExpandedSeries: (series: string | null) => void;
  setViewMode: (mode: 'details' | 'levels') => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  selectedLevel: null,
  levelProgress: {},
  expandedSeries: null,
  viewMode: 'levels',

  setSelectedLevel: (level) => set({ selectedLevel: level }),
  
  updateLevelProgress: (levelId, progress) =>
    set((state) => ({
      levelProgress: {
        ...state.levelProgress,
        [levelId]: progress,
      },
    })),

  setExpandedSeries: (series) => set({ expandedSeries: series }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
}));
