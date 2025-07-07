import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader, Modal, ActionIcon, Tooltip, Badge, Text, Divider } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { useForm } from 'react-hook-form';
import { CalendarIcon, PlusIcon } from '../../assets/icons';
import Button from '../common/Button';
import { StaffException } from '../../types/sessionTypes';
import { 
  useGetAvailability, 
  useCreateAvailability, 
  useUpdateAvailability,
  usePartialUpdateAvailability,
  useGetStaffExceptions,
  useApproveStaffException,
  useDenyStaffException
} from '../../hooks/reactQuery';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

interface TimeShift {
  start: string;
  end: string;
}

interface Exception {
  date: string;
  reason?: string;
  isAllDay: boolean;
  timeSlots?: TimeShift[];
}



interface DaySchedule {
  isOpen: boolean;
  shifts: TimeShift[];
}

interface AvailabilityFormData {
  schedule: Record<string, DaySchedule>;
  exceptions: Exception[];
}

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const createDefaultSchedule = () => {
  const schedule: Record<string, DaySchedule> = {};
  DAYS_OF_WEEK.forEach(day => {
    schedule[day] = {
      isOpen: day !== 'sunday', // Default: closed on Sunday
      shifts: day !== 'sunday' ? [{ start: '09:00', end: '17:00' }] : []
    };
  });
  return schedule;
};

const defaultFormValues: AvailabilityFormData = {
  schedule: createDefaultSchedule(),
  exceptions: []
};

// API Response interface based on actual backend structure
interface AvailabilityApiResponse {
  id?: number;
  working_hours: Record<string, TimeShift[]>;
  appointment_duration: number;
  open_days: string[];
  exceptions?: Exception[];
  business?: number;
  schedule?: Record<string, DaySchedule>;
}

// Time validation functions
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const validateTimeRange = (start: string, end: string): boolean => {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  return startMinutes < endMinutes;
};

const validateShiftsOverlap = (shifts: TimeShift[]): boolean => {
  for (let i = 0; i < shifts.length; i++) {
    for (let j = i + 1; j < shifts.length; j++) {
      const start1 = timeToMinutes(shifts[i].start);
      const end1 = timeToMinutes(shifts[i].end);
      const start2 = timeToMinutes(shifts[j].start);
      const end2 = timeToMinutes(shifts[j].end);
      
      if ((start1 < end2 && end1 > start2)) {
        return true; // overlap found
      }
    }
  }
  return false; // no overlap
};

// Transform API response to form data
const transformApiToForm = (apiData: AvailabilityApiResponse): AvailabilityFormData => {
  const schedule: Record<string, DaySchedule> = {};
  
  DAYS_OF_WEEK.forEach(day => {
    const isOpen = apiData.open_days?.includes(day) || false;
    const shifts = apiData.working_hours?.[day] || [];
    schedule[day] = { isOpen, shifts };
  });

  return {
    schedule,
    exceptions: apiData.exceptions || []
  };
};

// Transform form data to API format
const transformFormToApi = (formData: AvailabilityFormData) => {
  console.log('🔄 Transforming form data to API format:', formData);
  
  // Convert schedule to working_hours format
  const working_hours: Record<string, TimeShift[]> = {};
  const open_days: string[] = [];
  
  Object.entries(formData.schedule).forEach(([day, daySchedule]) => {
    if (daySchedule.isOpen && daySchedule.shifts.length > 0) {
      working_hours[day] = daySchedule.shifts;
      open_days.push(day);
    }
  });
  
  const apiData = {
    working_hours,
    open_days,
    exceptions: formData.exceptions || []
  };
  
  console.log('🔄 Transformed API data:', apiData);
  console.log('🔄 Exceptions in API data:', apiData.exceptions);
  
  return apiData;
};

