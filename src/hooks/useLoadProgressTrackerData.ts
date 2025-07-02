import { api } from "../lib/axios";
import {
  Series,
  SeriesProgress,
  useProgressStore,
} from "../store/progressStore";

export const useLoadProgressTrackerData = (clientId: string) => {
  const { setSeriesData, updateLevelProgress } = useProgressStore();

  const loadProgressData = async () => {
    try {
      const [seriesRes, progressRes, outcomesRes, clientProgressRes] = await Promise.all([
        api.get("/api/progress/series"),
        api.get(`/api/progress/${clientId}/`),
        api.get("/api/progress/outcomes?client_id=" + clientId),
        api.get(`/api/progress/client/${clientId}/`),  // This will now match our new URL pattern
      ]);
      
     
      
      // Create a map of level IDs to their assessed_on dates
      const assessedOnMap = clientProgressRes.data.reduce((acc: Record<string, string>, item: any) => {
        if (item.assessed_on) {
          acc[item.id] = item.assessed_on;
        }
        return acc;
      }, {});

      const series = seriesRes.data;
      const progress: SeriesProgress = progressRes.data;
      const outcomesData = outcomesRes.data;
      // Map progress by levelId for easy lookup
      const progressMap = Array.isArray(progress)
        ? progress.reduce((acc, item) => {
            acc[String(item.levelId)] = item.progress;
            return acc;
          }, {} as { [key: string]: number })
        : {};

      // Inject progress into levels
      const formattedSeries = series?.map((s: Series) => ({
        ...s,
        levels: s?.levels?.map((level) => {
          const outcomes = outcomesData?.[level.id]?.outcomes ?? [];
          const completed = outcomesData?.[level.id]?.completed ?? [];
          const progress =
            outcomes.length > 0
              ? Math.round((completed.length / outcomes.length) * 100)
              : 0;

          const assessedOn = assessedOnMap[level.id] || null;
            
          return {
            ...level,
            outcomes,
            completed,
            progress,
            assessed_on: assessedOn,
          };
        }),
        progress: (() => {
          const levelProgresses =
            s?.levels?.map((level) => level.progress || 0) || [];
          return Math.round(
            levelProgresses.reduce((a, b) => a + b, 0) /
              (levelProgresses.length || 1)
          );
        })(),
      }));

      // Update store
      setSeriesData(formattedSeries || []);

      // Populate levelProgress map in store too
      Object.entries(progressMap || {}).forEach(([levelId, prog]) => {
        updateLevelProgress(levelId, prog as number);
      });
    } catch (error) {
      console.error("Failed to load progress tracker data", error);
    }
  };

  return { loadProgressData };
};
