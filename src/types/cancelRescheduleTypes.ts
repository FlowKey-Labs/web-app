export interface TimePeriod {
  start: string;  // Date string in YYYY-MM-DD format
  end: string;    // Date string in YYYY-MM-DD format
}

export interface SummaryMetrics {
  total_cancellations: number;
  total_reschedules: number;
  cancellation_rate: number;
  time_period: TimePeriod;
}

export interface SessionTypeCount {
  session__session_type: string;
  count: number;
}

export interface TimeSeriesDataPoint {
  created_date: string;  // Date string in YYYY-MM-DD format
  count: number;
}

export interface TopSession {
  session__id: number;
  session__title: string;
  session__session_type: string;
  count: number;
}

export interface CancellationRescheduleAnalytics {
  summary: SummaryMetrics;
  by_session_type: {
    cancellations: SessionTypeCount[];
    reschedules: SessionTypeCount[];
  };
  time_series: {
    cancellations: TimeSeriesDataPoint[];
    reschedules: TimeSeriesDataPoint[];
  };
  top_metrics: {
    cancelled_sessions: TopSession[];
    rescheduled_sessions: TopSession[];
  };
}

// Type for the API response
export interface CancellationRescheduleAnalyticsResponse {
  data: CancellationRescheduleAnalytics;
  status: number;
  statusText: string;
}
