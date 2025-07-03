import { useForm, Controller, FormProvider } from 'react-hook-form';
import { Session, Category, ClassFields } from '../../types/sessionTypes';
import { Policy } from '../../types/policy';

import Button from '../common/Button';
import DropdownSelectInput from '../common/Dropdown';
import Input from '../common/Input';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';
import { days, repeatDays, weekdayNames } from '../../utils/dummyData';
import ChevronUp from '../../assets/icons/up.svg';
import ChevronDown from '../../assets/icons/down.svg';
import { DatePickerInput } from '@mantine/dates';
import {
  useGetStaff,
  useGetClients,
  useGetSessionCategories,
  useGetLocations,
  useGetPolicies,
  useGetBookingSettings,
  useGetClassTypes,
} from '../../hooks/reactQuery';
import { useCreateSession } from '../../hooks/reactQuery';
import moment from 'moment';
import { Modal, Drawer } from '@mantine/core';
import { useTimezone } from '../../contexts/TimezoneContext';

import './index.css';

interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
}

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  fromClientDrawer?: boolean;
  pendingClientData?: Record<string, any>;
}

import { DropDownItem } from '../common/Dropdown';
import { useDisclosure } from '@mantine/hooks';

type FormData = Omit<
  Session,
  | 'id'
  | 'is_active'
  | 'attendances'
  | 'assigned_staff'
  | 'profile_picture'
  | 'category'
> & {
  start_time: string;
  end_time: string;
  session_type: 'class' | 'appointment' | 'event';
  repetition: string;
  date: string;

  title: string;
  class_type: DropDownItem | ClassFields['class_type'];
  spots: number;
  staff?: DropDownItem | number; // Single staff for backward compatibility
  staff_ids?: number[]; // Multiple staff for flexible booking
  category_id?: DropDownItem | number;
  location_id?: DropDownItem | number; // Single location for backward compatibility
  location_ids?: number[]; // Multiple locations for flexible booking
  client_ids: number[];
  policy_ids?: number[];
  description?: string;

  repeat_every?: number;
  repeat_unit?: 'days' | 'weeks' | 'months';
  repeat_on?: string[];
  repeat_end_type: 'never' | 'on' | 'after';
  repeat_end_date?: string;
  repeat_occurrences?: number;

  // Flexible booking fields
  allow_staff_selection?: boolean;
  allow_location_selection?: boolean;
  require_staff_confirmation?: boolean;
  staff_confirmation_timeout_hours?: number;
  auto_assign_when_single_option?: boolean;

  _pendingClientFromDrawer?: boolean;
};

