import { useQuery } from "@tanstack/react-query";
import {
  get_upcoming_birthdays,
  get_category_distribution,
  get_sessions_per_staff,
  get_cancellation_reschedule_analytics,
  get_weekly_clients,
} from "../../api/analytics";

import { UpcomingBirthdaysResponse } from "../../types/birthdays";
import { CategoryDistributionResponse } from "../../types/categoryDistribution";
import { DailyStaffSessionsResponse } from "../../types/sessionTypes";
import { CancellationRescheduleAnalyticsResponse } from "../../types/cancelRescheduleTypes";
import { WeeklyClientsResponse } from "../../types/weeklyClients";

export const useGetUpcomingBirthdays = () => {
  const { data, isLoading, error } = useQuery<UpcomingBirthdaysResponse>({
    queryKey: ["upcoming-birthdays"],
    queryFn: () => get_upcoming_birthdays(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
  return { data, isLoading, error };
};

export const useGetCategoryDistribution = () => {
  const { data, isLoading, error } = useQuery<CategoryDistributionResponse>({
    queryKey: ["category-distribution"],
    queryFn: () => get_category_distribution(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
  return { data, isLoading, error };
};

export const useGetSessionsPerStaff = () => {
  const { data, isLoading, error } =
    useQuery<DailyStaffSessionsResponse | null>({
      queryKey: ["sessions-per-staff"],
      queryFn: async () => {
        try {
          const response = await get_sessions_per_staff();
          return response || null;
        } catch (error) {
          console.error("Error fetching sessions per staff:", error);
          return null;
        }
      },
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 2,
    });

  return {
    data: data || undefined,
    isLoading,
    error,
  };
};

export const useGetCancellationRescheduleAnalytics = (
  timeFilter: string = "last_30_days"
) => {
  const { data, isLoading, error } =
    useQuery<CancellationRescheduleAnalyticsResponse>({
      queryKey: ["cancellation-reschedule-analytics", timeFilter],
      queryFn: async () => {
        try {
          const response = await get_cancellation_reschedule_analytics(
            timeFilter
          );

          // The API returns data directly, not wrapped in a 'data' property
          if (response && typeof response === "object") {
            // Check if response has the expected structure
            if (
              "summary" in response ||
              "time_series" in response ||
              "top_metrics" in response
            ) {
              return {
                data: response,
              } as CancellationRescheduleAnalyticsResponse;
            }
            // If it already has a 'data' property, return as-is
            if ("data" in response) {
              return response as CancellationRescheduleAnalyticsResponse;
            }
          }

          console.warn("Unexpected response format:", response);
          // Return a safe default structure
          return {
            data: {
              summary: {
                total_cancellations: 0,
                total_reschedules: 0,
                cancellation_rate: 0,
                time_period: {
                  start: new Date().toISOString(),
                  end: new Date().toISOString(),
                },
              },
              time_series: { cancellations: [], reschedules: [] },
              top_metrics: { cancelled_sessions: [], rescheduled_sessions: [] },
              by_session_type: { cancellations: [], reschedules: [] },
            },
            status: 200,
            statusText: "OK",
          } as CancellationRescheduleAnalyticsResponse;
        } catch (err) {
          console.error("Error in useGetCancellationRescheduleAnalytics:", {
            error: err,
            timeFilter,
            errorMessage: err instanceof Error ? err.message : "Unknown error",
          });
          throw err;
        }
      },
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 2,
    });

  return {
    data: data?.data ? data : data,
    isLoading,
    error: error as Error,
    rawData: data,
  };
};

export const useGetWeeklyClients = () => {
  const { data, isLoading, error } = useQuery<WeeklyClientsResponse>({
    queryKey: ["weekly-clients"],
    queryFn: () => get_weekly_clients(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
  return { data, isLoading, error };
};
