import { useForm, Controller, FormProvider } from 'react-hook-form';
import {
  Category,
  ClassType,
  CreateSessionData,
  RepeatUnit,
  Session,
} from '../../types/sessionTypes';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';
import Button from '../common/Button';
import DropdownSelectInput from '../common/Dropdown';
import Input from '../common/Input';
import { useEffect, useState } from 'react';
import { repeatDays, weekdayNames, days } from '../../utils/dummyData';
import ChevronUp from '../../assets/icons/up.svg';
import ChevronDown from '../../assets/icons/down.svg';
import { DatePickerInput } from '@mantine/dates';
import {
  useGetStaff,
  useGetClients,
  useGetSessionCategories,
  useGetLocations,
  useGetPolicies,
  useUpdateSession,
  useGetBookingSettings,
  useGetClassTypes,
} from '../../hooks/reactQuery';
import { useGetSessionDetail } from '../../hooks/reactQuery';
import moment from 'moment';
import { Drawer, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Policy } from '../../types/policy';
import { useTimezone } from '../../contexts/TimezoneContext';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  onUpdateSuccess?: () => void;
  zIndex?: number;
  fromClientDrawer?: boolean;
  pendingClientData?: Record<string, unknown>;
}

const UpdateSession = ({
  isOpen,
  onClose,
  sessionId,
  onUpdateSuccess,
  zIndex,
  fromClientDrawer,
  pendingClientData,
}: SessionModalProps) => {
  const { state: timezoneState } = useTimezone();
  type SessionWithClassType = Session & { class_type_detail?: ClassType };
  const { data: sessionData } = useGetSessionDetail<SessionWithClassType>(
    sessionId || ''
  );
  const updateSessionMutation = useUpdateSession();
  
  // Check if this is a private session that shouldn't be edited
  const isPrivateSession = sessionData?.class_type_detail?.name === 'Private' || 
                           sessionData?.class_type === 'Private' ||
                           (sessionData?.title && sessionData.title.includes(' for ')) ||
                           (sessionData as any)?.is_bookable === false;
  type CustomSessionData = Omit<
    CreateSessionData,
    'repetition' | 'class_type'
  > & {
    repetition?: string;
    class_type?:
      | string
      | { value: string; label: string; description?: string }
      | ClassType;
  };

  const methods = useForm<Partial<CustomSessionData>>({
    mode: 'onSubmit',
    defaultValues: {
      title: '',
      description: '',
      session_type: 'class',
      date: '',
      start_time: '',
      end_time: '',
      repeat_every: undefined,
      repeat_unit: undefined,
      repeat_on: undefined,
      staff: undefined,
      staff_ids: [],
      category: undefined,
      location_id: undefined,
      location_ids: [],
      client_ids: [],
      repeat_end_type: 'never',
      repeat_end_date: undefined,
      repeat_occurrences: undefined,
      spots: 0,
      class_type: '',
      email: '',
      phone_number: '',
      selected_class: undefined,
    },
  });

  const { data: staffData, isLoading: isStaffLoading } = useGetStaff();
  const { data: clientsData, isLoading: isClientsLoading } = useGetClients();
  const { data: categoriesData } = useGetSessionCategories();
  const { data: locationsData, isLoading: isLocationsLoading } =
    useGetLocations();
  const { data: policiesData, isLoading: isPoliciesLoading } = useGetPolicies();
  const { data: bookingSettings } = useGetBookingSettings();
  const { data: classTypes, isLoading: isLoadingClassTypes } =
    useGetClassTypes();

  const [
    isRepetitionModalOpen,
    { open: openRepetitionModal, close: closeRepetitionModal },
  ] = useDisclosure();

  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [endsOption, setEndsOption] = useState<'never' | 'on' | 'after'>(
    'never'
  );
  const [occurrences, setOccurrences] = useState(2);
  const [value, setValue] = useState<Date | null>(null);

  const handleWeekdayClick = (day: string) => {
    setSelectedWeekdays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const handleEndsOptionChange = (option: 'never' | 'on' | 'after') => {
    setEndsOption(option);
    methods.setValue('repeat_end_type', option);

    if (option === 'never') {
      methods.setValue('repeat_end_date', undefined);
      methods.setValue('repeat_occurrences', undefined);
      setValue(null);
    } else if (option === 'on') {
      methods.setValue('repeat_occurrences', undefined);
    } else if (option === 'after') {
      methods.setValue('repeat_end_date', undefined);
      setValue(null);
      methods.setValue('repeat_occurrences', occurrences);
    }
  };

  const handleOccurrencesChange = (change: number) => {
    const newValue = Math.max(2, occurrences + change);
    setOccurrences(newValue);
    if (endsOption === 'after') {
      methods.setValue('repeat_occurrences', newValue);
    }
  };

  useEffect(() => {
    if (sessionData && isOpen) {
      if (sessionData.repeat_on && Array.isArray(sessionData.repeat_on)) {
        setSelectedWeekdays(sessionData.repeat_on);
      }

      if (sessionData.repeat_end_type) {
        setEndsOption(sessionData.repeat_end_type as 'never' | 'on' | 'after');
      }

      if (sessionData.repeat_occurrences) {
        setOccurrences(sessionData.repeat_occurrences);
      }

      if (sessionData.repeat_end_date) {
        setValue(new Date(sessionData.repeat_end_date));
      }

      let repetitionValue: string = 'none';

      if (
        sessionData.repetition &&
        typeof sessionData.repetition === 'string'
      ) {
        repetitionValue = sessionData.repetition;
      } else if (sessionData.repeat_unit) {
        if (sessionData.repeat_unit === 'days') {
          repetitionValue = 'daily';
        } else if (sessionData.repeat_unit === 'weeks') {
          if (
            sessionData.repeat_on &&
            Array.isArray(sessionData.repeat_on) &&
            sessionData.repeat_on.length > 0
          ) {
            const weekdayLabels = sessionData.repeat_on
              .map((day) => {
                if (!isNaN(Number(day))) {
                  const dayIndex = Number(day);
                  return (
                    weekdayNames[dayIndex as keyof typeof weekdayNames] || day
                  );
                }
                const dayIndex = days.findIndex((d) => d === day);
                if (dayIndex !== -1) {
                  return (
                    weekdayNames[dayIndex as keyof typeof weekdayNames] || day
                  );
                }
                return day;
              })
              .join(', ');

            repetitionValue = `Weekly on ${weekdayLabels}`;

            if (
              sessionData.repeat_end_type === 'on' &&
              sessionData.repeat_end_date
            ) {
              repetitionValue += ` until ${moment(
                sessionData.repeat_end_date
              ).format('MM/DD/YYYY')}`;
            } else if (
              sessionData.repeat_end_type === 'after' &&
              sessionData.repeat_occurrences
            ) {
              repetitionValue += ` for ${sessionData.repeat_occurrences} occurrences`;
            }
          } else {
            repetitionValue = 'weekly';
          }
        } else if (sessionData.repeat_unit === 'months') {
          repetitionValue = 'monthly';
        }
      }

      const formattedDate = sessionData.date
        ? moment(sessionData.date).format('YYYY-MM-DD')
        : '';

      const clientIds =
        sessionData.attendances
          ?.filter((a) => a.client !== null && a.participant_type === 'client')
          .map((a) => {
            return typeof a.client === 'object' && a.client !== null
              ? a.client.id
              : typeof a.client === 'number'
              ? a.client
              : null;
          })
          .filter((id) => id !== null) || [];

      const policyIds =
        sessionData.policy_ids || sessionData.policies?.map((p) => p.id) || [];

      let staffId = null;
      if (sessionData.staff) {
        if (
          typeof sessionData.staff === 'object' &&
          sessionData.staff !== null
        ) {
          const staffObj = sessionData.staff as Record<string, any>;
          if ('id' in staffObj) {
            staffId = staffObj.id;
          }
        } else if (typeof sessionData.staff === 'number') {
          staffId = sessionData.staff;
        }
      }

      const formattedStartTime =
        sessionData._frontend_start_time ||
        (sessionData.start_time
          ? moment(sessionData.start_time).format('HH:mm')
          : '');
      const formattedEndTime =
        sessionData._frontend_end_time ||
        (sessionData.end_time
          ? moment(sessionData.end_time).format('HH:mm')
          : '');

      // Format class type for dropdown
      const formattedClassType = (() => {
        // Use class_type_detail if available (new format)
        if (sessionData.class_type_detail) {
          return {
            value: sessionData.class_type_detail.id?.toString() || '',
            label: sessionData.class_type_detail.name || '',
            description: sessionData.class_type_detail.description || '',
          };
        }

        // Fallback to class_type string (legacy format)
        if (
          sessionData.class_type &&
          typeof sessionData.class_type === 'string'
        ) {
          return {
            value: sessionData.class_type,
            label:
              sessionData.class_type.charAt(0).toUpperCase() +
              sessionData.class_type.slice(1),
          };
        }

        // Default fallback
        return { value: 'regular', label: 'Regular' };
      })();

      methods.reset({
        title: sessionData.title || '',
        description: sessionData.description || '',
        session_type: sessionData.session_type || 'class',
        class_type: formattedClassType,
        date: formattedDate,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        spots: sessionData.spots,
        category: sessionData.category?.id,
        location_id: sessionData.location?.id,
        is_active: sessionData.is_active,
        client_ids: clientIds,
        email: sessionData.email || '',
        phone_number: sessionData.phone_number || '',
        selected_class: sessionData.selected_class,
        repetition: repetitionValue as any,
        repeat_every: sessionData.repeat_every,
        repeat_unit: sessionData.repeat_unit,
        repeat_on: sessionData.repeat_on,
        repeat_end_type: sessionData.repeat_end_type,
        repeat_end_date: sessionData.repeat_end_date,
        repeat_occurrences: sessionData.repeat_occurrences,
        policy_ids: policyIds,
        staff: staffId,

        // Multi-select fields - populate from available staff/locations if present, otherwise from single selections
        staff_ids: sessionData.allow_staff_selection
          ? sessionData.available_staff &&
            sessionData.available_staff.length > 0
            ? sessionData.available_staff.map((staff: any) => staff.id)
            : staffId
            ? [staffId]
            : []
          : [],
        location_ids: sessionData.allow_location_selection
          ? sessionData.available_locations &&
            sessionData.available_locations.length > 0
            ? sessionData.available_locations.map(
                (location: any) => location.id
              )
            : sessionData.location?.id
            ? [sessionData.location.id]
            : []
          : [],

        // Flexible booking fields
        allow_staff_selection: sessionData.allow_staff_selection || false,
        allow_location_selection: sessionData.allow_location_selection || false,
        require_staff_confirmation:
          sessionData.require_staff_confirmation || false,
        staff_confirmation_timeout_hours:
          sessionData.staff_confirmation_timeout_hours || 24,
        auto_assign_when_single_option:
          sessionData.auto_assign_when_single_option || false,
      });

      const staff_ids_value = sessionData.allow_staff_selection
        ? sessionData.available_staff && sessionData.available_staff.length > 0
          ? sessionData.available_staff.map((staff: any) => staff.id)
          : staffId
          ? [staffId]
          : []
        : [];

      const location_ids_value = sessionData.allow_location_selection
        ? sessionData.available_locations &&
          sessionData.available_locations.length > 0
          ? sessionData.available_locations.map((location: any) => location.id)
          : sessionData.location?.id
          ? [sessionData.location.id]
          : []
        : [];

      methods.setValue('date', formattedDate);
      methods.setValue('start_time', formattedStartTime);
      methods.setValue('end_time', formattedEndTime);
      methods.setValue('client_ids', clientIds);
      methods.setValue('policy_ids', policyIds);
      methods.setValue('staff', staffId);

      // Populate multi-select fields when flexible booking is enabled
      if (sessionData.allow_staff_selection) {
        const staff_ids_value =
          sessionData.available_staff && sessionData.available_staff.length > 0
            ? sessionData.available_staff.map((staff: any) => staff.id)
            : staffId
            ? [staffId]
            : [];
        methods.setValue('staff_ids', staff_ids_value);
      }

      if (sessionData.allow_location_selection) {
        const location_ids_value =
          sessionData.available_locations &&
          sessionData.available_locations.length > 0
            ? sessionData.available_locations.map(
                (location: any) => location.id
              )
            : sessionData.location?.id
            ? [sessionData.location.id]
            : [];
        methods.setValue('location_ids', location_ids_value);
      }

      if (sessionData.repeat_on && Array.isArray(sessionData.repeat_on)) {
        const dayNames = sessionData.repeat_on.map((day) => {
          if (!isNaN(Number(day))) {
            return days[Number(day)];
          }
          return day;
        });
        setSelectedWeekdays(dayNames);

        methods.setValue('repeat_on', dayNames);
      }

      if (sessionData.repeat_end_type) {
        setEndsOption(sessionData.repeat_end_type as 'never' | 'on' | 'after');
      }

      if (sessionData.repeat_end_date) {
        setValue(new Date(sessionData.repeat_end_date));
      }

      if (sessionData.repeat_occurrences) {
        setOccurrences(sessionData.repeat_occurrences);
      }
    }
  }, [sessionData, isOpen]);

  const onSubmit = async (data: Partial<CustomSessionData>) => {
    if (!sessionId) return;

    try {
      const extractValue = (field: any, fieldName?: string) => {
        if (field === null || field === undefined) return null;
        if (typeof field === 'object') {
          if (fieldName === 'class_type' && 'value' in field) {
            const value = field.value;
            return value ? Number(value) : null;
          }
          if ('value' in field) return field.value;
        }
        if (
          fieldName === 'class_type' &&
          typeof field === 'string' &&
          !isNaN(Number(field))
        ) {
          return Number(field);
        }
        return field;
      };

      const dateOnly = data.date
        ? moment(data.date).format('YYYY-MM-DD')
        : undefined;

      let repeatUnit: RepeatUnit | undefined = undefined;
      let repeatEvery: number | undefined = undefined;
      let repeatOn: string[] | undefined = undefined;
      let repeatEndType: string | undefined = undefined;
      let repeatEndDate: string | undefined = undefined;
      let repeatOccurrences: number | undefined = undefined;

      if (data.repetition && data.repetition !== 'none') {
        repeatEvery = 1;

        if (data.repetition === 'daily') {
          repeatUnit = 'days';
        } else if (data.repetition === 'weekly') {
          repeatUnit = 'weeks';
          repeatOn = selectedWeekdays.length > 0 ? selectedWeekdays : undefined;
        } else if (data.repetition === 'monthly') {
          repeatUnit = 'months';
        } else if (
          data.repetition === 'custom' ||
          (typeof data.repetition === 'string' &&
            !['none', 'daily', 'weekly', 'monthly', 'custom'].includes(
              data.repetition
            ))
        ) {
          repeatUnit = 'weeks';
          repeatEvery = 1;

          repeatOn = selectedWeekdays;
        }

        repeatEndType = endsOption;
        if (endsOption === 'on' && value) {
          repeatEndDate = moment(value).format('YYYY-MM-DD');
        } else if (endsOption === 'after') {
          repeatOccurrences = occurrences;
        }
      }

      let clientIds: any[] = [];

      if (data.session_type === 'appointment') {
        if (Array.isArray(data.client_ids) && data.client_ids.length > 0) {
          const clientId = data.client_ids[0];
          if (clientId !== null && clientId !== undefined) {
            if (
              typeof clientId === 'object' &&
              clientId !== null &&
              'value' in clientId
            ) {
              clientIds = [(clientId as { value: string | number }).value];
            } else {
              clientIds = [clientId];
            }
          }
        }
      } else {
        clientIds = data.client_ids || [];

        clientIds = clientIds.filter(
          (id: any) => id !== null && id !== undefined
        );
        clientIds = clientIds.map((id: any) => {
          if (typeof id === 'object' && id !== null && 'value' in id) {
            return (id as { value: string | number }).value;
          }
          return id;
        });

        clientIds = clientIds.filter(
          (id: any) => id !== null && id !== undefined
        );

        clientIds = [...new Set(clientIds)];
      }

      // Handle staff assignment - prioritize multi-select if available
      const staffAssignment =
        data.staff_ids && data.staff_ids.length > 0
          ? { staff_ids: data.staff_ids }
          : data.staff
          ? { staff: extractValue(data.staff) }
          : {};

      // Handle location assignment - prioritize multi-select if available
      const locationAssignment =
        data.location_ids && data.location_ids.length > 0
          ? { location_ids: data.location_ids }
          : data.location_id
          ? { location_id: extractValue(data.location_id) }
          : {};

      const businessTimezone =
        timezoneState.businessTimezone || 'Africa/Nairobi';

      const formattedStartTime =
        data.start_time && data.start_time.trim() && dateOnly
          ? `${dateOnly}T${data.start_time}:00`
          : null;
      const formattedEndTime =
        data.end_time && data.end_time.trim() && dateOnly
          ? `${dateOnly}T${data.end_time}:00`
          : null;

      const formattedData: any = {
        title: data.title,
        description: data.description,
        session_type: data.session_type,
        class_type: extractValue(data.class_type, 'class_type'),
        date: dateOnly,
        spots: data.spots ? parseInt(data.spots.toString()) : undefined,
        category: extractValue(data.category),
        ...locationAssignment,
        ...staffAssignment,
        repeat_every: repeatEvery,
        repeat_unit: repeatUnit,
        repeat_on: repeatOn,
        repeat_end_type: repeatEndType,
        repeat_end_date: repeatEndDate,
        repeat_occurrences: repeatOccurrences,
        is_active: true,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        email: data.email,
        phone_number: data.phone_number,
        selected_class: data.selected_class,
        client_ids: [],
        policy_ids: data.policy_ids || [],

        // Flexible booking fields
        allow_staff_selection: data.allow_staff_selection || false,
        allow_location_selection: data.allow_location_selection || false,
        require_staff_confirmation: data.require_staff_confirmation || false,
        staff_confirmation_timeout_hours:
          data.staff_confirmation_timeout_hours || 24,
        auto_assign_when_single_option:
          data.auto_assign_when_single_option || false,
      };

      formattedData.client_ids = clientIds;

      await updateSessionMutation.mutateAsync({
        id: sessionId,
        updateData: formattedData,
      });

      if (onUpdateSuccess) {
        onUpdateSuccess();
      }

      onClose();
      methods.reset();
      notifications.show({
        title: 'Success',
        message:
          data.session_type === 'class'
            ? 'Class updated successfully!'
            : 'Appointment updated successfully!',
        color: 'green',
        radius: 'md',
        icon: (
          <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
            <img src={successIcon} alt='Success' className='w-4 h-4' />
          </span>
        ),
        withBorder: true,
        autoClose: 3000,
        position: 'top-right',
      });
    } catch (error: any) {
      console.error('Error:', error);

      if (error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Response Status:', error.response.status);

        const errorData = error.response.data;
        const errorMessages = Object.entries(errorData)
          .map(([field, errors]) => `${field}: ${errors}`)
          .join('\n');

        if (methods.formState.errors) {
          Object.keys(error.response.data).forEach((field) => {
            const safeField = field;
            methods.setError(safeField as any, {
              type: 'manual',
              message: error.response.data[field][0],
            });
          });
        }

        notifications.show({
          title: 'Error',
          message: `Failed to update session: ${errorMessages}`,
          color: 'red',
          radius: 'md',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
        });
      } else if (error.request) {
        console.error('Error Request:', error.request);
        notifications.show({
          title: 'Connection Error',
          message:
            'No response received from server. Please check your connection.',
          color: 'red',
          radius: 'md',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
        });
      } else {
        console.error('Error Message:', error.message || 'Unknown error');
        notifications.show({
          title: 'Error',
          message: 'Failed to update session. Please try again.',
          color: 'red',
          radius: 'md',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
        });
      }
    }
  };

  const pendingClientNotice = fromClientDrawer ? (
    <div className='bg-blue-50 p-3 mb-4 rounded-md border border-blue-200'>
      <div className='flex items-start'>
        <div className='flex-shrink-0 pt-0.5'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 text-blue-500'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
              clipRule='evenodd'
            />
          </svg>
        </div>
        <div className='ml-3'>
          <h3 className='text-sm font-medium text-blue-800'>
            Updating Session for Client
          </h3>
          <div className='mt-1 text-sm text-blue-700'>
            <p>
              You are updating a session that was created from a client record.
            </p>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  const privateSessionNotice = isPrivateSession ? (
    <div className='bg-red-50 p-3 mb-4 rounded-md border border-red-200'>
      <div className='flex items-start'>
        <div className='flex-shrink-0 pt-0.5'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 text-red-500'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
              clipRule='evenodd'
            />
          </svg>
        </div>
        <div className='ml-3'>
          <h3 className='text-sm font-medium text-red-800'>
            Private Client Session
          </h3>
          <div className='mt-1 text-sm text-red-700'>
            <p>
              This is a private session created for a specific client booking. 
              These sessions cannot be edited to maintain privacy and booking integrity.
            </p>
            <p className='mt-1'>
              To make changes, please contact the client directly or cancel and recreate the booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Drawer
        opened={isOpen}
        onClose={onClose}
        size='lg'
        title={
          methods.watch('session_type') === 'class'
            ? 'Update Class'
            : methods.watch('session_type') === 'appointment'
            ? 'Update Appointment'
            : 'Update Event'
        }
        position='right'
        zIndex={zIndex}
        styles={{
          header: {
            padding: '1.5rem 2rem',
            marginBottom: 0,
          },
          title: {
            fontWeight: 600,
            fontSize: '1.25rem',
          },
          close: {
            color: '#374151',
          },
          body: {
            padding: 0,
          },
        }}
      >
        <div className='flex flex-col'>
          <FormProvider {...methods}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                methods.handleSubmit(onSubmit)(e);
              }}
              className='flex-1 flex flex-col'
            >
              <div className='flex-1 p-8'>
                {pendingClientNotice}
                {privateSessionNotice}
                {isPrivateSession ? (
                  <div className='text-center py-8'>
                    <div className='text-gray-500 text-lg'>
                      This session cannot be edited
                    </div>
                  </div>
                ) : (
                <div className='space-y-6'>
                  {methods.watch('session_type') === 'class' ? (
                    <div className='space-y-4'>
                      <div className='flex flex-col space-y-3'>
                        <div>
                          <h2 className='font-medium mb-2'>Class Details</h2>
                        </div>
                        <Controller
                          name='class_type'
                          control={methods.control}
                          rules={{ required: true }}
                          render={({ field }) => {
                            let stringValue: string | undefined = undefined;

                            if (field.value) {
                              if (
                                typeof field.value === 'object' &&
                                field.value !== null &&
                                'value' in field.value
                              ) {
                                const dropdownItem = field.value as {
                                  value: string | number;
                                };
                                stringValue = String(dropdownItem.value);
                              } else {
                                stringValue = String(field.value);
                              }
                            }

                            return (
                              <DropdownSelectInput
                                value={stringValue}
                                label='Class Type'
                                placeholder='Select Class Type'
                                options={
                                  classTypes
                                    ?.map((type: ClassType) => ({
                                      label: type.name,
                                      value: type.id?.toString() || '',
                                      description: type.description || '',
                                    }))
                                    .filter(
                                      (option: {
                                        value: string;
                                        label: string;
                                        description?: string;
                                      }) => option.value
                                    ) || []
                                }
                                isLoading={isLoadingClassTypes}
                                onSelectItem={(selectedItem) =>
                                  field.onChange(selectedItem)
                                }
                                createLabel='Create new class type'
                                createDrawerType='session'
                              />
                            );
                          }}
                        />

                        <Controller
                          name='title'
                          control={methods.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              label='Class Name'
                              placeholder='Enter Class Name'
                            />
                          )}
                        />

                        <Controller
                          name='description'
                          control={methods.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type='textarea'
                              label='Description (Optional)'
                              placeholder='Enter session description'
                              rows={4}
                              containerClassName='mb-4'
                            />
                          )}
                        />
                        <Controller
                          name='category'
                          control={methods.control}
                          render={({ field }) => {
                            return (
                              <DropdownSelectInput
                                label='Class Category'
                                placeholder='Select category'
                                options={
                                  categoriesData?.map((category: Category) => ({
                                    label: category.name,
                                    value: category.id.toString(),
                                  })) || []
                                }
                                value={
                                  field.value ? field.value.toString() : ''
                                }
                                onSelectItem={(selectedItem) => {
                                  field.onChange(
                                    selectedItem ? selectedItem.value : ''
                                  );
                                }}
                                createLabel='Create new category'
                                createDrawerType='category'
                              />
                            );
                          }}
                        />
                        <div className='space-y-4'>
                          <h3 className='text-lg font-bold text-gray-700'>
                            Class Schedule
                          </h3>
                          <Controller
                            name='date'
                            control={methods.control}
                            render={({ field }) => (
                              <div className='w-full mt-4 mb-6'>
                                <div className='relative w-full'>
                                  <input
                                    type='date'
                                    id='date'
                                    value={field.value || ''}
                                    onChange={(e) => {
                                      field.onChange(e.target.value);
                                    }}
                                    className='w-full h-[58px] border border-gray-300 rounded-lg px-4 pt-6 pb-2 text-xs focus:outline-none focus:ring-[1px] focus:border-none focus:ring-secondary focus:border-secondary'
                                  />
                                  <label
                                    htmlFor='date'
                                    className='absolute top-2 text-xs left-4 transition-all duration-200 text-primary'
                                  >
                                    Date
                                  </label>
                                </div>
                              </div>
                            )}
                          />
                          <div className='grid grid-cols-2 gap-4'>
                            <Controller
                              name='start_time'
                              control={methods.control}
                              render={({ field }) => (
                                <div className='w-full mt-4'>
                                  <div className='relative w-full'>
                                    <input
                                      type='time'
                                      id='start_time'
                                      value={field.value || ''}
                                      onChange={(e) => {
                                        field.onChange(e.target.value);
                                      }}
                                      className='w-full h-[58px] border border-gray-300 rounded-lg px-4 pt-6 pb-2 text-xs focus:outline-none focus:ring-[1px] focus:border-none focus:ring-secondary focus:border-secondary'
                                    />
                                    <label
                                      htmlFor='start_time'
                                      className='absolute top-2 text-xs left-4 transition-all duration-200 text-primary'
                                    >
                                      Start Time
                                    </label>
                                  </div>
                                </div>
                              )}
                            />
                            <Controller
                              name='end_time'
                              control={methods.control}
                              render={({ field }) => (
                                <div className='w-full mt-4'>
                                  <div className='relative w-full'>
                                    <input
                                      type='time'
                                      id='end_time'
                                      value={field.value || ''}
                                      onChange={(e) => {
                                        field.onChange(e.target.value);
                                      }}
                                      className='w-full h-[58px] border border-gray-300 rounded-lg px-4 pt-6 pb-2 text-xs focus:outline-none focus:ring-[1px] focus:border-none focus:ring-secondary focus:border-secondary'
                                    />
                                    <label
                                      htmlFor='end_time'
                                      className='absolute top-2 text-xs left-4 transition-all duration-200 text-primary'
                                    >
                                      End Time
                                    </label>
                                  </div>
                                </div>
                              )}
                            />
                          </div>
                        </div>
                        <Controller
                          name='repetition'
                          control={methods.control}
                          render={({ field }) => (
                            <div>
                              <DropdownSelectInput
                                value={field.value}
                                label='Set Repetition'
                                placeholder='Does not repeat'
                                options={[
                                  { label: 'Does not repeat', value: 'none' },
                                  { label: 'Daily', value: 'daily' },
                                  { label: 'Weekly', value: 'weekly' },
                                  { label: 'Monthly', value: 'monthly' },
                                  { label: 'Custom', value: 'custom' },
                                  ...(field.value &&
                                  ![
                                    'none',
                                    'daily',
                                    'weekly',
                                    'monthly',
                                    'custom',
                                  ].includes(field.value)
                                    ? [
                                        {
                                          label: field.value,
                                          value: field.value,
                                        },
                                      ]
                                    : []),
                                ]}
                                onSelectItem={(selectedItem) => {
                                  const value =
                                    typeof selectedItem === 'string'
                                      ? selectedItem
                                      : selectedItem?.value;

                                  field.onChange(value as any);

                                  if (value === 'custom') {
                                    const currentRepeatOn =
                                      methods.getValues('repeat_on');
                                    const currentRepeatEndType =
                                      methods.getValues('repeat_end_type') ||
                                      'never';
                                    const currentRepeatEndDate =
                                      methods.getValues('repeat_end_date');
                                    const currentRepeatOccurrences =
                                      methods.getValues('repeat_occurrences');

                                    methods.setValue('repeat_unit', 'weeks');

                                    if (
                                      Array.isArray(currentRepeatOn) &&
                                      currentRepeatOn.length > 0
                                    ) {
                                      setSelectedWeekdays(currentRepeatOn);
                                    } else {
                                      const today = new Date().getDay();
                                      const dayName = days[today];
                                      setSelectedWeekdays([dayName]);
                                    }

                                    setEndsOption(
                                      currentRepeatEndType as
                                        | 'never'
                                        | 'on'
                                        | 'after'
                                    );

                                    if (currentRepeatEndDate) {
                                      setValue(new Date(currentRepeatEndDate));
                                    }

                                    if (currentRepeatOccurrences) {
                                      setOccurrences(currentRepeatOccurrences);
                                    }

                                    openRepetitionModal();
                                  }
                                }}
                              />
                            </div>
                          )}
                        />
                        <div className='flex justify-between items-center gap-4'>
                          <Controller
                            name='spots'
                            control={methods.control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label='Slots'
                                placeholder='Enter number of slots'
                                type='number'
                              />
                            )}
                          />

                          <div className='w-full mt-4'>
                            {/* Multi-select Staff for Flexible Booking */}
                            {bookingSettings?.enable_flexible_booking &&
                            methods.watch('allow_staff_selection') ? (
                              <div className='relative'>
                                <Controller
                                  name='staff_ids'
                                  control={methods.control}
                                  render={({ field }) => (
                                    <div
                                      className={`transition-all duration-300 ${
                                        methods.watch('allow_staff_selection')
                                          ? 'ring-2 ring-blue-400 ring-opacity-50'
                                          : ''
                                      }`}
                                    >
                                      <DropdownSelectInput
                                        label='Assign Staff (Multiple)'
                                        placeholder='Select Multiple Staff'
                                        singleSelect={false}
                                        options={
                                          isStaffLoading
                                            ? [
                                                {
                                                  label: 'Loading...',
                                                  value: '',
                                                },
                                              ]
                                            : staffData
                                                ?.map((staff: any) => {
                                                  if (!staff || !staff.id) {
                                                    console.warn(
                                                      'Invalid staff data:',
                                                      staff
                                                    );
                                                    return null;
                                                  }

                                                  const userData =
                                                    staff.user || {};
                                                  const email =
                                                    userData.email ||
                                                    staff.email ||
                                                    '';
                                                  const isActive =
                                                    staff.isActive ?? false;
                                                  const status = isActive
                                                    ? 'active'
                                                    : 'inactive';

                                                  if (
                                                    userData.first_name &&
                                                    userData.last_name
                                                  ) {
                                                    return {
                                                      label: `${userData.first_name} ${userData.last_name}`,
                                                      value:
                                                        staff.id.toString(),
                                                      subLabel: email,
                                                      status,
                                                    };
                                                  } else if (email) {
                                                    return {
                                                      label: email,
                                                      value:
                                                        staff.id.toString(),
                                                      subLabel: `Staff ${staff.id}`,
                                                      status,
                                                    };
                                                  } else {
                                                    return {
                                                      label: `Staff ${staff.id}`,
                                                      value:
                                                        staff.id.toString(),
                                                      status,
                                                    };
                                                  }
                                                })
                                                .filter(Boolean) || []
                                        }
                                        value={
                                          field.value
                                            ? field.value.map(String)
                                            : []
                                        }
                                        onSelectItem={(selectedItems) => {
                                          const values = Array.isArray(
                                            selectedItems
                                          )
                                            ? selectedItems.map((item) =>
                                                parseInt(item.value)
                                              )
                                            : selectedItems
                                            ? [parseInt(selectedItems.value)]
                                            : [];
                                          field.onChange(values);
                                          // Clear single staff selection when multi-select is used
                                          methods.setValue('staff', undefined);
                                        }}
                                        createLabel='Add new staff member'
                                        createDrawerType='staff'
                                      />
                                    </div>
                                  )}
                                />
                                <div className='absolute -top-1 -right-1 text-xs bg-blue-500 text-white px-2 py-1 rounded-full'>
                                  Multi-select
                                </div>
                              </div>
                            ) : (
                              <Controller
                                name='staff'
                                control={methods.control}
                                render={({ field }) => {
                                  const staffId = field.value
                                    ? typeof field.value === 'object' &&
                                      field.value !== null
                                      ? (field.value as any).id
                                      : field.value
                                    : null;

                                  const selectedStaff = staffData?.find(
                                    (staff: any) => {
                                      return (
                                        staff.id?.toString() ===
                                        staffId?.toString()
                                      );
                                    }
                                  );

                                  const staffValue = selectedStaff
                                    ? selectedStaff.id.toString()
                                    : typeof field.value === 'string' ||
                                      typeof field.value === 'number'
                                    ? field.value.toString()
                                    : '';

                                  return (
                                    <div className='flex flex-col'>
                                      <DropdownSelectInput
                                        label='Assign Staff'
                                        placeholder='Select Staff'
                                        options={
                                          isStaffLoading
                                            ? []
                                            : staffData
                                                ?.map((staff: any) => {
                                                  if (!staff || !staff.id) {
                                                    console.warn(
                                                      'Invalid staff data:',
                                                      staff
                                                    );
                                                    return null;
                                                  }

                                                  const userData =
                                                    staff.user || {};
                                                  const email =
                                                    userData.email ||
                                                    staff.email ||
                                                    '';
                                                  const isActive =
                                                    staff.isActive ?? false;
                                                  const status = isActive
                                                    ? 'active'
                                                    : 'inactive';

                                                  if (
                                                    userData.first_name &&
                                                    userData.last_name
                                                  ) {
                                                    return {
                                                      label: `${userData.first_name} ${userData.last_name}`,
                                                      value:
                                                        staff.id.toString(),
                                                      subLabel: email,
                                                      status,
                                                    };
                                                  } else if (email) {
                                                    return {
                                                      label: email,
                                                      value:
                                                        staff.id.toString(),
                                                      subLabel: `Staff ${staff.id}`,
                                                      status,
                                                    };
                                                  } else {
                                                    return {
                                                      label: `Staff ${staff.id}`,
                                                      value:
                                                        staff.id.toString(),
                                                      status,
                                                    };
                                                  }
                                                })
                                                .filter(Boolean) || []
                                        }
                                        value={staffValue}
                                        onSelectItem={(selectedItem) => {
                                          field.onChange(selectedItem.value);
                                          // Clear multi-select when single selection is used
                                          methods.setValue('staff_ids', []);
                                        }}
                                        createLabel='Add new staff member'
                                        createDrawerType='staff'
                                      />
                                      {(() => {
                                        if (!staffId) return null;

                                        let staffIdValue: string | null = null;
                                        if (
                                          typeof staffId === 'object' &&
                                          staffId !== null
                                        ) {
                                          if ('value' in staffId) {
                                            staffIdValue = String(
                                              staffId.value
                                            );
                                          } else if ('id' in staffId) {
                                            staffIdValue = String(staffId.id);
                                          }
                                        } else if (staffId) {
                                          staffIdValue = String(staffId);
                                        }

                                        if (!staffIdValue) return null;

                                        const selectedStaff = staffData?.find(
                                          (staff: any) =>
                                            staff.id.toString() === staffIdValue
                                        );

                                        if (
                                          selectedStaff &&
                                          !(selectedStaff.isActive ?? true)
                                        ) {
                                          return (
                                            <div className='mt-1 text-amber-600 text-xs flex items-center'>
                                              <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                className='h-4 w-4 mr-1'
                                                fill='none'
                                                viewBox='0 0 24 24'
                                                stroke='currentColor'
                                              >
                                                <path
                                                  strokeLinecap='round'
                                                  strokeLinejoin='round'
                                                  strokeWidth={2}
                                                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                                                />
                                              </svg>
                                              Note: This staff member has not
                                              completed their account setup yet.
                                            </div>
                                          );
                                        }

                                        return null;
                                      })()}
                                    </div>
                                  );
                                }}
                              />
                            )}

                            {(() => {
                              const staffId = methods.watch('staff');
                              const staffIds = methods.watch('staff_ids');
                              const relevantStaffIds =
                                bookingSettings?.enable_flexible_booking &&
                                methods.watch('allow_staff_selection')
                                  ? staffIds || []
                                  : staffId
                                  ? [staffId]
                                  : [];

                              if (relevantStaffIds.length === 0) return null;

                              const inactiveStaff = relevantStaffIds
                                .map((id) =>
                                  staffData?.find(
                                    (staff: any) =>
                                      staff.id.toString() === id.toString()
                                  )
                                )
                                .filter(
                                  (staff) => staff && !(staff.isActive ?? true)
                                );

                              if (inactiveStaff.length > 0) {
                                return (
                                  <div className='mt-1 text-amber-600 text-xs flex items-center'>
                                    <svg
                                      xmlns='http://www.w3.org/2000/svg'
                                      className='h-4 w-4 mr-1'
                                      fill='none'
                                      viewBox='0 0 24 24'
                                      stroke='currentColor'
                                    >
                                      <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                                      />
                                    </svg>
                                    Note: {inactiveStaff.length} selected staff{' '}
                                    {inactiveStaff.length === 1
                                      ? 'member has'
                                      : 'members have'}{' '}
                                    not completed their account setup yet.
                                  </div>
                                );
                              }

                              return null;
                            })()}
                          </div>
                        </div>
                      </div>
                      <Controller
                        name='client_ids'
                        control={methods.control}
                        render={({ field }) => {
                          // Handle both paginated response and direct array
                          const clientsItems = Array.isArray(clientsData)
                            ? clientsData
                            : clientsData?.items || [];

                          return (
                            <DropdownSelectInput
                              label='Name'
                              placeholder='Select client'
                              singleSelect={false}
                              options={
                                isClientsLoading
                                  ? [{ label: 'Loading...', value: '' }]
                                  : clientsItems
                                      ?.filter(Boolean)
                                      .map((client: any) => ({
                                        label: `${client.first_name} ${client.last_name}`,
                                        value: client.id.toString(),
                                      })) || []
                              }
                              value={
                                Array.isArray(field.value)
                                  ? field.value
                                      .filter((id) => id != null)
                                      .map((id) => id.toString())
                                  : []
                              }
                              onSelectItem={(selectedItems) => {
                                const values = Array.isArray(selectedItems)
                                  ? selectedItems.map((item) =>
                                      parseInt(item.value)
                                    )
                                  : selectedItems
                                  ? [parseInt(selectedItems.value)]
                                  : [];
                                field.onChange(values);
                              }}
                              createLabel='Add new client'
                              createDrawerType='client'
                            />
                          );
                        }}
                      />
                      {/* Multi-select Location for Flexible Booking */}
                      {bookingSettings?.enable_flexible_booking &&
                      methods.watch('allow_location_selection') ? (
                        <div className='relative'>
                          <Controller
                            name='location_ids'
                            control={methods.control}
                            render={({ field }) => (
                              <div
                                className={`transition-all duration-300 ${
                                  methods.watch('allow_location_selection')
                                    ? 'ring-2 ring-green-400 ring-opacity-50'
                                    : ''
                                }`}
                              >
                                <DropdownSelectInput
                                  label='Location (Multiple)'
                                  placeholder='Select Multiple Locations'
                                  singleSelect={false}
                                  options={
                                    isLocationsLoading
                                      ? [{ label: 'Loading...', value: '' }]
                                      : locationsData?.map((location: any) => ({
                                          label: location.name,
                                          value: location.id
                                            ? location.id.toString()
                                            : '',
                                        })) || []
                                  }
                                  value={
                                    field.value ? field.value.map(String) : []
                                  }
                                  onSelectItem={(selectedItems) => {
                                    const values = Array.isArray(selectedItems)
                                      ? selectedItems.map((item) =>
                                          parseInt(item.value)
                                        )
                                      : selectedItems
                                      ? [parseInt(selectedItems.value)]
                                      : [];
                                    field.onChange(values);
                                    // Clear single location selection when multi-select is used
                                    methods.setValue('location_id', undefined);
                                  }}
                                  createLabel='Create new location'
                                  createDrawerType='location'
                                />
                              </div>
                            )}
                          />
                          <div className='absolute -top-1 -right-1 text-xs bg-green-500 text-white px-2 py-1 rounded-full'>
                            Multi-select
                          </div>
                        </div>
                      ) : (
                        <Controller
                          name='location_id'
                          control={methods.control}
                          render={({ field }) => {
                            // Display the location's formatted address if available
                            return (
                              <DropdownSelectInput
                                label='Location'
                                placeholder='Select Location'
                                options={
                                  isLocationsLoading
                                    ? []
                                    : locationsData?.map((location: any) => ({
                                        label: location.name,
                                        value: location.id
                                          ? location.id.toString()
                                          : '',
                                      })) || []
                                }
                                value={
                                  field.value ? field.value.toString() : ''
                                }
                                onSelectItem={(selectedItem) => {
                                  field.onChange(selectedItem.value);
                                  // Clear multi-select when single selection is used
                                  methods.setValue('location_ids', []);
                                }}
                                createLabel='Create new location'
                                createDrawerType='location'
                              />
                            );
                          }}
                        />
                      )}
                      <Controller
                        name='policy_ids'
                        control={methods.control}
                        render={({ field }) => {
                          return (
                            <DropdownSelectInput
                              label='Policies'
                              placeholder='Select Policies'
                              singleSelect={false}
                              options={
                                isPoliciesLoading
                                  ? [{ label: 'Loading...', value: '' }]
                                  : policiesData?.map((policy: Policy) => ({
                                      label: policy.title,
                                      value: policy.id.toString(),
                                    })) || []
                              }
                              value={
                                field.value
                                  ? Array.isArray(field.value)
                                    ? field.value.map(String)
                                    : [String(field.value)]
                                  : []
                              }
                              onSelectItem={(selectedItems) => {
                                const values = (
                                  Array.isArray(selectedItems)
                                    ? selectedItems
                                    : [selectedItems]
                                )
                                  .filter(Boolean)
                                  .map((item) =>
                                    Number(
                                      typeof item === 'string'
                                        ? item
                                        : item.value
                                    )
                                  );
                                field.onChange(values);
                              }}
                              createLabel='Create new policy'
                              createDrawerType='policy'
                            />
                          );
                        }}
                      />

                      {/* Flexible Booking Options for Classes */}
                      {bookingSettings?.enable_flexible_booking && (
                        <div className='space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                          <div className='flex items-center justify-between'>
                            <div>
                              <h3 className='text-lg font-bold text-gray-700'>
                                Flexible Booking Options
                              </h3>
                              <p className='text-sm text-gray-500'>
                                Configure how clients can book this class
                              </p>
                            </div>
                            <svg
                              className='w-5 h-5 text-blue-500'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                              />
                            </svg>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex items-center justify-between p-3 bg-white rounded-lg border'>
                              <div>
                                <label className='text-sm font-medium text-gray-700'>
                                  Staff Selection
                                </label>
                                <p className='text-xs text-gray-500'>
                                  Allow clients to choose specific staff
                                </p>
                              </div>
                              <Controller
                                name='allow_staff_selection'
                                control={methods.control}
                                render={({ field }) => (
                                  <input
                                    type='checkbox'
                                    checked={field.value || false}
                                    onChange={field.onChange}
                                    className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
                                  />
                                )}
                              />
                            </div>

                            <div className='flex items-center justify-between p-3 bg-white rounded-lg border'>
                              <div>
                                <label className='text-sm font-medium text-gray-700'>
                                  Location Selection
                                </label>
                                <p className='text-xs text-gray-500'>
                                  Allow clients to choose locations
                                </p>
                              </div>
                              <Controller
                                name='allow_location_selection'
                                control={methods.control}
                                render={({ field }) => (
                                  <input
                                    type='checkbox'
                                    checked={field.value || false}
                                    onChange={field.onChange}
                                    className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
                                  />
                                )}
                              />
                            </div>
                          </div>

                          {methods.watch('allow_staff_selection') && (
                            <div className='space-y-4 p-3 bg-white rounded-lg border'>
                              <h4 className='text-sm font-medium text-gray-700'>
                                Staff Confirmation Settings
                              </h4>

                              <div className='flex items-center justify-between'>
                                <div>
                                  <label className='text-sm font-medium text-gray-700'>
                                    Require Staff Confirmation
                                  </label>
                                  <p className='text-xs text-gray-500'>
                                    Staff must confirm before booking is
                                    finalized
                                  </p>
                                </div>
                                <Controller
                                  name='require_staff_confirmation'
                                  control={methods.control}
                                  render={({ field }) => (
                                    <input
                                      type='checkbox'
                                      checked={field.value || false}
                                      onChange={field.onChange}
                                      className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
                                    />
                                  )}
                                />
                              </div>

                              {methods.watch('require_staff_confirmation') && (
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                  <Controller
                                    name='staff_confirmation_timeout_hours'
                                    control={methods.control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type='number'
                                        label='Confirmation Timeout (hours)'
                                        placeholder='24'
                                        value={field.value?.toString() || '24'}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseInt(e.target.value) || 24
                                          )
                                        }
                                      />
                                    )}
                                  />

                                  <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border'>
                                    <div>
                                      <label className='text-sm font-medium text-gray-700'>
                                        Auto-assign if single option
                                      </label>
                                      <p className='text-xs text-gray-500'>
                                        Skip selection if only one
                                        staff/location available
                                      </p>
                                    </div>
                                    <Controller
                                      name='auto_assign_when_single_option'
                                      control={methods.control}
                                      render={({ field }) => (
                                        <input
                                          type='checkbox'
                                          checked={field.value || false}
                                          onChange={field.onChange}
                                          className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
                                        />
                                      )}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div className='text-xs text-blue-600 bg-blue-100 p-2 rounded-lg'>
                            💡 <strong>Tip:</strong> Flexible booking allows
                            clients to choose their preferred staff and
                            locations when booking this class. Enable
                            business-level flexible booking in Profile → Booking
                            Settings first.
                          </div>
                        </div>
                      )}
                    </div>
                  ) : methods.watch('session_type') === 'appointment' ? (
                    <div className='space-y-4'>
                      <div>
                        <h2 className='font-medium mb-2'>
                          Appointment Details
                        </h2>
                      </div>

                      <Controller
                        name='title'
                        control={methods.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            label='Appointment Name'
                            placeholder='Enter Appointment Name'
                          />
                        )}
                      />

                      <Controller
                        name='description'
                        control={methods.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type='textarea'
                            label='Description (Optional)'
                            placeholder='Enter appointment description'
                            rows={4}
                            containerClassName='mb-4'
                          />
                        )}
                      />
                      <Controller
                        name='client_ids'
                        control={methods.control}
                        render={({ field }) => {
                          // Handle both paginated response and direct array
                          const clientsItems = Array.isArray(clientsData)
                            ? clientsData
                            : clientsData?.items || [];

                          return (
                            <DropdownSelectInput
                              label='Name'
                              placeholder='Select client'
                              singleSelect={false}
                              options={
                                isClientsLoading
                                  ? [{ label: 'Loading...', value: '' }]
                                  : clientsItems
                                      ?.filter(Boolean)
                                      .map((client: any) => ({
                                        label: `${client.first_name} ${client.last_name}`,
                                        value: client.id.toString(),
                                      })) || []
                              }
                              value={
                                Array.isArray(field.value)
                                  ? field.value
                                      .filter((id) => id != null)
                                      .map((id) => id.toString())
                                  : []
                              }
                              onSelectItem={(selectedItems) => {
                                const values = Array.isArray(selectedItems)
                                  ? selectedItems.map((item) =>
                                      parseInt(item.value)
                                    )
                                  : selectedItems
                                  ? [parseInt(selectedItems.value)]
                                  : [];
                                field.onChange(values);
                              }}
                              createLabel='Add new client'
                              createDrawerType='client'
                            />
                          );
                        }}
                      />

                      <Controller
                        name='location_id'
                        control={methods.control}
                        render={({ field }) => {
                          return (
                            <DropdownSelectInput
                              label='Location'
                              placeholder='Select Location'
                              options={
                                isLocationsLoading
                                  ? [{ label: 'Loading...', value: '' }]
                                  : locationsData?.map((location: any) => ({
                                      label: location.name,
                                      value: location.id
                                        ? location.id.toString()
                                        : '',
                                    })) || []
                              }
                              value={field.value ? field.value.toString() : ''}
                              onSelectItem={(selectedItem) => {
                                field.onChange(
                                  selectedItem ? selectedItem.value : ''
                                );
                              }}
                            />
                          );
                        }}
                      />
                      <div className='flex items-center gap-4'>
                        <Controller
                          name='email'
                          control={methods.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              label='Email'
                              placeholder='Enter client email'
                            />
                          )}
                        />
                        <Controller
                          name='phone_number'
                          control={methods.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              label='Phone'
                              placeholder='Enter phone number'
                            />
                          )}
                        />
                      </div>

                      <Controller
                        name='date'
                        control={methods.control}
                        render={({ field }) => (
                          <div className='w-full mt-4 mb-6'>
                            <div className='relative w-full'>
                              <input
                                type='date'
                                id='date'
                                value={field.value || ''}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                }}
                                className='w-full h-[58px] border border-gray-300 rounded-lg px-4 pt-6 pb-2 text-xs focus:outline-none focus:ring-[1px] focus:border-none focus:ring-secondary focus:border-secondary'
                              />
                              <label
                                htmlFor='date'
                                className='absolute top-2 text-xs left-4 transition-all duration-200 text-primary'
                              >
                                Date
                              </label>
                            </div>
                          </div>
                        )}
                      />

                      <div className='grid grid-cols-2 gap-4'>
                        <Controller
                          name='start_time'
                          control={methods.control}
                          render={({ field }) => (
                            <div className='w-full mt-4'>
                              <div className='relative w-full'>
                                <input
                                  type='time'
                                  id='start_time'
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                  }}
                                  className='w-full h-[58px] border border-gray-300 rounded-lg px-4 pt-6 pb-2 text-xs focus:outline-none focus:ring-[1px] focus:border-none focus:ring-secondary focus:border-secondary'
                                />
                                <label
                                  htmlFor='start_time'
                                  className='absolute top-2 text-xs left-4 transition-all duration-200 text-primary'
                                >
                                  Start Time
                                </label>
                              </div>
                            </div>
                          )}
                        />
                        <Controller
                          name='end_time'
                          control={methods.control}
                          render={({ field }) => (
                            <div className='w-full mt-4'>
                              <div className='relative w-full'>
                                <input
                                  type='time'
                                  id='end_time'
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                  }}
                                  className='w-full h-[58px] border border-gray-300 rounded-lg px-4 pt-6 pb-2 text-xs focus:outline-none focus:ring-[1px] focus:border-none focus:ring-secondary focus:border-secondary'
                                />
                                <label
                                  htmlFor='end_time'
                                  className='absolute top-2 text-xs left-4 transition-all duration-200 text-primary'
                                >
                                  End Time
                                </label>
                              </div>
                            </div>
                          )}
                        />
                      </div>

                      <Controller
                        name='repetition'
                        control={methods.control}
                        render={({ field }) => (
                          <div>
                            <DropdownSelectInput
                              value={field.value}
                              label='Set Repetition'
                              placeholder='Does not repeat'
                              options={[
                                { label: 'Does not repeat', value: 'none' },
                                { label: 'Daily', value: 'daily' },
                                { label: 'Weekly', value: 'weekly' },
                                { label: 'Monthly', value: 'monthly' },
                                { label: 'Custom', value: 'custom' },
                                ...(field.value &&
                                ![
                                  'none',
                                  'daily',
                                  'weekly',
                                  'monthly',
                                  'custom',
                                ].includes(field.value)
                                  ? [
                                      {
                                        label: field.value,
                                        value: field.value,
                                      },
                                    ]
                                  : []),
                              ]}
                              onSelectItem={(selectedItem) => {
                                const value =
                                  typeof selectedItem === 'string'
                                    ? selectedItem
                                    : selectedItem?.value;

                                field.onChange(value);

                                if (value === 'custom') {
                                  openRepetitionModal();
                                }
                              }}
                            />
                          </div>
                        )}
                      />

                      {/* Flexible Booking Options for Appointments */}
                      {bookingSettings?.enable_flexible_booking && (
                        <div className='space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                          <div className='flex items-center justify-between'>
                            <div>
                              <h3 className='text-lg font-bold text-gray-700'>
                                Flexible Booking Options
                              </h3>
                              <p className='text-sm text-gray-500'>
                                Configure how clients can book this appointment
                              </p>
                            </div>
                            <svg
                              className='w-5 h-5 text-blue-500'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                              />
                            </svg>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex items-center justify-between p-3 bg-white rounded-lg border'>
                              <div>
                                <label className='text-sm font-medium text-gray-700'>
                                  Staff Selection
                                </label>
                                <p className='text-xs text-gray-500'>
                                  Allow clients to choose specific staff
                                </p>
                              </div>
                              <Controller
                                name='allow_staff_selection'
                                control={methods.control}
                                render={({ field }) => (
                                  <input
                                    type='checkbox'
                                    checked={field.value || false}
                                    onChange={field.onChange}
                                    className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
                                  />
                                )}
                              />
                            </div>

                            <div className='flex items-center justify-between p-3 bg-white rounded-lg border'>
                              <div>
                                <label className='text-sm font-medium text-gray-700'>
                                  Location Selection
                                </label>
                                <p className='text-xs text-gray-500'>
                                  Allow clients to choose locations
                                </p>
                              </div>
                              <Controller
                                name='allow_location_selection'
                                control={methods.control}
                                render={({ field }) => (
                                  <input
                                    type='checkbox'
                                    checked={field.value || false}
                                    onChange={field.onChange}
                                    className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
                                  />
                                )}
                              />
                            </div>
                          </div>

                          {methods.watch('allow_staff_selection') && (
                            <div className='space-y-4 p-3 bg-white rounded-lg border'>
                              <h4 className='text-sm font-medium text-gray-700'>
                                Staff Confirmation Settings
                              </h4>

                              <div className='flex items-center justify-between'>
                                <div>
                                  <label className='text-sm font-medium text-gray-700'>
                                    Require Staff Confirmation
                                  </label>
                                  <p className='text-xs text-gray-500'>
                                    Staff must confirm before booking is
                                    finalized
                                  </p>
                                </div>
                                <Controller
                                  name='require_staff_confirmation'
                                  control={methods.control}
                                  render={({ field }) => (
                                    <input
                                      type='checkbox'
                                      checked={field.value || false}
                                      onChange={field.onChange}
                                      className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
                                    />
                                  )}
                                />
                              </div>

                              {methods.watch('require_staff_confirmation') && (
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                  <Controller
                                    name='staff_confirmation_timeout_hours'
                                    control={methods.control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type='number'
                                        label='Confirmation Timeout (hours)'
                                        placeholder='24'
                                        value={field.value?.toString() || '24'}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseInt(e.target.value) || 24
                                          )
                                        }
                                      />
                                    )}
                                  />

                                  <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border'>
                                    <div>
                                      <label className='text-sm font-medium text-gray-700'>
                                        Auto-assign if single option
                                      </label>
                                      <p className='text-xs text-gray-500'>
                                        Skip selection if only one
                                        staff/location available
                                      </p>
                                    </div>
                                    <Controller
                                      name='auto_assign_when_single_option'
                                      control={methods.control}
                                      render={({ field }) => (
                                        <input
                                          type='checkbox'
                                          checked={field.value || false}
                                          onChange={field.onChange}
                                          className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
                                        />
                                      )}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div className='text-xs text-blue-600 bg-blue-100 p-2 rounded-lg'>
                            💡 <strong>Tip:</strong> Flexible booking allows
                            clients to choose their preferred staff and
                            locations when booking this appointment. Enable
                            business-level flexible booking in Profile → Booking
                            Settings first.
                          </div>
                        </div>
                      )}
                    </div>
                  ) : methods.watch('session_type') === 'event' ? (
                    <div className='space-y-4'>
                      <div>
                        <h2 className='font-medium mb-2'>Event Details</h2>
                      </div>

                      <Controller
                        name='title'
                        control={methods.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            label='Event Name'
                            placeholder='Enter Event Name'
                          />
                        )}
                      />

                      <Controller
                        name='description'
                        control={methods.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type='textarea'
                            label='Description (Optional)'
                            placeholder='Enter event description'
                            rows={4}
                            containerClassName='mb-4'
                          />
                        )}
                      />

                      <Controller
                        name='location_id'
                        control={methods.control}
                        render={({ field }) => {
                          return (
                            <DropdownSelectInput
                              label='Location'
                              placeholder='Select Location'
                              options={
                                isLocationsLoading
                                  ? [{ label: 'Loading...', value: '' }]
                                  : locationsData?.map((location: any) => ({
                                      label: location.name,
                                      value: location.id
                                        ? location.id.toString()
                                        : '',
                                    })) || []
                              }
                              value={field.value ? field.value.toString() : ''}
                              onSelectItem={(selectedItem) => {
                                field.onChange(
                                  selectedItem ? selectedItem.value : ''
                                );
                              }}
                            />
                          );
                        }}
                      />

                      <div className='space-y-3'>
                        <h3 className='text-sm font-medium text-gray-700'>
                          Schedule
                        </h3>
                        <Controller
                          name='date'
                          control={methods.control}
                          render={({ field }) => (
                            <div className='w-full mt-4 mb-6'>
                              <div className='relative w-full'>
                                <input
                                  type='date'
                                  id='date'
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                  }}
                                  className='w-full h-[58px] border border-gray-300 rounded-lg px-4 pt-6 pb-2 text-xs focus:outline-none focus:ring-[1px] focus:border-none focus:ring-secondary focus:border-secondary'
                                />
                                <label
                                  htmlFor='date'
                                  className='absolute top-2 text-xs left-4 transition-all duration-200 text-primary'
                                >
                                  Date
                                </label>
                              </div>
                            </div>
                          )}
                        />
                        <div className='grid grid-cols-2 gap-4'>
                          <Controller
                            name='start_time'
                            control={methods.control}
                            render={({ field }) => (
                              <div className='w-full mt-4'>
                                <div className='relative w-full'>
                                  <input
                                    type='time'
                                    id='start_time'
                                    value={field.value || ''}
                                    onChange={(e) => {
                                      field.onChange(e.target.value);
                                    }}
                                    className='w-full h-[58px] border border-gray-300 rounded-lg px-4 pt-6 pb-2 text-xs focus:outline-none focus:ring-[1px] focus:border-none focus:ring-secondary focus:border-secondary'
                                  />
                                  <label
                                    htmlFor='start_time'
                                    className='absolute top-2 text-xs left-4 transition-all duration-200 text-primary'
                                  >
                                    Start Time
                                  </label>
                                </div>
                              </div>
                            )}
                          />
                          <Controller
                            name='end_time'
                            control={methods.control}
                            render={({ field }) => (
                              <div className='w-full mt-4'>
                                <div className='relative w-full'>
                                  <input
                                    type='time'
                                    id='end_time'
                                    value={field.value || ''}
                                    onChange={(e) => {
                                      field.onChange(e.target.value);
                                    }}
                                    className='w-full h-[58px] border border-gray-300 rounded-lg px-4 pt-6 pb-2 text-xs focus:outline-none focus:ring-[1px] focus:border-none focus:ring-secondary focus:border-secondary'
                                  />
                                  <label
                                    htmlFor='end_time'
                                    className='absolute top-2 text-xs left-4 transition-all duration-200 text-primary'
                                  >
                                    End Time
                                  </label>
                                </div>
                              </div>
                            )}
                          />
                        </div>
                      </div>
                      <Controller
                        name='repetition'
                        control={methods.control}
                        render={({ field }) => (
                          <div>
                            <DropdownSelectInput
                              value={field.value}
                              label='Set Repetition'
                              placeholder='Does not repeat'
                              options={[
                                { label: 'Does not repeat', value: 'none' },
                                { label: 'Daily', value: 'daily' },
                                { label: 'Weekly', value: 'weekly' },
                                { label: 'Monthly', value: 'monthly' },
                                { label: 'Custom', value: 'custom' },
                                ...(field.value &&
                                ![
                                  'none',
                                  'daily',
                                  'weekly',
                                  'monthly',
                                  'custom',
                                ].includes(field.value)
                                  ? [
                                      {
                                        label: field.value,
                                        value: field.value,
                                      },
                                    ]
                                  : []),
                              ]}
                              onSelectItem={(selectedItem) => {
                                if (selectedItem) {
                                  if (selectedItem.value === 'custom') {
                                    openRepetitionModal();
                                  } else {
                                    field.onChange(selectedItem.value);
                                  }
                                }
                              }}
                            />
                          </div>
                        )}
                      />

                      <Controller
                        name='client_ids'
                        control={methods.control}
                        render={({ field }) => {
                          // Handle both paginated response and direct array
                          const clientsItems = Array.isArray(clientsData)
                            ? clientsData
                            : clientsData?.items || [];

                          return (
                            <DropdownSelectInput
                              label='Clients'
                              placeholder='Select Clients'
                              // singleSelect={false}
                              options={
                                isClientsLoading
                                  ? [{ label: 'Loading...', value: '' }]
                                  : clientsItems
                                      ?.filter(Boolean)
                                      .map((client: any) => ({
                                        label: `${client.first_name} ${client.last_name}`,
                                        value: client.id.toString(),
                                      })) || []
                              }
                              value={
                                Array.isArray(field.value)
                                  ? field.value
                                      .filter((id) => id != null)
                                      .map((id) => id.toString())
                                  : []
                              }
                              onSelectItem={(selectedItems) => {
                                const values = Array.isArray(selectedItems)
                                  ? selectedItems.map((item) =>
                                      parseInt(item.value)
                                    )
                                  : selectedItems
                                  ? [parseInt(selectedItems.value)]
                                  : [];
                                field.onChange(values);
                              }}
                              createLabel='Add new client'
                              createDrawerType='client'
                            />
                          );
                        }}
                      />
                      <Controller
                        name='policy_ids'
                        control={methods.control}
                        render={({ field }) => {
                          return (
                            <DropdownSelectInput
                              label='Policies'
                              placeholder='Select Policies'
                              singleSelect={false}
                              options={
                                isPoliciesLoading
                                  ? [{ label: 'Loading...', value: '' }]
                                  : policiesData?.map((policy: Policy) => ({
                                      label: policy.title,
                                      value: policy.id.toString(),
                                    })) || []
                              }
                              value={
                                field.value
                                  ? Array.isArray(field.value)
                                    ? field.value.map(String)
                                    : [String(field.value)]
                                  : []
                              }
                              onSelectItem={(selectedItems) => {
                                const values = (
                                  Array.isArray(selectedItems)
                                    ? selectedItems
                                    : [selectedItems]
                                )
                                  .filter(Boolean)
                                  .map((item) =>
                                    Number(
                                      typeof item === 'string'
                                        ? item
                                        : item.value
                                    )
                                  );
                                field.onChange(values);
                              }}
                              createLabel='Create new policy'
                              createDrawerType='policy'
                            />
                          );
                        }}
                      />
                    </div>
                  ) : null}
                </div>
                )}
              </div>

              <div className='p-8'>
                <div className='flex justify-end gap-4'>
                  <Button
                    onClick={onClose}
                    variant='outline'
                    color='#6B7280'
                    radius='8px'
                  >
                    {isPrivateSession ? 'Close' : 'Cancel'}
                  </Button>
                  {!isPrivateSession && (
                  <Button
                    type='submit'
                    variant='filled'
                    color='#1D9B5E'
                    radius='8px'
                    disabled={
                      methods.formState.isSubmitting ||
                      updateSessionMutation.isPending
                    }
                  >
                    {updateSessionMutation.isPending
                      ? methods.watch('session_type') === 'class'
                        ? 'Updating Class...'
                        : methods.watch('session_type') === 'appointment'
                        ? 'Updating Appointment...'
                        : 'Updating Event...'
                      : methods.watch('session_type') === 'class'
                      ? 'Update Class'
                      : methods.watch('session_type') === 'appointment'
                      ? 'Update Appointment'
                      : 'Update Event'}
                  </Button>
                  )}
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </Drawer>

      <Modal
        opened={isRepetitionModalOpen}
        onClose={closeRepetitionModal}
        title='Set Repetition'
        size='md'
        centered
        zIndex={zIndex ? zIndex + 1 : 1001}
        styles={{
          header: {
            padding: '1rem 1.5rem',
          },
          body: {
            padding: '1rem 1.5rem',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          content: {
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            borderRadius: '8px',
          },
        }}
      >
        <div className='space-y-4'>
          <div className='space-y-2'>
            <p className='text-base font-medium text-gray-700'>Repeat On</p>
            <div className='flex gap-2'>
              {repeatDays.map((dayNum) => (
                <button
                  key={dayNum}
                  type='button'
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    selectedWeekdays.includes(days[dayNum])
                      ? 'bg-secondary text-white hover:bg-secondary/90'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWeekdayClick(days[dayNum]);
                  }}
                >
                  {weekdayNames[dayNum]?.charAt(0)}
                </button>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <p className='text-[16px] font-[400]'>Ends</p>
            <div className='flex gap-8'>
              {['never', 'on', 'after'].map((option) => (
                <label key={option} className='flex items-center gap-2'>
                  <div className='relative flex items-center'>
                    <input
                      type='checkbox'
                      checked={endsOption === option}
                      onChange={() =>
                        handleEndsOptionChange(
                          option as 'never' | 'on' | 'after'
                        )
                      }
                      className='w-4 h-4 border-2 p-2 border-secondary focus:ring-2 focus:border-none focus:ring-secondary appearance-none rounded-full cursor-pointer bg-white'
                    />
                    <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                      <div
                        className={`w-3 h-3 rounded-full transition-colors ${
                          endsOption === option
                            ? 'bg-secondary'
                            : 'bg-transparent'
                        }`}
                      ></div>
                    </div>
                  </div>
                  <span>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {endsOption === 'on' && (
            <div className='flex justify-between gap-4'>
              <div className='flex justify-center items-center cursor-pointer w-[133px] h-[43px] bg-cardsBg text-center rounded-lg text-sm'>
                <DatePickerInput
                  variant='unstyled'
                  value={value}
                  onChange={(newDate) => {
                    setValue(newDate);
                    if (newDate) {
                      const formattedDate = newDate.toISOString().split('T')[0];
                      methods.setValue('repeat_end_date', formattedDate);
                    } else {
                      methods.setValue('repeat_end_date', undefined);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder='Select date'
                  valueFormat='MMM DD, YYYY'
                  popoverProps={{
                    withinPortal: true,
                    zIndex: 2000,
                    shadow: 'md',
                    withOverlay: true,
                  }}
                />
              </div>
            </div>
          )}
          {endsOption === 'after' && (
            <div className='flex justify-between gap-4'>
              <div className='flex items-center gap-2'>
                <span className='flex justify-center items-center cursor-pointer w-[133px] h-[43px] bg-cardsBg text-center rounded-lg text-sm'>
                  {occurrences} occurrences
                </span>
                <div className='flex flex-col'>
                  <button
                    onClick={() => handleOccurrencesChange(1)}
                    className='p-1 rounded-full hover:bg-gray-100'
                  >
                    <img src={ChevronUp} alt='increase' className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleOccurrencesChange(-1)}
                    className='p-1 rounded-full hover:bg-gray-100'
                  >
                    <img src={ChevronDown} alt='decrease' className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className='flex justify-end gap-3 mt-6 pt-4 border-t'>
            <button
              type='button'
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 '
              onClick={() => {
                closeRepetitionModal();
              }}
            >
              Cancel
            </button>
            <button
              type='button'
              className='px-4 py-2 text-sm font-medium text-white bg-secondary rounded-md hover:bg-secondary/90 '
              onClick={() => {
                let repetitionDescription = '';

                if (selectedWeekdays.length > 0) {
                  const weekdayLabels = selectedWeekdays
                    .map((day) => {
                      return day;
                    })
                    .join(', ');

                  repetitionDescription = `Weekly on ${weekdayLabels}`;
                } else {
                  repetitionDescription = 'Weekly';
                }

                if (endsOption === 'on' && value) {
                  repetitionDescription += ` until ${moment(value).format(
                    'MM/DD/YYYY'
                  )}`;
                } else if (endsOption === 'after') {
                  repetitionDescription += ` for ${occurrences} occurrences`;
                }

                methods.setValue('repetition', repetitionDescription as any);

                setTimeout(() => {
                  const currentValue = methods.getValues('repetition');
                  methods.setValue('repetition', currentValue as any);
                }, 0);

                methods.setValue('repeat_unit', 'weeks');

                methods.setValue('repeat_on', selectedWeekdays);

                methods.trigger('repeat_on');

                methods.setValue('repeat_every', 1);

                if (endsOption === 'never') {
                  methods.setValue('repeat_end_date', undefined);
                  methods.setValue('repeat_occurrences', undefined);
                } else if (endsOption === 'on' && value) {
                  methods.setValue(
                    'repeat_end_date',
                    moment(value).format('YYYY-MM-DD')
                  );
                  methods.setValue('repeat_occurrences', undefined);
                } else if (endsOption === 'after') {
                  methods.setValue('repeat_end_date', undefined);
                  methods.setValue('repeat_occurrences', occurrences);
                }

                closeRepetitionModal();
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UpdateSession;
