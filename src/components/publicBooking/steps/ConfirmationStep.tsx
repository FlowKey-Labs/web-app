import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Title, Text, Group, Divider, Alert } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import {
  ArrowLeftIcon,
  CheckIcon,
  UserIcon,
  PhoneIcon,
  EmailIcon,
  LocationIcon,
  InfoIcon,
} from '../bookingIcons';
import { useCreatePublicBooking } from '../../../hooks/reactQuery';
import { useBookingFlow } from '../PublicBookingProvider';
import { useTimezone } from '../../../contexts/TimezoneContext';
import { BookingConfirmation, PublicBusinessInfo } from '../../../types/clientTypes';
import { FlowKeyIcon } from '../../../assets/icons';
import Button from '../../common/Button';
import { MobileBusinessHeader } from '../components/MobileBusinessHeader';
import { formatBookingTimeRange } from '../../../utils/timezone';
import { DateTime } from 'luxon';

interface ConfirmationStepProps {
  businessSlug: string;
  businessInfo: PublicBusinessInfo;
}

export function ConfirmationStep({ businessSlug, businessInfo }: ConfirmationStepProps) {
  const { state, dispatch, goToPreviousStep, resetFlow } = useBookingFlow();
  const { state: timezoneState, actions: timezoneActions } = useTimezone();
  const { width } = useViewportSize();
  
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingConfirmation | null>(null);
  const [isBusinessProfileExpanded, setIsBusinessProfileExpanded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  const isMobile = width < 768;
  const createBookingMutation = useCreatePublicBooking();

  const serviceName = state.selectedService?.name || 'Service';
  const sessionTitle = state.selectedTimeSlot?.session_title || serviceName;

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  const handleBack = useCallback(() => {
    goToPreviousStep();
  }, [goToPreviousStep]);

  const handleBookAnother = useCallback(() => {
    setBookingConfirmation(null);
    resetFlow();
  }, [resetFlow]);

  const handleServiceChange = useCallback(() => {
    resetFlow();
  }, [resetFlow]);

  const handleConfirmBooking = useCallback(async () => {
    if (!state.formData.session_id || !state.formData.client_name || !state.formData.client_email || !state.formData.client_phone) {
      return;
    }

    if (!state.selectedDate || !state.selectedTimeSlot) {
      return;
    }

    try {
      let selectedDate: string;
      
      if (typeof state.selectedDate === 'string') {
        selectedDate = state.selectedDate;
      } else {
        const year = state.selectedDate.getFullYear();
        const month = String(state.selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(state.selectedDate.getDate()).padStart(2, '0');
        selectedDate = `${year}-${month}-${day}`;
      }

      const timeSlotDate = state.selectedTimeSlot.date;
      const finalDate = timeSlotDate || selectedDate;

      const baseDate = typeof state.selectedDate === 'string' 
        ? state.selectedDate 
        : state.selectedDate?.toISOString().split('T')[0] || DateTime.now().toFormat('yyyy-MM-dd');
      
      const businessStartTime = DateTime.fromISO(`${baseDate}T${state.selectedTimeSlot.start_time}:00`, { 
        zone: timezoneState.businessTimezone 
      });
      const businessEndTime = DateTime.fromISO(`${baseDate}T${state.selectedTimeSlot.end_time}:00`, { 
        zone: timezoneState.businessTimezone 
      });
      
      const convertedStartTime = businessStartTime.setZone(timezoneState.selectedTimezone).toFormat('HH:mm');
      const convertedEndTime = businessEndTime.setZone(timezoneState.selectedTimezone).toFormat('HH:mm');
      
      const bookingData = {
        session_id: state.formData.session_id,
        client_name: state.formData.client_name,
        client_email: state.formData.client_email,
        client_phone: state.formData.client_phone,
        notes: state.formData.notes || '',
        selected_date: finalDate,
        selected_time: convertedStartTime,
        selected_end_time: convertedEndTime,
        quantity: state.formData.quantity || 1,
        client_timezone: timezoneState.selectedTimezone,
        business_timezone: timezoneState.businessTimezone,
        // Additional info for transformation
        session_title: sessionTitle,
        business_name: businessInfo.business_name,
        business_email: businessInfo.email,
        // Include flexible booking fields if present
        ...(state.formData.selected_staff_id && { selected_staff_id: state.formData.selected_staff_id }),
        ...(state.formData.selected_location_id && { selected_location_id: state.formData.selected_location_id }),
        ...(state.formData.is_group_booking && {
          is_group_booking: true,
          group_booking_notes: state.formData.group_booking_notes || 'Group booking request'
        })
      };

      const confirmation = await createBookingMutation.mutateAsync({
        businessSlug,
        bookingData,
      });

      setBookingConfirmation(confirmation);
      dispatch({ type: 'SET_BOOKING_CONFIRMATION', payload: confirmation });
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  }, [
    state.formData,
    state.selectedDate,
    state.selectedTimeSlot,
    timezoneState.businessTimezone,
    timezoneState.selectedTimezone,
    businessSlug,
    createBookingMutation,
    dispatch
  ]);

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

  if (bookingConfirmation) {
    const isApprovalRequired = bookingConfirmation.status === 'pending';
    
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
            className="flex-1 p-4 lg:p-8 overflow-auto services-section lg:flex lg:items-center lg:justify-center"
          >
            <div className="max-w-2xl mx-auto booking-mobile-content lg:text-center">
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center space-y-6 lg:space-y-8"
              >
                <div className="w-20 h-20 lg:w-32 lg:h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <CheckIcon className="w-10 h-10 lg:w-16 lg:h-16 text-white" />
                </div>
                
                <div className="space-y-3">
                  <Title order={2} className="text-xl lg:text-4xl font-bold text-slate-900">
                    {isApprovalRequired ? 'Request Submitted!' : 'Booking Confirmed!'}
                  </Title>
                  
                  <Text size="md" className="text-slate-700 lg:text-lg max-w-lg mx-auto">
                    {bookingConfirmation.message}
                  </Text>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/20 shadow-lg text-left max-w-md mx-auto"
                >
                  <Text className="font-semibold text-slate-900 mb-6 text-center text-base">What happens next?</Text>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <Text size="xs" className="text-slate-700 lg:text-sm">
                        {isApprovalRequired 
                          ? 'You\'ll receive an email confirmation once your booking is approved'
                          : 'Check your email for booking confirmation and details'
                        }
                      </Text>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      <Text size="xs" className="text-slate-700 lg:text-sm">
                        Add the appointment to your calendar
                      </Text>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <Text size="xs" className="text-slate-700 lg:text-sm">
                        Arrive on time for your appointment
                      </Text>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="pt-4 mobile-action-button"
                >
                  <Button
                    onClick={handleBookAnother}
                    size="lg"
                    variant="outline"
                    className="w-full lg:w-auto font-semibold py-3 px-8 rounded-xl btn-green-outline shadow-lg hover:shadow-xl lg:text-base"
                  >
                    Book Another Appointment
                  </Button>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="lg:hidden text-center pt-6"
                >
                  <Text size="xs" className="text-slate-400 mb-1">Powered by</Text>
                  <Group gap="xs" justify="center">
                    <FlowKeyIcon className="w-4 h-4 text-emerald-500" />
                    <Text size="sm" className="text-slate-500 font-medium">FlowKey</Text>
                  </Group>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
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
          className="flex-1 p-4 lg:p-8 overflow-auto services-section"
        >
          <div className="max-w-2xl mx-auto space-y-6 lg:space-y-8 lg:ml-8 booking-mobile-content">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="lg:mt-12"
            >
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="subtle"
                  size="sm"
                  leftSection={<ArrowLeftIcon className="w-4 h-4" />}
                  onClick={handleBack}
                  className="p-0 btn-green-subtle"
                  disabled={createBookingMutation.isPending}
                >
                  Back
                </Button>
              </div>
              <Text className="text-slate-600 text-xs lg:text-sm mb-2">
                Review & Confirm
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
                Review Your Booking
              </Title>
              <Text className="text-slate-600 text-xs lg:text-sm">
                Please review your booking details before confirming.
              </Text>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/30"
            >
              <div className="mb-6">
                <Title order={4} className="text-base lg:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-emerald-600">📅</span>
                  Session Details
                </Title>
                
                <div className="space-y-4 mt-4">
                  <div className="flex justify-between">
                    <Text size="sm" className="text-slate-600">Session</Text>
                    <Text className="font-bold text-slate-900 text-lg">{sessionTitle}</Text>
                  </div>
                  
                  <div className="flex justify-between">
                    <Text size="sm" className="text-slate-600">Duration</Text>
                    <Text className="font-bold text-slate-900 text-lg">
                      {(state.selectedTimeSlot?.duration_minutes ?? state.selectedService?.duration_minutes ?? 0)} minutes
                    </Text>
                  </div>
                  
                  <div className="flex justify-between">
                    <Text size="sm" className="text-slate-600">Date</Text>
                    <Text className="font-bold text-slate-900 text-lg">
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
                  </div>
                  
                  <div className="flex justify-between">
                    <Text size="sm" className="text-slate-600">Time</Text>
                    <Text className="font-bold text-slate-900 text-lg">
                      {state.selectedTimeSlot && (
                        formatBookingTimeRange(
                          state.selectedTimeSlot.start_time, 
                          state.selectedTimeSlot.end_time, 
                          timezoneState.selectedTimezone || 'Africa/Nairobi',
                          timezoneState.businessTimezone || businessInfo?.timezone || 'Africa/Nairobi',
                          typeof state.selectedDate === 'string' ? state.selectedDate : state.selectedDate?.toISOString().split('T')[0]
                        )
                      )}
                    </Text>
                  </div>
                  
                  {state.selectedStaff && state.flexibleBookingSettings?.allow_staff_selection && (
                    <div className="flex justify-between">
                      <Text size="sm" className="text-slate-600">Staff Member</Text>
                      <Text className="font-bold text-slate-900 text-lg flex items-center gap-1">
                        <UserIcon className="w-4 h-4" />
                        {state.selectedStaff.name}
                      </Text>
                    </div>
                  )}

                  {state.selectedLocation && state.flexibleBookingSettings?.allow_location_selection ? (
                    <div className="flex justify-between">
                      <Text size="sm" className="text-slate-600">Location</Text>
                      <Text className="font-bold text-slate-900 text-lg flex items-center gap-1">
                        <LocationIcon className="w-4 h-4" />
                        {state.selectedLocation.name}
                      </Text>
                    </div>
                  ) : state.selectedTimeSlot?.location && (
                    <div className="flex justify-between">
                      <Text size="sm" className="text-slate-600">Location</Text>
                      <Text className="font-bold text-slate-900 text-lg flex items-center gap-1">
                        <LocationIcon className="w-4 h-4" />
                        {state.selectedTimeSlot.location}
                      </Text>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Text size="sm" className="text-slate-600">Quantity</Text>
                    <Text className="font-bold text-slate-900 text-lg">
                      {state.formData.quantity} {state.formData.quantity === 1 ? 'person' : 'people'}
                    </Text>
                  </div>

                  {state.selectedService?.price && (
                    <div className="flex justify-between pt-2 border-t border-slate-200">
                      <Text size="sm" className="text-slate-600 font-medium">Total</Text>
                      <Text className="font-bold text-emerald-600 text-xl">
                        KSh {(Number(state.selectedService.price) * (state.formData.quantity || 1)).toFixed(2)}
                      </Text>
                    </div>
                  )}
                </div>
              </div>

              <Divider />

              <div className="mt-6">
                <Title order={4} className="text-base lg:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-emerald-600" />
                  Contact Information
                </Title>
                
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <Text className="font-bold text-slate-900 text-base">{state.formData.client_name}</Text>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <EmailIcon className="w-4 h-4 text-slate-400" />
                    <Text size="sm" className="text-slate-600">{state.formData.client_email}</Text>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-4 h-4 text-slate-400" />
                    <Text size="sm" className="text-slate-600">{state.formData.client_phone}</Text>
                  </div>

                  {state.formData.is_group_booking && (
                    <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                      <Text size="xs" className="text-emerald-800 font-medium mb-1">
                        Group Booking - For {state.formData.quantity} people
                      </Text>
                      {state.formData.group_booking_notes && (
                        <Text size="xs" className="text-emerald-700">
                          {state.formData.group_booking_notes}
                        </Text>
                      )}
                    </div>
                  )}

                  {state.formData.notes && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                      <Text size="xs" className="text-slate-600 font-medium mb-1">Additional Notes</Text>
                      <Text size="xs" className="text-slate-700">{state.formData.notes}</Text>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {createBookingMutation.error && (
              <Alert 
                icon={<InfoIcon className="w-5 h-5" />} 
                color="red" 
                title="Booking Failed"
                className="mb-6"
              >
                {createBookingMutation.error instanceof Error 
                  ? (() => {
                      const errorMessage = createBookingMutation.error.message;
                      
                      try {
                        const errorData = JSON.parse(errorMessage);
                        
                        if (errorData.code === 'DUPLICATE_BOOKING') {
                          return (
                            <div>
                              <Text className="font-medium mb-2">You already have a booking for this session</Text>
                              <Text size="sm" className="text-red-700">
                                Existing booking reference: <strong>{errorData.details?.existing_booking_reference}</strong>
                                <br />
                                Status: <strong className="capitalize">{errorData.details?.existing_status}</strong>
                                <br />
                                Quantity: <strong>{errorData.details?.existing_quantity} person(s)</strong>
                              </Text>
                              <Text size="sm" className="text-red-600 mt-2">
                                Please contact support if you need to modify your existing booking.
                              </Text>
                            </div>
                          );
                        }
                        
                        if (errorData.code === 'SESSION_FULL') {
                          return 'This session is now full. Please select a different time slot.';
                        }
                        
                        if (errorData.code === 'SESSION_NOT_FOUND') {
                          return 'The selected session is no longer available. Please choose a different time.';
                        }
                        
                        if (errorData.code === 'VALIDATION_ERROR') {
                          return 'Please check your booking details and try again. Some required information may be missing or invalid.';
                        }
                        
                        if (errorData.code === 'INSUFFICIENT_SPOTS') {
                          return `Only ${errorData.details?.available_spots || 0} spots are available for this session. Please reduce the quantity or choose a different time.`;
                        }
                        
                        if (errorData.error && typeof errorData.error === 'string') {
                          return errorData.error;
                        }
                        
                        return errorData.message || 'We encountered an issue processing your booking. Please try again or contact support.';
                      } catch {
                        if (errorMessage.includes('duplicate') || errorMessage.includes('already have a booking')) {
                          return 'You already have a booking for this session. Please contact support if you need to modify your existing booking.';
                        }
                        if (errorMessage.includes('Validation failed')) {
                          return 'Please check your booking details and try again. Some required information may be missing.';
                        }
                        if (errorMessage.includes('session is full') || errorMessage.includes('no available spots')) {
                          return 'Sorry, this time slot is now full. Please select a different time or date.';
                        }
                        if (errorMessage.includes('session not found')) {
                          return 'The selected time slot is no longer available. Please choose a different time.';
                        }
                        if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                          return 'Connection error. Please check your internet connection and try again.';
                        }
                        return 'We encountered an issue processing your booking. Please try again or contact support if the problem persists.';
                      }
                    })()
                  : 'We encountered an issue processing your booking. Please try again or contact support if the problem persists.'}
              </Alert>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-slate-50/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50"
            >
              <Text size="sm" className="text-slate-700 text-center leading-relaxed">
                By confirming, you agree to{' '}
                <a 
                  href="https://flowkeylabs.com/terms-of-use" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-600 cursor-pointer hover:text-emerald-700 underline decoration-emerald-300 hover:decoration-emerald-500 transition-colors duration-200"
                >
                  FlowKey's Terms of Use
                </a>
                {' '}and{' '}
                <a 
                  href="https://flowkeylabs.com/privacy-notice" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-600 cursor-pointer hover:text-emerald-700 underline decoration-emerald-300 hover:decoration-emerald-500 transition-colors duration-200"
                >
                  Privacy Notice
                </a>
                .
              </Text>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="pt-2 lg:pt-2 mobile-action-button bg-white/90 backdrop-blur-sm p-4 rounded-lg"
            >
              <Button
                onClick={handleConfirmBooking}
                loading={createBookingMutation.isPending}
                size="lg"
                variant="filled"
                className="w-full lg:w-auto font-semibold py-3 px-8 rounded-xl btn-green-primary shadow-lg hover:shadow-xl"
                rightSection={<CheckIcon className="w-4 h-4" />}
              >
                {createBookingMutation.isPending ? 'Confirming...' : 'Confirm Booking'}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 