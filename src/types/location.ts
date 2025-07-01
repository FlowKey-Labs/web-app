// Location types
export interface Business {
  id: number;
  business_name: string;
}

export interface Location {
  id: number;
  business: Business;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_primary: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateLocationData = Omit<Location, 'id' | 'created_at' | 'updated_at'>;