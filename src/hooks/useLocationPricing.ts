import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLocationPricing,
  createLocationPricing,
  updateLocationPricing,
  deleteLocationPricing,
  getLocationPricingByLocation,
  getLocationPricingByService,
  bulkCreateLocationPricing,
  getEffectivePricing,
} from '../api/locationPricing';
import {
  LocationServicePricing,
  CreateLocationPricingData,
  BulkLocationPricingData,
} from '../types/locationPricing';
import { useNotification } from './useNotification';

// Get all location pricing overrides
export const useLocationPricing = () => {
  return useQuery({
    queryKey: ['location-pricing'],
    queryFn: getLocationPricing,
  });
};

// Get location pricing overrides by location
export const useLocationPricingByLocation = (locationId?: number) => {
  return useQuery({
    queryKey: ['location-pricing', 'by-location', locationId],
    queryFn: () => getLocationPricingByLocation(locationId!),
    enabled: !!locationId,
  });
};

// Get location pricing overrides by service
export const useLocationPricingByService = (serviceId?: number) => {
  return useQuery({
    queryKey: ['location-pricing', 'by-service', serviceId],
    queryFn: () => getLocationPricingByService(serviceId!),
    enabled: !!serviceId,
  });
};

// Get effective pricing for a service
export const useEffectivePricing = (serviceId?: number, locationId?: number) => {
  return useQuery({
    queryKey: ['effective-pricing', serviceId, locationId],
    queryFn: () => getEffectivePricing(serviceId!, locationId),
    enabled: !!serviceId,
  });
};

// Create location pricing override
export const useCreateLocationPricing = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: createLocationPricing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['location-pricing'] });
      showNotification('success', 'Pricing override created successfully');
    },
    onError: (error: any) => {
      showNotification('error', error.response?.data?.message || 'Failed to create pricing override');
    },
  });
};

// Update location pricing override
export const useUpdateLocationPricing = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateLocationPricingData> }) =>
      updateLocationPricing(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['location-pricing'] });
      showNotification('success', 'Pricing override updated successfully');
    },
    onError: (error: any) => {
      showNotification('error', error.response?.data?.message || 'Failed to update pricing override');
    },
  });
};

// Delete location pricing override
export const useDeleteLocationPricing = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: deleteLocationPricing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['location-pricing'] });
      showNotification('success', 'Pricing override deleted successfully');
    },
    onError: (error: any) => {
      showNotification('error', error.response?.data?.message || 'Failed to delete pricing override');
    },
  });
};

// Bulk create location pricing overrides
export const useBulkCreateLocationPricing = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: bulkCreateLocationPricing,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['location-pricing'] });
      const { created_count, error_count } = data;
      
      if (error_count === 0) {
        showNotification('success', `Successfully created ${created_count} pricing overrides`);
      } else {
        showNotification(
          'warning',
          `Created ${created_count} pricing overrides, ${error_count} failed`
        );
      }
    },
    onError: (error: any) => {
      showNotification('error', error.response?.data?.message || 'Failed to create pricing overrides');
    },
  });
};
