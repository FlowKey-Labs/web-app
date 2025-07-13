export type CategoryDistribution = {
  id: number;
  name: string;
  session_count: number;
  client_count: number;
};

export type CategoryDistributionResponse = {
  categories: CategoryDistribution[];
  total_sessions: number;
  total_clients: number;
};
