import React, { useState } from 'react';
import { 
  Stack, 
  Text, 
  Card, 
  Group, 
  Badge, 
  Button, 
  Modal, 
  Switch,
  Grid,
  Alert,
  Divider,
  ActionIcon
} from '@mantine/core';
import { 
  IconMapPin, 
  IconCalendar, 
  IconPlus, 
  IconEdit, 
  IconTrash,
  IconInfoCircle
} from '@tabler/icons-react';
import { StaffLocationAssignment } from '../../types/sessionTypes';
import { 
  useGetStaffLocationAvailability,
  useCreateStaffLocationAvailability,
  useUpdateStaffLocationAvailability,
  useDeleteStaffLocationAvailability
} from '../../hooks/reactQuery';
import { notifications } from '@mantine/notifications';

interface LocationAvailabilityManagementProps {
  selectedStaff: number | null;
  staffLocationAssignments: StaffLocationAssignment[];
}

interface LocationAvailability {
  id?: number;
  staff_location: number;
  working_hours: Record<string, string | Array<{ start: string; end: string }>>;
  available_days: string[];
  is_active: boolean;
  schedule: Record<string, { isOpen: boolean; shifts: Array<{ start: string; end: string }> }>;
}

interface TimeShift {
  start: string;
  end: string;
}

interface DaySchedule {
  isOpen: boolean;
  shifts: TimeShift[];
}

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Local EmptyState Component
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
        {icon}
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

