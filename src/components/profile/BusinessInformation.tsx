import { Accordion, Loader, Select, Switch, Text } from '@mantine/core';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

import Button from '../common/Button';
import Input from '../common/Input';
import {
  useUpdateBusinessProfile,
  useGetBusinessProfile,
} from '../../hooks/reactQuery';
import { useTimezone } from '../../contexts/TimezoneContext';
import { TIMEZONE_OPTIONS } from '../../utils/timezone';
import ErrorBoundary from '../common/ErrorBoundary';

import profileGeneralIcon from '../../assets/icons/profileGeneral.svg';
import greenProfileGeneralIcon from '../../assets/icons/greenProfileGeneral.svg';

export interface ProfileFormData {
  business_name: string;
  contact_person: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  about: string;
  timezone: string;
  user_timezone: string;
  use_24_hour: boolean;
}

interface BusinessInformationProps {
  openedAccordion: string | null;
  setOpenedAccordion: (value: string | null) => void;
}

const BusinessInformation = ({
  openedAccordion,
  setOpenedAccordion,
}: BusinessInformationProps) => {
  const { data: businessProfile, isLoading } = useGetBusinessProfile();
  const { state: timezoneState, actions: timezoneActions } = useTimezone();
  const methods = useForm<ProfileFormData>({
    defaultValues: {
      business_name: '',
      contact_person: '',
      address: '',
      contact_phone: '',
      contact_email: '',
      about: '',
      timezone: 'Africa/Nairobi',
      user_timezone: 'Africa/Nairobi',
      use_24_hour: false,
    },
  });
  const updateProfile = useUpdateBusinessProfile();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getCurrentTimeForTimezone = (timezone: string, use24Hour: boolean) => {
    try {
      const now = DateTime.fromJSDate(currentTime).setZone(timezone);
      return use24Hour ? now.toFormat('HH:mm:ss') : now.toFormat('h:mm:ss a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid timezone';
    }
  };

  const formData = useMemo(() => ({
    business_name: businessProfile?.[0]?.business_name || '',
    contact_person: businessProfile?.[0]?.contact_person || '',
    address: businessProfile?.[0]?.address || '',
    contact_phone: businessProfile?.[0]?.contact_phone || '',
    contact_email: businessProfile?.[0]?.contact_email || '',
    about: businessProfile?.[0]?.about || '',
    timezone: businessProfile?.[0]?.timezone || 'Africa/Nairobi',
    user_timezone: timezoneState.selectedTimezone,
    use_24_hour: timezoneState.use24Hour,
  }), [businessProfile, timezoneState.selectedTimezone, timezoneState.use24Hour]);

  useEffect(() => {
    if (businessProfile?.[0]) {
      methods.reset(formData);
    }
  }, [businessProfile, formData, methods]);

  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="w-full space-y-4">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <Loader size="md" color="#1D9B5E" />
              <p className="mt-4 text-gray-600">Loading business information...</p>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  const onSubmit = (data: ProfileFormData) => {
    if (!businessProfile?.[0]?.id) {
      console.error('No business profile ID found');

      notifications.show({
        title: 'Error',
        message: 'Business profile not found. Please try again.',
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
      return;
    }

    updateProfile.mutate(
      {
        id: businessProfile[0].id.toString(),
        updateData: {
          business_name: data.business_name,
          contact_person: data.contact_person,
          address: data.address,
          contact_phone: data.contact_phone,
          contact_email: data.contact_email,
          about: data.about,
          timezone: data.timezone,
        },
      },
      {
        onSuccess: () => {
          timezoneActions.setSelectedTimezone(data.user_timezone);
          timezoneActions.setBusinessTimezone(data.timezone);
          timezoneActions.setUse24Hour(data.use_24_hour);
          
          notifications.show({
            title: 'Success',
            message: 'Business profile updated successfully!',
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
        },
        onError: (error) => {
          console.error('Update failed:', error);
          notifications.show({
            title: 'Error',
            message: 'Failed to update business profile. Please try again.',
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
        },
      }
    );
  };

  return (
    <ErrorBoundary>
      <div className='w-full space-y-4'>
        <FormProvider {...methods}>
        <Accordion
          transitionDuration={300}
          variant='contained'
          chevronPosition='right'
          radius='lg'
          defaultValue='general'
          onChange={setOpenedAccordion}
        >
          <Accordion.Item value='general' className="border border-gray-200 rounded-lg overflow-hidden">
            <Accordion.Control
              className="hover:bg-gray-50 transition-colors duration-200"
              icon={
                <div className='rounded-full bg-gray-100 p-2'>
                  <img
                    src={
                      openedAccordion === 'general'
                        ? greenProfileGeneralIcon
                        : profileGeneralIcon
                    }
                    alt='profileGeneralIcon'
                    className='w-5 h-5 lg:w-6 lg:h-6'
                  />
                </div>
              }
            >
              <div className='flex flex-col gap-1'>
                <h3 className='text-primary text-sm lg:text-base font-semibold'>
                  General Information
                </h3>
                <p className='text-gray-500 text-xs lg:text-sm'>
                  Tell us more about your business
                </p>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className='p-4 lg:p-6'>
                <form onSubmit={methods.handleSubmit(onSubmit)} className='w-full space-y-6 lg:space-y-8'>

                  <div className='flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6'>
                    <div className='flex flex-col items-center lg:items-start space-y-3 lg:flex-shrink-0 w-full business-preview-section'>
                      <style>{`
                        @media (min-width: 1024px) {
                          .business-preview-section { 
                            flex: 0 0 30% !important;
                            width: 30% !important;
                          }
                          .business-form-section {
                            flex: 1 1 70% !important;
                          }
                        }
                      `}</style>
                      <div className='relative'>
                        <div className='w-16 h-16 lg:w-20 lg:h-20 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl border-4 border-white/50 business-logo'>
                          <span className='text-lg lg:text-xl font-bold text-white relative z-10'>
                            {(() => {
                              const name = methods.getValues('business_name')?.trim() || '';
                              if (!name) return 'BN';
                              const words = name.split(' ').filter(Boolean);
                              if (words.length === 1)
                                return words[0].substring(0, 2).toUpperCase();
                              return (words[0][0] + words[1][0]).toUpperCase();
                            })()}
                          </span>
                        </div>
                        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-3xl blur-xl animate-pulse"></div>
                      </div>
                      
                      <div className='text-center lg:text-left w-full'>
                        <h3 className='text-sm lg:text-base font-semibold text-gray-900 truncate'>
                          {methods.getValues('business_name') || 'Add Business Name'}
                        </h3>
                        <p className='text-xs text-gray-500 mt-1 line-clamp-2 lg:line-clamp-4'>
                          {methods.getValues('about') || 'Add business description to help clients understand what you offer and why they should choose your services.'}
                        </p>
                      </div>
                    </div>

                    <div className='hidden lg:block w-px h-20 bg-gray-200 mt-2'></div>

                    <div className='flex-1 min-w-0 w-full lg:w-auto business-form-section'>
                      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                        <Controller
                          name='business_name'
                          control={methods.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              name='business_name'
                              label='Business Name'
                              placeholder='Enter business name'
                              type='text'
                              className="w-full"
                            />
                          )}
                        />
                        <Controller
                          name='contact_person'
                          control={methods.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              name='contact_person'
                              label='Contact Person'
                              placeholder='Enter contact person'
                              type='text'
                              className="w-full"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <h3 className='text-sm lg:text-base font-medium text-gray-900 border-b border-gray-200 pb-2'>
                      Contact Information
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <Controller
                        name='contact_phone'
                        control={methods.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            name='contact_phone'
                            label='Contact Phone'
                            placeholder='Enter phone number'
                            type='text'
                            className="w-full"
                          />
                        )}
                      />
                      <Controller
                        name='contact_email'
                        control={methods.control}
                        rules={{
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email format',
                          },
                        }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            name='contact_email'
                            label='Contact Email'
                            placeholder='Enter email'
                            type='email'
                            className="w-full"
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <h3 className='text-sm lg:text-base font-medium text-gray-900 border-b border-gray-200 pb-2'>
                      Business Settings
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <Controller
                        name='timezone'
                        control={methods.control}
                        render={({ field }) => {
                          const getTimezoneOptionsForBusinessSelect = () => {
                            const grouped = (TIMEZONE_OPTIONS || []).reduce((acc, tz) => {
                              const region = tz.region || 'Other';
                              if (!acc[region]) {
                                acc[region] = { group: region, items: [] };
                              }
                              acc[region].items.push({ value: tz.value, label: tz.label });
                              return acc;
                            }, {} as Record<string, { group: string; items: { value: string; label: string }[] }>);
                            
                            return Object.values(grouped);
                          };

                          return (
                            <div className="w-full">
                              <Select
                                {...field}
                                label='Business Timezone'
                                placeholder='Select your business timezone'
                                data={getTimezoneOptionsForBusinessSelect()}
                                className="w-full"
                                searchable
                                description="This timezone will be used for all your sessions and bookings"
                                onChange={(value) => {
                                  field.onChange(value || 'Africa/Nairobi');
                                  if (value) {
                                    timezoneActions.setBusinessTimezone(value);
                                  }
                                }}
                              />
                            </div>
                          );
                        }}
                      />
                      
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={methods.watch('use_24_hour')}
                            onChange={(event) => {
                              methods.setValue('use_24_hour', event.currentTarget.checked);
                              timezoneActions.setUse24Hour(event.currentTarget.checked);
                            }}
                            size="sm"
                            color="teal"
                          />
                          <Text size="sm" className="text-gray-700">
                            Use 24-hour format
                          </Text>
                        </div>
                        <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <Text size="xs" className="text-gray-500 font-medium">
                            Current time:
                          </Text>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <Text size="sm" className="text-emerald-600 font-mono font-semibold">
                              {getCurrentTimeForTimezone(
                                methods.watch('timezone') || 'Africa/Nairobi',
                                methods.watch('use_24_hour') || false
                              )}
                            </Text>
                          </div>
                          <Text size="xs" className="text-gray-400">
                            {(() => {
                              const selectedTimezone = methods.watch('timezone') || 'Africa/Nairobi';
                              const timezoneInfo = TIMEZONE_OPTIONS.find(tz => tz.value === selectedTimezone);
                              return timezoneInfo?.label || 'Selected timezone';
                            })()}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <h3 className='text-sm lg:text-base font-medium text-gray-900 border-b border-gray-200 pb-2'>
                      About Company
                    </h3>
                    <Controller
                      name='about'
                      control={methods.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          name='about'
                          label='About'
                          placeholder='Tell us about your business'
                          type='textarea'
                          rows={4}
                          className="w-full"
                        />
                      )}
                    />
                  </div>

                  <div className='flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200'>
                    <Button
                      size='sm'
                      radius='md'
                      type='button'
                      variant='outline'
                      color='red'
                      onClick={() => {
                        if (businessProfile?.[0]) {
                          const resetData = {
                            business_name: businessProfile[0].business_name || '',
                            contact_person: businessProfile[0].contact_person || '',
                            address: businessProfile[0].address || '',
                            contact_phone: businessProfile[0].contact_phone || '',
                            contact_email: businessProfile[0].contact_email || '',
                            about: businessProfile[0].about || '',
                            timezone: businessProfile[0].timezone || 'Africa/Nairobi',
                            user_timezone: timezoneState.selectedTimezone,
                            use_24_hour: timezoneState.use24Hour,
                          };
                          methods.reset(resetData);
                        }
                      }}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      size='sm'
                      radius='md'
                      type='submit'
                      color='#1D9B5E'
                      disabled={updateProfile.isPending}
                      className="w-full sm:w-auto"
                    >
                      {updateProfile.isPending ? 'Saving...' : 'Save & Continue'}
                    </Button>
                  </div>
                </form>
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </FormProvider>
    </div>
    </ErrorBoundary>
  );
};

export default BusinessInformation;
