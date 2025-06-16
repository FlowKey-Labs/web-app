import React, { useState, useEffect } from 'react';
import { Accordion, Loader } from '@mantine/core';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

import Button from '../common/Button';
import Input from '../common/Input';
import { useGetBookingSettings, useUpdateBookingSettings } from '../../hooks/reactQuery';
import { BookingSettings as BookingSettingsType } from '../../types/bookingTypes';

// Import icons (you may need to create or use existing ones)
import profileGeneralIcon from '../../assets/icons/profileGeneral.svg';
import greenProfileGeneralIcon from '../../assets/icons/greenProfileGeneral.svg';

// Custom Icons for Booking Settings
const GeneralSettingsIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='w-6 h-6'
  >
    <path
      d='M3 9.11V14.88C3 17 3 17 5 18.35L10.5 21.53C11.33 22.01 12.68 22.01 13.5 21.53L19 18.35C21 17 21 17 21 14.88V9.11C21 7 21 7 19 5.65L13.5 2.47C12.68 1.99 11.33 1.99 10.5 2.47L5 5.65C3 7 3 7 3 9.11Z'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const GroupBookingsIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='w-6 h-6'
  >
    <path
      d='M18 7.16C17.94 7.15 17.87 7.15 17.81 7.16C16.43 7.11 15.33 5.98 15.33 4.58C15.33 3.15 16.48 2 17.91 2C19.34 2 20.49 3.16 20.49 4.58C20.48 5.98 19.38 7.11 18 7.16Z'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M16.97 14.44C18.34 14.67 19.85 14.43 20.91 13.72C22.32 12.78 22.32 11.24 20.91 10.3C19.84 9.59001 18.31 9.35001 16.94 9.59001'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M5.97 7.16C6.03 7.15 6.1 7.15 6.16 7.16C7.54 7.11 8.64 5.98 8.64 4.58C8.64 3.15 7.49 2 6.06 2C4.63 2 3.48 3.16 3.48 4.58C3.49 5.98 4.59 7.11 5.97 7.16Z'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M7 14.44C5.63 14.67 4.12 14.43 3.06 13.72C1.65 12.78 1.65 11.24 3.06 10.3C4.13 9.59001 5.66 9.35001 7.03 9.59001'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12 14.63C11.94 14.62 11.87 14.62 11.81 14.63C10.43 14.58 9.33002 13.45 9.33002 12.05C9.33002 10.62 10.48 9.47 11.91 9.47C13.34 9.47 14.49 10.63 14.49 12.05C14.48 13.45 13.38 14.59 12 14.63Z'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M9.09002 17.78C7.68002 18.72 7.68002 20.26 9.09002 21.2C10.69 22.27 13.31 22.27 14.91 21.2C16.32 20.26 16.32 18.72 14.91 17.78C13.32 16.72 10.69 16.72 9.09002 17.78Z'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const EmailNotificationsIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='w-6 h-6'
  >
    <path
      d='M17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V15.5C22 19 20 20.5 17 20.5Z'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M18.7698 7.7688L13.2228 12.0551C12.5025 12.6116 11.4973 12.6116 10.777 12.0551L5.23004 7.7688'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M19.5 5C20.8807 5 22 6.11929 22 7.5C22 8.88071 20.8807 10 19.5 10C18.1193 10 17 8.88071 17 7.5C17 6.11929 18.1193 5 19.5 5Z'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const BookingPoliciesIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='w-6 h-6'
  >
    <path
      d='M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M14 2V8H20'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M16 13H8'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M16 17H8'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M10 9H9H8'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    {/* Checkmark to indicate policies/rules */}
    <circle
      cx="7"
      cy="15"
      r="2"
      fill={isActive ? '#1D9B5E' : '#6D7172'}
      opacity="0.3"
    />
    <path
      d="M6 15L6.5 15.5L8 14"
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const PageCustomizationIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='w-6 h-6'
  >
    <path
      d='M12 2L2 7L12 12L22 7L12 2Z'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M2 17L12 22L22 17'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M2 12L12 17L22 12'
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    {/* Paintbrush/customization element */}
    <circle
      cx="18"
      cy="6"
      r="2"
      fill={isActive ? '#1D9B5E' : '#6D7172'}
      opacity="0.3"
    />
    <path
      d="M16 4L17 5"
      stroke={isActive ? '#1D9B5E' : '#6D7172'}
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

interface BookingSettingsProps {
  openedAccordion: string | null;
  setOpenedAccordion: (value: string | null) => void;
}

