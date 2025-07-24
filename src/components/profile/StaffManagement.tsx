import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Card, 
  Badge, 
  Button, 
  Select, 
  Modal, 
  Text, 
  Group, 
  Stack, 
  Loader, 
  NumberInput, 
  ActionIcon, 
  Divider, 
  Paper, 
  Title, 
  ScrollArea,
  Flex,
  Chip
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm, Controller } from 'react-hook-form';
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconClock, 
  IconMapPin, 
  IconUser, 
  IconStar,
  IconSettings,
  IconCoins,
  IconCalendar
} from '@tabler/icons-react';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';
import { 
  useGetStaff, 
  useGetSessionCategories, 
  useGetBusinessLocations,
  useGetStaffServiceCompetencies,
  useGetStaffLocationAssignments,
  useCreateStaffServiceCompetency,
  useUpdateStaffServiceCompetency,
  useDeleteStaffServiceCompetency,
  useCreateStaffLocationAssignment,
  useDeleteStaffLocationAssignment,
  useGetSessionSubCategories,
  useGetBusinessProfile
} from '../../hooks/reactQuery';
import { StaffServiceCompetency, StaffLocationAssignment, SubCategory, formatDuration, calculateServicePrice } from '../../types/sessionTypes';
import { formatCurrency, getCurrencyPlaceholder } from '../../utils/stringUtils';
import LocationAvailabilityManagement from './LocationAvailabilityManagement';

// Enhanced types for staff management
interface Staff {
  id: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  role?: {
    name: string;
  };
  isActive: boolean;
}

interface EnhancedStaffServiceCompetency extends StaffServiceCompetency {
  service?: SubCategory;
}

