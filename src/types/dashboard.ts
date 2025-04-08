export interface UpcomingSession {
  id: string;
  title: string;
  date: string;
  staff_name?: string;
}

export interface AnalyticsData {
  total_sessions: number;
  total_clients: number;
  total_staff: number;
}

export type DateFilterOption =
  | 'to_date'
  | 'today'
  | 'last_7_days'
  | 'last_30_days'
  | 'last_3_months'
  | 'last_year';
