import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Title, 
  Text, 
  Group, 
  Stack,
  Card,
  Divider,
  Alert,
  List,
  ThemeIcon,
  Badge,
  Avatar
} from '@mantine/core';
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  UserIcon, 
  PhoneIcon, 
  EmailIcon, 
  ClockIcon, 
  LocationIcon,
  InfoIcon
} from '../bookingIcons';
import { useCreatePublicBooking } from '../../../hooks/reactQuery';
import { useBookingFlow } from '../PublicBookingProvider';
import { useTimezone } from '../../../contexts/TimezoneContext';
import { BookingConfirmation, PublicBusinessInfo } from '../../../types/clientTypes';
import { FlowKeyIcon } from '../../../assets/icons';
import Button from '../../common/Button';
import { MobileBusinessHeader } from '../components/MobileBusinessHeader';
import { UnifiedProgressIndicator } from '../components/UnifiedProgressIndicator';
import { useViewportSize } from '@mantine/hooks';
import { formatBookingTimeRange } from '../../../utils/timezone';
import { DateTime } from 'luxon';

interface ConfirmationStepProps {
  businessSlug: string;
  businessInfo: PublicBusinessInfo;
}

export function ConfirmationStep({ businessSlug, businessInfo }: ConfirmationStepProps) {
  const { state, goToPreviousStep, resetFlow } = useBookingFlow();
  const { state: timezoneState, actions: timezoneActions } = useTimezone();
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingConfirmation | null>(null);
  
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
  
  const createBookingMutation = useCreatePublicBooking();

  const handleBack = () => {
    goToPreviousStep();
  };

  const handleConfirmBooking = async () => {
    if (!state.formData.session_id || !state.formData.client_name || !state.formData.client_email || !state.formData.client_phone) {
      return;
    }

    if (!state.selectedDate || !state.selectedTimeSlot) {
      console.error('Missing date or time slot information');
      return;
    }

    try {
      // Fix date formatting - ensure we use the correct selected date
      let selectedDate: string;
      
      if (typeof state.selectedDate === 'string') {
        // If it's already a string, use it directly
        selectedDate = state.selectedDate;
      } else {
        // If it's a Date object, format it properly using local timezone
        const year = state.selectedDate.getFullYear();
        const month = String(state.selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(state.selectedDate.getDate()).padStart(2, '0');
        selectedDate = `${year}-${month}-${day}`;
      }

      // Also get the date from the time slot as a fallback/validation
      const timeSlotDate = state.selectedTimeSlot.date;
      
      // Use the time slot date if available (it's the authoritative source)
      const finalDate = timeSlotDate || selectedDate;

      console.log('Date debugging:', {
        stateSelectedDate: state.selectedDate,
        timeSlotDate: timeSlotDate,
        formattedDate: selectedDate,
        finalDate: finalDate,
        timeSlot: state.selectedTimeSlot
              });

        // Convert times from business timezone to client timezone
        const baseDate = typeof state.selectedDate === 'string' 
          ? state.selectedDate 
          : state.selectedDate?.toISOString().split('T')[0] || DateTime.now().toFormat('yyyy-MM-dd');
        
        // Business timezone time -> Client timezone time
        const businessStartTime = DateTime.fromISO(`${baseDate}T${state.selectedTimeSlot.start_time}:00`, { 
          zone: timezoneState.businessTimezone 
        });
        const businessEndTime = DateTime.fromISO(`${baseDate}T${state.selectedTimeSlot.end_time}:00`, { 
          zone: timezoneState.businessTimezone 
        });
        
        // Convert to client timezone and format as HH:mm
        const convertedStartTime = businessStartTime.setZone(timezoneState.selectedTimezone).toFormat('HH:mm');
        const convertedEndTime = businessEndTime.setZone(timezoneState.selectedTimezone).toFormat('HH:mm');

        // Create the booking payload that matches the expected API format
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
        ...(state.formData.is_group_booking && {
          is_group_booking: true,
          group_booking_notes: state.formData.group_booking_notes || 'Group booking request'
        })
      };

      console.log('Sending booking data:', bookingData);

      const confirmation = await createBookingMutation.mutateAsync({
        businessSlug,
        bookingData,
      });

      setBookingConfirmation(confirmation);
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  const handleBookAnother = () => {
    setBookingConfirmation(null);
    resetFlow();
  };

  const handleServiceChange = () => {
    resetFlow();
  };



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

  // Show success confirmation
  if (bookingConfirmation) {
    const isApprovalRequired = bookingConfirmation.status === 'pending';
    
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
          {/* LEFT SECTION - Business Profile (Desktop Only) */}
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
              
              {/* Business Info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center space-y-2"
              >
                <Title order={2} className="text-xl font-bold text-slate-900">
                  {businessName}
                </Title>
                <Badge 
                  variant="light" 
                  className="bg-slate-100 text-slate-700 border border-slate-200"
                  style={{ textTransform: 'capitalize' }}
                >
                  {businessInfo.business_type || 'Service Provider'}
                </Badge>
              </motion.div>

              {/* Success Message - Desktop Sidebar */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <Text className="font-semibold text-green-900 mb-2">
                    {isApprovalRequired ? 'Request Sent!' : 'Booking Confirmed!'}
                  </Text>
                  <Text size="sm" className="text-green-800">
                    {bookingConfirmation.message}
                  </Text>
                </div>
              </motion.div>

              {/* Powered by FlowKey */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-center pt-4"
              >
                <Text size="xs" className="text-slate-400 mb-1">Powered by</Text>
                <Group gap="xs" justify="center">
                  <FlowKeyIcon className="w-4 h-4 text-emerald-500" />
                  <Text size="sm" className="text-slate-500 font-medium">FlowKey</Text>
                </Group>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT SECTION - Main Success Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="flex-1 p-4 lg:p-8 overflow-auto services-section lg:flex lg:items-center lg:justify-center"
          >
            <div className="max-w-2xl mx-auto booking-mobile-content lg:text-center">
              
              {/* Success Content */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center space-y-6 lg:space-y-8"
              >
                {/* Success Icon */}
                <div className="w-20 h-20 lg:w-32 lg:h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <CheckIcon className="w-10 h-10 lg:w-16 lg:h-16 text-white" />
                </div>
                
                {/* Success Title */}
                <div className="space-y-3">
                  <Title order={1} className="text-2xl lg:text-5xl font-bold text-slate-900">
                    {isApprovalRequired ? 'Request Submitted!' : 'Booking Confirmed!'}
                  </Title>
                  
                  {/* Success Message */}
                  <Text size="lg" className="text-slate-700 lg:text-xl max-w-lg mx-auto">
                    {bookingConfirmation.message}
                  </Text>
                </div>

                {/* What happens next card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/20 shadow-lg text-left max-w-md mx-auto"
                >
                  <Text className="font-semibold text-slate-900 mb-6 text-center text-lg">What happens next?</Text>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <Text size="sm" className="text-slate-700 lg:text-base">
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
                      <Text size="sm" className="text-slate-700 lg:text-base">
                        Add the appointment to your calendar
                      </Text>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <Text size="sm" className="text-slate-700 lg:text-base">
                        Arrive on time for your appointment
                      </Text>
                    </div>
                  </div>
                </motion.div>

                {/* Single Action Button */}
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

                {/* Powered by FlowKey - Mobile Only */}
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
        {/* LEFT SECTION - Business Profile - Hidden on mobile */}
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
                    {state.selectedService?.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {state.selectedService.duration_minutes} min
                      </span>
                    )}
                    {state.selectedService?.price ? (
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
                        {formatBookingTimeRange(
                          state.selectedTimeSlot.start_time, 
                          state.selectedTimeSlot.end_time, 
                          timezoneState.selectedTimezone || 'Africa/Nairobi',
                          timezoneState.businessTimezone || businessInfo?.timezone || 'Africa/Nairobi',
                          typeof state.selectedDate === 'string' ? state.selectedDate : state.selectedDate?.toISOString().split('T')[0]
                        )}
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

        {/* RIGHT SECTION - Review & Confirm */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="flex-1 p-4 lg:p-8 lg:pl-0 overflow-auto services-section"
        >
          <div className="max-w-2xl mx-auto space-y-6 lg:space-y-8 lg:ml-8 booking-mobile-content">
            {/* Header */}
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
              <Text className="text-slate-600 text-sm lg:text-base mb-2">
                Review & Confirm
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
                Review Your Booking
              </Title>
              <Text className="text-slate-600 text-sm lg:text-base">
                Please review your booking details before confirming.
              </Text>
            </motion.div>

            {/* Review Details */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/30"
            >
              {/* Session Details section */}
              <div className="mb-6">
                <Title order={3} className="text-lg lg:text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-emerald-600">📅</span>
                  Session Details
                </Title>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Text className="text-slate-600">Session</Text>
                    <Text className="font-semibold text-slate-800">{sessionTitle}</Text>
                  </div>
                  
                  <div className="flex justify-between">
                    <Text className="text-slate-600">Duration</Text>
                    <Text className="font-semibold text-slate-800">
                      {state.selectedService?.duration_minutes} minutes
                    </Text>
                  </div>
                  
                  <div className="flex justify-between">
                    <Text className="text-slate-600">Date</Text>
                    <Text className="font-semibold text-slate-800">
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
                    <Text className="text-slate-600">Time</Text>
                    <Text className="font-semibold text-slate-800">
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
                  
                  {state.selectedTimeSlot?.location && (
                    <div className="flex justify-between">
                      <Text className="text-slate-600">Location</Text>
                      <Text className="font-semibold text-slate-800 flex items-center gap-1">
                        <LocationIcon className="w-4 h-4" />
                        {state.selectedTimeSlot.location}
                      </Text>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Text className="text-slate-600">Quantity</Text>
                    <Text className="font-semibold text-slate-800">
                      {state.formData.quantity} {state.formData.quantity === 1 ? 'person' : 'people'}
                    </Text>
                  </div>

                  {state.selectedService?.price && (
                    <div className="flex justify-between pt-2 border-t border-slate-200">
                      <Text className="text-slate-600 font-medium">Total</Text>
                      <Text className="font-bold text-emerald-600 text-lg">
                        KSh {(state.selectedService.price * (state.formData.quantity || 1)).toFixed(2)}
                      </Text>
                    </div>
                  )}
                </div>
              </div>

              <Divider />

              {/* Contact Information section */}
              <div className="mt-6">
                <Title order={3} className="text-lg lg:text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-emerald-600" />
                  Contact Information
                </Title>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <Text className="font-semibold text-slate-800">{state.formData.client_name}</Text>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <EmailIcon className="w-4 h-4 text-slate-400" />
                    <Text className="text-slate-600">{state.formData.client_email}</Text>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-4 h-4 text-slate-400" />
                    <Text className="text-slate-600">{state.formData.client_phone}</Text>
                  </div>

                  {state.formData.is_group_booking && (
                    <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                      <Text className="text-sm text-emerald-800 font-medium mb-1">
                        Group Booking - For {state.formData.quantity} people
                      </Text>
                      {state.formData.group_booking_notes && (
                        <Text className="text-sm text-emerald-700">
                          {state.formData.group_booking_notes}
                        </Text>
                      )}
                    </div>
                  )}

                  {state.formData.notes && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                      <Text className="text-sm text-slate-600 font-medium mb-1">Additional Notes</Text>
                      <Text className="text-sm text-slate-700">{state.formData.notes}</Text>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Confirmation Error */}
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
                      
                      // Try to parse the error as JSON to get specific error codes
                      try {
                        const errorData = JSON.parse(errorMessage);
                        
                        // Handle specific error codes
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
                        
                        // If we have a specific error message, use it
                        if (errorData.error && typeof errorData.error === 'string') {
                          return errorData.error;
                        }
                        
                        // Fallback to generic message for unknown error codes
                        return errorData.message || 'We encountered an issue processing your booking. Please try again or contact support.';
                      } catch (parseError) {
                        // Not JSON, check for common error patterns in plain text
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
                        // Default to a user-friendly message
                        return 'We encountered an issue processing your booking. Please try again or contact support if the problem persists.';
                      }
                    })()
                  : 'We encountered an issue processing your booking. Please try again or contact support if the problem persists.'}
              </Alert>
            )}

            {/* Terms and Privacy Notice - MOVED BEFORE CONFIRM BUTTON */}
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

            {/* Confirm Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="pt-2 lg:pt-2 mobile-action-button"
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