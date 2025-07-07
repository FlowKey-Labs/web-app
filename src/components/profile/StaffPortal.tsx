import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Modal, Text, Group, Stack, Alert, Select, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm, Controller } from 'react-hook-form';
import { 
  useGetStaffExceptions,
  useCreateStaffException,
  useUpdateStaffException,
  useGetStaffServiceCompetencies,
  useGetStaffLocationAssignments,
  useGetSessionCategories,
  useGetBusinessLocations
} from '../../hooks/reactQuery';
import { useAuthStore } from '../../store/auth';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';
import { InfoIcon } from '../publicBooking/bookingIcons';

interface StaffExceptionFormData {
  date: string;
  exception_type: 'unavailable' | 'vacation' | 'sick' | 'training' | 'personal';
  reason: string;
  is_all_day: boolean;
  start_time?: string;
  end_time?: string;
}

const StaffPortalContent: React.FC = () => {
  const [exceptionModalOpen, setExceptionModalOpen] = useState(false);
  const [editingException, setEditingException] = useState<any>(null);

  const user = useAuthStore((state) => state.user);

  // Queries
  const { data: exceptions = [], isLoading: exceptionsLoading, error: exceptionsError } = useGetStaffExceptions();
  const { data: competencies = [], isLoading: competenciesLoading } = useGetStaffServiceCompetencies();
  const { data: locationAssignments = [], isLoading: locationsLoading } = useGetStaffLocationAssignments();
  const { data: categories = [] } = useGetSessionCategories();
  const { data: locations = [] } = useGetBusinessLocations();

  // Mutations
  const createExceptionMutation = useCreateStaffException();
  const updateExceptionMutation = useUpdateStaffException();

  // Form
  const exceptionForm = useForm<StaffExceptionFormData>({
    defaultValues: {
      is_all_day: true,
      exception_type: 'unavailable',
    }
  });

  // Check if there's an API error indicating no staff profile
  const hasStaffProfileError = exceptionsError && 
    (exceptionsError as any)?.message?.includes('Staff profile not found');

  // Filter exceptions for current staff member
  const myExceptions = useMemo(() => {
    return exceptions.filter((exception: any) => exception.staff?.user?.id === user?.id);
  }, [exceptions, user?.id]);

  // Filter competencies for current staff member
  const myCompetencies = useMemo(() => {
    return competencies.filter((competency: any) => competency.staff?.user?.id === user?.id);
  }, [competencies, user?.id]);

  // Filter location assignments for current staff member
  const myLocationAssignments = useMemo(() => {
    return locationAssignments.filter((assignment: any) => assignment.staff?.user?.id === user?.id);
  }, [locationAssignments, user?.id]);

  // Get subcategories for all categories
  const allSubcategories = useMemo(() => {
    return categories.flatMap((category: any) => 
      category.subcategories?.map((sub: any) => ({
        ...sub,
        categoryName: category.name,
      })) || []
    );
  }, [categories]);

  // If user doesn't have a staff profile, show helpful message
  if (hasStaffProfileError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <InfoIcon className="w-8 h-8 text-orange-600" />
          </div>
          <Text className="text-xl font-semibold text-gray-900 mb-2">Staff Portal Access Required</Text>
          <Text className="text-gray-600 mb-6 max-w-md mx-auto">
            You need to have a staff profile to access the staff portal. Please contact your administrator to:
          </Text>
          <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
            <ul className="text-left text-sm text-gray-700 space-y-2">
              <li>• Create a staff profile for your account</li>
              <li>• Assign you to appropriate service competencies</li>
              <li>• Set up your location assignments</li>
              <li>• Configure your permissions</li>
            </ul>
          </div>
          <Button
            className="mt-6"
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleOpenExceptionModal = (exception?: any) => {
    setEditingException(exception);
    
    if (exception) {
      exceptionForm.reset({
        date: exception.date,
        exception_type: exception.exception_type,
        reason: exception.reason,
        is_all_day: exception.is_all_day,
        start_time: exception.start_time || '',
        end_time: exception.end_time || '',
      });
    } else {
      exceptionForm.reset({
        date: '',
        exception_type: 'unavailable',
        reason: '',
        is_all_day: true,
      });
    }
    
    setExceptionModalOpen(true);
  };

  const handleExceptionSubmit = (data: StaffExceptionFormData) => {
    if (editingException) {
      updateExceptionMutation.mutate({
        id: editingException.id,
        ...data,
      }, {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Exception updated successfully',
            color: 'green',
            icon: <img src={successIcon} alt="Success" className="w-4 h-4" />,
          });
          setExceptionModalOpen(false);
          setEditingException(null);
        },
        onError: () => {
          notifications.show({
            title: 'Error',
            message: 'Failed to update exception',
            color: 'red',
            icon: <img src={errorIcon} alt="Error" className="w-4 h-4" />,
          });
        }
      });
    } else {
      createExceptionMutation.mutate(data, {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Exception request created successfully and sent for approval',
            color: 'green',
            icon: <img src={successIcon} alt="Success" className="w-4 h-4" />,
          });
          setExceptionModalOpen(false);
          exceptionForm.reset();
        },
        onError: () => {
          notifications.show({
            title: 'Error',
            message: 'Failed to create exception request',
            color: 'red',
            icon: <img src={errorIcon} alt="Error" className="w-4 h-4" />,
          });
        }
      });
    }
  };

  const skillLevelColors = {
    trainee: 'gray',
    competent: 'blue',
    expert: 'green',
    master: 'yellow',
  };

  const exceptionTypeColors = {
    unavailable: 'gray',
    vacation: 'blue',
    sick: 'red',
    training: 'green',
    personal: 'orange',
  };

  const statusColors = {
    pending: 'yellow',
    approved: 'green',
    denied: 'red',
  };

  const isLoading = exceptionsLoading || competenciesLoading || locationsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <Text>Loading your staff profile...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-green-600">Staff Portal</h2>
          <p className="text-gray-600">Manage your service assignments, locations, and exception requests</p>
        </div>
      </div>

      {/* Service Competencies Section */}
      <Card padding="lg" shadow="sm">
        <Text size="lg" fw={600} mb="md">My Service Competencies</Text>
        
        {myCompetencies.length > 0 ? (
          <div className="grid gap-3">
            {myCompetencies.map((competency: any) => {
              const subcategory = allSubcategories.find((s: any) => s.id === competency.subcategory_id);
              return (
                <div key={competency.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <Text fw={500}>{subcategory?.name}</Text>
                      <Text size="sm" color="dimmed">{subcategory?.categoryName}</Text>
                    </div>
                    <Badge color={skillLevelColors[competency.skill_level as keyof typeof skillLevelColors]}>
                      {competency.skill_level}
                    </Badge>
                    {competency.hourly_rate && (
                      <Badge variant="outline" color="green">
                        ${competency.hourly_rate}/hr
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Alert color="blue" icon={<InfoIcon className="w-4 h-4" />}>
            No service competencies assigned yet. Contact your administrator to get assigned to services you can provide.
          </Alert>
        )}
      </Card>

      {/* Location Assignments Section */}
      <Card padding="lg" shadow="sm">
        <Text size="lg" fw={600} mb="md">My Location Assignments</Text>
        
        {myLocationAssignments.length > 0 ? (
          <div className="grid gap-3">
            {myLocationAssignments.map((assignment: any) => {
              const location = locations.find((l: any) => l.id === assignment.location_id);
              return (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <Text fw={500}>{location?.name}</Text>
                      <Text size="sm" color="dimmed">{location?.address}</Text>
                    </div>
                    {assignment.is_primary && (
                      <Badge color="green" variant="light">Primary</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Alert color="blue" icon={<InfoIcon className="w-4 h-4" />}>
            No location assignments yet. Contact your administrator to get assigned to locations.
          </Alert>
        )}
      </Card>

      {/* Exception Requests Section */}
      <Card padding="lg" shadow="sm">
        <div className="flex justify-between items-center mb-4">
          <Text size="lg" fw={600}>My Exception Requests</Text>
          <Button 
            onClick={() => handleOpenExceptionModal()}
            className="bg-green-600 hover:bg-green-700"
          >
            Request Exception
          </Button>
        </div>

        {myExceptions.length > 0 ? (
          <div className="grid gap-3">
            {myExceptions.map((exception: any) => (
              <div key={exception.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <Text fw={500}>{exception.date}</Text>
                    <Text size="sm">{exception.reason}</Text>
                    {!exception.is_all_day && exception.start_time && exception.end_time && (
                      <Text size="xs" color="dimmed">
                        {exception.start_time} - {exception.end_time}
                      </Text>
                    )}
                    {exception.admin_notes && (
                      <Text size="xs" color="dimmed" mt="xs">
                        Admin note: {exception.admin_notes}
                      </Text>
                    )}
                  </div>
                  <Badge color={exceptionTypeColors[exception.exception_type as keyof typeof exceptionTypeColors]}>
                    {exception.exception_type}
                  </Badge>
                  <Badge color={statusColors[exception.status as keyof typeof statusColors]}>
                    {exception.status}
                  </Badge>
                </div>
                
                {exception.status === 'pending' && (
                  <Button 
                    size="xs" 
                    variant="light"
                    onClick={() => handleOpenExceptionModal(exception)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Alert color="blue" icon={<InfoIcon className="w-4 h-4" />}>
            No exception requests yet. Use the "Request Exception" button to create your first request.
          </Alert>
        )}
      </Card>

      {/* Exception Request Modal */}
      <Modal
        opened={exceptionModalOpen}
        onClose={() => setExceptionModalOpen(false)}
        title={editingException ? "Edit Exception Request" : "Request Exception"}
        size="md"
      >
        <form onSubmit={exceptionForm.handleSubmit(handleExceptionSubmit)} className="space-y-4">
          <Controller
            name="date"
            control={exceptionForm.control}
            rules={{ required: 'Date is required' }}
            render={({ field, fieldState }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <TextInput
                  type="date"
                  {...field}
                  error={fieldState.error?.message}
                />
              </div>
            )}
          />

          <Controller
            name="exception_type"
            control={exceptionForm.control}
            rules={{ required: 'Exception type is required' }}
            render={({ field, fieldState }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exception Type</label>
                <Select
                  placeholder="Select exception type"
                  data={[
                    { value: 'unavailable', label: 'Unavailable' },
                    { value: 'vacation', label: 'Vacation' },
                    { value: 'sick', label: 'Sick Leave' },
                    { value: 'training', label: 'Training' },
                    { value: 'personal', label: 'Personal Time' },
                  ]}
                  {...field}
                  error={fieldState.error?.message}
                />
              </div>
            )}
          />

          <Controller
            name="reason"
            control={exceptionForm.control}
            rules={{ required: 'Reason is required' }}
            render={({ field, fieldState }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <TextInput
                  placeholder="Brief explanation"
                  {...field}
                  error={fieldState.error?.message}
                />
              </div>
            )}
          />

          <Controller
            name="is_all_day"
            control={exceptionForm.control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_all_day"
                  checked={field.value}
                  onChange={field.onChange}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="is_all_day" className="text-sm">
                  All day exception
                </label>
              </div>
            )}
          />

          {!exceptionForm.watch('is_all_day') && (
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="start_time"
                control={exceptionForm.control}
                render={({ field, fieldState }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <TextInput
                      type="time"
                      {...field}
                      error={fieldState.error?.message}
                    />
                  </div>
                )}
              />

              <Controller
                name="end_time"
                control={exceptionForm.control}
                render={({ field, fieldState }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <TextInput
                      type="time"
                      {...field}
                      error={fieldState.error?.message}
                    />
                  </div>
                )}
              />
            </div>
          )}

          {!editingException && (
            <Alert color="blue" icon={<InfoIcon className="w-4 h-4" />}>
              Your exception request will be sent to administration for approval. You'll receive a notification once it's reviewed.
            </Alert>
          )}

          <Group justify="flex-end" gap="md">
            <Button variant="outline" onClick={() => setExceptionModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={createExceptionMutation.isPending || updateExceptionMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {editingException ? 'Update' : 'Submit'} Request
            </Button>
          </Group>
        </form>
      </Modal>
    </div>
  );
};

const StaffPortal: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <StaffPortalContent />
    </div>
  );
};

export default StaffPortal; 