export interface LocationServicePricing {
  id?: number;
  location: number;
  service: number;
  location_name?: string;
  service_name?: string;
  base_price_override?: number;
  price_per_minute_override?: number;
  is_active: boolean;
  notes?: string;
  has_overrides?: boolean;
  effective_base_price?: number;
  created_at?: string;
  updated_at?: string;
}

export interface EffectivePricing {
  base_price: number;
  formatted_price: string;
  currency: string;
  has_location_override: boolean;
  location_id?: number;
}

export interface LocationWithPricing {
  id: number;
  name: string;
  address: string;
  city: string;
  is_primary: boolean;
  effective_pricing?: EffectivePricing;
}

export interface CreateLocationPricingData {
  location: number;
  service: number;
  base_price_override?: number;
  price_per_minute_override?: number;
  is_active?: boolean;
  notes?: string;
}

export interface BulkLocationPricingData {
  pricing_overrides: CreateLocationPricingData[];
}
