import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Label } from '../common/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { Switch } from '../common/Switch';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { AlertCircle } from 'lucide-react';
import { useLocations } from '../../hooks/reactQuery';
import { useServices } from '../../hooks/useServices';
import { useEffectivePricing } from '../../hooks/useLocationPricing';
import { LocationServicePricing, CreateLocationPricingData } from '../../types/locationPricing';

interface LocationPricingFormProps {
  initialData?: LocationServicePricing;
  onSubmit: (data: CreateLocationPricingData | Partial<CreateLocationPricingData>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LocationPricingForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: LocationPricingFormProps) {
  const [formData, setFormData] = useState<CreateLocationPricingData>({
    location: initialData?.location || 0,
    service: initialData?.service || 0,
    base_price_override: initialData?.base_price_override,
    price_per_minute_override: initialData?.price_per_minute_override,
    is_active: initialData?.is_active ?? true,
    notes: initialData?.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: locations = [] } = useLocations();
  const { data: services = [] } = useServices();

  // Get effective pricing preview when service and location are selected
  const { data: effectivePricing } = useEffectivePricing(
    formData.service || undefined,
    formData.location || undefined
  );

  const selectedService = services.find((s) => s.id === formData.service);

  useEffect(() => {
    setErrors({});
  }, [formData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    if (!formData.service) {
      newErrors.service = 'Service is required';
    }

    if (
      formData.base_price_override !== undefined &&
      formData.base_price_override !== null &&
      formData.base_price_override < 0
    ) {
      newErrors.base_price_override = 'Base price override cannot be negative';
    }

    if (
      formData.price_per_minute_override !== undefined &&
      formData.price_per_minute_override !== null &&
      formData.price_per_minute_override < 0
    ) {
      newErrors.price_per_minute_override = 'Per-minute price override cannot be negative';
    }

    // Check if at least one override is provided
    const hasBaseOverride = formData.base_price_override !== undefined && formData.base_price_override !== null;
    const hasPerMinuteOverride = formData.price_per_minute_override !== undefined && formData.price_per_minute_override !== null;
    
    if (!hasBaseOverride && !hasPerMinuteOverride) {
      newErrors.general = 'Please provide at least one pricing override (base price or per-minute rate)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Clean up the data - remove empty values
    const cleanData = {
      ...formData,
      base_price_override: formData.base_price_override || undefined,
      price_per_minute_override: formData.price_per_minute_override || undefined,
      notes: formData.notes || undefined,
    };

    onSubmit(cleanData);
  };

  const handleInputChange = (field: keyof CreateLocationPricingData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return 'Not set';
    return `KSH ${price.toLocaleString()}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
          <span className="text-sm text-red-700">{errors.general}</span>
        </div>
      )}

      {/* Location Selection */}
      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Select
          value={formData.location?.toString()}
          onValueChange={(value) => handleInputChange('location', parseInt(value))}
        >
          <SelectTrigger className={errors.location ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id.toString()}>
                {location.name} - {location.city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
      </div>

      {/* Service Selection */}
      <div className="space-y-2">
        <Label htmlFor="service">Service *</Label>
        <Select
          value={formData.service?.toString()}
          onValueChange={(value) => handleInputChange('service', parseInt(value))}
        >
          <SelectTrigger className={errors.service ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id.toString()}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.service && <p className="text-sm text-red-600">{errors.service}</p>}
      </div>

      {/* Service Details Preview */}
      {selectedService && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Current Service Pricing</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Base Price:</span>
                <div className="font-medium">{formatPrice(selectedService.base_price)}</div>
              </div>
              <div>
                <span className="text-gray-600">Per Minute:</span>
                <div className="font-medium">{formatPrice(selectedService.price_per_minute)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Base Price Override */}
      <div className="space-y-2">
        <Label htmlFor="base_price_override">Base Price Override</Label>
        <Input
          id="base_price_override"
          type="number"
          step="0.01"
          min="0"
          placeholder="Leave blank to use service price"
          value={formData.base_price_override || ''}
          onChange={(e) => handleInputChange('base_price_override', parseFloat(e.target.value) || undefined)}
          className={errors.base_price_override ? 'border-red-500' : ''}
        />
        {errors.base_price_override && (
          <p className="text-sm text-red-600">{errors.base_price_override}</p>
        )}
        <p className="text-xs text-gray-500">
          Override the base price for this service at this location
        </p>
      </div>

      {/* Per Minute Price Override */}
      <div className="space-y-2">
        <Label htmlFor="price_per_minute_override">Per-Minute Price Override</Label>
        <Input
          id="price_per_minute_override"
          type="number"
          step="0.01"
          min="0"
          placeholder="Leave blank to use service rate"
          value={formData.price_per_minute_override || ''}
          onChange={(e) => handleInputChange('price_per_minute_override', parseFloat(e.target.value) || undefined)}
          className={errors.price_per_minute_override ? 'border-red-500' : ''}
        />
        {errors.price_per_minute_override && (
          <p className="text-sm text-red-600">{errors.price_per_minute_override}</p>
        )}
        <p className="text-xs text-gray-500">
          Override the per-minute rate for variable duration services
        </p>
      </div>

      {/* Effective Pricing Preview */}
      {effectivePricing && (formData.base_price_override || formData.price_per_minute_override) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm text-blue-800">Preview: Effective Pricing</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-sm text-blue-700">
              <div className="font-medium">{effectivePricing.formatted_price}</div>
              {effectivePricing.has_location_override && (
                <div className="text-xs">✓ Location override applied</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Optional notes about this pricing override..."
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
        />
      </div>

      {/* Active Status */}
      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => handleInputChange('is_active', checked)}
        />
        <Label htmlFor="is_active">Active</Label>
        <span className="text-sm text-gray-500">
          (Inactive overrides will not be applied to pricing calculations)
        </span>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Override' : 'Create Override'}
        </Button>
      </div>
    </form>
  );
}
