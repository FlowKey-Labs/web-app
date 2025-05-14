import { api } from "../lib/axios";
import { useProgressStore } from "../store/progressStore";

export const useLoadProgressTrackerData = () => {
  const { setSeriesData, updateLevelProgress } = useProgressStore();

  const loadProgressData = async () => {
    try {
      const [seriesRes, progressRes, outcomesRes] = await Promise.all([
        api.get("/api/progress/series"),
        api.get("/api/progress/progress"),
        api.get("/api/progress/outcomes"),
      ]);

      const series = seriesRes.data;
      const progress = progressRes.data; // array of { levelId, progress }
      const outcomesData = outcomesRes.data; // keyed by levelId

      console.log("Progress Tracker Data", {
        series,
        progress,
        outcomesData,
      });

      // Map progress by levelId for easy lookup
      const progressMap = progress.reduce((acc, item) => {
        acc[item.levelId] = item.progress;
        return acc;
      }, {} as { [key: string]: number });

      // Inject progress into levels
      const formattedSeries = series.map((s: any) => ({
        ...s,
        levels: s.levels.map((level: any) => {
          const outcomes = outcomesData[level.value]?.outcomes ?? [];
          const completed = outcomesData[level.value]?.completed ?? [];
          const progress =
            outcomes.length > 0
              ? Math.round((completed.length / outcomes.length) * 100)
              : 0;

          return {
            ...level,
            outcomes,
            completed,
            progress,
          };
        }),
        progress: (() => {
          const levelProgresses = s.levels.map(
            (level: any) => progressMap[level.value] || 0
          );
          return Math.round(
            levelProgresses.reduce((a, b) => a + b, 0) / levelProgresses.length
          );
        })(),
      }));
      console.log("Formatted Series", formattedSeries);

      // Update store
      setSeriesData(formattedSeries);

      // Populate levelProgress map in store too
      Object.entries(progressMap).forEach(([levelId, prog]) => {
        updateLevelProgress(levelId, prog);
      });
    } catch (error) {
      console.error("Failed to load progress tracker data", error);
    }
  };

  return { loadProgressData };
};