// Compact Staff Card Component with Avatar Initials
const StaffCard: React.FC<{
  staff: Staff;
  isSelected: boolean;
  onClick: () => void;
  competenciesCount: number;
  locationsCount: number;
}> = ({ staff, isSelected, onClick, competenciesCount, locationsCount }) => {
  const initials = `${staff.user.first_name?.[0] || ''}${staff.user.last_name?.[0] || ''}`.toUpperCase();
  const fullName = `${staff.user.first_name} ${staff.user.last_name}`.trim();

  return (
    <Card
      className={`staff-card cursor-pointer transition-all duration-300 relative ${
        isSelected 
          ? 'ring-2 ring-green-500 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 shadow-xl border-l-4 border-l-green-500' 
          : 'hover:bg-gray-50 hover:ring-1 hover:ring-green-300 hover:shadow-md'
      }`}
      onClick={onClick}
      p="lg"
      radius="lg"
      withBorder
    >
      <Group gap="sm" wrap="nowrap">
        <div 
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-md ${
            isSelected 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white ring-2 ring-green-200' 
              : 'bg-gradient-to-br from-gray-500 to-gray-600 text-white hover:from-green-400 hover:to-green-500'
          }`}
        >
          {initials}
        </div>
        
        <div className="flex-1 min-w-0">
          <Flex justify="space-between" align="flex-start">
            <div className="flex-1 min-w-0">
              <Text 
                size="sm" 
                fw={600} 
                className={`truncate ${isSelected ? 'text-green-800' : 'text-gray-900'}`}
                title={fullName || 'Unnamed Staff'}
              >
                {fullName || 'Unnamed Staff'}
              </Text>
              <Text 
                size="xs" 
                c="dimmed" 
                className="truncate"
                title={staff.user.email}
              >
                {staff.user.email}
              </Text>
            </div>
            
            <Badge 
              color={staff.isActive ? (isSelected ? 'green' : 'green') : 'gray'} 
              variant={isSelected ? 'filled' : 'light'} 
              size="xs"
              className="shrink-0 ml-2"
            >
              {staff.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </Flex>
        </div>
      </Group>
      
      <Group gap="xs" mt="sm">
        <Chip 
          size="xs" 
          variant={isSelected ? 'filled' : 'light'}
          color={isSelected ? 'green' : 'gray'}
          className="transition-colors duration-300"
        >
          <Group gap={4}>
            <IconStar size={12} />
            <span>{competenciesCount} Services</span>
          </Group>
        </Chip>
        <Chip 
          size="xs" 
          variant={isSelected ? 'filled' : 'light'}
          color={isSelected ? 'emerald' : 'gray'}
          className="transition-colors duration-300"
        >
          <Group gap={4}>
            <IconMapPin size={12} />
            <span>{locationsCount} Locations</span>
          </Group>
        </Chip>
      </Group>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
        </div>
      )}
    </Card>
  );
};

// Enhanced Service Item Component with hierarchy
const ServiceItemCard: React.FC<{
  competency: EnhancedStaffServiceCompetency;
  onEdit: () => void;
  onDelete: () => void;
  businessProfile?: { currency?: string; currency_symbol?: string };
}> = ({ competency, onEdit, onDelete, businessProfile }) => {
  const service = competency.service;
  const pricing = service ? calculateServicePrice(service, undefined, businessProfile) : null;

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'master': return 'purple';
      case 'expert': return 'green';
      case 'competent': return 'blue';
      default: return 'gray';
    }
  };

  const getSkillLevelIcon = (level: string) => {
    switch (level) {
      case 'master': return '👑';
      case 'expert': return '⭐';
      case 'competent': return '✓';
      default: return '📚';
    }
  };

  return (
    <Paper withBorder p="md" radius="md" className="hover:shadow-sm transition-shadow">
      <Flex justify="space-between" align="flex-start" mb="sm">
        <div className="flex-1">
          <Group gap="xs" mb={4}>
            <Text fw={600} size="sm" className="text-gray-900">
              {competency.subcategory_name}
            </Text>
            <Badge 
              variant="light" 
              color={getSkillLevelColor(competency.skill_level)}
              size="xs"
              leftSection={getSkillLevelIcon(competency.skill_level)}
            >
              {competency.skill_level}
            </Badge>
          </Group>
          <Text size="xs" c="dimmed" mb="xs">
            {competency.category_name}
          </Text>
          
          {service && (
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <IconCoins size={14} className="text-green-600" />
                <span className="font-medium">{pricing?.formattedPrice}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <IconClock size={14} className="text-blue-600" />
                <span>{formatDuration(service.default_duration || 60)}</span>
              </div>
              {service.min_duration && service.max_duration && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <IconCalendar size={14} className="text-purple-600" />
                  <span>{service.min_duration}-{service.max_duration}min</span>
                </div>
              )}
              {competency.hourly_rate && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <IconUser size={14} className="text-orange-600" />
                  <span>{formatCurrency(competency.hourly_rate, businessProfile?.currency, businessProfile?.currency_symbol)}/hr</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <Group gap="xs" ml="md">
          <ActionIcon 
            variant="light" 
            color="blue" 
            size="sm" 
            onClick={onEdit}
            title="Edit Competency"
          >
            <IconEdit size={14} />
          </ActionIcon>
          <ActionIcon 
            variant="light" 
            color="red" 
            size="sm" 
            onClick={onDelete}
            title="Remove Competency"
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      </Flex>

      {service?.description && (
        <Text size="xs" c="dimmed" lineClamp={2} mt="xs">
          {service.description}
        </Text>
      )}
    </Paper>
  );
};

// Compact Location Assignment Card
const LocationCard: React.FC<{
  assignment: StaffLocationAssignment;
  onDelete: () => void;
}> = ({ assignment, onDelete }) => (
  <Paper withBorder p="sm" radius="md" className="hover:shadow-sm transition-shadow">
    <Flex justify="space-between" align="center">
      <div className="flex-1">
        <Group gap="xs">
          <Text fw={500} size="sm">
            {assignment.location_name}
          </Text>
          {assignment.is_primary && (
            <Badge color="green" variant="light" size="xs">
              Primary
            </Badge>
          )}
        </Group>
        {assignment.location_address && (
          <Text size="xs" c="dimmed" lineClamp={1}>
            {assignment.location_address}
          </Text>
        )}
      </div>
      <ActionIcon 
        variant="light" 
        color="red" 
        size="sm" 
        onClick={onDelete}
        title="Remove Location"
        ml="md"
      >
        <IconTrash size={14} />
      </ActionIcon>
    </Flex>
  </Paper>
);

// Improved Empty State Component
const EmptyState: React.FC<{ 
  title: string; 
  description: string; 
  actionLabel?: string; 
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({ title, description, actionLabel, onAction, icon }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6">
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
      <div className="text-gray-400">
        {icon || <IconUser size={32} />}
      </div>
    </div>
    <Text size="lg" fw={600} className="text-gray-700 mb-3 text-center">
      {title}
    </Text>
    <Text size="sm" c="dimmed" className="max-w-sm mx-auto text-center leading-relaxed mb-6">
      {description}
    </Text>
    {actionLabel && onAction && (
      <Button variant="light" size="sm" onClick={onAction} radius="md">
        {actionLabel}
      </Button>
    )}
  </div>
);

const StaffManagement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const selectedStaffId = searchParams.get('staff');
  const [selectedStaff, setSelectedStaff] = useState<number | null>(selectedStaffId ? parseInt(selectedStaffId) : null);
  const [activeTab, setActiveTab] = useState<'services' | 'locations' | 'availability'>('services');
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [editingCompetency, setEditingCompetency] = useState<EnhancedStaffServiceCompetency | null>(null);

  // Data fetching with forced refresh
  const { data: staff = [], isLoading: staffLoading } = useGetStaff();
  const { data: categories = [], isLoading: categoriesLoading } = useGetSessionCategories();
  const { data: subcategories = [], isLoading: subcategoriesLoading } = useGetSessionSubCategories();
  const { data: locations = [], isLoading: locationsLoading } = useGetBusinessLocations();
  const { data: competencies = [], refetch: refetchCompetencies } = useGetStaffServiceCompetencies();
  const { data: locationAssignments = [], refetch: refetchLocations } = useGetStaffLocationAssignments();
  const { data: businessProfile } = useGetBusinessProfile();

  // Mutations
  const createCompetencyMutation = useCreateStaffServiceCompetency();
  const updateCompetencyMutation = useUpdateStaffServiceCompetency();
  const deleteCompetencyMutation = useDeleteStaffServiceCompetency();
  const createLocationAssignment = useCreateStaffLocationAssignment();
  const deleteLocationAssignment = useDeleteStaffLocationAssignment();

  // Forms
  const { control, handleSubmit, reset, setValue, watch } = useForm();
  const { control: locationControl, handleSubmit: handleLocationSubmit, reset: resetLocation } = useForm();

  // Enhanced data with service details
  const enhancedCompetencies = useMemo(() => {
    return competencies.map((comp: StaffServiceCompetency) => ({
      ...comp,
      service: subcategories.find((sub: SubCategory) => sub.id === comp.subcategory)
    })) as EnhancedStaffServiceCompetency[];
  }, [competencies, subcategories]);

  // Filter data by selected staff
  const staffCompetencies = enhancedCompetencies.filter((comp: EnhancedStaffServiceCompetency) => 
    Number(comp.staff) === Number(selectedStaff)
  );
  
  const staffLocationAssignments = locationAssignments.filter((assignment: StaffLocationAssignment) => 
    Number(assignment.staff) === Number(selectedStaff)
  );

  // Get counts for staff cards
  const getStaffCounts = (staffId: number) => {
    const competenciesCount = enhancedCompetencies.filter((comp: EnhancedStaffServiceCompetency) => Number(comp.staff) === Number(staffId)).length;
    const locationsCount = locationAssignments.filter((assign: StaffLocationAssignment) => Number(assign.staff) === Number(staffId)).length;
    return { competenciesCount, locationsCount };
  };

  // Get services filtered by category
  const servicesInCategory = useMemo(() => {
    const selectedCategory = watch('category');
    if (!selectedCategory) return [];
    return subcategories.filter((sub: SubCategory) => 
      sub.category === selectedCategory && sub.is_service
    );
  }, [subcategories, watch('category')]);

  // Handle staff selection
  useEffect(() => {
    if (selectedStaffId && !selectedStaff) {
      setSelectedStaff(parseInt(selectedStaffId));
    }
  }, [selectedStaffId, selectedStaff]);

  // Handle service competency creation/update with immediate UI updates
  const onSubmitService = async (formData: {
    service: number;
    skillLevel: string;
    hourlyRate?: number;
  }) => {
    if (!selectedStaff) return;

    try {
      const payload = {
        staff: selectedStaff,
        subcategory: formData.service,
        skill_level: formData.skillLevel,
        hourly_rate: formData.hourlyRate || null,
        is_active: true,
      };

      if (editingCompetency) {
        // Update existing competency
        await updateCompetencyMutation.mutateAsync({
          id: editingCompetency.id,
          ...payload,
        });
        
        notifications.show({
          title: 'Success',
          message: 'Staff service competency updated successfully',
          color: 'green',
          icon: <img src={successIcon} alt="Success" className="w-4 h-4" />,
        });
      } else {
        // Create new competency
        await createCompetencyMutation.mutateAsync(payload);
        
        notifications.show({
          title: 'Success',
          message: 'Staff service competency added successfully',
          color: 'green',
          icon: <img src={successIcon} alt="Success" className="w-4 h-4" />,
        });
      }

      // Force refresh data immediately
      await refetchCompetencies();
      
      // Close modal and reset form
      setServiceModalOpen(false);
      setEditingCompetency(null);
      reset();
      
    } catch (error: any) {
      console.error('Error managing staff competency:', error);
      
      let errorMessage = 'Failed to save staff service competency';
      
      if (error?.response?.data?.non_field_errors) {
        const errors = error.response.data.non_field_errors;
        if (errors.some((e: string) => e.includes('unique set'))) {
          errorMessage = 'This staff member is already assigned to this service. Please update the existing assignment instead.';
        }
      } else if (error?.response?.data) {
        const fieldErrors = Object.entries(error.response.data)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        errorMessage = fieldErrors || errorMessage;
      }

      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
        icon: <img src={errorIcon} alt="Error" className="w-4 h-4" />,
      });
    }
  };

  // Handle location assignment creation
  const onSubmitLocation = async (data: any) => {
    try {
      await createLocationAssignment.mutateAsync({
        staff: selectedStaff,
        location: data.location,
        is_primary: data.is_primary || false,
        is_active: true
      });

      notifications.show({
        title: 'Success',
        message: 'Location assigned successfully',
        color: 'green'
      });

      // Force refresh data
      await refetchLocations();

      setLocationModalOpen(false);
      resetLocation();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to assign location',
        color: 'red'
      });
    }
  };

  // Handle competency deletion
  const handleDeleteCompetency = async (competency: EnhancedStaffServiceCompetency) => {
    try {
      await deleteCompetencyMutation.mutateAsync(competency.id);
      notifications.show({
        title: 'Success',
        message: 'Service competency removed successfully',
        color: 'green'
      });
      
      // Force refresh data
      await refetchCompetencies();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to remove service competency',
        color: 'red'
      });
    }
  };

  // Handle location assignment deletion
  const handleDeleteLocationAssignment = async (assignment: StaffLocationAssignment) => {
    try {
      await deleteLocationAssignment.mutateAsync(assignment.id);
      notifications.show({
        title: 'Success',
        message: 'Location assignment removed successfully',
        color: 'green'
      });
      await refetchLocations();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to remove location assignment',
        color: 'red'
      });
    }
  };

  // Handle edit competency with proper form population
  const handleEditCompetency = (competency: EnhancedStaffServiceCompetency) => {
    setEditingCompetency(competency);
    
    // Reset form with current values immediately
    const formValues = {
      category: competency.service?.category || null,
      service: competency.subcategory || null,
      skillLevel: competency.skill_level || null,
      hourlyRate: competency.hourly_rate ? parseFloat(competency.hourly_rate) : null,
    };
    
    reset(formValues);
    setServiceModalOpen(true);
  };

  if (staffLoading || categoriesLoading || subcategoriesLoading || locationsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  const selectedStaffMember = staff.find(s => s.id === selectedStaff);

  return (
    <div className="staff-management space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <Title order={2} className="text-gray-900">Staff Management</Title>
          <Text c="dimmed" size="sm">
            Manage staff service assignments and location access
          </Text>
        </div>
      </div>

      {/* Mobile-first responsive layout with independent scrolling */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-200px)]">
        {/* Staff List - Full width on mobile, 2 columns on desktop */}
        <div className="lg:col-span-2">
          <Card withBorder className="h-full flex flex-col">
            <Group justify="space-between" mb="md">
              <Text fw={600} className="text-gray-800">Staff Members</Text>
              <Badge variant="gradient" gradient={{ from: 'green', to: 'emerald' }}>
                {staff.length}
              </Badge>
            </Group>
            <Divider mb="md" />
            
            {staff.length === 0 ? (
              <EmptyState
                title="No Staff Members"
                description="Add staff members to manage their service assignments"
                icon={<IconUser size={40} />}
              />
            ) : (
              <ScrollArea className="flex-1" offsetScrollbars>
                <Stack gap="sm">
                  {staff.map((staffMember) => {
                    const counts = getStaffCounts(staffMember.id);
                    return (
                      <StaffCard
                        key={staffMember.id}
                        staff={staffMember}
                        isSelected={selectedStaff === staffMember.id}
                        onClick={() => setSelectedStaff(staffMember.id)}
                        competenciesCount={counts.competenciesCount}
                        locationsCount={counts.locationsCount}
                      />
                    );
                  })}
                </Stack>
              </ScrollArea>
            )}
          </Card>
        </div>

        {/* Staff Details - Full width on mobile, 3 columns on desktop */}
        <div className="lg:col-span-3">
          {!selectedStaff ? (
            <Card withBorder className="h-full">
              <EmptyState
                title="Select a Staff Member"
                description="Choose a staff member from the list to manage their service assignments and location access"
                icon={<IconSettings size={40} />}
              />
            </Card>
          ) : (
            <Card withBorder className="h-full flex flex-col">
              {/* Staff Header */}
              <Group justify="space-between" mb="md">
                <div>
                  <Text fw={600} size="lg">
                    {selectedStaffMember?.user.first_name} {selectedStaffMember?.user.last_name}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedStaffMember?.user.email}
                  </Text>
                </div>
                <Button 
                  leftSection={<IconPlus size={14} />}
                  variant="light"
                  size="sm"
                  onClick={() => {
                    if (activeTab === 'services') {
                      setEditingCompetency(null);
                      reset();
                      setServiceModalOpen(true);
                    } else {
                      resetLocation();
                      setLocationModalOpen(true);
                    }
                  }}
                >
                  Add {activeTab === 'services' ? 'Service' : 'Location'}
                </Button>
              </Group>

              <Divider mb="md" />

                             {/* Compact Tabs */}
               <Group gap="xs" mb="md">
                 <Button 
                   variant={activeTab === 'services' ? 'filled' : 'light'}
                   size="sm" 
                   onClick={() => setActiveTab('services')}
                 >
                   Services ({staffCompetencies.length})
                 </Button>
                 <Button 
                   variant={activeTab === 'locations' ? 'filled' : 'light'}
                   size="sm"
                   onClick={() => setActiveTab('locations')}
                 >
                   Locations ({staffLocationAssignments.length})
                 </Button>
                 <Button 
                   variant={activeTab === 'availability' ? 'filled' : 'light'}
                   size="sm"
                   onClick={() => setActiveTab('availability')}
                 >
                   Availability
                 </Button>
               </Group>

              {/* Tab Content with independent scrolling */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full" offsetScrollbars>
                  {activeTab === 'services' ? (
                    staffCompetencies.length === 0 ? (
                      <EmptyState
                        title="No Service Assignments"
                        description="This staff member hasn't been assigned to any services yet"
                        actionLabel="Add Service"
                        onAction={() => {
                          setEditingCompetency(null);
                          reset();
                          setServiceModalOpen(true);
                        }}
                        icon={<IconStar size={40} />}
                      />
                    ) : (
                      <Stack gap="sm">
                        {staffCompetencies.map((competency) => (
                          <ServiceItemCard
                            key={competency.id}
                            competency={competency}
                            onEdit={() => handleEditCompetency(competency)}
                            onDelete={() => handleDeleteCompetency(competency)}
                            businessProfile={businessProfile}
                          />
                        ))}
                      </Stack>
                    )
                  ) : activeTab === 'locations' ? (
                    staffLocationAssignments.length === 0 ? (
                      <EmptyState
                        title="No Location Assignments"
                        description="This staff member hasn't been assigned to any locations yet"
                        actionLabel="Add Location"
                        onAction={() => {
                          resetLocation();
                          setLocationModalOpen(true);
                        }}
                        icon={<IconMapPin size={40} />}
                      />
                    ) : (
                      <Stack gap="sm">
                        {staffLocationAssignments.map((assignment) => (
                          <LocationCard
                            key={assignment.id}
                            assignment={assignment}
                            onDelete={() => handleDeleteLocationAssignment(assignment)}
                          />
                        ))}
                      </Stack>
                    )
                  ) : (
                    // Availability Tab Content
                    <LocationAvailabilityManagement
                      selectedStaff={selectedStaff}
                      staffLocationAssignments={staffLocationAssignments}
                    />
                  )}
                </ScrollArea>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Enhanced Service Assignment Modal */}
      <Modal
        opened={serviceModalOpen}
        onClose={() => {
          setServiceModalOpen(false);
          setEditingCompetency(null);
          reset();
        }}
        title={editingCompetency ? 'Edit Service Competency' : 'Add Service Competency'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmitService)}>
          <Stack gap="md">
            <Controller
              name="category"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field, fieldState }) => (
                <Select
                  {...field}
                  label="Service Category"
                  placeholder="Select a category"
                  data={categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))}
                  error={fieldState.error?.message}
                  onChange={(value) => {
                    field.onChange(value ? parseInt(value) : null);
                    setValue('service', null);
                  }}
                />
              )}
            />

            <Controller
              name="service"
              control={control}
              rules={{ required: 'Service is required' }}
              render={({ field, fieldState }) => (
                <Select
                  {...field}
                  label="Service"
                  placeholder="Select a service"
                  data={servicesInCategory.map(service => ({
                    value: service.id.toString(),
                    label: `${service.name} - ${calculateServicePrice(service, undefined, businessProfile).formattedPrice} (${formatDuration(service.default_duration || 60)})`
                  }))}
                  error={fieldState.error?.message}
                  disabled={!watch('category')}
                  onChange={(value) => field.onChange(value ? parseInt(value) : null)}
                />
              )}
            />

            <Controller
              name="skillLevel"
              control={control}
              rules={{ required: 'Skill level is required' }}
              render={({ field, fieldState }) => (
                <Select
                  {...field}
                  label="Skill Level"
                  placeholder="Select skill level"
                  data={[
                    { value: 'trainee', label: '📚 Trainee' },
                    { value: 'competent', label: '✓ Competent' },
                    { value: 'expert', label: '⭐ Expert' },
                    { value: 'master', label: '👑 Master' }
                  ]}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="hourlyRate"
              control={control}
              render={({ field, fieldState }) => (
                <NumberInput
                  {...field}
                  label="Hourly Rate (Optional)"
                  placeholder={getCurrencyPlaceholder(businessProfile?.currency, businessProfile?.currency_symbol)}
                  prefix={businessProfile?.currency_symbol || 'KSH'}
                  decimalScale={2}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Group justify="flex-end" gap="sm">
              <Button 
                variant="light" 
                onClick={() => {
                  setServiceModalOpen(false);
                  setEditingCompetency(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700"
                loading={createCompetencyMutation.isPending || updateCompetencyMutation.isPending}
              >
                {editingCompetency ? 'Update' : 'Add'} Competency
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Location Assignment Modal */}
      <Modal
        opened={locationModalOpen}
        onClose={() => {
          setLocationModalOpen(false);
          resetLocation();
        }}
        title="Add Location Assignment"
        size="md"
      >
        <form onSubmit={handleLocationSubmit(onSubmitLocation)}>
          <Stack gap="md">
            <Controller
              name="location"
              control={locationControl}
              rules={{ required: 'Location is required' }}
              render={({ field, fieldState }) => (
                <Select
                  {...field}
                  label="Location"
                  placeholder="Select a location"
                  data={locations
                    .filter(loc => !staffLocationAssignments.some(assign => assign.location === loc.id))
                    .map(loc => ({ value: loc.id.toString(), label: loc.name }))
                  }
                  error={fieldState.error?.message}
                  onChange={(value) => field.onChange(value ? parseInt(value) : null)}
                />
              )}
            />

            <Group justify="flex-end" gap="sm">
              <Button 
                variant="light" 
                onClick={() => {
                  setLocationModalOpen(false);
                  resetLocation();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700"
                loading={createLocationAssignment.isPending}
              >
                Add Location
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
};

export default StaffManagement; 