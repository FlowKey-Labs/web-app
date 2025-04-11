import { useForm, Controller, FormProvider } from 'react-hook-form';
import {
  Session,
  Category,
  ClassFields,
  AppointmentFields,
} from '../../types/sessionTypes';
import { toast } from 'react-toastify';
import Button from '../common/Button';
import DropdownSelectInput from '../common/Dropdown';
import Input from '../common/Input';
import { useState, useEffect } from 'react';
import { repeatDays, weekdayNames } from '../../utils/dummyData';
import ChevronUp from '../../assets/icons/up.svg';
import ChevronDown from '../../assets/icons/down.svg';
import { DatePickerInput } from '@mantine/dates';
import {
  useGetStaff,
  useGetClients,
  useGetSessionCategories,
  useGetClassSessions,
} from '../../hooks/reactQuery';
import { useCreateSession } from '../../hooks/reactQuery';
import moment from 'moment';
import { Modal, Drawer } from '@mantine/core';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  // Common fields
  start_time: string;
  end_time: string;
  session_type: 'class' | 'appointment';
  repetition: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  date: string;

  // Class fields with dropdown support
  title: string;
  class_type: DropDownItem | ClassFields['class_type'];
  spots: number;

  // Appointment fields with dropdown support
  email?: AppointmentFields['email'];
  phone_number?: AppointmentFields['phone_number'];
  selected_class?: DropDownItem | AppointmentFields['selected_class'];

  // Dropdown fields that can be objects or primitives
  staff?: DropDownItem | number;
  category_id?: DropDownItem | number;
  client_ids: string[];

  // Repetition fields
  repeat_every?: number;
  repeat_unit?: 'days' | 'weeks' | 'months';
  repeat_on?: number[];
  repeat_end_type: 'never' | 'on' | 'after';
  repeat_end_date?: string;
  repeat_occurrences?: number;
};

