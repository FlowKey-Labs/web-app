import { create } from "zustand";

export interface Outcome {
  id: string;
  label: string;
}

export interface SeriesLevel {
  id: string;
  label: string;
  value: string;
  outcomes?: Outcome[];
  completed?: string[];
  progress?: number;
}

export interface Series {
  title: string;
  progress?: number;
  levels?: SeriesLevel[];
}

export interface SeriesProgress {
  levelId: string;
  progress: number;
}

interface ProgressState {
  selectedLevel: SeriesLevel | null;
  levelOutcomesCompleted: { [key: string]: string[] };
  levelProgress: { [key: string]: number };
  expandedSeries: string | null;
  viewMode: "details" | "levels";
  activeTab: "overview" | "Progress Tracker" | "Attendance" | "Assessments";
  seriesData: Series[];
  currentLevelIndex: number;
  currentSeriesIndex: number;

  // Actions
  setSeriesData: (data: Series[]) => void;
  setSelectedLevel: (level: ProgressState["selectedLevel"]) => void;
  getFirstIncompleteLevel: (data: Series[]) => SeriesLevel | null;
  setLevelOutcomesCompleted?: (levelId: string, completed: string[]) => void;
  updateLevelProgress: (levelId: string, progress: number) => void;
  setExpandedSeries: (series: string | null) => void;
  setViewMode: (mode: "details" | "levels") => void;
  setActiveTab: (
    tab: "overview" | "Progress Tracker" | "Attendance" | "Assessments"
  ) => void;
  goToNextLevel: () => void;
  goToPreviousLevel: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  selectedLevel: null,
  levelProgress: {},
  expandedSeries: "STARFISH Series",
  viewMode: "details",
  activeTab: "overview",
  currentLevelIndex: 0,
  currentSeriesIndex: 0,
  seriesData: [],
  levelOutcomesCompleted: {},
  setSeriesData: (data: Series[]) => set({ seriesData: data }),
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
  setActiveTab: (tab) => set({ activeTab: tab }),
  getFirstIncompleteLevel: (_seriesData) => {
    for (const series of _seriesData) {
      if (!series.levels) continue;
      for (const level of series.levels) {
        const { outcomes = [], completed = [] } = level;
        const allCompleted = outcomes.every((outcome) =>
          completed.includes(outcome.id)
        );
        if (!allCompleted) {
          set(() => ({
            selectedLevel: level,
          }));
          return level;
        } else {
          set(() => {
            const lastLevel = series.levels?.[series.levels.length - 1];
            return {
              selectedLevel: lastLevel,
            };
          });
        }
      }
    }
    return null;
  },
  goToNextLevel: () => {
    const {
      seriesData,
      currentSeriesIndex,
      currentLevelIndex,
      levelProgress,
      selectedLevel,
    } = get();
    const currentSeries = seriesData[currentSeriesIndex];

    if (!currentSeries || !currentSeries.levels) return;

    // Check if current level is 100% complete
    const currentLevelId = selectedLevel?.value;
    const currentLevelProgress = currentLevelId
      ? levelProgress[currentLevelId]
      : 0;

    if (currentLevelProgress < 100) {
      return;
    }

    // Check if there's a next level in current series
    if (currentLevelIndex < currentSeries.levels.length - 1) {
      const nextLevel = currentSeries.levels[currentLevelIndex + 1];
      set({
        currentLevelIndex: currentLevelIndex + 1,
        selectedLevel: nextLevel,
        expandedSeries: currentSeries.title,
      });
    }
    // Otherwise move to next series
    else if (currentSeriesIndex < seriesData.length - 1) {
      const nextSeries = seriesData[currentSeriesIndex + 1];
      if (nextSeries.levels && nextSeries.levels.length > 0) {
        set({
          currentSeriesIndex: currentSeriesIndex + 1,
          currentLevelIndex: 0,
          selectedLevel: nextSeries.levels[0],
          expandedSeries: nextSeries.title,
        });
      }
    }
  },
  goToPreviousLevel: () => {
    const { seriesData, currentSeriesIndex, currentLevelIndex } = get();
    const currentSeries = seriesData[currentSeriesIndex];

    if (!currentSeries || !currentSeries.levels) return;

    // Check if there's a previous level in current series
    if (currentLevelIndex > 0) {
      const previousLevel = currentSeries.levels[currentLevelIndex - 1];
      set({
        currentLevelIndex: currentLevelIndex - 1,
        selectedLevel: previousLevel,
        expandedSeries: currentSeries.title,
      });
    }
    // Otherwise move to previous series
    else if (currentSeriesIndex > 0) {
      const previousSeries = seriesData[currentSeriesIndex - 1];
      if (previousSeries.levels && previousSeries.levels.length > 0) {
        set({
          currentSeriesIndex: currentSeriesIndex - 1,
          currentLevelIndex: previousSeries.levels.length - 1,
          selectedLevel:
            previousSeries.levels[previousSeries.levels.length - 1],
          expandedSeries: previousSeries.title,
        });
      }
    }
  },
}));
