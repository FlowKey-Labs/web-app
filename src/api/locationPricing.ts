import { api } from '../lib/axios';
import {
  LocationServicePricing,
  CreateLocationPricingData,
  BulkLocationPricingData,
  EffectivePricing,
} from '../types/locationPricing';

// Location Pricing CRUD Operations
export const getLocationPricing = async (): Promise<LocationServicePricing[]> => {
  const { data } = await api.get('/api/session/location-pricing/');
  return data.results || data;
};

export const createLocationPricing = async (
  data: CreateLocationPricingData
): Promise<LocationServicePricing> => {
  const { data: response } = await api.post('/api/session/location-pricing/', data);
  return response;
};

export const updateLocationPricing = async (
  id: number,
  data: Partial<CreateLocationPricingData>
): Promise<LocationServicePricing> => {
  const { data: response } = await api.patch(`/api/session/location-pricing/${id}/`, data);
  return response;
};

export const deleteLocationPricing = async (id: number): Promise<void> => {
  await api.delete(`/api/session/location-pricing/${id}/`);
};

// Get pricing overrides by location
export const getLocationPricingByLocation = async (
  locationId: number
): Promise<{
  location: { id: number; name: string };
  pricing_overrides: LocationServicePricing[];
  count: number;
}> => {
  const { data } = await api.get(
    `/api/session/location-pricing/by_location/?location_id=${locationId}`
  );
  return data;
};

// Get pricing overrides by service
export const getLocationPricingByService = async (
  serviceId: number
): Promise<{
  service: { id: number; name: string };
  pricing_overrides: LocationServicePricing[];
  count: number;
}> => {
  const { data } = await api.get(
    `/api/session/location-pricing/by_service/?service_id=${serviceId}`
  );
  return data;
};

// Bulk create pricing overrides
export const bulkCreateLocationPricing = async (
  data: BulkLocationPricingData
): Promise<{
  created: LocationServicePricing[];
  errors: any[];
  created_count: number;
  error_count: number;
}> => {
  const { data: response } = await api.post(
    '/api/session/location-pricing/bulk_create/',
    data
  );
  return response;
};

// Get effective pricing for a service at a location
export const getEffectivePricing = async (
  serviceId: number,
  locationId?: number
): Promise<EffectivePricing> => {
  const params = new URLSearchParams({ service_id: serviceId.toString() });
  if (locationId) {
    params.append('location_id', locationId.toString());
  }
  
  const { data } = await api.get(
    `/api/session/location-pricing/effective_pricing/?${params.toString()}`
  );
  return data;
};
