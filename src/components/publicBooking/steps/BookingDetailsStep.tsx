import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Title, Text, TextInput, Textarea, NumberInput, Checkbox, Alert, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useViewportSize } from '@mantine/hooks';
import { ArrowLeftIcon, ArrowRightIcon, UserIcon, PhoneIcon, EmailIcon, InfoIcon } from '../bookingIcons';
import { useBookingFlow } from '../PublicBookingProvider';
import { useTimezone } from '../../../contexts/TimezoneContext';
import { PublicBookingFormData, PublicBusinessInfo } from '../../../types/clientTypes';
import { MobileBusinessHeader } from '../components/MobileBusinessHeader';

interface BookingDetailsStepProps {
  businessInfo: PublicBusinessInfo;
}

export function BookingDetailsStep({ businessInfo }: BookingDetailsStepProps) {
  const { state, dispatch, goToNextStep, goToPreviousStep } = useBookingFlow();
  const { state: timezoneState, actions: timezoneActions } = useTimezone();
  const { width } = useViewportSize();
  
  const [isGroupBooking, setIsGroupBooking] = useState(state.formData.is_group_booking || false);
  const [isBusinessProfileExpanded, setIsBusinessProfileExpanded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  const isMobile = width < 768;

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
  });

  const maxQuantity = Math.min(
    state.selectedTimeSlot?.available_spots || 1,
    state.selectedService?.capacity || 20
  );

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  const handleContinue = useCallback(() => {
    const validation = form.validate();
    if (!validation.hasErrors) {
      if (form.values.is_group_booking && !form.values.group_booking_notes) {
        form.setFieldValue('group_booking_notes', 'Group booking request');
      }
      // Update form data in provider only when proceeding to next step
      dispatch({ type: 'UPDATE_FORM_DATA', payload: form.values });
      goToNextStep();
    }
  }, [form, dispatch, goToNextStep]);

  const handleBack = useCallback(() => {
    // Save current form values before going back
    dispatch({ type: 'UPDATE_FORM_DATA', payload: form.values });
    goToPreviousStep();
  }, [dispatch, goToPreviousStep]);

  const handleServiceChange = useCallback(() => {
    dispatch({ type: 'RESET_SELECTIONS' });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 'service' });
  }, [dispatch]);

  useEffect(() => {
    if (!isMobile) return;

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, handleScroll]);

  useEffect(() => {
    if (businessInfo?.timezone && businessInfo.timezone !== timezoneState.businessTimezone) {
      timezoneActions.setBusinessTimezone(businessInfo.timezone);
    }
  }, [businessInfo?.timezone, timezoneState.businessTimezone, timezoneActions]);

  useEffect(() => {
    setIsGroupBooking(form.values.is_group_booking || false);
  }, [form.values.is_group_booking]);

  useEffect(() => {
    form.setFieldValue('is_group_booking', isGroupBooking);
    if (!isGroupBooking) {
      form.setFieldValue('quantity', 1);
      form.setFieldValue('group_booking_notes', '');
    } else if (!form.values.group_booking_notes) {
      form.setFieldValue('group_booking_notes', 'Group booking request');
    }
  }, [isGroupBooking, form]);



  if (!businessInfo || !state.selectedService || !state.selectedTimeSlot) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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

  return (
    <div className="h-full w-full bg-none relative overflow-hidden">
      <MobileBusinessHeader 
        businessInfo={businessInfo}
        scrollY={scrollY}
        isExpanded={isBusinessProfileExpanded}
        onToggleExpanded={() => setIsBusinessProfileExpanded(!isBusinessProfileExpanded)}
        onServiceChange={handleServiceChange}
      />
      
      <div className="flex flex-col h-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex-1 p-4 lg:p-8 flex flex-col min-h-0"
        >
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
              <Text className="text-slate-600 text-xs lg:text-sm mb-2">
                Your Details
              </Text>
              <Title 
                order={2} 
                className="text-xl lg:text-3xl font-bold text-slate-900 mb-2 lg:mb-4"
                style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Tell us about yourself
              </Title>
              <Text className="text-slate-600 text-xs lg:text-sm">
                Please fill in your details to complete the booking.
              </Text>
            </motion.div>
          </div>

          <div className="flex-1 overflow-y-auto lg:ml-8 booking-mobile-content">
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              onSubmit={form.onSubmit(handleContinue)}
              className="space-y-6 lg:space-y-8 max-w-2xl"
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/30">
                <Title order={4} className="text-base lg:text-lg font-semibold text-slate-800 mb-4 lg:mb-6 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-emerald-600" />
                  Personal Information
                </Title>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-4">
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

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/30">
                <Title order={4} className="text-base lg:text-lg font-semibold text-slate-800 mb-4 lg:mb-6 flex items-center gap-2">
                  <span className="text-emerald-600">⚙️</span>
                  Booking Options
                </Title>
                
                <div className="space-y-4 lg:space-y-6">
                  <div className="p-4 mt-4 bg-slate-50/60 rounded-xl border border-slate-200/50">
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

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/30">
                <Title order={4} className="text-base lg:text-lg font-semibold text-slate-800 mb-4 lg:mb-6 flex items-center gap-2">
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="pt-2 mobile-action-button bg-white/90 backdrop-blur-sm p-4 rounded-lg"
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
        </motion.div>
      </div>
    </div>
  );
} 