interface BookingFormData {
  // Core settings
  is_active: boolean;
  requires_approval: boolean;
  auto_approve_returning_clients: boolean;
  buffer_time_minutes: number;
  booking_expiry_hours: number;
  max_advance_booking_days: number;
  min_advance_booking_hours: number;
  
  // Group booking settings
  allow_group_bookings: boolean;
  max_group_size: number;
  group_booking_requires_approval: boolean;
  allow_duplicate_bookings: boolean;
  
  // Email notification settings
  send_confirmation_emails: boolean;
  send_reminder_emails: boolean;
  reminder_hours_before: number;
  auto_release_expired: boolean;
  send_expiry_notifications: boolean;
  
  // Customization
  booking_page_title: string;
  booking_page_description: string;
  success_message: string;
  
  // Policies
  allow_client_cancellation: boolean;
  cancellation_deadline_hours: number;
  send_cancellation_emails: boolean;
  cancellation_fee_policy: string;
  allow_client_reschedule: boolean;
  reschedule_deadline_hours: number;
  max_reschedules_per_booking: number;
  send_reschedule_emails: boolean;
  reschedule_fee_policy: string;
  allow_admin_deletion: boolean;
  require_deletion_reason: boolean;
}

const BookingSettings: React.FC<BookingSettingsProps> = ({
  openedAccordion,
  setOpenedAccordion,
}) => {
  const { data: settings, isLoading, error } = useGetBookingSettings();
  const updateSettings = useUpdateBookingSettings();

  const methods = useForm<BookingFormData>({
    defaultValues: {
      is_active: true,
      requires_approval: false,
      auto_approve_returning_clients: false,
      buffer_time_minutes: 15,
      booking_expiry_hours: 24,
      max_advance_booking_days: 30,
      min_advance_booking_hours: 2,
      allow_group_bookings: true,
      max_group_size: 10,
      group_booking_requires_approval: true,
      allow_duplicate_bookings: false,
      send_confirmation_emails: true,
      send_reminder_emails: true,
      reminder_hours_before: 24,
      auto_release_expired: true,
      send_expiry_notifications: true,
      booking_page_title: '',
      booking_page_description: '',
      success_message: '',
      allow_client_cancellation: true,
      cancellation_deadline_hours: 24,
      send_cancellation_emails: true,
      cancellation_fee_policy: '',
      allow_client_reschedule: true,
      reschedule_deadline_hours: 24,
      max_reschedules_per_booking: 2,
      send_reschedule_emails: true,
      reschedule_fee_policy: '',
      allow_admin_deletion: true,
      require_deletion_reason: true,
    },
  });

  useEffect(() => {
    if (settings) {
      methods.reset(settings);
    }
  }, [settings, methods]);

  const onSubmit = async (data: BookingFormData) => {
    try {
      await updateSettings.mutateAsync(data);
      notifications.show({
        title: 'Success',
        message: 'Booking settings updated successfully!',
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
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to update booking settings',
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
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen p-6 pt-12'>
        <Loader size='xl' color='#1D9B5E' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center h-64 p-6'>
        <div className='text-center'>
          <p className='text-red-500 mb-4'>Failed to load booking settings</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full space-y-6 bg-white rounded-lg p-6'>
      <FormProvider {...methods}>
        <Accordion
          transitionDuration={300}
          variant='contained'
          chevronPosition='right'
          radius='md'
          defaultValue='general'
          value={openedAccordion}
          onChange={setOpenedAccordion}
        >
          {/* General Settings */}
          <Accordion.Item value='general' className="border border-gray-200 rounded-lg overflow-hidden mb-4">
            <Accordion.Control
              className={`transition-all duration-200 ${
                openedAccordion === 'general' 
                  ? 'bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20 shadow-md' 
                  : 'hover:bg-gray-50'
              }`}
              icon={
                <div className={`rounded-full p-2.5 transition-colors duration-200 ${
                  openedAccordion === 'general' 
                    ? 'bg-secondary/15 ring-2 ring-secondary/30' 
                    : 'bg-gray-100'
                }`}>
                  <GeneralSettingsIcon isActive={openedAccordion === 'general'} />
                </div>
              }
            >
              <div className='flex flex-col gap-1'>
                <h3 className={`text-sm lg:text-base font-semibold transition-colors duration-200 ${
                  openedAccordion === 'general' 
                    ? 'text-secondary' 
                    : 'text-primary'
                }`}>
                  General Settings
                </h3>
                <p className={`text-xs lg:text-sm transition-colors duration-200 ${
                  openedAccordion === 'general' 
                    ? 'text-secondary/80' 
                    : 'text-gray-500'
                }`}>
                  Configure core booking system settings
                </p>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className='px-6 py-4 space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <label className='text-primary text-sm font-medium'>Enable Booking System</label>
                      <p className='text-gray-500 text-xs'>Allow clients to make booking requests</p>
                    </div>
                    <Controller
                      name='is_active'
                      control={methods.control}
                      render={({ field }) => (
                        <input
                          type='checkbox'
                          checked={field.value}
                          onChange={field.onChange}
                          className='w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary focus:ring-2'
                        />
                      )}
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <label className='text-primary text-sm font-medium'>Require Manual Approval</label>
                      <p className='text-gray-500 text-xs'>All bookings require admin approval</p>
                    </div>
                    <Controller
                      name='requires_approval'
                      control={methods.control}
                      render={({ field }) => (
                        <input
                          type='checkbox'
                          checked={field.value}
                          onChange={field.onChange}
                          className='w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary focus:ring-2'
                        />
                      )}
                    />
                  </div>

                  {methods.watch('requires_approval') && (
                    <div className='flex items-center justify-between'>
                      <div>
                        <label className='text-primary text-sm font-medium'>Auto-approve Returning Clients</label>
                        <p className='text-gray-500 text-xs'>Automatically approve bookings from previous clients</p>
                      </div>
                      <Controller
                        name='auto_approve_returning_clients'
                        control={methods.control}
                        render={({ field }) => (
                          <input
                            type='checkbox'
                            checked={field.value}
                            onChange={field.onChange}
                            className='w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary focus:ring-2'
                          />
                        )}
                      />
                    </div>
                  )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Controller
                    name='buffer_time_minutes'
                    control={methods.control}
                    render={({ field }) => (
                      <Input
                        type='number'
                        label='Buffer Time (minutes)'
                        placeholder='15'
                        {...field}
                        value={field.value?.toString() || ''}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    )}
                  />

                  <Controller
                    name='booking_expiry_hours'
                    control={methods.control}
                    render={({ field }) => (
                      <Input
                        type='number'
                        label='Booking Expiry (hours)'
                        placeholder='24'
                        {...field}
                        value={field.value?.toString() || ''}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    )}
                  />

                  <Controller
                    name='max_advance_booking_days'
                    control={methods.control}
                    render={({ field }) => (
                      <Input
                        type='number'
                        label='Max Advance Booking (days)'
                        placeholder='30'
                        {...field}
                        value={field.value?.toString() || ''}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    )}
                  />

                  <Controller
                    name='min_advance_booking_hours'
                    control={methods.control}
                    render={({ field }) => (
                      <Input
                        type='number'
                        label='Min Advance Booking (hours)'
                        placeholder='2'
                        {...field}
                        value={field.value?.toString() || ''}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    )}
                  />
                </div>

                <div className='pt-4'>
                  <Button
                    type='submit'
                    loading={updateSettings.isPending}
                    onClick={methods.handleSubmit(onSubmit)}
                    className='w-auto'
                  >
                    Save General Settings
                  </Button>
                </div>
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          {/* Group Bookings */}
          <Accordion.Item value='groups' className="border border-gray-200 rounded-lg overflow-hidden mb-4">
            <Accordion.Control
              className={`transition-all duration-200 ${
                openedAccordion === 'groups' 
                  ? 'bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20 shadow-md' 
                  : 'hover:bg-gray-50'
              }`}
              icon={
                <div className={`rounded-full p-2.5 transition-colors duration-200 ${
                  openedAccordion === 'groups' 
                    ? 'bg-secondary/15 ring-2 ring-secondary/30' 
                    : 'bg-gray-100'
                }`}>
                  <GroupBookingsIcon isActive={openedAccordion === 'groups'} />
                </div>
              }
            >
              <div className='flex flex-col gap-1'>
                <h3 className={`text-sm lg:text-base font-semibold transition-colors duration-200 ${
                  openedAccordion === 'groups' 
                    ? 'text-secondary' 
                    : 'text-primary'
                }`}>
                  Group Bookings
                </h3>
                <p className={`text-xs lg:text-sm transition-colors duration-200 ${
                  openedAccordion === 'groups' 
                    ? 'text-secondary/80' 
                    : 'text-gray-500'
                }`}>
                  Configure group booking policies
                </p>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className='px-6 py-4 space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <label className='text-primary text-sm font-medium'>Allow Group Bookings</label>
                    <p className='text-gray-500 text-xs'>Enable clients to book multiple spots</p>
                  </div>
                  <Controller
                    name='allow_group_bookings'
                    control={methods.control}
                    render={({ field }) => (
                      <input
                        type='checkbox'
                        checked={field.value}
                        onChange={field.onChange}
                        className='w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary focus:ring-2'
                      />
                    )}
                  />
                </div>

                {methods.watch('allow_group_bookings') && (
                  <div className='space-y-4'>
                    <Controller
                      name='max_group_size'
                      control={methods.control}
                      render={({ field }) => (
                        <Input
                          type='number'
                          label='Maximum Group Size'
                          placeholder='10'
                          {...field}
                          value={field.value?.toString() || ''}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      )}
                    />

                    <div className='flex items-center justify-between'>
                      <div>
                        <label className='text-primary text-sm font-medium'>Group Bookings Require Approval</label>
                        <p className='text-gray-500 text-xs'>Always require approval for group bookings</p>
                      </div>
                      <Controller
                        name='group_booking_requires_approval'
                        control={methods.control}
                        render={({ field }) => (
                          <input
                            type='checkbox'
                            checked={field.value}
                            onChange={field.onChange}
                            className='w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary focus:ring-2'
                          />
                        )}
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div>
                        <label className='text-primary text-sm font-medium'>Allow Duplicate Bookings</label>
                        <p className='text-gray-500 text-xs'>Allow same client to book multiple times</p>
                      </div>
                      <Controller
                        name='allow_duplicate_bookings'
                        control={methods.control}
                        render={({ field }) => (
                          <input
                            type='checkbox'
                            checked={field.value}
                            onChange={field.onChange}
                            className='w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary focus:ring-2'
                          />
                        )}
                      />
                    </div>
                  </div>
                )}

                <div className='pt-4'>
                  <Button
                    type='submit'
                    loading={updateSettings.isPending}
                    onClick={methods.handleSubmit(onSubmit)}
                    className='w-auto'
                  >
                    Save Group Settings
                  </Button>
                </div>
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          {/* Notifications */}
          <Accordion.Item value='notifications' className="border border-gray-200 rounded-lg overflow-hidden mb-4">
            <Accordion.Control
              className={`transition-all duration-200 ${
                openedAccordion === 'notifications' 
                  ? 'bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20 shadow-md' 
                  : 'hover:bg-gray-50'
              }`}
              icon={
                <div className={`rounded-full p-2.5 transition-colors duration-200 ${
                  openedAccordion === 'notifications' 
                    ? 'bg-secondary/15 ring-2 ring-secondary/30' 
                    : 'bg-gray-100'
                }`}>
                  <EmailNotificationsIcon isActive={openedAccordion === 'notifications'} />
                </div>
              }
            >
              <div className='flex flex-col gap-1'>
                <h3 className={`text-sm lg:text-base font-semibold transition-colors duration-200 ${
                  openedAccordion === 'notifications' 
                    ? 'text-secondary' 
                    : 'text-primary'
                }`}>
                  Email Notifications
                </h3>
                <p className={`text-xs lg:text-sm transition-colors duration-200 ${
                  openedAccordion === 'notifications' 
                    ? 'text-secondary/80' 
                    : 'text-gray-500'
                }`}>
                  Configure email notification preferences
                </p>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className='px-6 py-4 space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <label className='text-primary text-sm font-medium'>Send Confirmation Emails</label>
                      <p className='text-gray-500 text-xs'>Email clients when booking is approved</p>
                    </div>
                    <Controller
                      name='send_confirmation_emails'
                      control={methods.control}
                      render={({ field }) => (
                        <input
                          type='checkbox'
                          checked={field.value}
                          onChange={field.onChange}
                          className='w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary focus:ring-2'
                        />
                      )}
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <label className='text-primary text-sm font-medium'>Send Reminder Emails</label>
                      <p className='text-gray-500 text-xs'>Send reminder emails before sessions</p>
                    </div>
                    <Controller
                      name='send_reminder_emails'
                      control={methods.control}
                      render={({ field }) => (
                        <input
                          type='checkbox'
                          checked={field.value}
                          onChange={field.onChange}
                          className='w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary focus:ring-2'
                        />
                      )}
                    />
                  </div>
                </div>

                {methods.watch('send_reminder_emails') && (
                  <Controller
                    name='reminder_hours_before'
                    control={methods.control}
                    render={({ field }) => (
                      <Input
                        type='number'
                        label='Reminder Time (hours before session)'
                        placeholder='24'
                        {...field}
                        value={field.value?.toString() || ''}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    )}
                  />
                )}

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <label className='text-primary text-sm font-medium'>Auto-Release Expired Bookings</label>
                      <p className='text-gray-500 text-xs'>Automatically release expired slots</p>
                    </div>
                    <Controller
                      name='auto_release_expired'
                      control={methods.control}
                      render={({ field }) => (
                        <input
                          type='checkbox'
                          checked={field.value}
                          onChange={field.onChange}
                          className='w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary focus:ring-2'
                        />
                      )}
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <label className='text-primary text-sm font-medium'>Send Expiry Notifications</label>
                      <p className='text-gray-500 text-xs'>Notify when bookings expire</p>
                    </div>
                    <Controller
                      name='send_expiry_notifications'
                      control={methods.control}
                      render={({ field }) => (
                        <input
                          type='checkbox'
                          checked={field.value}
                          onChange={field.onChange}
                          className='w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary focus:ring-2'
                        />
                      )}
                    />
                  </div>
                </div>

                <div className='pt-4'>
                  <Button
                    type='submit'
                    loading={updateSettings.isPending}
                    onClick={methods.handleSubmit(onSubmit)}
                    className='w-auto'
                  >
                    Save Notification Settings
                  </Button>
                </div>
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          {/* Policies */}
          <Accordion.Item value='policies' className="border border-gray-200 rounded-lg overflow-hidden mb-4">
            <Accordion.Control
              className={`transition-all duration-200 ${
                openedAccordion === 'policies' 
                  ? 'bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20 shadow-md' 
                  : 'hover:bg-gray-50'
              }`}
              icon={
                <div className={`rounded-full p-2.5 transition-colors duration-200 ${
                  openedAccordion === 'policies' 
                    ? 'bg-secondary/15 ring-2 ring-secondary/30' 
                    : 'bg-gray-100'
                }`}>
                  <BookingPoliciesIcon isActive={openedAccordion === 'policies'} />
                </div>
              }
            >
              <div className='flex flex-col gap-1'>
                <h3 className={`text-sm lg:text-base font-semibold transition-colors duration-200 ${
                  openedAccordion === 'policies' 
                    ? 'text-secondary' 
                    : 'text-primary'
                }`}>
                  Booking Policies
                </h3>
                <p className={`text-xs lg:text-sm transition-colors duration-200 ${
                  openedAccordion === 'policies' 
                    ? 'text-secondary/80' 
                    : 'text-gray-500'
                }`}>
                  Configure cancellation and reschedule policies
                </p>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className='px-6 py-4 space-y-6'>
                {/* Cancellation Policy */}
                <div className='space-y-4'>
                  <h4 className='text-primary text-sm font-medium border-b pb-2'>Cancellation Policy</h4>
                  
                  <div className='flex items-center justify-between'>
                    <div>
                      <label className='text-primary text-sm font-medium'>Allow Client Cancellation</label>
                      <p className='text-gray-500 text-xs'>Let clients cancel their own bookings</p>
                    </div>
                    <Controller
                      name='allow_client_cancellation'
                      control={methods.control}
                      render={({ field }) => (
                        <input
                          type='checkbox'
                          checked={field.value}
                          onChange={field.onChange}
                          className='w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary focus:ring-2'
                        />
                      )}
                    />
                  </div>

                  {methods.watch('allow_client_cancellation') && (
                    <div className='space-y-4'>
                      <Controller
                        name='cancellation_deadline_hours'
                        control={methods.control}
                        render={({ field }) => (
                          <Input
                            type='number'
                            label='Cancellation Deadline (hours)'
                            placeholder='24'
                            {...field}
                            value={field.value?.toString() || ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        )}
                      />

                      <Controller
                        name='cancellation_fee_policy'
                        control={methods.control}
                        render={({ field }) => (
                          <div>
                            <label className='block text-primary text-sm font-medium mb-1'>
                              Cancellation Fee Policy
                            </label>
                            <textarea
                              {...field}
                              rows={3}
                              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent'
                              placeholder='e.g., No fee for cancellations 24+ hours in advance...'
                            />
                          </div>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Reschedule Policy */}
                <div className='space-y-4'>
                  <h4 className='text-primary text-sm font-medium border-b pb-2'>Reschedule Policy</h4>
                  
                  <div className='flex items-center justify-between'>
                    <div>
                      <label className='text-primary text-sm font-medium'>Allow Client Reschedule</label>
                      <p className='text-gray-500 text-xs'>Let clients reschedule their bookings</p>
                    </div>
                    <Controller
                      name='allow_client_reschedule'
                      control={methods.control}
                      render={({ field }) => (
                        <input
                          type='checkbox'
                          checked={field.value}
                          onChange={field.onChange}
                          className='w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary focus:ring-2'
                        />
                      )}
                    />
                  </div>

                  {methods.watch('allow_client_reschedule') && (
                    <div className='space-y-4'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <Controller
                          name='reschedule_deadline_hours'
                          control={methods.control}
                          render={({ field }) => (
                            <Input
                              type='number'
                              label='Reschedule Deadline (hours)'
                              placeholder='24'
                              {...field}
                              value={field.value?.toString() || ''}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          )}
                        />

                        <Controller
                          name='max_reschedules_per_booking'
                          control={methods.control}
                          render={({ field }) => (
                            <Input
                              type='number'
                              label='Max Reschedules Per Booking'
                              placeholder='2'
                              {...field}
                              value={field.value?.toString() || ''}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          )}
                        />
                      </div>

                      <Controller
                        name='reschedule_fee_policy'
                        control={methods.control}
                        render={({ field }) => (
                          <div>
                            <label className='block text-primary text-sm font-medium mb-1'>
                              Reschedule Fee Policy
                            </label>
                            <textarea
                              {...field}
                              rows={3}
                              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent'
                              placeholder='e.g., Free reschedule 24+ hours in advance...'
                            />
                          </div>
                        )}
                      />
                    </div>
                  )}
                </div>

                <div className='pt-4'>
                  <Button
                    type='submit'
                    loading={updateSettings.isPending}
                    onClick={methods.handleSubmit(onSubmit)}
                    className='w-auto'
                  >
                    Save Policy Settings
                  </Button>
                </div>
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          {/* Customization */}
          <Accordion.Item value='customization' className="border border-gray-200 rounded-lg overflow-hidden mb-4">
            <Accordion.Control
              className={`transition-all duration-200 ${
                openedAccordion === 'customization' 
                  ? 'bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20 shadow-md' 
                  : 'hover:bg-gray-50'
              }`}
              icon={
                <div className={`rounded-full p-2.5 transition-colors duration-200 ${
                  openedAccordion === 'customization' 
                    ? 'bg-secondary/15 ring-2 ring-secondary/30' 
                    : 'bg-gray-100'
                }`}>
                  <PageCustomizationIcon isActive={openedAccordion === 'customization'} />
                </div>
              }
            >
              <div className='flex flex-col gap-1'>
                <h3 className={`text-sm lg:text-base font-semibold transition-colors duration-200 ${
                  openedAccordion === 'customization' 
                    ? 'text-secondary' 
                    : 'text-primary'
                }`}>
                  Page Customization
                </h3>
                <p className={`text-xs lg:text-sm transition-colors duration-200 ${
                  openedAccordion === 'customization' 
                    ? 'text-secondary/80' 
                    : 'text-gray-500'
                }`}>
                  Customize your booking page appearance
                </p>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className='px-6 py-4 space-y-4'>
                <Controller
                  name='booking_page_title'
                  control={methods.control}
                  render={({ field }) => (
                    <Input
                      label='Booking Page Title'
                      placeholder='Book a Session'
                      {...field}
                    />
                  )}
                />

                <Controller
                  name='booking_page_description'
                  control={methods.control}
                  render={({ field }) => (
                    <div>
                      <label className='block text-primary text-sm font-medium mb-1'>
                        Booking Page Description
                      </label>
                      <textarea
                        {...field}
                        rows={3}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent'
                        placeholder='Welcome! Select a session to book...'
                      />
                    </div>
                  )}
                />

                <Controller
                  name='success_message'
                  control={methods.control}
                  render={({ field }) => (
                    <div>
                      <label className='block text-primary text-sm font-medium mb-1'>
                        Success Message
                      </label>
                      <textarea
                        {...field}
                        rows={3}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent'
                        placeholder='Thank you! Your booking request has been submitted...'
                      />
                    </div>
                  )}
                />

                <div className='pt-4'>
                  <Button
                    type='submit'
                    loading={updateSettings.isPending}
                    onClick={methods.handleSubmit(onSubmit)}
                    className='w-auto'
                  >
                    Save Customization Settings
                  </Button>
                </div>
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </FormProvider>
    </div>
  );
};

export default BookingSettings; 