export interface Business {
  id: number;
  business_name: string;
}

export interface BusinessService {
  id: number;
  business: Business;
  title: string;
  start_time: string;
  end_time: string;
  available_days: string[];
  created_by: number;
}

export type BusinessServices = BusinessService[];
