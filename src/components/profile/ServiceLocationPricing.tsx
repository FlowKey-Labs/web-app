import { useState, useMemo } from 'react';
import {
  Stack,
  Text,
  Group,
  Button,
  NumberInput,
  Switch,
  Textarea,
  Card,
  Badge,
  ActionIcon,
  Collapse,
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconMapPin,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import {
  useLocationPricing,
  useCreateLocationPricing,
  useUpdateLocationPricing,
  useDeleteLocationPricing,
} from '../../hooks/useLocationPricing';
import { useGetLocations } from '../../hooks/reactQuery';
import { LocationServicePricing, CreateLocationPricingData } from '../../types/locationPricing';
import { notifications } from '@mantine/notifications';

interface ServiceLocationPricingProps {
  serviceId: number;
  serviceName: string;
  basePrice: number;
  pricePerMinute?: number;
}

export function ServiceLocationPricing({ 
  serviceId, 
  basePrice, 
  pricePerMinute 
}: ServiceLocationPricingProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingOverride, setIsAddingOverride] = useState(false);
  const [editingOverride, setEditingOverride] = useState<LocationServicePricing | null>(null);
  const [formData, setFormData] = useState<Partial<CreateLocationPricingData>>({
    location: undefined,
    service: serviceId,
    base_price_override: undefined,
    price_per_minute_override: undefined,
    is_active: true,
    notes: '',
  });

  const { data: allLocationPricing = [], refetch } = useLocationPricing();
  const { data: locations = [] } = useGetLocations();
  

  const createMutation = useCreateLocationPricing();
  const updateMutation = useUpdateLocationPricing();
  const deleteMutation = useDeleteLocationPricing();
  // Use Mantine notifications directly with fallback
  const showNotification = (type: 'success' | 'error', message: string) => {
    try {
      notifications.show({
        title: type === 'success' ? 'Success' : 'Error',
        message,
        color: type === 'success' ? 'green' : 'red',
      });
    } catch (error) {
      // Fallback to alert if notifications fail
      alert(`${type.toUpperCase()}: ${message}`);
    }
  };

  // Filter pricing overrides for this specific service
  const servicePricingOverrides = allLocationPricing.filter(
    (pricing) => pricing.service === serviceId
  );
  




  const handleAddOverride = () => {
    setEditingOverride(null);
    const newFormData = {
      location: undefined,
      service: serviceId,
      base_price_override: undefined,
      price_per_minute_override: undefined,
      is_active: true,
      notes: '',
    };
    setFormData(newFormData);
    setIsAddingOverride(true);
  };

  const handleEditOverride = (pricing: LocationServicePricing) => {
    setEditingOverride(pricing);
    setFormData({
      location: pricing.location,
      service: pricing.service,
      base_price_override: pricing.base_price_override,
      price_per_minute_override: pricing.price_per_minute_override,
      is_active: pricing.is_active,
      notes: pricing.notes || '',
    });
    setIsAddingOverride(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.location) {
        showNotification('error', 'Please select a location');
        return;
      }

      if (!formData.base_price_override && !formData.price_per_minute_override) {
        showNotification('error', 'Please provide at least one pricing override');
        return;
      }

      const submitData: CreateLocationPricingData = {
        location: formData.location,
        service: serviceId,
        base_price_override: formData.base_price_override,
        price_per_minute_override: formData.price_per_minute_override,
        is_active: formData.is_active ?? true,
        notes: formData.notes,
      };

      if (editingOverride) {
        await updateMutation.mutateAsync({ id: editingOverride.id!, data: submitData });
        showNotification('success', 'Pricing override updated successfully');
      } else {
        await createMutation.mutateAsync(submitData);
        showNotification('success', 'Pricing override created successfully');
      }

      setIsAddingOverride(false);
      refetch();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          error?.message || 
                          'Unknown error occurred';
      
      showNotification('error', `Failed to save pricing override: ${errorMessage}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this pricing override?')) {
      try {
        await deleteMutation.mutateAsync(id);
        showNotification('success', 'Pricing override deleted successfully');
        refetch();
      } catch (error) {
        showNotification('error', 'Failed to delete pricing override');
      }
    }
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return 'Not set';
    return `KSH ${price.toLocaleString()}`;
  };

  const getLocationName = (locationId: number) => {
    if (!locations || !Array.isArray(locations)) {
      return 'Loading...';
    }
    const location = locations.find((l: any) => l.id === locationId);
    return location?.name || `Location ${locationId}`;
  };

  const getAvailableLocations = () => {
    if (!locations || !Array.isArray(locations)) {
      return [];
    }


    
    // Ensure locations have the expected structure
    const validLocations = locations.filter(loc => loc && loc.id && loc.name);
    
    // Show all valid locations (can be refined later to exclude used ones)
    const availableLocations = validLocations;
    return availableLocations;
  };

  // Pre-build dropdown data (like working implementation)
  const dropdownData = useMemo(() => {
    const availableLocations = getAvailableLocations();
    
    if (availableLocations.length === 0) {
      return [];
    }
    
    const mappedData = availableLocations.map((location: any) => {
      const mappedItem = {
        value: location.id.toString(),
        label: `${location.name}${location.city ? ` - ${location.city}` : ''}${location.address ? ` (${location.address})` : ''}`,
      };
      return mappedItem;
    });
    
    return mappedData;
  }, [locations, servicePricingOverrides]);

  return (
    <Card withBorder p="md" mt="md">
      <Group justify="space-between" mb="sm">
        <Group>
          <IconMapPin size={16} />
          <Text fw={500}>Location-Specific Pricing</Text>
          <Badge variant="light" color="blue" size="sm">
            {servicePricingOverrides.length} override{servicePricingOverrides.length !== 1 ? 's' : ''}
          </Badge>
        </Group>
        <ActionIcon
          variant="subtle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </ActionIcon>
      </Group>

      <Text size="sm" c="dimmed" mb="md">
        Set different prices for this service at different locations
      </Text>

      <Collapse in={isExpanded}>
        <Stack gap="md">
          {/* Current Base Pricing Info */}
          <Card withBorder p="sm" bg="gray.0">
            <Text size="sm">
              <strong>Default pricing:</strong> Base: {formatPrice(basePrice)}
              {pricePerMinute && `, Per minute: ${formatPrice(pricePerMinute)}`}
            </Text>
          </Card>

          {/* Existing Overrides */}
          {servicePricingOverrides.length > 0 && (
            <Stack gap="xs">
              <Text size="sm" fw={500}>Active Location Overrides:</Text>
              {servicePricingOverrides.map((pricing) => (
                <Card key={pricing.id} withBorder p="sm" bg="blue.0">
                  <Group justify="space-between">
                    <div>
                      <Group gap="xs" mb="xs">
                        <IconMapPin size={14} />
                        <Text size="sm" fw={500}>{getLocationName(pricing.location)}</Text>
                        <Badge
                          color={pricing.is_active ? 'green' : 'gray'}
                          size="xs"
                        >
                          {pricing.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </Group>
                      <Text size="xs" c="dimmed">
                        Base: {formatPrice(pricing.base_price_override)}
                        {pricing.price_per_minute_override && 
                          `, Per minute: ${formatPrice(pricing.price_per_minute_override)}`
                        }
                      </Text>
                      {pricing.notes && (
                        <Text size="xs" c="dimmed" mt="xs">
                          Note: {pricing.notes}
                        </Text>
                      )}
                    </div>
                    <Group gap="xs">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => handleEditOverride(pricing)}
                      >
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(pricing.id!)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}



          {/* Add New Override Form */}
          {isAddingOverride ? (
            <Card withBorder p="md" bg="green.0">
              <Stack gap="md">
                <Text size="sm" fw={500}>
                  {editingOverride ? 'Edit' : 'Add'} Location Pricing Override
                </Text>

                {/* Native HTML Select - 100% Reliable */}
                <div>
                  <Text size="sm" fw={500} mb={5}>
                    Location <span style={{color: 'red'}}>*</span>
                  </Text>
                  <select
                    value={formData.location?.toString() || ''}
                    onChange={(e) => {
                      const newLocation = e.target.value ? parseInt(e.target.value) : undefined;
                      setFormData({ 
                        ...formData, 
                        location: newLocation 
                      });
                    }}
                    required
                    disabled={!!editingOverride}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#228be6';
                      e.target.style.boxShadow = '0 0 0 1px #228be6';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ced4da';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Select a location</option>
                    {dropdownData.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Group grow>
                  <NumberInput
                    label="Base Price Override"
                    placeholder={`Default: ${formatPrice(basePrice)}`}
                    value={formData.base_price_override}
                    onChange={(value) => setFormData({ 
                      ...formData, 
                      base_price_override: typeof value === 'number' ? value : undefined 
                    })}
                    min={0}
                    step={0.01}
                    prefix="KSH "
                  />

                  <NumberInput
                    label="Per-Minute Override"
                    placeholder={pricePerMinute ? `Default: ${formatPrice(pricePerMinute)}` : 'Not set'}
                    value={formData.price_per_minute_override}
                    onChange={(value) => setFormData({ 
                      ...formData, 
                      price_per_minute_override: typeof value === 'number' ? value : undefined 
                    })}
                    min={0}
                    step={0.01}
                    prefix="KSH "
                  />
                </Group>

                <Switch
                  label="Active"
                  description="Inactive overrides will not be applied"
                  checked={formData.is_active}
                  onChange={(event) => setFormData({ 
                    ...formData, 
                    is_active: event.currentTarget.checked 
                  })}
                />

                <Textarea
                  label="Notes"
                  placeholder="Optional notes about this pricing override"
                  value={formData.notes}
                  onChange={(event) => setFormData({ 
                    ...formData, 
                    notes: event.currentTarget.value 
                  })}
                  rows={2}
                />

                <Group justify="flex-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingOverride(false)}
                  >
                    Cancel
                  </Button>
                                          <Button
                          onClick={handleSubmit}
                          loading={createMutation.isPending || updateMutation.isPending}
                        >
                          {editingOverride ? 'Update' : 'Create'} Override
                        </Button>
                </Group>
              </Stack>
            </Card>
          ) : (
            <Button
              leftSection={<IconPlus size={16} />}
              variant="light"
              onClick={handleAddOverride}
              disabled={dropdownData.length === 0}
            >
              {dropdownData.length === 0 
                ? 'All locations have overrides' 
                : 'Add Location Override'
              }
            </Button>
          )}

          {servicePricingOverrides.length === 0 && !isAddingOverride && (
            <Card withBorder p="sm" bg="blue.0">
              <Text size="sm">
                This service uses the same price at all locations. Add location overrides to set different prices.
              </Text>
            </Card>
          )}
        </Stack>
      </Collapse>
    </Card>
  );
}
