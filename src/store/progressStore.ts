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
  };
  levelProgress: { [key: string]: number };
  expandedSeries: string | null;
  viewMode: 'details' | 'levels';
  activeTab: 'overview' | 'Progress Tracker' | 'Attendance' | 'Assessments';
  seriesData: Series[];
  currentLevelIndex: number;
  currentSeriesIndex: number;

  // Actions
  setSelectedLevel: (level: ProgressState['selectedLevel']) => void;
  updateLevelProgress: (levelId: string, progress: number) => void;
  setExpandedSeries: (series: string | null) => void;
  setViewMode: (mode: 'details' | 'levels') => void;
  setActiveTab: (
    tab: 'overview' | 'Progress Tracker' | 'Attendance' | 'Assessments'
  ) => void;
  goToNextLevel: () => void;
  goToPreviousLevel: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  selectedLevel: {
    series: 'STARFISH Series',
    level: { label: 'Level 1', value: 'starfish-1' },
  },
  levelProgress: {},
  expandedSeries: 'STARFISH Series',
  viewMode: 'details',
  activeTab: 'overview',
  currentLevelIndex: 0,
  currentSeriesIndex: 0,
  seriesData: [
    {
      title: 'STARFISH Series',
      levels: [
        { label: 'Level 1', value: 'starfish-1' },
        { label: 'Level 2', value: 'starfish-2' },
        { label: 'Level 3', value: 'starfish-3' },
      ],
    },
    {
      title: 'STANLEY Series',
      levels: [
        { label: 'Level 1', value: 'stanley-1' },
        { label: 'Level 2', value: 'stanley-2' },
        { label: 'Level 3', value: 'stanley-3' },
        { label: 'Level 4', value: 'stanley-4' },
        { label: 'Level 5', value: 'stanley-5' },
        { label: 'Level 6', value: 'stanley-6' },
      ],
    },
    {
      title: 'Octopus Series',
      levels: [
        { label: 'Level 1', value: 'octopus-1' },
        { label: 'Level 2', value: 'octopus-2' },
        { label: 'Level 3', value: 'octopus-3' },
        { label: 'Level 4', value: 'octopus-4' },
        { label: 'Level 5', value: 'octopus-5' },
        { label: 'Level 6', value: 'octopus-6' },
      ],
    },
    {
      title: 'Jellyfish Series',
      levels: [
        { label: 'Level 1', value: 'jellyfish-1' },
        { label: 'Level 2', value: 'jellyfish-2' },
        { label: 'Level 3', value: 'jellyfish-3' },
        { label: 'Level 4', value: 'jellyfish-4' },
        { label: 'Level 5', value: 'jellyfish-5' },
        { label: 'Level 6', value: 'jellyfish-6' },
      ],
    },
  ],

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
    const currentLevelId = selectedLevel.level.value;
    const currentLevelProgress = levelProgress[currentLevelId] || 0;

    if (currentLevelProgress < 100) {
      return;
    }

    // Check if there's a next level in current series
    if (currentLevelIndex < currentSeries.levels.length - 1) {
      const nextLevel = currentSeries.levels[currentLevelIndex + 1];
      set({
        currentLevelIndex: currentLevelIndex + 1,
        selectedLevel: {
          series: currentSeries.title,
          level: nextLevel,
        },
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
          selectedLevel: {
            series: nextSeries.title,
            level: nextSeries.levels[0],
          },
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
        selectedLevel: {
          series: currentSeries.title,
          level: previousLevel,
        },
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
          selectedLevel: {
            series: previousSeries.title,
            level: previousSeries.levels[previousSeries.levels.length - 1],
          },
          expandedSeries: previousSeries.title,
        });
      }
    }
  },
}));