// Clock Icon Component (inline since it doesn't exist in icons.tsx)
const ClockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Exception Icon Component
const ExceptionIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Error Boundary Component
class AvailabilityErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Availability component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExceptionIcon className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">Unable to load availability settings.</p>
            <Button onClick={() => window.location.reload()} className="bg-secondary hover:bg-secondary/90 text-white">
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple Custom Toggle Component
const CustomToggle = ({ 
  checked, 
  onChange, 
  disabled = false 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void; 
  disabled?: boolean;
}) => {
  const handleClick = () => {
    console.log('🔘 CustomToggle clicked, current state:', checked, 'disabled:', disabled);
    if (!disabled) {
      console.log('🔘 Calling onChange with:', !checked);
      onChange(!checked);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 ${
        checked ? 'bg-secondary' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

// Completely rewritten Day Schedule Component with direct state management
const NewDaySchedule = ({ 
  day, 
  daySchedule, 
  isEditing, 
  onUpdate,
  validationErrors
}: {
  day: string;
  daySchedule: DaySchedule;
  isEditing: boolean;
  onUpdate: (day: string, schedule: DaySchedule) => void;
  validationErrors: Record<string, string>;
}) => {
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

  const handleToggle = (isOpen: boolean) => {
    console.log(`🗓️ ${day} toggle clicked - changing from ${daySchedule.isOpen} to ${isOpen}`);
    console.log('🗓️ Current daySchedule:', daySchedule);
    console.log('🗓️ isEditing:', isEditing);
    
    if (!isEditing) {
      console.log('🗓️ Not editing, returning early');
      return;
    }

    const newSchedule: DaySchedule = {
      isOpen,
      shifts: isOpen && daySchedule.shifts.length === 0 
        ? [{ start: '09:00', end: '17:00' }] 
        : isOpen 
        ? daySchedule.shifts 
        : []
    };
    
    console.log('🗓️ New schedule for', day, ':', newSchedule);
    onUpdate(day, newSchedule);
  };

  const handleAddShift = () => {
    console.log(`➕ Adding shift to ${day}`);
    const newShifts = [...daySchedule.shifts, { start: '09:00', end: '17:00' }];
    onUpdate(day, { ...daySchedule, shifts: newShifts });
  };

  const handleRemoveShift = (index: number) => {
    console.log(`➖ Removing shift ${index} from ${day}`);
    if (daySchedule.shifts.length <= 1) return;
    const newShifts = daySchedule.shifts.filter((_, i) => i !== index);
    onUpdate(day, { ...daySchedule, shifts: newShifts });
  };

  const handleTimeChange = (shiftIndex: number, field: 'start' | 'end', value: string) => {
    console.log(`🕐 Time change in ${day}, shift ${shiftIndex}, field ${field}, value ${value}`);
    const newShifts = [...daySchedule.shifts];
    newShifts[shiftIndex] = { ...newShifts[shiftIndex], [field]: value };
    onUpdate(day, { ...daySchedule, shifts: newShifts });
  };
  
  const error = validationErrors[day];
  
  return (
    <div className={`bg-white border rounded-lg p-3 transition-all duration-200 hover:shadow-sm ${
      error ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
    } ${daySchedule.isOpen ? 'ring-1 ring-secondary/30' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
            daySchedule.isOpen ? 'bg-secondary/10' : 'bg-gray-100'
          }`}>
            <CalendarIcon className={`w-3 h-3 ${daySchedule.isOpen ? 'text-secondary' : 'text-gray-400'}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 text-sm">{formatDayName(day)}</h3>
            <p className="text-xs text-gray-500 truncate">
              {daySchedule.isOpen 
                ? `${daySchedule.shifts.length} slot${daySchedule.shifts.length !== 1 ? 's' : ''}`
                : 'Closed'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {error && (
            <Tooltip label={error}>
              <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
            </Tooltip>
          )}
          <CustomToggle
            checked={daySchedule.isOpen}
            onChange={handleToggle}
            disabled={!isEditing}
          />
        </div>
      </div>

      {daySchedule.isOpen && (
        <div className="space-y-2">
          {daySchedule.shifts.map((shift, shiftIndex) => (
            <div key={shiftIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100">
              <ClockIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
              
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <div className="flex flex-col min-w-0">
                  <label className="text-xs font-medium text-gray-600 mb-0.5">Start</label>
                  <input
                    type="time"
                    value={shift.start}
                    onChange={(e) => handleTimeChange(shiftIndex, 'start', e.target.value)}
                    disabled={!isEditing}
                    className="w-18 px-1.5 py-1 border border-gray-300 rounded text-xs font-medium focus:ring-1 focus:ring-secondary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                
                <div className="flex items-center justify-center pt-4">
                  <div className="w-2 h-px bg-gray-300"></div>
                </div>
                
                <div className="flex flex-col min-w-0">
                  <label className="text-xs font-medium text-gray-600 mb-0.5">End</label>
                  <input
                    type="time"
                    value={shift.end}
                    onChange={(e) => handleTimeChange(shiftIndex, 'end', e.target.value)}
                    disabled={!isEditing}
                    className="w-18 px-1.5 py-1 border border-gray-300 rounded text-xs font-medium focus:ring-1 focus:ring-secondary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>
              
              {isEditing && daySchedule.shifts.length > 1 && (
                <Tooltip label="Remove">
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="xs"
                    onClick={() => handleRemoveShift(shiftIndex)}
                    className="flex-shrink-0"
                  >
                    <ExceptionIcon className="w-3 h-3" />
                  </ActionIcon>
                </Tooltip>
              )}
            </div>
          ))}
          
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={handleAddShift}
              className="w-full border-dashed border-2 border-gray-300 hover:border-secondary hover:bg-secondary/5 text-gray-600 hover:text-secondary py-1.5 text-xs"
            >
              <PlusIcon className="w-3 h-3 mr-1" />
              Add Slot
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const Availability: React.FC = () => {
  const { data: availabilityData, isLoading, error: fetchError } = useGetAvailability();
  const { data: staffExceptions, isLoading: staffExceptionsLoading } = useGetStaffExceptions();
  const createAvailability = useCreateAvailability();
  const updateAvailability = useUpdateAvailability();
  const partialUpdateAvailability = usePartialUpdateAvailability();
  const approveStaffException = useApproveStaffException();
  const denyStaffException = useDenyStaffException();
  
  const { control, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<AvailabilityFormData>({
    defaultValues: defaultFormValues
  });

  const watchedExceptions = watch('exceptions');
  
  // Local state for UI and editing
  const [isEditing, setIsEditing] = useState(false);
  const [hasAvailability, setHasAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Direct schedule state (not controlled by react-hook-form for better UX)
  const [scheduleState, setScheduleState] = useState<Record<string, DaySchedule>>(createDefaultSchedule);

  // Exception modal state
  const [exceptionModalOpen, setExceptionModalOpen] = useState(false);
  const [selectedExceptionDate, setSelectedExceptionDate] = useState<Date | null>(null);
  const [exceptionReason, setExceptionReason] = useState('');
  const [exceptionIsAllDay, setExceptionIsAllDay] = useState(true);
  const [exceptionTimeSlots, setExceptionTimeSlots] = useState<TimeShift[]>([{ start: '09:00', end: '17:00' }]);
  
  // Staff exception modal state
  const [staffExceptionModalOpen, setStaffExceptionModalOpen] = useState(false);
  const [selectedStaffException, setSelectedStaffException] = useState<StaffException | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  console.log('🏠 Availability component render - scheduleState:', scheduleState);
  console.log('🏠 isEditing:', isEditing);

  // Validation function
  const validateSchedule = useCallback((): boolean => {
    console.log('✅ Validating schedule:', scheduleState);
    const newErrors: Record<string, string> = {};
    
    Object.entries(scheduleState).forEach(([day, dayData]) => {
      if (dayData.isOpen) {
        if (dayData.shifts.length === 0) {
          newErrors[day] = 'At least one time slot is required for open days';
          return;
        }
        
        // Validate each shift
        for (const shift of dayData.shifts) {
          if (!shift.start || !shift.end) {
            newErrors[day] = 'All time slots must have start and end times';
            return;
          }
          
          if (!validateTimeRange(shift.start, shift.end)) {
            newErrors[day] = 'End time must be after start time';
            return;
          }
        }
        
        // Check for overlapping shifts
        if (validateShiftsOverlap(dayData.shifts)) {
          newErrors[day] = 'Time slots cannot overlap';
        }
      }
    });
    
    console.log('✅ Validation errors:', newErrors);
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [scheduleState]);

  // Handle schedule updates directly
  const handleScheduleUpdate = useCallback((day: string, daySchedule: DaySchedule) => {
    console.log(`📝 Updating schedule for ${day}:`, daySchedule);
    setScheduleState(prev => {
      const newState = { ...prev, [day]: daySchedule };
      console.log('📝 New schedule state:', newState);
      return newState;
    });
  }, []);

  // Exception handlers
  const handleCalendarDayClick = useCallback((date: Date) => {
    console.log('📅 Calendar day clicked:', date);
    setSelectedExceptionDate(date);
    setExceptionModalOpen(true);
  }, []);

  const handleAddException = useCallback(async () => {
    if (!selectedExceptionDate) {
      console.log('❌ No exception date selected');
      return;
    }
    
    console.log('➕ Adding exception for date:', selectedExceptionDate);
    
    // Fix timezone issue: format date locally instead of using toISOString()
    const localDate = new Date(selectedExceptionDate.getTime() - selectedExceptionDate.getTimezoneOffset() * 60000);
    const dateString = localDate.toISOString().split('T')[0];
    
    const newException: Exception = {
      date: dateString,
      reason: exceptionReason,
      isAllDay: exceptionIsAllDay,
      timeSlots: exceptionIsAllDay ? undefined : exceptionTimeSlots
    };
    
    console.log('➕ New exception object:', newException);
    
    const currentExceptions = watchedExceptions || [];
    const updatedExceptions = [...currentExceptions, newException];
    
    console.log('➕ Updated exceptions array:', updatedExceptions);
    
    // Update form state
    setValue('exceptions', updatedExceptions);
    
    // Auto-save the exceptions immediately
    try {
      console.log('💾 Auto-saving exceptions...');
      const formData: AvailabilityFormData = {
        schedule: scheduleState,
        exceptions: updatedExceptions
      };
      
      const apiData = transformFormToApi(formData);
      console.log('💾 API data for auto-save:', apiData);
      
      if (hasAvailability) {
        await partialUpdateAvailability.mutateAsync(apiData);
        console.log('✅ Exceptions auto-saved successfully');
        notifications.show({
          title: 'Exception Added',
          message: 'Exception has been saved successfully',
          icon: <img src={successIcon} alt="success" className="w-4 h-4" />,
          color: 'green',
          autoClose: 2000,
        });
      } else {
        await createAvailability.mutateAsync(apiData);
        setHasAvailability(true);
        console.log('✅ Availability with exceptions created successfully');
        notifications.show({
          title: 'Exception Added',
          message: 'Exception has been saved successfully',
          icon: <img src={successIcon} alt="success" className="w-4 h-4" />,
          color: 'green',
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error('❌ Error auto-saving exceptions:', error);
      // Revert the UI change if save failed
      setValue('exceptions', currentExceptions);
      notifications.show({
        title: 'Error',
        message: 'Failed to save exception. Please try again.',
        icon: <img src={errorIcon} alt="error" className="w-4 h-4" />,
        color: 'red',
        autoClose: 5000,
      });
      return; // Don't close modal if save failed
    }
    
    // Reset modal state only after successful save
    setSelectedExceptionDate(null);
    setExceptionReason('');
    setExceptionIsAllDay(true);
    setExceptionTimeSlots([{ start: '09:00', end: '17:00' }]);
    setExceptionModalOpen(false);
  }, [selectedExceptionDate, exceptionReason, exceptionIsAllDay, exceptionTimeSlots, watchedExceptions, setValue, scheduleState, hasAvailability, partialUpdateAvailability, createAvailability]);

  const removeException = useCallback(async (index: number) => {
    console.log('🗑️ Removing exception at index:', index);
    
    const currentExceptions = watchedExceptions || [];
    console.log('🗑️ Current exceptions:', currentExceptions);
    
    const exceptionToRemove = currentExceptions[index];
    console.log('🗑️ Exception to remove:', exceptionToRemove);
    
    const newExceptions = currentExceptions.filter((_, i) => i !== index);
    console.log('🗑️ New exceptions array:', newExceptions);
    
    // Update form state
    setValue('exceptions', newExceptions);
    
    // Auto-save the updated exceptions immediately
    try {
      console.log('💾 Auto-saving exception removal...');
      const formData: AvailabilityFormData = {
        schedule: scheduleState,
        exceptions: newExceptions
      };
      
      const apiData = transformFormToApi(formData);
      console.log('💾 API data for auto-save:', apiData);
      
      if (hasAvailability) {
        await partialUpdateAvailability.mutateAsync(apiData);
        console.log('✅ Exception removal auto-saved successfully');
        notifications.show({
          title: 'Exception Removed',
          message: 'Exception has been removed successfully',
          icon: <img src={successIcon} alt="success" className="w-4 h-4" />,
          color: 'green',
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error('❌ Error auto-saving exception removal:', error);
      // Revert the UI change if save failed
      setValue('exceptions', currentExceptions);
      notifications.show({
        title: 'Error',
        message: 'Failed to remove exception. Please try again.',
        icon: <img src={errorIcon} alt="error" className="w-4 h-4" />,
        color: 'red',
        autoClose: 5000,
      });
    }
  }, [watchedExceptions, setValue, scheduleState, hasAvailability, partialUpdateAvailability]);

  // Load existing data
  useEffect(() => {
    if (availabilityData) {
      setHasAvailability(true);
      
      try {
        const normalizedData = transformApiToForm(availabilityData);
        
        // Update direct schedule state
        setScheduleState(normalizedData.schedule);
        
        // Reset the entire form with the normalized data (including exceptions)
        reset(normalizedData);
        
      } catch (error) {
        console.error('📥 Error normalizing availability data:', error);
        setScheduleState(createDefaultSchedule());
      }
    }
  }, [availabilityData, reset]);

  // Handle API errors
  useEffect(() => {
    if (fetchError) {
      console.error('Availability API error:', fetchError);
      notifications.show({
        title: 'Error',
        message: 'Failed to load availability data. Please refresh the page.',
        icon: <img src={errorIcon} alt="error" className="w-4 h-4" />,
        color: 'red',
        autoClose: 5000,
      });
    }
  }, [fetchError]);

  // Validate on schedule change
  useEffect(() => {
    validateSchedule();
  }, [validateSchedule]);

  // Submit handler
  const onSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    if (!validateSchedule()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fix the time conflicts before saving.',
        icon: <img src={errorIcon} alt="error" className="w-4 h-4" />,
        color: 'red',
        autoClose: 5000,
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData: AvailabilityFormData = {
        schedule: scheduleState,
        exceptions: watchedExceptions || []
      };
      
      const apiData = transformFormToApi(formData);
      
      if (hasAvailability) {
        await partialUpdateAvailability.mutateAsync(apiData);
      } else {
        await createAvailability.mutateAsync(apiData);
        setHasAvailability(true);
      }
      
      notifications.show({
        title: 'Success',
        message: 'Availability updated successfully',
        icon: <img src={successIcon} alt="success" className="w-4 h-4" />,
        color: 'green',
        autoClose: 3000,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating availability:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update availability. Please try again.',
        icon: <img src={errorIcon} alt="error" className="w-4 h-4" />,
        color: 'red',
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, scheduleState, watchedExceptions, hasAvailability, partialUpdateAvailability, createAvailability, validateSchedule]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setValidationErrors({});
    if (availabilityData) {
      try {
        const normalizedData = transformApiToForm(availabilityData);
        setScheduleState(normalizedData.schedule);
        reset(normalizedData);
      } catch (error) {
        console.error('Error resetting availability data:', error);
        setScheduleState(createDefaultSchedule());
        reset(defaultFormValues);
      }
    } else {
      setScheduleState(createDefaultSchedule());
      reset(defaultFormValues);
    }
  }, [availabilityData, reset]);

  const isPending = useMemo(() => 
    isSubmitting || createAvailability.isPending || updateAvailability.isPending || partialUpdateAvailability.isPending
  , [isSubmitting, createAvailability.isPending, updateAvailability.isPending, partialUpdateAvailability.isPending]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader size="lg" color="#1D9B5E" />
          <p className="mt-4 text-gray-600">Loading availability settings...</p>
        </div>
      </div>
    );
  }

  return (
    <AvailabilityErrorBoundary>
      {/* Full width container with proper padding */}
      <div className="w-full space-y-4 max-w-7xl mx-auto">
        {/* Working Hours Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
                </div>
                <div>
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900">Working Hours</h2>
                  <p className="text-xs lg:text-sm text-gray-600">Set your availability and time slots for bookings</p>
                </div>
              </div>
              {!isEditing && (
                <Button
                  type="button"
                  onClick={() => {
                    console.log('✏️ Edit button clicked');
                    setIsEditing(true);
                  }}
                  className="bg-secondary hover:bg-secondary/90 text-white px-4 lg:px-5 py-2 lg:py-2.5 rounded-lg font-medium text-sm w-full sm:w-auto"
                >
                  {hasAvailability ? 'Edit Availability' : 'Set Availability'}
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 lg:p-6">
            <div className="space-y-4">
              {/* Days of Week */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Weekly Schedule</h3>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayData = scheduleState[day] || { isOpen: false, shifts: [] };
                    
                    return (
                      <NewDaySchedule
                        key={day}
                        day={day}
                        daySchedule={dayData}
                        isEditing={isEditing}
                        onUpdate={handleScheduleUpdate}
                        validationErrors={validationErrors}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="px-4 lg:px-5 py-2 text-gray-600 border-gray-300 hover:bg-gray-50 rounded-lg font-medium text-sm"
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={isPending || Object.keys(validationErrors).length > 0}
                    className="px-4 lg:px-5 py-2 bg-secondary hover:bg-secondary/90 text-white disabled:opacity-50 rounded-lg font-medium text-sm"
                  >
                    {isPending ? 'Saving...' : 'Save Availability'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Exceptions Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ExceptionIcon className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-base lg:text-lg font-semibold text-gray-900">Exceptions</h2>
                <p className="text-xs lg:text-sm text-gray-600">Mark specific dates when you won't be available</p>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-6">
            <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Calendar */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Select Dates</h3>
                
                {/* Color Legend */}
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                 <div className='mb-2'>
                 <Text size="xs" fw={500} className="text-gray-700 ">Calendar Legend:</Text>
                 </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
                      <span className="text-gray-600">Business Exception</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
                      <span className="text-gray-600">Approved Staff Exception</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></div>
                      <span className="text-gray-600">Pending Staff Exception</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-amber-400 border border-amber-500"></div>
                      <span className="text-gray-600">Multiple Exceptions</span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <Calendar
                    value={selectedExceptionDate}
                    onChange={(date) => date && handleCalendarDayClick(date)}
                    minDate={new Date()}
                    size="sm"
                    className="w-full"
                    getDayProps={(date) => {
                      // Fix timezone issue: use consistent local date formatting
                      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                      const dateStr = localDate.toISOString().split('T')[0];
                      
                      // Check for business exceptions
                      const hasBusinessException = watchedExceptions?.some(ex => ex.date === dateStr);
                      
                      // Check for staff exceptions
                      const staffExceptionsForDate = (staffExceptions as StaffException[])?.filter(ex => ex.date === dateStr) || [];
                      const hasPendingStaffException = staffExceptionsForDate.some(ex => ex.status === 'pending');
                      const hasApprovedStaffException = staffExceptionsForDate.some(ex => ex.status === 'approved');
                      const hasDeniedStaffException = staffExceptionsForDate.some(ex => ex.status === 'denied');
                      
                      // Determine styling based on exception types
                      let backgroundColor = '#ffffff';
                      let color = '#374151';
                      let fontWeight = 'normal';
                      
                      if (hasBusinessException && (hasPendingStaffException || hasApprovedStaffException)) {
                        // Both business and staff exceptions
                        backgroundColor = '#fbbf24'; // amber
                        color = '#ffffff';
                        fontWeight = 'bold';
                      } else if (hasBusinessException) {
                        // Business exception only
                        backgroundColor = '#fee2e2'; // red-100
                        color = '#dc2626'; // red-600
                        fontWeight = 'bold';
                      } else if (hasPendingStaffException) {
                        // Pending staff exception
                        backgroundColor = '#fef3c7'; // yellow-100
                        color = '#d97706'; // yellow-600
                        fontWeight = 'bold';
                      } else if (hasApprovedStaffException) {
                        // Approved staff exception
                        backgroundColor = '#dcfce7'; // green-100
                        color = '#16a34a'; // green-600
                        fontWeight = 'bold';
                      } else if (hasDeniedStaffException) {
                        // Denied staff exception (lighter styling)
                        backgroundColor = '#f9fafb'; // gray-50
                        color = '#6b7280'; // gray-500
                        fontWeight = 'normal';
                      }
                      
                      return {
                        onClick: () => {
                          if (staffExceptionsForDate.length > 0) {
                            // Show staff exception details if there are staff exceptions
                            setSelectedStaffException(staffExceptionsForDate[0]);
                            setStaffExceptionModalOpen(true);
                          } else {
                            // Add business exception
                            handleCalendarDayClick(date);
                          }
                        },
                        style: {
                          backgroundColor,
                          color,
                          fontWeight,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          position: 'relative',
                        }
                      };
                    }}
                  />
                </div>
              </div>

              {/* Current Exceptions */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Current Exceptions</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {watchedExceptions?.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <ExceptionIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-medium mb-1">No exceptions added yet</p>
                      <p className="text-xs">Click on a calendar date to add an exception</p>
                    </div>
                  ) : (
                    watchedExceptions?.map((exception, index) => (
                      <div key={index} className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge 
                                color="red" 
                                size="xs" 
                                className="font-medium"
                              >
                                {(() => {
                                  // Fix timezone issue: parse date components directly
                                  const [year, month, day] = exception.date.split('-').map(Number);
                                  const localDate = new Date(year, month - 1, day); // month is 0-indexed
                                  return localDate.toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                  });
                                })()}
                              </Badge>
                              {exception.isAllDay ? (
                                <Badge variant="outline" color="gray" size="xs">
                                  All Day
                                </Badge>
                              ) : (
                                <Badge variant="outline" color="orange" size="xs">
                                  Partial
                                </Badge>
                              )}
                            </div>
                            
                            {exception.reason && (
                              <div className="mb-2">
                                <Text size="xs" color="dimmed" className="font-medium mb-0.5">Reason:</Text>
                                <Text size="sm" className="text-gray-700 bg-white/60 rounded px-2 py-1 text-xs truncate">
                                  {exception.reason}
                                </Text>
                              </div>
                            )}
                            
                            {!exception.isAllDay && exception.timeSlots && (
                              <div>
                                <Text size="xs" color="dimmed" className="font-medium mb-1">Hours:</Text>
                                <div className="flex flex-wrap gap-1">
                                  {exception.timeSlots.map((slot, i) => (
                                    <Badge key={i} variant="light" color="red" size="xs">
                                      {slot.start}-{slot.end}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <Tooltip label="Remove exception">
                            <ActionIcon
                              variant="light"
                              color="red"
                              size="xs"
                              onClick={() => removeException(index)}
                              className="ml-2 flex-shrink-0"
                            >
                              <ExceptionIcon className="w-3 h-3" />
                            </ActionIcon>
                          </Tooltip>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exception Modal */}
        <Modal
          opened={exceptionModalOpen}
          onClose={() => {
            setExceptionModalOpen(false);
            setSelectedExceptionDate(null);
            setExceptionReason('');
            setExceptionIsAllDay(true);
            setExceptionTimeSlots([{ start: '09:00', end: '17:00' }]);
          }}
          title="Add Business Exception"
          size="md"
          centered
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Date
              </label>
              <div className="p-3 bg-secondary/10 rounded-lg">
                <p className="text-secondary font-semibold">
                  {selectedExceptionDate?.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) || 'No date selected'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exception Type
              </label>
              <div className="flex items-center gap-3">
                <CustomToggle
                  checked={exceptionIsAllDay}
                  onChange={setExceptionIsAllDay}
                />
                <span className="text-sm font-medium">
                  {exceptionIsAllDay ? 'All Day' : 'Specific Hours'}
                </span>
              </div>
            </div>

            {!exceptionIsAllDay && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unavailable Time Slots
                </label>
                <div className="space-y-2">
                  {exceptionTimeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => {
                          const newSlots = [...exceptionTimeSlots];
                          newSlots[index].start = e.target.value;
                          setExceptionTimeSlots(newSlots);
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-gray-500 text-sm">to</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => {
                          const newSlots = [...exceptionTimeSlots];
                          newSlots[index].end = e.target.value;
                          setExceptionTimeSlots(newSlots);
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      {exceptionTimeSlots.length > 1 && (
                        <ActionIcon
                          variant="light"
                          color="red"
                          size="sm"
                          onClick={() => {
                            setExceptionTimeSlots(exceptionTimeSlots.filter((_, i) => i !== index));
                          }}
                        >
                          <ExceptionIcon className="w-3 h-3" />
                        </ActionIcon>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setExceptionTimeSlots([...exceptionTimeSlots, { start: '09:00', end: '17:00' }]);
                    }}
                    className="w-full border-dashed border-2 text-sm py-2"
                  >
                    <PlusIcon className="w-3 h-3 mr-1" />
                    Add Time Slot
                  </Button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={exceptionReason}
                onChange={(e) => setExceptionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                rows={3}
                placeholder="e.g., Personal day, Holiday, Conference, etc."
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setExceptionModalOpen(false);
                  setSelectedExceptionDate(null);
                  setExceptionReason('');
                  setExceptionIsAllDay(true);
                  setExceptionTimeSlots([{ start: '09:00', end: '17:00' }]);
                }}
                className="px-4 py-2 text-sm"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddException}
                disabled={!selectedExceptionDate}
                className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white text-sm"
              >
                Add Exception
              </Button>
            </div>
          </div>
        </Modal>

        {/* Staff Exception Details Modal */}
        <Modal
          opened={staffExceptionModalOpen}
          onClose={() => {
            setStaffExceptionModalOpen(false);
            setSelectedStaffException(null);
            setAdminNotes('');
          }}
          title="Staff Exception Details"
          size="lg"
          centered
        >
          {selectedStaffException && (
            <div className="space-y-6">
              {/* Exception Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text size="sm" fw={600} className="text-gray-700 mb-1">Staff Member</Text>
                  <Text size="sm" className="text-gray-900">{selectedStaffException.staff_name}</Text>
                </div>
                <div>
                  <Text size="sm" fw={600} className="text-gray-700 mb-1">Date</Text>
                  <Text size="sm" className="text-gray-900">
                    {new Date(selectedStaffException.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={600} className="text-gray-700 mb-1">Exception Type</Text>
                  <Badge color="blue" variant="light" size="sm">
                    {selectedStaffException.exception_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Text size="sm" fw={600} className="text-gray-700 mb-1">Duration</Text>
                  <Badge color={selectedStaffException.is_all_day ? "red" : "orange"} variant="light" size="sm">
                    {selectedStaffException.is_all_day ? "All Day" : 
                     `${selectedStaffException.start_time} - ${selectedStaffException.end_time}`}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Text size="sm" fw={600} className="text-gray-700 mb-1">Reason</Text>
                  <Text size="sm" className="text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedStaffException.reason || 'No reason provided'}
                  </Text>
                </div>
              </div>

              <Divider />

              {/* Status Information */}
              <div>
                <Text size="sm" fw={600} className="text-gray-700 mb-2">Status Information</Text>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text size="sm" fw={600} className="text-gray-700 mb-1">Current Status</Text>
                    <Badge 
                      color={
                        selectedStaffException.status === 'approved' ? 'green' :
                        selectedStaffException.status === 'denied' ? 'red' : 'yellow'
                      }
                      variant="filled"
                      size="sm"
                    >
                      {selectedStaffException.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Text size="sm" fw={600} className="text-gray-700 mb-1">Requested On</Text>
                    <Text size="sm" className="text-gray-900">
                      {new Date(selectedStaffException.created_at).toLocaleDateString()}
                    </Text>
                  </div>
                  {selectedStaffException.reviewed_at && (
                    <>
                      <div>
                        <Text size="sm" fw={600} className="text-gray-700 mb-1">Reviewed By</Text>
                        <Text size="sm" className="text-gray-900">
                          {selectedStaffException.reviewed_by_name || 'Admin'}
                        </Text>
                      </div>
                      <div>
                        <Text size="sm" fw={600} className="text-gray-700 mb-1">Reviewed On</Text>
                        <Text size="sm" className="text-gray-900">
                          {new Date(selectedStaffException.reviewed_at).toLocaleDateString()}
                        </Text>
                      </div>
                    </>
                  )}
                </div>
                {selectedStaffException.admin_notes && (
                  <div className="mt-3">
                    <Text size="sm" fw={600} className="text-gray-700 mb-1">Admin Notes</Text>
                    <Text size="sm" className="text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedStaffException.admin_notes}
                    </Text>
                  </div>
                )}
              </div>

              {/* Action Section - Only show if pending */}
              {selectedStaffException.status === 'pending' && (
                <>
                  <Divider />
                  <div>
                    <Text size="sm" fw={600} className="text-gray-700 mb-3">Admin Action</Text>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Notes (Optional)
                        </label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                          rows={3}
                          placeholder="Add notes about your decision..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            approveStaffException.mutate(
                              { id: selectedStaffException.id, admin_notes: adminNotes },
                              {
                                onSuccess: () => {
                                  notifications.show({
                                    title: 'Exception Approved',
                                    message: 'Staff exception has been approved successfully',
                                    color: 'green',
                                    icon: <img src={successIcon} alt="Success" className="w-4 h-4" />,
                                  });
                                  setStaffExceptionModalOpen(false);
                                  setSelectedStaffException(null);
                                  setAdminNotes('');
                                },
                                onError: () => {
                                  notifications.show({
                                    title: 'Error',
                                    message: 'Failed to approve exception',
                                    color: 'red',
                                    icon: <img src={errorIcon} alt="Error" className="w-4 h-4" />,
                                  });
                                }
                              }
                            );
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={approveStaffException.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => {
                            denyStaffException.mutate(
                              { id: selectedStaffException.id, admin_notes: adminNotes },
                              {
                                onSuccess: () => {
                                  notifications.show({
                                    title: 'Exception Denied',
                                    message: 'Staff exception has been denied',
                                    color: 'orange',
                                    icon: <img src={successIcon} alt="Success" className="w-4 h-4" />,
                                  });
                                  setStaffExceptionModalOpen(false);
                                  setSelectedStaffException(null);
                                  setAdminNotes('');
                                },
                                onError: () => {
                                  notifications.show({
                                    title: 'Error',
                                    message: 'Failed to deny exception',
                                    color: 'red',
                                    icon: <img src={errorIcon} alt="Error" className="w-4 h-4" />,
                                  });
                                }
                              }
                            );
                          }}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          disabled={denyStaffException.isPending}
                        >
                          Deny
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Close Button */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStaffExceptionModalOpen(false);
                    setSelectedStaffException(null);
                    setAdminNotes('');
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AvailabilityErrorBoundary>
  );
};

export default React.memo(Availability); 