const AddSession = ({
  isOpen,
  onClose,
  zIndex,
  fromClientDrawer,
  pendingClientData,
}: SessionModalProps) => {
  const { state: timezoneState } = useTimezone();
  const methods = useForm<FormData>({
    mode: 'onSubmit',
    defaultValues: {
      title: '',
      session_type: 'class',
      date: '',
      start_time: '',
      end_time: '',
      repeat_every: undefined,
      repeat_unit: undefined,
      repeat_on: undefined,
      staff: undefined,
      staff_ids: [],
      category_id: undefined,
      location_id: undefined,
      location_ids: [],
      client_ids: [],
      policy_ids: [],
      repeat_end_type: 'never',
      repeat_end_date: undefined,
      repeat_occurrences: undefined,
      spots: 0,
      class_type: 'regular',
      repetition: 'none',
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

  const createSession = useCreateSession();

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

  useEffect(() => {
    const currentType = methods.watch('session_type');
    const currentValues = methods.getValues();

    if (currentType === 'class') {
      methods.reset({
        ...currentValues,
        email: '',
        phone_number: '',
        selected_class: undefined,
      });
    } else {
      methods.reset({
        ...currentValues,
        spots: 0,
        class_type: undefined,
      });
    }
  }, [methods.watch('session_type')]);

  useEffect(() => {
    if (!isOpen) {
      closeRepetitionModal();
      setSelectedWeekdays([]);
      setEndsOption('never');
      setOccurrences(2);
      setValue(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (fromClientDrawer && pendingClientData) {
      console.log(
        'Session drawer opened from client drawer with data:',
        pendingClientData
      );

      methods.setValue('_pendingClientFromDrawer', true);
    }
  }, [fromClientDrawer, pendingClientData, methods]);

  const handleWeekdayClick = (weekday: string) => {
    setSelectedWeekdays((prev) =>
      prev.includes(weekday)
        ? prev.filter((day) => day !== weekday)
        : [...prev, weekday]
    );
  };

  const handleEndsOptionChange = (option: 'never' | 'on' | 'after') => {
    setEndsOption(option);
  };

  const handleOccurrencesChange = (delta: number) => {
    setOccurrences((prev) => Math.max(1, prev + delta));
  };

  const onSubmit = async (data: FormData) => {
    try {
      let dateObj = null;
      if (data.date) {
        if (typeof data.date === 'string') {
          dateObj = new Date(data.date);
        } else {
          dateObj = data.date;
        }
      }

      const dateOnly = moment(dateObj).format('YYYY-MM-DD');

      // CRITICAL TIMEZONE FIX: Format times properly for backend with business timezone awareness
      const businessTimezone =
        timezoneState.businessTimezone || 'Africa/Nairobi';

      // Format times for backend - these will be interpreted as business local time
      // Fix: Check for actual time values, not just truthy values
      const formattedStartTime =
        data.start_time && data.start_time.trim() && dateOnly
          ? `${dateOnly}T${data.start_time}:00`
          : null;
      const formattedEndTime =
        data.end_time && data.end_time.trim() && dateOnly
          ? `${dateOnly}T${data.end_time}:00`
          : null;

      let repeatEndDateObj = null;
      if (data.repeat_end_date) {
        if (typeof data.repeat_end_date === 'string') {
          repeatEndDateObj = new Date(data.repeat_end_date);
        } else {
          repeatEndDateObj = data.repeat_end_date;
        }
      }

      const formattedRepeatEndDate = repeatEndDateObj
        ? repeatEndDateObj.toISOString().split('T')[0]
        : null;

      const extractValue = (field: any) => {
        if (field === null || field === undefined) return null;
        if (typeof field === 'object' && 'value' in field) return field.value;
        return field;
      };

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

      const formattedData: any = {
        title: data.title,
        session_type: data.session_type,
        date: dateOnly,
        spots: parseInt(data.spots.toString()),
        category: extractValue(data.category_id),
        ...staffAssignment,
        ...locationAssignment,
        client_ids: data.client_ids || [],
        description: data.description,
        repeat_end_date: formattedRepeatEndDate,
        repeat_every: data.repeat_every,
        repeat_unit: data.repeat_unit,
        repeat_on: data.repeat_on,
        repeat_end_type: data.repeat_end_type,
        repeat_occurrences: data.repeat_occurrences,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        email: data.email,
        phone_number: data.phone_number,
        selected_class: extractValue(data.selected_class),
        policy_ids: data.policy_ids || [],
        _pendingClientFromDrawer: fromClientDrawer ? true : undefined,

        // Include flexible booking fields
        allow_staff_selection: data.allow_staff_selection || false,
        allow_location_selection: data.allow_location_selection || false,
        require_staff_confirmation: data.require_staff_confirmation || false,
        staff_confirmation_timeout_hours:
          data.staff_confirmation_timeout_hours || 24,
        auto_assign_when_single_option:
          data.auto_assign_when_single_option || false,
      };

      if (
        data.session_type === 'class' ||
        data.session_type === 'appointment'
      ) {
        formattedData.class_type = extractValue(data.class_type);
      }

      const repetitionValue = data.repetition;

      if (repetitionValue === 'daily') {
        formattedData.repeat_every = 1;
        formattedData.repeat_unit = 'days';
      } else if (repetitionValue === 'weekly') {
        formattedData.repeat_every = 1;
        formattedData.repeat_unit = 'weeks';
      } else if (repetitionValue === 'monthly') {
        formattedData.repeat_every = 1;
        formattedData.repeat_unit = 'months';
      } else if (repetitionValue === 'custom') {
        formattedData.repeat_on = selectedWeekdays;
        formattedData.repeat_end_type = endsOption;

        if (endsOption === 'after') {
          formattedData.repeat_occurrences = occurrences;
          formattedData.repeat_end_date = null;
        } else if (endsOption === 'on') {
          formattedData.repeat_occurrences = undefined;
        } else {
          formattedData.repeat_occurrences = undefined;
          formattedData.repeat_end_date = null;
        }
      }

      await createSession.mutateAsync(formattedData);

      notifications.show({
        title: 'Success',
        message:
          data.session_type === 'class'
            ? 'Class created successfully!'
            : data.session_type === 'appointment'
            ? 'Appointment created successfully!'
            : 'Event created successfully!',
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

      onClose();
      methods.reset();
      setSelectedWeekdays([]);
      setEndsOption('never');
      setOccurrences(4);
    } catch (error: any) {
      console.error('Error creating session:', error);

      if (error.response) {
        console.error('API Error Status:', error.response.status);
        console.error('API Error Headers:', error.response.headers);
        console.error('API Error Response:', error.response.data);

        console.error(
          'Request payload that caused error:',
          error.config?.data ? JSON.parse(error.config.data) : 'No payload data'
        );

        if (error.response.data?.start_time) {
          console.error('Start time error:', error.response.data.start_time);
        }

        if (error.response.data?.end_time) {
          console.error('End time error:', error.response.data.end_time);
        }

        if (error.response.data?.date) {
          console.error('Date error:', error.response.data.date);
        }

        if (typeof error.response.data === 'object') {
          const errorMessages = Object.entries(error.response.data)
            .map(([field, errors]) => `${field}: ${errors}`)
            .join('\n');

          notifications.show({
            title: 'Validation Error',
            message: `Validation errors:\n${errorMessages}`,
            color: 'red',
            radius: 'md',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
                <img src={errorIcon} alt='Error' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 10000,
            position: 'top-right',
          });

          if (methods.formState.errors) {
            Object.keys(error.response.data).forEach((field) => {
              const safeField = field === 'category' ? 'category_id' : field;

              try {
                methods.setError(safeField as any, {
                  type: 'server',
                  message: Array.isArray(error.response.data[field])
                    ? error.response.data[field][0]
                    : error.response.data[field],
                });
              } catch (err) {
                console.warn(
                  `Could not set error for field: ${safeField}`,
                  err
                );
              }
            });
          }
        } else {
          notifications.show({
            title: 'Server Error',
            message: `Server error: ${JSON.stringify(error.response.data)}`,
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
          message: 'Failed to create session. Please try again.',
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
            Creating Session for New Client
          </h3>
          <div className='mt-1 text-sm text-blue-700'>
            <p>
              This session will be automatically assigned to the client you're
              creating.
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
        title='New Session'
        size='lg'
        position='right'
        zIndex={zIndex}
        styles={{
          header: {
            padding: '1rem 1.5rem',
          },
          title: {
            fontSize: '24px',
            fontWeight: 'bold',
          },
          body: {
            padding: 0,
          },
        }}
      >
        <div className='flex flex-col'>
          <div className='flex gap-4 pt-8 px-8'>
            <button
              type='button'
              onClick={() => methods.setValue('session_type', 'class')}
              className={`px-6 py-2 font-medium rounded-lg hover:opacity-90 transition-opacity w-[120px] text-sm ${
                methods.watch('session_type') === 'class'
                  ? 'text-primary bg-[#1D9B5E33]'
                  : 'text-gray-500 bg-gray-100'
              }`}
            >
              Class
            </button>
            <button
              type='button'
              onClick={() => methods.setValue('session_type', 'appointment')}
              className={`px-6 py-2 font-medium rounded-lg hover:opacity-90 transition-opacity w-[120px] text-sm ${
                methods.watch('session_type') === 'appointment'
                  ? 'text-primary bg-[#1D9B5E33]'
                  : 'text-gray-500 bg-gray-100'
              }`}
            >
              Appointment
            </button>
            <button
              type='button'
              onClick={() => methods.setValue('session_type', 'event')}
              className={`px-6 py-2 font-medium rounded-lg hover:opacity-90 transition-opacity w-[120px] text-sm ${
                methods.watch('session_type') === 'event'
                  ? 'text-primary bg-[#1D9B5E33]'
                  : 'text-gray-500 bg-gray-100'
              }`}
            >
              Event
            </button>
          </div>
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className='flex-1 flex flex-col'
            >
              <div className='flex-1 p-8'>
                {pendingClientNotice}
                <div className='space-y-4'>
                  <div className='space-y-6'>
                    {methods.watch('session_type') === 'class' ? (
                      <>
                        <div className='flex flex-col space-y-3'>
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

                              // Map class types to dropdown options
                              const classTypeOptions = (classTypes || []).map(
                                (type: any) => ({
                                  label: type.name,
                                  value: type.id.toString(),
                                  description: type.description || '',
                                })
                              );

                              return (
                                <div className='mb-4'>
                                  <DropdownSelectInput
                                    value={stringValue}
                                    label='Class Type'
                                    placeholder={
                                      isLoadingClassTypes
                                        ? 'Loading class types...'
                                        : 'Select Class Type'
                                    }
                                    options={classTypeOptions}
                                    onSelectItem={(selectedItem) => {
                                      if (selectedItem) {
                                        field.onChange(selectedItem);
                                      }
                                    }}
                                    createLabel='Create new class type'
                                    createDrawerType='session'
                                    isLoading={isLoadingClassTypes}
                                  />
                                  {methods.formState.errors.class_type && (
                                    <p className='mt-1 text-sm text-red-500'>
                                      {
                                        methods.formState.errors.class_type
                                          .message as string
                                      }
                                    </p>
                                  )}
                                </div>
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
                          <div>
                            <Controller
                              name='category_id'
                              control={methods.control}
                              render={({ field }) => (
                                <DropdownSelectInput
                                  label='Category'
                                  placeholder='Select a category'
                                  options={
                                    categoriesData
                                      ? categoriesData.map(
                                          (category: Category) => ({
                                            label: category.name,
                                            value: category.id.toString(),
                                          })
                                        )
                                      : []
                                  }
                                  value={
                                    field.value
                                      ? (typeof field.value === 'object'
                                          ? field.value.value
                                          : field.value
                                        )?.toString()
                                      : undefined
                                  }
                                  onSelectItem={(selectedItem) => {
                                    field.onChange(
                                      selectedItem ? parseInt(selectedItem.value) : null
                                    );
                                  }}
                                  createLabel='Create new category'
                                  createDrawerType='category'
                                />
                              )}
                            />
                          </div>
                        </div>
                        <div className='space-y-4'>
                          <h3 className='text-lg font-bold text-gray-700'>
                            Class Schedule
                          </h3>
                          <div className='w-full'>
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
                                        console.log(
                                          'Date changed:',
                                          e.target.value
                                        );
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
                                  <Input
                                    {...field}
                                    type='time'
                                    label='Start Time'
                                    placeholder='12:00 PM'
                                  />
                                )}
                              />
                              <Controller
                                name='end_time'
                                control={methods.control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type='time'
                                    label='End Time'
                                    placeholder='12:00 PM'
                                  />
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
                                  type='number'
                                  label='Spots Available'
                                  placeholder='Enter number of spots'
                                  onChange={(e) =>
                                    field.onChange(parseInt(e.target.value))
                                  }
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
                                            methods.setValue(
                                              'staff',
                                              undefined
                                            );
                                          }}
                                          createLabel='Create new staff'
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
                                  render={({ field }) => (
                                    <DropdownSelectInput
                                      label='Assign Staff'
                                      placeholder='Select Staff'
                                      options={
                                        isStaffLoading
                                          ? [{ label: 'Loading...', value: '' }]
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
                                                    value: staff.id.toString(),
                                                    subLabel: email,
                                                    status,
                                                  };
                                                } else if (email) {
                                                  return {
                                                    label: email,
                                                    value: staff.id.toString(),
                                                    subLabel: `Staff ${staff.id}`,
                                                    status,
                                                  };
                                                } else {
                                                  return {
                                                    label: `Staff ${staff.id}`,
                                                    value: staff.id.toString(),
                                                    status,
                                                  };
                                                }
                                              })
                                              .filter(Boolean) || []
                                      }
                                      value={
                                        field.value?.toString
                                          ? field.value?.toString()
                                          : field.value?.toString
                                          ? field.value.toString()
                                          : ''
                                      }
                                      onSelectItem={(selectedItem) => {
                                        const value = selectedItem?.value;
                                        field.onChange(
                                          value ? parseInt(value) : undefined
                                        );
                                        // Clear multi-select when single selection is used
                                        methods.setValue('staff_ids', []);
                                      }}
                                      createLabel='Create new staff'
                                      createDrawerType='staff'
                                    />
                                  )}
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
                                    ? [
                                        typeof staffId === 'object' &&
                                        staffId !== null
                                          ? String(
                                              (staffId as any).value || staffId
                                            )
                                          : String(staffId),
                                      ]
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
                                    (staff) =>
                                      staff && !(staff.isActive ?? true)
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
                                      Note: {inactiveStaff.length} selected
                                      staff{' '}
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
                          render={({ field }) => (
                            <>
                              {fromClientDrawer ? (
                                <div className='mb-4'>
                                  <label className='block text-sm mb-1 text-gray-700'>
                                    Clients
                                  </label>
                                  <div className='flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700'>
                                    <svg
                                      xmlns='http://www.w3.org/2000/svg'
                                      className='h-5 w-5 text-blue-500 mr-2'
                                      fill='none'
                                      viewBox='0 0 24 24'
                                      stroke='currentColor'
                                    >
                                      <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth='2'
                                        d='M5 13l4 4L19 7'
                                      />
                                    </svg>
                                    <span>
                                      Will be assigned to the client you're
                                      creating
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <DropdownSelectInput
                                  label='Clients'
                                  placeholder='Select Clients'
                                  singleSelect={false}
                                  options={
                                    isClientsLoading
                                      ? [{ label: 'Loading...', value: '' }]
                                      : (Array.isArray(clientsData)
                                          ? clientsData
                                          : clientsData?.items || []
                                        )?.map((client: Client) => ({
                                          label: `${client.first_name} ${client.last_name}`,
                                          value: client.id.toString(),
                                        })) || []
                                  }
                                  value={
                                    field.value ? field.value.map(String) : []
                                  }
                                  onSelectItem={(selectedItems) => {
                                    const values = Array.isArray(selectedItems)
                                      ? selectedItems.map((item) => item.value)
                                      : selectedItems
                                      ? [selectedItems.value]
                                      : [];
                                    field.onChange(values);
                                  }}
                                  createLabel='Add new client'
                                  createDrawerType='client'
                                />
                              )}
                            </>
                          )}
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
                                    label='Locations (Multiple)'
                                    placeholder='Select Multiple Locations'
                                    singleSelect={false}
                                    options={
                                      isLocationsLoading
                                        ? [{ label: 'Loading...', value: '' }]
                                        : locationsData
                                            ?.map((location: any) => {
                                              if (!location || !location.id) {
                                                console.warn(
                                                  'Invalid location data:',
                                                  location
                                                );
                                                return null;
                                              }
                                              return {
                                                label: location.name,
                                                value: location.id.toString(),
                                              };
                                            })
                                            .filter(
                                              (item): item is DropDownItem =>
                                                item !== null
                                            ) || []
                                    }
                                    value={
                                      field.value ? field.value.map(String) : []
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
                                      // Clear single location selection when multi-select is used
                                      methods.setValue(
                                        'location_id',
                                        undefined
                                      );
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
                            render={({ field }) => (
                              <DropdownSelectInput
                                label='Location'
                                placeholder='Select Location'
                                options={
                                  isLocationsLoading
                                    ? [{ label: 'Loading...', value: '' }]
                                    : locationsData
                                        ?.map((location: any) => {
                                          if (!location || !location.id) {
                                            console.warn(
                                              'Invalid location data:',
                                              location
                                            );
                                            return null;
                                          }
                                          return {
                                            label: location.name,
                                            value: location.id.toString(),
                                          };
                                        })
                                        .filter(
                                          (item): item is DropDownItem =>
                                            item !== null
                                        ) || []
                                }
                                value={
                                  field.value
                                    ? (typeof field.value === 'object'
                                        ? field.value.value
                                        : field.value
                                      )?.toString()
                                    : undefined
                                }
                                onSelectItem={(selectedItem) => {
                                  field.onChange(selectedItem ? parseInt(selectedItem.value) : null);
                                  // Clear multi-select when single selection is used
                                  methods.setValue('location_ids', []);
                                }}
                                createLabel='Create new location'
                                createDrawerType='location'
                              />
                            )}
                          />
                        )}
                        <Controller
                          name='policy_ids'
                          control={methods.control}
                          render={({ field }) => (
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
                              value={field.value ? field.value.map(String) : []}
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
                          )}
                        />

                        {/* Flexible Booking Options */}
                        {bookingSettings?.enable_flexible_booking && (
                          <div className='space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                            <div className='flex items-center justify-between'>
                              <div>
                                <h3 className='text-lg font-bold text-gray-700'>
                                  Flexible Booking Options
                                </h3>
                                <p className='text-sm text-gray-500'>
                                  Configure how clients can book this session
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

                                {methods.watch(
                                  'require_staff_confirmation'
                                ) && (
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
                                          value={
                                            field.value?.toString() || '24'
                                          }
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
                              locations when booking this session. Enable
                              business-level flexible booking in Profile →
                              Booking Settings first.
                            </div>
                          </div>
                        )}
                      </>
                    ) : methods.watch('session_type') === 'appointment' ? (
                      <>
                        <div className='space-y-4'>
                          <Controller
                            name='client_ids'
                            control={methods.control}
                            render={({ field }) => (
                              <>
                                {fromClientDrawer ? (
                                  <div className='mb-4'>
                                    <label className='block text-sm mb-1 text-gray-700'>
                                      Client Name
                                    </label>
                                    <div className='flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700'>
                                      <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        className='h-5 w-5 text-blue-500 mr-2'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                        stroke='currentColor'
                                      >
                                        <path
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                          strokeWidth='2'
                                          d='M5 13l4 4L19 7'
                                        />
                                      </svg>
                                      <span>
                                        Will be assigned to the client you're
                                        creating
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <DropdownSelectInput
                                    label='Client Name'
                                    placeholder='Select or create Clients'
                                    options={
                                      isClientsLoading
                                        ? [{ label: 'Loading...', value: '' }]
                                        : (Array.isArray(clientsData)
                                            ? clientsData
                                            : clientsData?.items || []
                                          )?.map((client: any) => ({
                                            label: `${client.first_name} ${client.last_name}`,
                                            value: client.id.toString(),
                                          })) || []
                                    }
                                    onSelectItem={(selectedItems) => {
                                      const values = Array.isArray(
                                        selectedItems
                                      )
                                        ? selectedItems.map(
                                            (item) => item.value
                                          )
                                        : selectedItems
                                        ? [selectedItems.value]
                                        : [];
                                      field.onChange(values);
                                      if (values.length > 0) {
                                        const clientId = values[0];
                                        const clientsList = Array.isArray(
                                          clientsData
                                        )
                                          ? clientsData
                                          : clientsData?.items || [];
                                        const selectedClient = clientsList.find(
                                          (client: Client) =>
                                            client.id.toString() === clientId
                                        );
                                        if (selectedClient) {
                                          methods.setValue(
                                            'email',
                                            selectedClient.email || ''
                                          );
                                          methods.setValue(
                                            'phone_number',
                                            selectedClient.phone_number || ''
                                          );
                                        }
                                      }
                                    }}
                                    createLabel='Add new client'
                                    createDrawerType='client'
                                  />
                                )}
                              </>
                            )}
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
                                  label='Phone Number'
                                  placeholder='Enter client phone number'
                                />
                              )}
                            />
                          </div>
                        </div>
                        <div className='space-y-4'>
                          <h3 className='text-lg font-bold text-gray-700'>
                            Appointment Details
                          </h3>
                          <div className='w-full'>
                            <Controller
                              name='title'
                              control={methods.control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  label='Appointment Name'
                                  placeholder='Enter Appointment Name'
                                  containerClassName='mb-4'
                                />
                              )}
                            />

                            <Controller
                              name='class_type'
                              control={methods.control}
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

                                // Map class types to dropdown options
                                const classTypeOptions = (classTypes || []).map(
                                  (type: any) => ({
                                    label: type.name,
                                    value: type.id.toString(),
                                    description: type.description || '',
                                  })
                                );

                                return (
                                  <div className='mb-4'>
                                    <DropdownSelectInput
                                      value={stringValue}
                                      label='Session Type'
                                      placeholder={
                                        isLoadingClassTypes
                                          ? 'Loading session types...'
                                          : 'Select Session Type'
                                      }
                                      options={classTypeOptions}
                                      onSelectItem={(selectedItem) => {
                                        if (selectedItem) {
                                          field.onChange(selectedItem);
                                        }
                                      }}
                                      createLabel='Create new session type'
                                      createDrawerType='session'
                                      isLoading={isLoadingClassTypes}
                                    />
                                    {methods.formState.errors.class_type && (
                                      <p className='mt-1 text-sm text-red-500'>
                                        {
                                          methods.formState.errors.class_type
                                            .message as string
                                        }
                                      </p>
                                    )}
                                  </div>
                                );
                              }}
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
                              name='date'
                              control={methods.control}
                              render={({ field }) => (
                                <div className='w-full mt-4 mb-6'>
                                  <div className='relative w-full'>
                                    <input
                                      type='date'
                                      id='appointment-date'
                                      value={field.value || ''}
                                      onChange={(e) => {
                                        field.onChange(e.target.value);
                                        console.log(
                                          'Date changed:',
                                          e.target.value
                                        );
                                      }}
                                      className='w-full h-[58px] border border-gray-300 rounded-lg px-4 pt-6 pb-2 text-xs focus:outline-none focus:ring-[1px] focus:border-none focus:ring-secondary focus:border-secondary'
                                    />
                                    <label
                                      htmlFor='appointment-date'
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
                                  <Input
                                    {...field}
                                    type='time'
                                    label='Start Time'
                                    placeholder='12:00 PM'
                                  />
                                )}
                              />
                              <Controller
                                name='end_time'
                                control={methods.control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type='time'
                                    label='End Time'
                                    placeholder='12:00 PM'
                                  />
                                )}
                              />
                            </div>
                          </div>
                          <Controller
                            name='staff'
                            control={methods.control}
                            render={({ field }) => (
                              <DropdownSelectInput
                                label='Assign Staff'
                                placeholder='Select Staff'
                                options={
                                  isStaffLoading
                                    ? [{ label: 'Loading...', value: '' }]
                                    : staffData
                                        ?.map((staff: any) => {
                                          if (!staff || !staff.id) {
                                            console.warn(
                                              'Invalid staff data:',
                                              staff
                                            );
                                            return null;
                                          }

                                          const userData = staff.user || {};
                                          const email =
                                            userData.email || staff.email || '';
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
                                              value: staff.id.toString(),
                                              subLabel: email,
                                              status,
                                            };
                                          } else if (email) {
                                            return {
                                              label: email,
                                              value: staff.id.toString(),
                                              subLabel: `Staff ${staff.id}`,
                                              status,
                                            };
                                          } else {
                                            return {
                                              label: `Staff ${staff.id}`,
                                              value: staff.id.toString(),
                                              status,
                                            };
                                          }
                                        })
                                        .filter(Boolean) || []
                                }
                                value={
                                  field.value?.toString
                                    ? field.value?.toString()
                                    : field.value?.toString
                                    ? field.value.toString()
                                    : ''
                                }
                                onSelectItem={(selectedItem) => {
                                  field.onChange(selectedItem);
                                }}
                                createLabel='Create new staff'
                                createDrawerType='staff'
                              />
                            )}
                          />
                          {(() => {
                            const staffId = methods.watch('staff');
                            if (!staffId) return null;

                            const selectedStaff = staffData?.find(
                              (staff: any) => {
                                const staffIdStr =
                                  typeof staffId === 'object' &&
                                  staffId !== null
                                    ? String((staffId as any).value || staffId)
                                    : String(staffId);
                                return staff.id.toString() === staffIdStr;
                              }
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
                                  Note: This staff member has not completed
                                  their account setup yet.
                                </div>
                              );
                            }

                            return null;
                          })()}
                        </div>

                        {/* Flexible Booking Options for Appointments */}
                        {bookingSettings?.enable_flexible_booking && (
                          <div className='space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                            <div className='flex items-center justify-between'>
                              <div>
                                <h3 className='text-lg font-bold text-gray-700'>
                                  Flexible Booking Options
                                </h3>
                                <p className='text-sm text-gray-500'>
                                  Configure how clients can book this
                                  appointment
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

                                {methods.watch(
                                  'require_staff_confirmation'
                                ) && (
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
                                          value={
                                            field.value?.toString() || '24'
                                          }
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
                              business-level flexible booking in Profile →
                              Booking Settings first.
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className='flex flex-col space-y-3'>
                          <Controller
                            name='title'
                            control={methods.control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label='Event Name'
                                placeholder='Enter Event Name'
                              />
                            )}
                          />
                          <Controller
                            name='location_id'
                            control={methods.control}
                            render={({ field }) => (
                              <DropdownSelectInput
                                label='Location'
                                placeholder='Select Location'
                                options={
                                  isLocationsLoading
                                    ? [{ label: 'Loading...', value: '' }]
                                    : locationsData
                                        ?.map((location: any) => {
                                          if (!location || !location.id) {
                                            console.warn(
                                              'Invalid location data:',
                                              location
                                            );
                                            return null;
                                          }
                                          return {
                                            label: location.name,
                                            value: location.id.toString(),
                                          };
                                        })
                                        .filter(
                                          (item): item is DropDownItem =>
                                            item !== null
                                        ) || []
                                }
                                value={
                                  field.value?.toString
                                    ? field.value?.toString()
                                    : field.value?.toString
                                    ? field.value.toString()
                                    : ''
                                }
                                onSelectItem={(selectedItem) => {
                                  field.onChange(selectedItem);
                                }}
                                createLabel='Create new location'
                                createDrawerType='location'
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
                          <div>
                            <Controller
                              name='category_id'
                              control={methods.control}
                              render={({ field }) => (
                                <DropdownSelectInput
                                  label='Category'
                                  placeholder='Select a category'
                                  options={
                                    categoriesData
                                      ? categoriesData.map(
                                          (category: Category) => ({
                                            label: category.name,
                                            value: category.id.toString(),
                                          })
                                        )
                                      : []
                                  }
                                  value={
                                    field.value
                                      ? (typeof field.value === 'object'
                                          ? field.value.value
                                          : field.value
                                        )?.toString()
                                      : undefined
                                  }
                                  onSelectItem={(selectedItem) => {
                                    field.onChange(
                                      selectedItem ? parseInt(selectedItem.value) : null
                                    );
                                  }}
                                  createLabel='Create new category'
                                  createDrawerType='category'
                                />
                              )}
                            />
                          </div>
                        </div>
                        <div className='space-y-4'>
                          <h3 className='text-lg font-bold text-gray-700'>
                            Event Schedule
                          </h3>
                          <div className='w-full'>
                            <Controller
                              name='date'
                              control={methods.control}
                              render={({ field }) => (
                                <div className='w-full mt-4 mb-6'>
                                  <div className='relative w-full'>
                                    <input
                                      type='date'
                                      id='event-date'
                                      value={field.value || ''}
                                      onChange={(e) => {
                                        field.onChange(e.target.value);
                                        console.log(
                                          'Date changed:',
                                          e.target.value
                                        );
                                      }}
                                      className='w-full h-[58px] border border-gray-300 rounded-lg px-4 pt-6 pb-2 text-xs focus:outline-none focus:ring-[1px] focus:border-none focus:ring-secondary focus:border-secondary'
                                    />
                                    <label
                                      htmlFor='event-date'
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
                                  <Input
                                    {...field}
                                    type='time'
                                    label='Start Time'
                                    placeholder='12:00 PM'
                                  />
                                )}
                              />
                              <Controller
                                name='end_time'
                                control={methods.control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type='time'
                                    label='End Time'
                                    placeholder='12:00 PM'
                                  />
                                )}
                              />
                            </div>
                          </div>
                          <div className='flex justify-between items-center gap-4'>
                            <Controller
                              name='spots'
                              control={methods.control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type='number'
                                  label='Spots Available'
                                  placeholder='Enter number of spots'
                                  onChange={(e) =>
                                    field.onChange(parseInt(e.target.value))
                                  }
                                />
                              )}
                            />
                            <div className='w-full mt-4'>
                              <Controller
                                name='staff'
                                control={methods.control}
                                render={({ field }) => (
                                  <DropdownSelectInput
                                    label='Assign Staff'
                                    placeholder='Select Staff'
                                    options={
                                      isStaffLoading
                                        ? [{ label: 'Loading...', value: '' }]
                                        : staffData
                                            ?.map((staff: any) => {
                                              if (!staff || !staff.id) {
                                                console.warn(
                                                  'Invalid staff data:',
                                                  staff
                                                );
                                                return null;
                                              }

                                              const userData = staff.user || {};
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
                                                  value: staff.id.toString(),
                                                  subLabel: email,
                                                  status,
                                                };
                                              } else if (email) {
                                                return {
                                                  label: email,
                                                  value: staff.id.toString(),
                                                  subLabel: `Staff ${staff.id}`,
                                                  status,
                                                };
                                              } else {
                                                return {
                                                  label: `Staff ${staff.id}`,
                                                  value: staff.id.toString(),
                                                  status,
                                                };
                                              }
                                            })
                                            .filter(Boolean) || []
                                    }
                                    value={
                                      field.value?.toString
                                        ? field.value?.toString()
                                        : field.value?.toString
                                        ? field.value.toString()
                                        : ''
                                    }
                                    onSelectItem={(selectedItem) => {
                                      field.onChange(selectedItem);
                                    }}
                                    createLabel='Create new staff'
                                    createDrawerType='staff'
                                  />
                                )}
                              />
                              {(() => {
                                const staffId = methods.watch('staff');
                                if (!staffId) return null;

                                const selectedStaff = staffData?.find(
                                  (staff: any) => {
                                    const staffIdStr =
                                      typeof staffId === 'object' &&
                                      staffId !== null
                                        ? String(
                                            (staffId as any).value || staffId
                                          )
                                        : String(staffId);
                                    return staff.id.toString() === staffIdStr;
                                  }
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
                                      Note: This staff member has not completed
                                      their account setup yet.
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
                          render={({ field }) => (
                            <>
                              {fromClientDrawer ? (
                                <div className='mb-4'>
                                  <label className='block text-sm mb-1 text-gray-700'>
                                    Clients
                                  </label>
                                  <div className='flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700'>
                                    <svg
                                      xmlns='http://www.w3.org/2000/svg'
                                      className='h-5 w-5 text-blue-500 mr-2'
                                      fill='none'
                                      viewBox='0 0 24 24'
                                      stroke='currentColor'
                                    >
                                      <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth='2'
                                        d='M5 13l4 4L19 7'
                                      />
                                    </svg>
                                    <span>
                                      Will be assigned to the client you're
                                      creating
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <DropdownSelectInput
                                  label='Clients'
                                  placeholder='Select Clients'
                                  singleSelect={false}
                                  options={
                                    isClientsLoading
                                      ? [{ label: 'Loading...', value: '' }]
                                      : (Array.isArray(clientsData)
                                          ? clientsData
                                          : clientsData?.items || []
                                        )?.map((client: Client) => ({
                                          label: `${client.first_name} ${client.last_name}`,
                                          value: client.id.toString(),
                                        })) || []
                                  }
                                  value={
                                    field.value ? field.value.map(String) : []
                                  }
                                  onSelectItem={(selectedItems) => {
                                    const values = Array.isArray(selectedItems)
                                      ? selectedItems.map((item) => item.value)
                                      : selectedItems
                                      ? [selectedItems.value]
                                      : [];
                                    field.onChange(values);
                                  }}
                                  createLabel='Add new client'
                                  createDrawerType='client'
                                />
                              )}
                            </>
                          )}
                        />
                        <Controller
                          name='policy_ids'
                          control={methods.control}
                          render={({ field }) => (
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
                              value={field.value ? field.value.map(String) : []}
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
                          )}
                        />

                        {/* Flexible Booking Options */}
                        {bookingSettings?.enable_flexible_booking && (
                          <div className='space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                            <div className='flex items-center justify-between'>
                              <div>
                                <h3 className='text-lg font-bold text-gray-700'>
                                  Flexible Booking Options
                                </h3>
                                <p className='text-sm text-gray-500'>
                                  Configure how clients can book this session
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

                                {methods.watch(
                                  'require_staff_confirmation'
                                ) && (
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
                                          value={
                                            field.value?.toString() || '24'
                                          }
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
                              locations when booking this session. Enable
                              business-level flexible booking in Profile →
                              Booking Settings first.
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className='bottom-0 py-4'>
                <div className='flex justify-end gap-4 pr-8'>
                  <Button
                    type='submit'
                    color='#1D9B5E'
                    radius='8px'
                    disabled={
                      methods.formState.isSubmitting || createSession.isPending
                    }
                    onClick={methods.handleSubmit(onSubmit)}
                  >
                    {createSession.isPending
                      ? methods.watch('session_type') === 'class'
                        ? 'Creating Class...'
                        : methods.watch('session_type') === 'appointment'
                        ? 'Creating Appointment...'
                        : 'Creating Event...'
                      : 'Continue'}
                  </Button>
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
                  const weekdayLabels = selectedWeekdays.join(', ');

                  repetitionDescription = `Weekly on ${weekdayLabels}`;
                } else {
                  repetitionDescription = 'Weekly';
                }

                if (
                  endsOption === 'on' &&
                  methods.getValues('repeat_end_date')
                ) {
                  const endDateStr = methods.getValues('repeat_end_date');
                  if (endDateStr) {
                    const endDate = new Date(endDateStr);
                    repetitionDescription += ` until ${endDate.toLocaleDateString()}`;
                  }
                } else if (endsOption === 'after') {
                  repetitionDescription += ` for ${occurrences} occurrences`;
                }

                const customRepetitionValue = repetitionDescription;
                methods.setValue('repetition', customRepetitionValue as any);

                setTimeout(() => {
                  const currentValue = methods.getValues('repetition');
                  methods.setValue('repetition', currentValue as any);
                }, 0);

                methods.setValue('repeat_every', 1);
                methods.setValue('repeat_unit', 'weeks');
                methods.setValue('repeat_on', selectedWeekdays);
                methods.setValue('repeat_end_type', endsOption);

                if (endsOption === 'after') {
                  methods.setValue('repeat_end_date', undefined);
                  methods.setValue('repeat_occurrences', occurrences);
                } else if (endsOption === 'never') {
                  methods.setValue('repeat_end_date', undefined);
                  methods.setValue('repeat_occurrences', undefined);
                } else if (endsOption === 'on') {
                  methods.setValue('repeat_occurrences', undefined);
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

export default AddSession;
