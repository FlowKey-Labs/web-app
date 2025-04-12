export interface UpcomingSession {
  id: string;
  title: string;
  date: string; // ISO date string (e.g., "2025-04-20")
  start_time: string | null; // ISO time string (e.g., "10:00:00")
  end_time: string | null;
  staff: {
    id: string;
    name: string;
  } | null;
}

export interface GenderDistribution {
  name: string;
  value: number;
}

export interface AnalyticsData {
  total_sessions: number;
  total_clients: number;
  total_staff: number;
  gender_distribution: GenderDistribution[];
}

export type DateFilterOption =
  | 'to_date'
  | 'today'
  | 'last_7_days'
  | 'last_30_days'
  | 'last_3_months'
  | 'last_year';