const LocationAvailabilityManagement: React.FC<LocationAvailabilityManagementProps> = ({ 
  selectedStaff, 
  staffLocationAssignments 
}) => {
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [selectedLocationAssignment, setSelectedLocationAssignment] = useState<StaffLocationAssignment | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [scheduleState, setScheduleState] = useState<Record<string, DaySchedule>>(() => {
    // Initialize with default closed schedule
    const defaultSchedule: Record<string, DaySchedule> = {};
    DAYS_OF_WEEK.forEach(day => {
      defaultSchedule[day] = { isOpen: false, shifts: [] };
    });
    return defaultSchedule;
  });

  // Fetch location availabilities using real API
  const { data: locationAvailabilities = [], isLoading, refetch } = useGetStaffLocationAvailability(selectedStaff || undefined);
  
  // Mutations
  const createAvailabilityMutation = useCreateStaffLocationAvailability();
  const updateAvailabilityMutation = useUpdateStaffLocationAvailability();
  const deleteAvailabilityMutation = useDeleteStaffLocationAvailability();

  const handleOpenAvailabilityModal = (assignment: StaffLocationAssignment) => {
    setSelectedLocationAssignment(assignment);
    
          // Check if there's existing availability for this location
      const existingAvailability = locationAvailabilities.find(
        (avail: LocationAvailability) => avail.staff_location === assignment.id
      );
    
    if (existingAvailability) {
      setScheduleState(existingAvailability.schedule);
      setIsEditing(true);
    } else {
      // Reset to default schedule
      const defaultSchedule: Record<string, DaySchedule> = {};
      DAYS_OF_WEEK.forEach(day => {
        defaultSchedule[day] = { isOpen: false, shifts: [] };
      });
      setScheduleState(defaultSchedule);
      setIsEditing(false);
    }
    
    setAvailabilityModalOpen(true);
  };

  const handleScheduleUpdate = (day: string, daySchedule: DaySchedule) => {
    setScheduleState(prev => ({
      ...prev,
      [day]: daySchedule
    }));
  };

  const handleSaveAvailability = async () => {
    if (!selectedLocationAssignment) return;
    
    try {
      const availabilityData = {
        staff_location: selectedLocationAssignment.id,
        schedule: scheduleState,
        is_active: true
      };
      
      // Check if we're editing existing availability
      const existingAvailability = locationAvailabilities.find(
        (avail: LocationAvailability) => avail.staff_location === selectedLocationAssignment.id
      );
      
      if (existingAvailability) {
        // Update existing availability
        await updateAvailabilityMutation.mutateAsync({
          id: existingAvailability.id!,
          data: availabilityData
        });
        
        notifications.show({
          title: 'Success',
          message: 'Availability schedule updated successfully',
          color: 'green',
        });
      } else {
        // Create new availability
        await createAvailabilityMutation.mutateAsync(availabilityData);
        
        notifications.show({
          title: 'Success',
          message: 'Availability schedule created successfully',
          color: 'green',
        });
      }
      
      // Refresh data and close modal
      await refetch();
      setAvailabilityModalOpen(false);
      setSelectedLocationAssignment(null);
      
            } catch (error: unknown) {
          console.error('Error saving availability:', error);
          notifications.show({
            title: 'Error',
            message: 'Failed to save availability schedule',
        color: 'red',
      });
    }
  };

  const handleDeleteAvailability = async (assignment: StaffLocationAssignment) => {
    const existingAvailability = locationAvailabilities.find(
      (avail: LocationAvailability) => avail.staff_location === assignment.id
    );
    
    if (!existingAvailability) return;
    
    try {
      await deleteAvailabilityMutation.mutateAsync(existingAvailability.id!);
      
      notifications.show({
        title: 'Success',
        message: 'Availability schedule deleted successfully',
        color: 'green',
      });
      
      await refetch();
    } catch (error: unknown) {
      console.error('Error deleting availability:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete availability schedule',
        color: 'red',
      });
    }
  };

  const formatDayName = (day: string) => {
    const names: Record<string, string> = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    };
    return names[day] || day;
  };

  const DayScheduleComponent = ({ 
    day, 
    daySchedule, 
    onUpdate 
  }: {
    day: string;
    daySchedule: DaySchedule;
    onUpdate: (day: string, schedule: DaySchedule) => void;
  }) => {
    const handleToggle = (isOpen: boolean) => {
      const newSchedule: DaySchedule = {
        isOpen,
        shifts: isOpen && daySchedule.shifts.length === 0 
          ? [{ start: '09:00', end: '17:00' }] 
          : isOpen 
          ? daySchedule.shifts 
          : []
      };
      onUpdate(day, newSchedule);
    };

    const handleAddShift = () => {
      const newShifts = [...daySchedule.shifts, { start: '09:00', end: '17:00' }];
      onUpdate(day, { ...daySchedule, shifts: newShifts });
    };

    const handleRemoveShift = (index: number) => {
      if (daySchedule.shifts.length <= 1) return;
      const newShifts = daySchedule.shifts.filter((_, i) => i !== index);
      onUpdate(day, { ...daySchedule, shifts: newShifts });
    };

    const handleTimeChange = (shiftIndex: number, field: 'start' | 'end', value: string) => {
      const newShifts = [...daySchedule.shifts];
      newShifts[shiftIndex] = { ...newShifts[shiftIndex], [field]: value };
      onUpdate(day, { ...daySchedule, shifts: newShifts });
    };

    return (
      <Card p="sm" withBorder>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={500} size="sm">{formatDayName(day)}</Text>
            <Switch
              checked={daySchedule.isOpen}
              onChange={(event) => handleToggle(event.currentTarget.checked)}
              size="sm"
            />
          </Group>
          
          {daySchedule.isOpen && (
            <Stack gap="xs">
              {daySchedule.shifts.map((shift, index) => (
                <Group key={index} gap="xs">
                  <input
                    type="time"
                    value={shift.start}
                    onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  />
                  <Text size="xs">to</Text>
                  <input
                    type="time"
                    value={shift.end}
                    onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  />
                  {daySchedule.shifts.length > 1 && (
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="red"
                      onClick={() => handleRemoveShift(index)}
                    >
                      <IconTrash size={12} />
                    </ActionIcon>
                  )}
                </Group>
              ))}
              <Button
                variant="light"
                size="xs"
                leftSection={<IconPlus size={12} />}
                onClick={handleAddShift}
              >
                Add Shift
              </Button>
            </Stack>
          )}
        </Stack>
      </Card>
    );
  };

  if (!selectedStaff) {
    return (
      <EmptyState
        title="Select a Staff Member"
        description="Choose a staff member to manage their location-specific availability"
        icon={<IconCalendar size={40} />}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Text size="sm" c="dimmed">Loading availability data...</Text>
      </div>
    );
  }

  if (staffLocationAssignments.length === 0) {
    return (
      <EmptyState
        title="No Location Assignments"
        description="This staff member needs to be assigned to locations before setting up availability schedules"
        icon={<IconMapPin size={40} />}
      />
    );
  }

  return (
    <Stack gap="md">
      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
        <strong>Smart Availability System:</strong> Staff automatically use business hours at all locations. 
        Only set custom schedules when different hours are needed (e.g., Monday-Wednesday at Location A, 
        Thursday-Saturday at Location B). No need to reconfigure business hours for every location.
      </Alert>

      <Stack gap="sm">
                 {staffLocationAssignments.map((assignment) => {
           const hasAvailability = locationAvailabilities.some(
             (avail: LocationAvailability) => avail.staff_location === assignment.id
           );
          
          return (
            <Card key={assignment.id} p="md" withBorder>
              <Group justify="space-between" mb="sm">
                <Group gap="sm">
                  <IconMapPin size={20} />
                  <div>
                    <Text fw={500}>{assignment.location_name}</Text>
                    <Text size="sm" c="dimmed">{assignment.location_address}</Text>
                  </div>
                  {assignment.is_primary && (
                    <Badge color="green" size="sm">Primary</Badge>
                  )}
                </Group>
                
                <Group gap="sm">
                                     {hasAvailability ? (
                     <Badge color="blue" variant="light">
                       Custom Schedule
                     </Badge>
                   ) : (
                     <Badge color="green" variant="light">
                       ✓ Uses Business Hours
                     </Badge>
                   )}
                  
                                     <Group gap="xs">
                     <Button
                       size="xs"
                       variant="light"
                       leftSection={hasAvailability ? <IconEdit size={12} /> : <IconPlus size={12} />}
                       onClick={() => handleOpenAvailabilityModal(assignment)}
                     >
                       {hasAvailability ? 'Edit Schedule' : 'Set Schedule'}
                     </Button>
                     
                     {hasAvailability && (
                       <ActionIcon
                         size="sm"
                         variant="light"
                         color="red"
                         onClick={() => handleDeleteAvailability(assignment)}
                       >
                         <IconTrash size={12} />
                       </ActionIcon>
                     )}
                   </Group>
                </Group>
              </Group>
              
              {hasAvailability && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <Text size="xs" c="dimmed">
                    Custom availability schedule is active for this location
                  </Text>
                </div>
              )}
            </Card>
          );
        })}
      </Stack>

      {/* Availability Schedule Modal */}
      <Modal
        opened={availabilityModalOpen}
        onClose={() => {
          setAvailabilityModalOpen(false);
          setSelectedLocationAssignment(null);
        }}
        title={
          <Group gap="sm">
            <IconCalendar size={20} />
            <div>
              <Text fw={500}>
                {isEditing ? 'Edit' : 'Set'} Availability Schedule
              </Text>
              <Text size="sm" c="dimmed">
                {selectedLocationAssignment?.location_name}
              </Text>
            </div>
          </Group>
        }
        size="xl"
        centered
      >
        <Stack gap="md">
          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
            <strong>Default:</strong> This staff member uses business hours at this location. 
            Only create a custom schedule if different hours are needed. Leave empty to keep using business hours.
          </Alert>

          <Text fw={500} size="sm">Weekly Schedule</Text>
          
          <Grid>
            {DAYS_OF_WEEK.map((day) => {
              const dayData = scheduleState[day] || { isOpen: false, shifts: [] };
              
              return (
                <Grid.Col key={day} span={{ base: 12, sm: 6, md: 4 }}>
                  <DayScheduleComponent
                    day={day}
                    daySchedule={dayData}
                    onUpdate={handleScheduleUpdate}
                  />
                </Grid.Col>
              );
            })}
          </Grid>

          <Divider />
          
          <Group justify="flex-end" gap="sm">
            <Button
              variant="light"
              onClick={() => {
                setAvailabilityModalOpen(false);
                setSelectedLocationAssignment(null);
              }}
            >
              Cancel
            </Button>
                         <Button 
               onClick={handleSaveAvailability}
               loading={createAvailabilityMutation.isPending || updateAvailabilityMutation.isPending}
             >
               {isEditing ? 'Update Schedule' : 'Save Schedule'}
             </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default LocationAvailabilityManagement; 