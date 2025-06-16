import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Title, 
  Text, 
  Group, 
  Stack,
  TextInput,
  Textarea,
  NumberInput,
  Checkbox,
  Alert,
  Divider,
  Badge,
  Avatar,
  Button,
  Anchor
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { ArrowLeftIcon, ArrowRightIcon, UserIcon, PhoneIcon, EmailIcon, InfoIcon, ClockIcon } from '../bookingIcons';
import { useBookingFlow } from '../PublicBookingProvider';
import { useTimezone } from '../../../contexts/TimezoneContext';
import { PublicBookingFormData, PublicBusinessInfo } from '../../../types/clientTypes';
import { FlowKeyIcon } from '../../../assets/icons';
import { DateTime } from 'luxon';
import { MobileBusinessHeader } from '../components/MobileBusinessHeader';
import { UnifiedProgressIndicator } from '../components/UnifiedProgressIndicator';
import { useViewportSize } from '@mantine/hooks';

interface BookingDetailsStepProps {
  businessSlug: string;
  businessInfo: PublicBusinessInfo;
}

export function BookingDetailsStep({ businessSlug, businessInfo }: BookingDetailsStepProps) {
  const { state, dispatch, goToNextStep, goToPreviousStep } = useBookingFlow();
  const { state: timezoneState, actions: timezoneActions } = useTimezone();
  
  // Initialize isGroupBooking from existing state
  const [isGroupBooking, setIsGroupBooking] = useState(state.formData.is_group_booking || false);
  
  // Mobile-specific state
  const { width } = useViewportSize();
  const isMobile = width < 768;
  const [isBusinessProfileExpanded, setIsBusinessProfileExpanded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Track scroll position for mobile header morphing
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  // Update business timezone in context when business info loads
  useEffect(() => {
    if (businessInfo?.timezone && businessInfo.timezone !== timezoneState.businessTimezone) {
      timezoneActions.setBusinessTimezone(businessInfo.timezone);
    }
  }, [businessInfo?.timezone, timezoneState.businessTimezone, timezoneActions]);

  const form = useForm<PublicBookingFormData>({
    initialValues: {
      session_id: state.selectedTimeSlot?.session_id || 0,
      client_name: state.formData.client_name || '',
      client_email: state.formData.client_email || '',
      client_phone: state.formData.client_phone || '',
      notes: state.formData.notes || '',
      quantity: state.formData.quantity || 1,
      is_group_booking: state.formData.is_group_booking || false,
      group_booking_notes: state.formData.group_booking_notes || '',
    },
    validate: {
      client_name: (value) => (!value ? 'Full name is required' : null),
      client_email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+$/.test(value)) return 'Invalid email format';
        return null;
      },
      client_phone: (value) => (!value ? 'Phone number is required' : null),
      quantity: (value) => {
        if (!value || value < 1) return 'At least 1 person is required';
        if (value > (state.selectedTimeSlot?.available_spots || 0)) {
          return `Only ${state.selectedTimeSlot?.available_spots} spots available`;
        }
        return null;
      },
    },
    onValuesChange: (values) => {
      // Sync form data with global state whenever values change
      dispatch({ type: 'UPDATE_FORM_DATA', payload: values });
    },
  });

  // Update isGroupBooking from form state
  useEffect(() => {
    setIsGroupBooking(form.values.is_group_booking || false);
  }, [form.values.is_group_booking]);

  // Update form when isGroupBooking changes
  useEffect(() => {
    form.setFieldValue('is_group_booking', isGroupBooking);
    if (!isGroupBooking) {
      form.setFieldValue('quantity', 1);
      form.setFieldValue('group_booking_notes', '');
    } else {
      // Set a default value for group booking notes if empty
      if (!form.values.group_booking_notes) {
        form.setFieldValue('group_booking_notes', 'Group booking request');
      }
    }
  }, [isGroupBooking]);

  const handleContinue = () => {
    const validation = form.validate();
    if (!validation.hasErrors) {
      // Ensure group booking notes has a value if it's a group booking
      if (form.values.is_group_booking && !form.values.group_booking_notes) {
        form.setFieldValue('group_booking_notes', 'Group booking request');
      }
      goToNextStep();
    }
  };

  const handleBack = () => {
    goToPreviousStep();
  };

  const handleServiceChange = () => {
    dispatch({ type: 'RESET_SELECTIONS' });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 'service' });
  };

  const formatTime = (time: string) => {
    try {
      // Get the selected date for conversion context
      const baseDate = typeof state.selectedDate === 'string' 
        ? state.selectedDate 
        : state.selectedDate?.toISOString().split('T')[0] || DateTime.now().toFormat('yyyy-MM-dd');
      
      // Get timezones
      const targetTimezone = timezoneState.selectedTimezone || 'Africa/Nairobi';
      const sourceTimezone = timezoneState.businessTimezone || businessInfo?.timezone || 'Africa/Nairobi';
      
      // Create datetime in source timezone (business timezone)
      const sourceDateTime = DateTime.fromISO(`${baseDate}T${time}:00`, { zone: sourceTimezone });
      
      if (!sourceDateTime.isValid) {
        console.warn('Invalid datetime for formatting:', { time, baseDate, sourceTimezone });
        return time;
      }
      
      // Convert to target timezone
      const convertedDateTime = sourceDateTime.setZone(targetTimezone);
      
      // Get timezone abbreviation for display
      const timezoneAbbr = targetTimezone.toUpperCase() === 'UTC' ? 'UTC' : convertedDateTime.offsetNameShort;
      
      // Format time with timezone
      return `${convertedDateTime.toFormat('h:mm a')} ${timezoneAbbr}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return time;
    }
  };

  const maxQuantity = Math.min(
    state.selectedTimeSlot?.available_spots || 1,
    state.selectedService?.capacity || 20
  );

  if (!businessInfo || !state.selectedService || !state.selectedTimeSlot) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Alert 
          icon={<InfoIcon className="w-5 h-5" />} 
          color="red" 
          title="Missing Information"
          radius="md"
          className="max-w-md"
        >
          Required booking information is missing. Please go back and try again.
        </Alert>
      </div>
    );
  }

  const businessName = businessInfo.business_name || 'Business';
  const serviceName = state.selectedService.name || 'Service';
  const sessionTitle = state.selectedTimeSlot.session_title || serviceName;

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Mobile Header */}
      <MobileBusinessHeader 
        businessInfo={businessInfo}
        scrollY={scrollY}
        isExpanded={isBusinessProfileExpanded}
        onToggleExpanded={() => setIsBusinessProfileExpanded(!isBusinessProfileExpanded)}
        onServiceChange={handleServiceChange}
      />
      
      <div className="flex flex-col lg:flex-row h-full relative z-10">
        {/* LEFT SECTION - Business Profile & Booking Summary - Hidden on mobile */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="hidden lg:block w-96 flex-shrink-0 pr-8 business-section"
        >
          <div className="space-y-6">
            {/* Business Logo */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative mx-auto w-fit"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl border-4 border-white/50 business-logo">
                <span className="text-2xl font-bold text-white relative z-10">
                  {businessName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-3xl blur-xl"></div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center space-y-3"
            >
              <Title 
                order={2} 
                className="text-xl font-bold text-slate-900 leading-tight"
              >
                {businessName}
              </Title>
              
              <Badge 
                variant="light" 
                color="gray" 
                size="md"
                className="bg-slate-100 text-slate-700 border border-slate-200"
              >
                {businessInfo.business_type || 'Service Provider'}
              </Badge>
            </motion.div>

            {/* Booking Summary */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                  <span className="text-xl">📋</span>
                </div>
                <Title order={4} className="text-slate-800 text-base">
                  Booking Summary
                </Title>
              </div>
              
              <div className="space-y-3">
                {/* Service */}
                <div>
                  <Text className="font-semibold text-slate-800 mb-1">{sessionTitle}</Text>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    {state.selectedService.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {state.selectedService.duration_minutes} min
                      </span>
                    )}
                    {state.selectedService.price ? (
                      <Text className="font-bold text-emerald-600">
                        KSh {state.selectedService.price}
                      </Text>
                    ) : (
                      <Badge color="green" variant="light" size="xs">
                        Free
                      </Badge>
                    )}
                  </div>
                </div>

                <Divider />

                {/* Date & Time */}
                <div>
                  <Text className="font-semibold text-slate-800 mb-1">
                    {state.selectedDate ? (
                      typeof state.selectedDate === 'string' 
                        ? new Date(state.selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : state.selectedDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                    ) : 'No date selected'}
                  </Text>
                  <div className="text-sm text-slate-600">
                    {state.selectedTimeSlot && (
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {formatTime(state.selectedTimeSlot.start_time)} - {formatTime(state.selectedTimeSlot.end_time)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="xs"
                className="w-full mt-4 btn-green-outline"
                onClick={handleServiceChange}
              >
                Start Over
              </Button>
            </motion.div>

            {/* Unified Progress Indicator for Desktop */}
            <UnifiedProgressIndicator />

            {/* Powered by */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-center pt-4"
            >
              <div className="flex items-center justify-center gap-2">
                <Text size="xs" className="text-slate-500">Powered by</Text>
                <div className="flex items-center gap-1">
                  <FlowKeyIcon className="w-8 h-auto opacity-60" />
                  <Text size="xs" className="text-slate-600 font-medium">FlowKey</Text>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT SECTION - Booking Details Form */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="flex-1 p-4 lg:p-8 lg:pl-0 flex flex-col min-h-0"
        >
          {/* Header */}
          <div className="mb-6 lg:mb-8 lg:ml-8 lg:mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="subtle"
                  size="sm"
                  className="p-0 btn-green-subtle"
                  leftSection={<ArrowLeftIcon className="w-4 h-4" />}
                  onClick={handleBack}
                >
                  Back
                </Button>
              </div>
              <Text className="text-slate-600 text-sm lg:text-base mb-2">
                Your Details
              </Text>
              <Title 
                order={1} 
                className="text-2xl lg:text-4xl font-bold text-slate-900 mb-2 lg:mb-4"
                style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Tell us about yourself
              </Title>
              <Text className="text-slate-600 text-sm lg:text-base">
                Please fill in your details to complete the booking.
              </Text>
            </motion.div>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto lg:ml-8 booking-mobile-content">
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              onSubmit={form.onSubmit(handleContinue)}
              className="space-y-6 lg:space-y-8 max-w-2xl"
            >
              {/* Personal Information */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/30">
                <Title order={3} className="text-lg lg:text-xl font-semibold text-slate-800 mb-4 lg:mb-6 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-emerald-600" />
                  Personal Information
                </Title>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <TextInput
                    label="Full Name"
                    placeholder="Enter your full name"
                    {...form.getInputProps('client_name')}
                    leftSection={<UserIcon className="w-4 h-4 text-slate-400" />}
                    classNames={{
                      input: "bg-white/80 border-white/30 focus:border-emerald-300",
                      label: "text-slate-700 font-medium"
                    }}
                    required
                  />
                  
                  <TextInput
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    {...form.getInputProps('client_phone')}
                    leftSection={<PhoneIcon className="w-4 h-4 text-slate-400" />}
                    classNames={{
                      input: "bg-white/80 border-white/30 focus:border-emerald-300",
                      label: "text-slate-700 font-medium"
                    }}
                    required
                  />
                </div>
                
                <div className="mt-4 lg:mt-6">
                  <TextInput
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email address"
                    {...form.getInputProps('client_email')}
                    leftSection={<EmailIcon className="w-4 h-4 text-slate-400" />}
                    classNames={{
                      input: "bg-white/80 border-white/30 focus:border-emerald-300",
                      label: "text-slate-700 font-medium"
                    }}
                    required
                  />
                </div>
              </div>

              {/* Booking Options */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/30">
                <Title order={3} className="text-lg lg:text-xl font-semibold text-slate-800 mb-4 lg:mb-6 flex items-center gap-2">
                  <span className="text-emerald-600">⚙️</span>
                  Booking Options
                </Title>
                
                <div className="space-y-4 lg:space-y-6">
                  {/* Group Booking Toggle */}
                  <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/50">
                    <Checkbox
                      label="This is a group booking"
                      description="Check this if you're booking for multiple people"
                      checked={isGroupBooking}
                      onChange={(event) => setIsGroupBooking(event.currentTarget.checked)}
                      classNames={{
                        label: "text-slate-800 font-medium",
                        description: "text-slate-600"
                      }}
                    />
                  </div>

                  {/* Quantity Input */}
                  {isGroupBooking && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <NumberInput
                        label="Number of People"
                        description={`Available spots: ${state.selectedTimeSlot?.available_spots}`}
                        min={1}
                        max={maxQuantity}
                        {...form.getInputProps('quantity')}
                        classNames={{
                          input: "bg-white/80 border-white/30 focus:border-emerald-300",
                          label: "text-slate-700 font-medium",
                          description: "text-slate-600"
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Group Booking Notes */}
                  {isGroupBooking && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <Textarea
                        label="Group Details"
                        description="Tell us about your group (ages, special requirements, etc.)"
                        placeholder="Provide details about your group..."
                        {...form.getInputProps('group_booking_notes')}
                        minRows={3}
                        classNames={{
                          input: "bg-white/80 border-white/30 focus:border-emerald-300",
                          label: "text-slate-700 font-medium",
                          description: "text-slate-600"
                        }}
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/30">
                <Title order={3} className="text-lg lg:text-xl font-semibold text-slate-800 mb-4 lg:mb-6 flex items-center gap-2">
                  <span className="text-emerald-600">💬</span>
                  Additional Notes
                </Title>
                
                <Textarea
                  label="Special Requests or Notes"
                  description="Let us know if you have any special requirements, questions, or preferences"
                  placeholder="Any special requests, accessibility needs, or questions..."
                  {...form.getInputProps('notes')}
                  minRows={4}
                  classNames={{
                    input: "bg-white/80 border-white/30 focus:border-emerald-300",
                    label: "text-slate-700 font-medium",
                    description: "text-slate-600"
                  }}
                />
              </div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="pt-2 mobile-action-button"
              >
                <Button
                  type="submit"
                  size="lg"
                  variant="filled"
                  rightSection={<ArrowRightIcon className="w-4 h-4" />}
                  className="w-full lg:w-auto font-semibold py-3 px-8 rounded-xl btn-green-primary shadow-lg hover:shadow-xl"
                >
                  Complete Booking
                </Button>
              </motion.div>
            </motion.form>
          </div>

          {/* Mobile Footer with Cookie Settings and Support - Hidden on critical action steps */}
          {/* 
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-white/20 p-4 z-30 shadow-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Text size="xs" className="text-slate-500">Powered by</Text>
                <div className="flex items-center gap-1">
                  <FlowKeyIcon className="w-6 h-auto opacity-60" />
                  <Text size="xs" className="text-slate-600 font-medium">FlowKey</Text>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Button
                  variant="subtle"
                  size="xs"
                  color="gray"
                  onClick={() => console.log('Cookie settings')}
                  className="text-slate-500 p-1"
                >
                  Cookie settings
                </Button>
                
                <Button
                  variant="subtle"
                  size="xs"
                  color="gray"
                  onClick={() => window.open('mailto:support@flowkeylabs.com', '_blank')}
                  className="text-slate-500 p-1"
                >
                  📞 Support
                </Button>
              </div>
            </div>
          </div>
          */}
        </motion.div>
      </div>
    </div>
  );
} 