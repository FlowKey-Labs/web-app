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
  effective_pricing?: {
    base_price: number;
    formatted_price: string;
    currency: string;
    currency_symbol: string;
    has_location_override: boolean;
    pricing_source: string;
  };
}

export type CreateLocationData = Omit<Location, 'id' | 'created_at' | 'updated_at'>;