import { useForm, Controller, FormProvider } from "react-hook-form";
import {
  Category,
  CreateSessionData,
  RepeatUnit,
} from '../../types/sessionTypes';
import { Location } from '../../types/location';
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
  useUpdateSession,
  useGetLocations,
} from '../../hooks/reactQuery';
import { useGetSessionDetail } from '../../hooks/reactQuery';
import moment from 'moment';
import { Drawer, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  onUpdateSuccess?: () => void;
}

const UpdateSession = ({
  isOpen,
  onClose,
  sessionId,
  onUpdateSuccess,
}: SessionModalProps) => {
  const { data: sessionData } = useGetSessionDetail(sessionId || '');
  const updateSessionMutation = useUpdateSession();
  type CustomSessionData = Omit<CreateSessionData, "repetition"> & {
    repetition?: string;
  };

  const methods = useForm<Partial<CustomSessionData>>({
    mode: "onSubmit",
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
      category: undefined,
      location_id: undefined,
      client_ids: [],
      repeat_end_type: "never",
      repeat_end_date: undefined,
      repeat_occurrences: undefined,
      spots: 0,
      class_type: "regular",
      email: "",
      phone_number: "",
      selected_class: undefined,
    },
  });

  const { data: staffData, isLoading: isStaffLoading } = useGetStaff();
  const { data: clientsData, isLoading: isClientsLoading } = useGetClients();
  const { data: categoriesData } = useGetSessionCategories();
  const { data: locationsData, isLoading: isLocationsLoading } =
    useGetLocations();

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

  const handleEndsOptionChange = (option: "never" | "on" | "after") => {
    setEndsOption(option);
    methods.setValue("repeat_end_type", option);

    if (option === "never") {
      methods.setValue("repeat_end_date", undefined);
      methods.setValue("repeat_occurrences", undefined);
      setValue(null);
    } else if (option === "on") {
      methods.setValue("repeat_occurrences", undefined);
    } else if (option === "after") {
      methods.setValue("repeat_end_date", undefined);
      setValue(null);
      methods.setValue("repeat_occurrences", occurrences);
    }
  };

  const handleOccurrencesChange = (change: number) => {
    const newValue = Math.max(2, occurrences + change);
    setOccurrences(newValue);
    if (endsOption === "after") {
      methods.setValue("repeat_occurrences", newValue);
    }
  };

  useEffect(() => {
    if (sessionData && isOpen) {
      if (sessionData.repeat_on && Array.isArray(sessionData.repeat_on)) {
        setSelectedWeekdays(sessionData.repeat_on);
      }

      if (sessionData.repeat_end_type) {
        setEndsOption(sessionData.repeat_end_type as "never" | "on" | "after");
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
            repetitionValue = "weekly";
          }
        } else if (sessionData.repeat_unit === "months") {
          repetitionValue = "monthly";
        }
      }

      methods.reset({
        title: sessionData.title || '',
        description: sessionData.description || '',
        session_type: sessionData.session_type || 'class',
        class_type: sessionData.class_type || 'regular',
        date: moment(sessionData.date).format('YYYY-MM-DD'),
        start_time: sessionData.start_time,
        end_time: sessionData.end_time,
        spots: sessionData.spots,
        category: sessionData.category?.id,
        location_id: sessionData.location?.id,
        is_active: sessionData.is_active,
        client_ids: sessionData.attendances?.map((a) => a.client.id) || [],
        email: sessionData.email,
        phone_number: sessionData.phone_number,
        selected_class: sessionData.selected_class,
        repetition: repetitionValue as any,
        repeat_every: sessionData.repeat_every,
        repeat_unit: sessionData.repeat_unit,
        repeat_on: sessionData.repeat_on,
        repeat_end_type: sessionData.repeat_end_type,
        repeat_end_date: sessionData.repeat_end_date,
        repeat_occurrences: sessionData.repeat_occurrences,
      });

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
        setEndsOption(sessionData.repeat_end_type as "never" | "on" | "after");
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
      const extractValue = (field: any) => {
        if (field === null || field === undefined) return null;
        if (typeof field === "object" && "value" in field) return field.value;
        return field;
      };

      const dateOnly = data.date
        ? moment(data.date).format("YYYY-MM-DD")
        : undefined;

      let repeatUnit: RepeatUnit | undefined = undefined;
      let repeatEvery: number | undefined = undefined;
      let repeatOn: string[] | undefined = undefined;
      let repeatEndType: string | undefined = undefined;
      let repeatEndDate: string | undefined = undefined;
      let repeatOccurrences: number | undefined = undefined;

      if (data.repetition && data.repetition !== "none") {
        repeatEvery = 1;

        if (data.repetition === "daily") {
          repeatUnit = "days";
        } else if (data.repetition === "weekly") {
          repeatUnit = "weeks";
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
        if (endsOption === "on" && value) {
          repeatEndDate = moment(value).format("YYYY-MM-DD");
        } else if (endsOption === "after") {
          repeatOccurrences = occurrences;
        }
      }

      let clientIds: any[] = [];

      if (data.session_type === "appointment") {
        if (Array.isArray(data.client_ids) && data.client_ids.length > 0) {
          const clientId = data.client_ids[0];
          if (clientId !== null && clientId !== undefined) {
            if (
              typeof clientId === "object" &&
              clientId !== null &&
              "value" in clientId
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
          if (typeof id === "object" && id !== null && "value" in id) {
            return (id as { value: string | number }).value;
          }
          return id;
        });

        clientIds = clientIds.filter(
          (id: any) => id !== null && id !== undefined
        );

        clientIds = [...new Set(clientIds)];
      }

      const formattedData: any = {
        title: data.title,
        description: data.description,
        session_type: data.session_type,
        class_type: extractValue(data.class_type),
        date: dateOnly,
        spots: data.spots ? parseInt(data.spots.toString()) : undefined,
        category: extractValue(data.category),
        location_id: extractValue(data.location_id),
        staff: extractValue(data.staff),
        repeat_every: repeatEvery,
        repeat_unit: repeatUnit,
        repeat_on: repeatOn,
        repeat_end_type: repeatEndType,
        repeat_end_date: repeatEndDate,
        repeat_occurrences: repeatOccurrences,
        is_active: true,
        start_time: data.start_time,
        end_time: data.end_time,
        email: data.email,
        phone_number: data.phone_number,
        selected_class: data.selected_class,
        client_ids: [],
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
        title: "Success",
        message:
          data.session_type === "class"
            ? "Class updated successfully!"
            : "Appointment updated successfully!",
        color: "green",
        radius: "md",
        icon: (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-200">
            <img src={successIcon} alt="Success" className="w-4 h-4" />
          </span>
        ),
        withBorder: true,
        autoClose: 3000,
        position: "top-right",
      });
    } catch (error: any) {
      console.error("Error:", error);

      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        console.error("Error Response Status:", error.response.status);

        const errorData = error.response.data;
        const errorMessages = Object.entries(errorData)
          .map(([field, errors]) => `${field}: ${errors}`)
          .join("\n");

        if (methods.formState.errors) {
          Object.keys(error.response.data).forEach((field) => {
            const safeField = field;
            methods.setError(safeField as any, {
              type: "manual",
              message: error.response.data[field][0],
            });
          });
        }

        notifications.show({
          title: "Error",
          message: `Failed to update session: ${errorMessages}`,
          color: "red",
          radius: "md",
          icon: (
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-200">
              <img src={errorIcon} alt="Error" className="w-4 h-4" />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: "top-right",
        });
      } else if (error.request) {
        console.error("Error Request:", error.request);
        notifications.show({
          title: 'Connection Error',
          message:
            'No response received from server. Please check your connection.',
          color: 'red',
          radius: 'md',
          icon: (
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-200">
              <img src={errorIcon} alt="Error" className="w-4 h-4" />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: "top-right",
        });
      } else {
        console.error("Error Message:", error.message || "Unknown error");
        notifications.show({
          title: "Error",
          message: "Failed to update session. Please try again.",
          color: "red",
          radius: "md",
          icon: (
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-200">
              <img src={errorIcon} alt="Error" className="w-4 h-4" />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: "top-right",
        });
      }
    }
  };

  return (
    <>
      <Drawer
        opened={isOpen}
        onClose={onClose}
        size="lg"
        title={
          methods.watch('session_type') === 'class'
            ? 'Update Class'
            : methods.watch('session_type') === 'appointment'
            ? 'Update Appointment'
            : 'Update Event'
        }
        position="right"
        styles={{
          header: {
            padding: "1.5rem 2rem",
            marginBottom: 0,
          },
          title: {
            fontWeight: 600,
            fontSize: "1.25rem",
          },
          close: {
            color: "#374151",
          },
          body: {
            padding: 0,
          },
        }}
      >
        <div className="flex flex-col">
          <FormProvider {...methods}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                methods.handleSubmit((formData) => onSubmit(formData))(e);
              }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 p-8">
                <div className="space-y-6">
                  {methods.watch("session_type") === "class" ? (
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-3">
                        <div>
                          <h2 className="font-medium mb-2">Class Details</h2>
                        </div>
                        <Controller
                          name="class_type"
                          control={methods.control}
                          rules={{ required: true }}
                          render={({ field }) => {
                            let stringValue: string | undefined = undefined;

                            if (field.value) {
                              if (
                                typeof field.value === "object" &&
                                field.value !== null &&
                                "value" in field.value
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
                                label="Class Type"
                                placeholder="Select Class Type"
                                options={[
                                  { label: "Regular", value: "regular" },
                                  { label: "Private", value: "private" },
                                  { label: "Workshop", value: "workshop" },
                                ]}
                                onSelectItem={(selectedItem) =>
                                  field.onChange(selectedItem)
                                }
                              />
                            );
                          }}
                        />

                        <Controller
                          name="title"
                          control={methods.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              label="Class Name"
                              placeholder="Enter Class Name"
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
                          name="category"
                          control={methods.control}
                          render={({ field }) => {
                            return (
                              <DropdownSelectInput
                                label="Class Category"
                                placeholder="Select category"
                                options={
                                  categoriesData?.map((category: Category) => ({
                                    label: category.name,
                                    value: category.id.toString(),
                                  })) || []
                                }
                                value={
                                  field.value ? field.value.toString() : ""
                                }
                                onSelectItem={(selectedItem) => {
                                  field.onChange(
                                    selectedItem ? selectedItem.value : ""
                                  );
                                }}
                              />
                            );
                          }}
                        />
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-gray-700">
                            Class Schedule
                          </h3>
                          <Controller
                            name="date"
                            control={methods.control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label="Date"
                                placeholder="YYYY-MM-DD"
                                type="date"
                                value={field.value}
                              />
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <Controller
                              name="start_time"
                              control={methods.control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  label="Start Time"
                                  placeholder="HH:MM"
                                  type="time"
                                  value={field.value}
                                />
                              )}
                            />
                            <Controller
                              name="end_time"
                              control={methods.control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  label="End Time"
                                  placeholder="HH:MM"
                                  type="time"
                                  value={field.value}
                                />
                              )}
                            />
                          </div>
                        </div>
                        <Controller
                          name="repetition"
                          control={methods.control}
                          render={({ field }) => (
                            <div>
                              <DropdownSelectInput
                                value={field.value}
                                label="Set Repetition"
                                placeholder="Does not repeat"
                                options={[
                                  { label: "Does not repeat", value: "none" },
                                  { label: "Daily", value: "daily" },
                                  { label: "Weekly", value: "weekly" },
                                  { label: "Monthly", value: "monthly" },
                                  { label: "Custom", value: "custom" },
                                  // Add a dynamic option for custom repetition if it exists
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
                        <div className="flex justify-between items-center gap-4">
                          <Controller
                            name="spots"
                            control={methods.control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label="Slots"
                                placeholder="Enter number of slots"
                                type="number"
                              />
                            )}
                          />

                          <div className="w-full mt-4">
                            <Controller
                              name="staff"
                              control={methods.control}
                              render={({ field }) => {
                                const staffId = field.value
                                  ? typeof field.value === "object" &&
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
                                  : typeof field.value === "string" ||
                                    typeof field.value === "number"
                                  ? field.value.toString()
                                  : "";

                                return (
                                  <DropdownSelectInput
                                    label="Assign Staff"
                                    placeholder="Select Staff"
                                    options={
                                      isStaffLoading
                                        ? [{ label: "Loading...", value: "" }]
                                        : staffData?.map((staff: any) => ({
                                            label: `${staff.user?.first_name} ${staff.user?.last_name}`,
                                            value: staff.id.toString(),
                                          })) || []
                                    }
                                    value={staffValue}
                                    onSelectItem={(selectedItem) => {
                                      field.onChange(
                                        selectedItem ? selectedItem.value : ""
                                      );
                                    }}
                                  />
                                );
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <Controller
                        name="client_ids"
                        control={methods.control}
                        render={({ field }) => {
                          return (
                            <DropdownSelectInput
                              label="Clients"
                              placeholder="Select clients"
                              singleSelect={false}
                              options={
                                isClientsLoading
                                  ? [{ label: "Loading...", value: "" }]
                                  : clientsData?.map((client: any) => ({
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
                            />
                          );
                        }}
                      />
                      <Controller
                        name='location_id'
                        control={methods.control}
                        render={({ field }) => {
                          const locationId = field.value
                            ? typeof field.value === 'object' &&
                              field.value !== null
                              ? (field.value as any).id
                              : field.value
                            : null;

                          // Use type assertion to avoid conflicts
                          const selectedLocation = locationsData?.find(
                            (location: any) =>
                              location.id?.toString() === locationId?.toString()
                          ) as Location | undefined;

                          const locationValue = selectedLocation
                            ? selectedLocation.id.toString()
                            : typeof field.value === 'string' ||
                              typeof field.value === 'number'
                            ? field.value.toString()
                            : '';

                          return (
                            <DropdownSelectInput
                              label='Location'
                              placeholder='Select Location'
                              options={
                                isLocationsLoading
                                  ? [{ label: 'Loading...', value: '' }]
                                  : locationsData?.map((location: any) => ({
                                      label: location.name,
                                      value: location.id.toString(),
                                    })) || []
                              }
                              value={locationValue}
                              onSelectItem={(selectedItem) => {
                                field.onChange(
                                  selectedItem ? selectedItem.value : ''
                                );
                              }}
                            />
                          );
                        }}
                      />
                    </div>
                  ) : methods.watch('session_type') === 'appointment' ? (
                    <div className='space-y-4'>
                      <div>
                        <h2 className="font-medium mb-2">
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
                        name="client_ids"
                        control={methods.control}
                        render={({ field }) => {
                          return (
                            <DropdownSelectInput
                              label="Name"
                              placeholder="Select client"
                              options={
                                isClientsLoading
                                  ? [{ label: "Loading...", value: "" }]
                                  : clientsData?.map((client: any) => ({
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
                            />
                          );
                        }}
                      />

                      <Controller
                        name='location_id'
                        control={methods.control}
                        render={({ field }) => {
                          const locationId = field.value
                            ? typeof field.value === 'object' &&
                              field.value !== null
                              ? (field.value as any).id
                              : field.value
                            : null;

                          // Use type assertion to avoid conflicts
                          const selectedLocation = locationsData?.find(
                            (location: any) =>
                              location.id?.toString() === locationId?.toString()
                          ) as Location | undefined;

                          const locationValue = selectedLocation
                            ? selectedLocation.id.toString()
                            : typeof field.value === 'string' ||
                              typeof field.value === 'number'
                            ? field.value.toString()
                            : '';

                          return (
                            <DropdownSelectInput
                              label='Location'
                              placeholder='Select Location'
                              options={
                                isLocationsLoading
                                  ? [{ label: 'Loading...', value: '' }]
                                  : locationsData?.map((location: any) => ({
                                      label: location.name,
                                      value: location.id.toString(),
                                    })) || []
                              }
                              value={locationValue}
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
                          name="email"
                          control={methods.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              label="Email"
                              placeholder="Enter client email"
                            />
                          )}
                        />
                        <Controller
                          name="phone_number"
                          control={methods.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              label="Phone"
                              placeholder="Enter phone number"
                            />
                          )}
                        />
                      </div>

                      <Controller
                        name="date"
                        control={methods.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            label="Date"
                            placeholder="YYYY-MM-DD"
                            type="date"
                          />
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <Controller
                          name="start_time"
                          control={methods.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              label="Start Time"
                              placeholder="HH:MM"
                              type="time"
                            />
                          )}
                        />
                        <Controller
                          name="end_time"
                          control={methods.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              label="End Time"
                              placeholder="HH:MM"
                              type="time"
                            />
                          )}
                        />
                      </div>

                      <Controller
                        name="staff"
                        control={methods.control}
                        render={({ field }) => {
                          const staffId = field.value
                            ? typeof field.value === "object" &&
                              field.value !== null
                              ? (field.value as any).id
                              : field.value
                            : null;

                          const selectedStaff = staffData?.find(
                            (staff: any) => {
                              return (
                                staff.id?.toString() === staffId?.toString()
                              );
                            }
                          );

                          const staffValue = selectedStaff
                            ? selectedStaff.id.toString()
                            : typeof field.value === "string" ||
                              typeof field.value === "number"
                            ? field.value.toString()
                            : "";

                          return (
                            <DropdownSelectInput
                              label="Assign Staff"
                              placeholder="Select Staff"
                              options={
                                isStaffLoading
                                  ? [{ label: "Loading...", value: "" }]
                                  : staffData?.map((staff: any) => ({
                                      label: `${staff.user?.first_name} ${staff.user?.last_name}`,
                                      value: staff.id.toString(),
                                    })) || []
                              }
                              value={staffValue}
                              onSelectItem={(selectedItem) => {
                                field.onChange(
                                  selectedItem ? selectedItem.value : ""
                                );
                              }}
                            />
                          );
                        }}
                      />
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
                          const locationId = field.value
                            ? typeof field.value === 'object' &&
                              field.value !== null
                              ? (field.value as any).id
                              : field.value
                            : null;

                          // Use type assertion to avoid conflicts
                          const selectedLocation = locationsData?.find(
                            (location: any) =>
                              location.id?.toString() === locationId?.toString()
                          ) as Location | undefined;

                          const locationValue = selectedLocation
                            ? selectedLocation.id.toString()
                            : typeof field.value === 'string' ||
                              typeof field.value === 'number'
                            ? field.value.toString()
                            : '';

                          return (
                            <DropdownSelectInput
                              label='Location'
                              placeholder='Select Location'
                              options={
                                isLocationsLoading
                                  ? [{ label: 'Loading...', value: '' }]
                                  : locationsData?.map((location: any) => ({
                                      label: location.name,
                                      value: location.id.toString(),
                                    })) || []
                              }
                              value={locationValue}
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
                            <Input
                              {...field}
                              label='Date'
                              placeholder='YYYY-MM-DD'
                              type='date'
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
                                label='Start Time'
                                placeholder='HH:MM'
                                type='time'
                              />
                            )}
                          />
                          <Controller
                            name='end_time'
                            control={methods.control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label='End Time'
                                placeholder='HH:MM'
                                type='time'
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
                                if (selectedItem) {
                                  // Handle custom repetition
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
                          />
                        )}
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className=" p-8">
                <div className="flex justify-end gap-4">
                  <Button
                    variant="filled"
                    color="#1D9B5E"
                    radius="8px"
                    disabled={
                      methods.formState.isSubmitting ||
                      updateSessionMutation.isPending
                    }
                    onClick={methods.handleSubmit(onSubmit)}
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
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </Drawer>

      <Modal
        opened={isRepetitionModalOpen}
        onClose={closeRepetitionModal}
        title="Set Repetition"
        size="md"
        centered
        styles={{
          header: {
            padding: "1rem 1.5rem",
          },
          body: {
            padding: "1rem 1.5rem",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            borderRadius: "8px",
          },
        }}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-base font-medium text-gray-700">Repeat On</p>
            <div className="flex gap-2">
              {repeatDays.map((dayNum) => (
                <button
                  key={dayNum}
                  type="button"
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

          <div className="space-y-2">
            <p className="text-[16px] font-[400]">Ends</p>
            <div className="flex gap-8">
              {["never", "on", "after"].map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={endsOption === option}
                      onChange={() =>
                        handleEndsOptionChange(
                          option as "never" | "on" | "after"
                        )
                      }
                      className="w-4 h-4 border-2 p-2 border-secondary focus:ring-2 focus:border-none focus:ring-secondary appearance-none rounded-full cursor-pointer bg-white"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className={`w-3 h-3 rounded-full transition-colors ${
                          endsOption === option
                            ? "bg-secondary"
                            : "bg-transparent"
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

          {endsOption === "on" && (
            <div className="flex justify-between gap-4">
              <div className="flex justify-center items-center cursor-pointer w-[133px] h-[43px] bg-cardsBg text-center rounded-lg text-sm">
                <DatePickerInput
                  variant="unstyled"
                  value={value}
                  onChange={(newDate) => {
                    setValue(newDate);
                    if (newDate) {
                      const formattedDate = newDate.toISOString().split("T")[0];
                      methods.setValue("repeat_end_date", formattedDate);
                    } else {
                      methods.setValue("repeat_end_date", undefined);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Select date"
                  valueFormat="MMM DD, YYYY"
                />
              </div>
            </div>
          )}
          {endsOption === "after" && (
            <div className="flex justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="flex justify-center items-center cursor-pointer w-[133px] h-[43px] bg-cardsBg text-center rounded-lg text-sm">
                  {occurrences} occurrences
                </span>
                <div className="flex flex-col">
                  <button
                    onClick={() => handleOccurrencesChange(1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <img src={ChevronUp} alt="increase" className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOccurrencesChange(-1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <img src={ChevronDown} alt="decrease" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 "
              onClick={() => {
                closeRepetitionModal();
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-md hover:bg-secondary/90 "
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
                  repetitionDescription = "Weekly";
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
                  const currentValue = methods.getValues("repetition");
                  methods.setValue("repetition", currentValue as any);
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
                    "repeat_end_date",
                    moment(value).format("YYYY-MM-DD")
                  );
                  methods.setValue("repeat_occurrences", undefined);
                } else if (endsOption === "after") {
                  methods.setValue("repeat_end_date", undefined);
                  methods.setValue("repeat_occurrences", occurrences);
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
