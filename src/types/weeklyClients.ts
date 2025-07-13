export interface DailyClientCount {
  day: string;
  value: number;
}

export interface WeeklyClientsResponse {
  data: DailyClientCount[];
  start_date: string;
  end_date: string;
}