const AddSession = ({ isOpen, onClose }: SessionModalProps) => {
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
      category_id: undefined,
      client_ids: [],
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

  // Fetch data from API
  const { data: staffData, isLoading: isStaffLoading } = useGetStaff();
  const { data: clientsData, isLoading: isClientsLoading } = useGetClients();
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetSessionCategories();
  const { data: classSessionsData, isLoading: isClassSessionsLoading } =
    useGetClassSessions();

  const createSession = useCreateSession();

  const [
    isRepetitionModalOpen,
    { open: openRepetitionModal, close: closeRepetitionModal },
  ] = useDisclosure();

  // Initialize repetition state
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [endsOption, setEndsOption] = useState<'never' | 'on' | 'after'>(
    'never'
  );
  const [occurrences, setOccurrences] = useState(2);
  const [value, setValue] = useState<Date | null>(null);

  // Reset form when type changes
  useEffect(() => {
    if (methods.watch('session_type') === 'class') {
      methods.reset({
        ...methods.getValues(),
        email: '',
        phone_number: '',
        selected_class: undefined,
      });
    } else {
      methods.reset({
        ...methods.getValues(),
        spots: 0,
        class_type: 'regular',
      });
    }
  }, [methods.watch('session_type')]);

  // Reset repetition state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      closeRepetitionModal();
      setSelectedWeekdays([]);
      setEndsOption('never');
      setOccurrences(2);
      setValue(null);
    }
  }, [isOpen]);

  const handleWeekdayClick = (weekday: number) => {
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
      const timeOnly = moment(data.start_time).format('HH:mm:ss');
      const actualStartTime = `${dateOnly}T${timeOnly}Z`;

      const timeOnlyEnd = moment(data.end_time).format('HH:mm:ss');
      const actualEndTime = `${dateOnly}T${timeOnlyEnd}Z`;

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

      const formattedData = {
        title: data.title,
        session_type: data.session_type,
        class_type: extractValue(data.class_type),
        date: dateOnly,
        spots: parseInt(data.spots.toString()),
        category: extractValue(data.category_id),
        staff: extractValue(data.staff),
        client_ids: data.client_ids || [],
        repeat_end_date: formattedRepeatEndDate,
        repeat_every: data.repeat_every,
        repeat_unit: data.repeat_unit,
        repeat_on: data.repeat_on,
        repeat_end_type: data.repeat_end_type,
        repeat_occurrences: data.repeat_occurrences,
        start_time: actualStartTime,
        end_time: actualEndTime,
        email: data.email,
        phone_number: data.phone_number,
        selected_class: extractValue(data.selected_class),
      };

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
      toast.success(
        data.session_type === 'class'
          ? 'Class created successfully!'
          : 'Appointment created successfully!'
      );

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

        if (typeof error.response.data === 'object') {
          const errorMessages = Object.entries(error.response.data)
            .map(([field, errors]) => `${field}: ${errors}`)
            .join('\n');

          toast.error(`Validation errors:\n${errorMessages}`, {
            autoClose: 10000,
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
          toast.error(`Server error: ${JSON.stringify(error.response.data)}`);
        }
      } else if (error.request) {
        console.error('Error Request:', error.request);
        toast.error(
          'No response received from server. Please check your connection.'
        );
      } else {
        console.error('Error Message:', error.message || 'Unknown error');
        toast.error('Failed to create session. Please try again.');
      }
    }
  };

  return (
    <>
      <Drawer
        opened={isOpen}
        onClose={onClose}
        title='New Session'
        size='lg'
        position='right'
        styles={{
          header: {
            padding: '1rem 1.5rem',
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
          </div>
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className='flex-1 flex flex-col'
            >
              <div className='flex-1 p-8'>
                <div className='space-y-4'>
                  <h3 className='text-lg font-bold text-gray-700'>
                    {methods.watch('session_type') === 'class'
                      ? 'Class Details'
                      : 'Client Information'}
                  </h3>
                  <div className='space-y-6'>
                    {methods.watch('session_type') === 'class' ? (
                      <>
                        <div className='flex flex-col space-y-3'>
                          <div>
                            <h2 className='font-medium mb-2'>Session Type</h2>
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
                                  options={[
                                    { label: 'Regular', value: 'regular' },
                                    { label: 'Private', value: 'private' },
                                    { label: 'Workshop', value: 'workshop' },
                                  ]}
                                  onSelectItem={(selectedItem) =>
                                    field.onChange(selectedItem)
                                  }
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
                          <div>
                            <Controller
                              name='category_id'
                              control={methods.control}
                              render={({ field }) => (
                                <DropdownSelectInput
                                  label='Categories'
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
                                    field.value?.toString
                                      ? field.value?.toString()
                                      : field.value?.toString
                                      ? field.value.toString()
                                      : ''
                                  }
                                  onSelectItem={(selectedItem) => {
                                    field.onChange(selectedItem);
                                  }}
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
                                <Input
                                  {...field}
                                  type='date'
                                  value={
                                    field.value ? field.value.toString() : ''
                                  }
                                  label='Date'
                                  placeholder='2020/12/12'
                                  containerClassName='mb-4'
                                />
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

                                              return {
                                                label:
                                                  userData.first_name &&
                                                  userData.last_name
                                                    ? `${userData.first_name} ${userData.last_name}`
                                                    : `Staff ${staff.id}`,
                                                value: staff.id.toString(),
                                              };
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
                                      console.log(
                                        'Selected staff item:',
                                        selectedItem
                                      );
                                      const value = selectedItem?.value;
                                      field.onChange(
                                        value ? parseInt(value) : undefined
                                      );
                                    }}
                                  />
                                )}
                              />
                            </div>
                          </div>
                        </div>
                        <Controller
                          name='client_ids'
                          control={methods.control}
                          render={({ field }) => (
                            <DropdownSelectInput
                              label='Clients'
                              placeholder='Select Clients'
                              singleSelect={false}
                              options={
                                isClientsLoading
                                  ? [{ label: 'Loading...', value: '' }]
                                  : clientsData?.map((client: any) => ({
                                      label: `${client.first_name} ${client.last_name}`,
                                      value: client.id.toString(),
                                    })) || []
                              }
                              value={field.value || []}
                              onSelectItem={(selectedItems) => {
                                const values = Array.isArray(selectedItems)
                                  ? selectedItems.map((item) => item.value)
                                  : selectedItems
                                  ? [selectedItems.value]
                                  : [];
                                field.onChange(values);
                              }}
                            />
                          )}
                        />
                      </>
                    ) : (
                      <>
                        <div className='space-y-4'>
                          <Controller
                            name='client_ids'
                            control={methods.control}
                            render={({ field }) => (
                              <DropdownSelectInput
                                label='Name'
                                placeholder='Select or create Clients'
                                options={
                                  isClientsLoading
                                    ? [{ label: 'Loading...', value: '' }]
                                    : clientsData?.map((client: any) => ({
                                        label: `${client.first_name} ${client.last_name}`,
                                        value: client.id.toString(),
                                      })) || []
                                }
                                value={field.value || []}
                                onSelectItem={(selectedItems) => {
                                  const values = Array.isArray(selectedItems)
                                    ? selectedItems.map((item) => item.value)
                                    : selectedItems
                                    ? [selectedItems.value]
                                    : [];
                                  field.onChange(values);
                                }}
                              />
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
                              name='date'
                              control={methods.control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type='date'
                                  value={
                                    field.value ? field.value.toString() : ''
                                  }
                                  label='Date'
                                  placeholder='2020/12/12'
                                  containerClassName='mb-4'
                                />
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
                          <div className='w-full'>
                            <Controller
                              name='selected_class'
                              control={methods.control}
                              render={({ field }) => (
                                <DropdownSelectInput
                                  label='Class'
                                  placeholder='Select a class'
                                  options={
                                    isClassSessionsLoading
                                      ? [{ label: 'Loading...', value: '' }]
                                      : classSessionsData
                                          ?.filter(
                                            (session) =>
                                              session.session_type === 'class'
                                          )
                                          .map((session) => ({
                                            label: session.title,
                                            value: session.id.toString(),
                                          })) || []
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
                                />
                              )}
                            />
                          </div>
                          <div className='w-full'>
                            <Controller
                              name='staff'
                              control={methods.control}
                              render={({ field }) => (
                                <DropdownSelectInput
                                  label='Assign Coach'
                                  placeholder='Select Coach'
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

                                            return {
                                              label:
                                                userData.first_name &&
                                                userData.last_name
                                                  ? `${userData.first_name} ${userData.last_name}`
                                                  : `Staff ${staff.id}`,
                                              value: staff.id.toString(),
                                            };
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
                                  }}
                                />
                              )}
                            />
                          </div>
                        </div>
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
                        : 'Creating Appointment...'
                      : methods.watch('session_type') === 'class'
                      ? 'Continue'
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
                    selectedWeekdays.includes(dayNum)
                      ? 'bg-secondary text-white hover:bg-secondary/90'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWeekdayClick(dayNum);
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
