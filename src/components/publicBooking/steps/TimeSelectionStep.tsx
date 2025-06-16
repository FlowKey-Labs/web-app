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
  Badge,
  Alert,
  LoadingOverlay,
  ScrollArea
} from '@mantine/core';
import { ArrowLeftIcon, InfoIcon, ClockIcon, LocationIcon } from '../bookingIcons';
import { useBookingFlow } from '../PublicBookingProvider';
import { PublicBusinessInfo, AvailabilitySlot } from '../../../types/clientTypes';
import { useGetPublicAvailability } from '../../../hooks/reactQuery';
import { useViewportSize } from '@mantine/hooks';
import { MobileBusinessHeader } from '../components/MobileBusinessHeader';
import { UnifiedProgressIndicator } from '../components/UnifiedProgressIndicator';
import { FlowKeyIcon } from '../../../assets/icons';
import Button from '../../common/Button';

interface TimeSelectionStepProps {
  businessSlug: string;
  businessInfo: PublicBusinessInfo;
}

export function TimeSelectionStep({ businessSlug, businessInfo }: TimeSelectionStepProps) {
  const { state, dispatch, goToNextStep, goToPreviousStep } = useBookingFlow();
  
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

  // Format selected date for API query
  const selectedDateString = state.selectedDate 
    ? (typeof state.selectedDate === 'string' 
        ? state.selectedDate 
        : state.selectedDate.toISOString().split('T')[0])
    : null;
  
  // Get time slots for the selected date
  const { 
    data: availabilityData, 
    isLoading, 
    error 
  } = useGetPublicAvailability(
    businessSlug,
    state.selectedService?.id || null,
    selectedDateString || '',
    selectedDateString || ''
  );

  const availableSlots = availabilityData?.slots || [];

  const handleSlotSelect = (slot: AvailabilitySlot) => {
    // Ensure the date is consistent - use the slot's date as the authoritative source
    const slotDate = slot.date;
    
    console.log('Time slot selection debug:', {
      slotDate: slotDate,
      stateSelectedDate: state.selectedDate,
      slot: slot
    });
    
    dispatch({ 
      type: 'SELECT_TIME_SLOT', 
      payload: {
        date: slotDate, // Use the slot's date for consistency
        timeSlot: slot,
        timezone: 'Africa/Nairobi' // Default timezone
      }
    });
    
    // Auto-advance to next step after brief delay
    setTimeout(() => {
      goToNextStep();
    }, 500);
  };

  const handleBack = () => {
    goToPreviousStep();
  };

  const handleServiceChange = () => {
    dispatch({ type: 'RESET_SELECTIONS' });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 'service' });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    return `${hour12}:${minutes} ${period}`;
  };

  const formatDate = (dateInput: Date | string) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!businessInfo || !state.selectedService || !state.selectedDate) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Alert 
          icon={<InfoIcon className="w-5 h-5" />} 
          color="red" 
          title="Missing Information"
          radius="md"
          className="max-w-md"
        >
          Please select a service and date first.
        </Alert>
      </div>
    );
  }

  const businessName = businessInfo.business_name || 'Business';
  const serviceName = state.selectedService.name || 'Service';

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
        {/* LEFT SECTION - Business Profile & Service Summary */}
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

            {/* Selected Service & Date Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <div className="flex-1">
                  <Title order={4} className="text-slate-800 mb-1 text-base">
                    Your Selection
                  </Title>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Text className="text-sm text-slate-600 mb-1">Service</Text>
                  <Text className="font-semibold text-slate-800">{serviceName}</Text>
                </div>
                
                <div>
                  <Text className="text-sm text-slate-600 mb-1">Date</Text>
                  <Text className="font-semibold text-slate-800">
                    {formatDate(state.selectedDate)}
                  </Text>
                </div>
                
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
              
              <Button
                variant="outline"
                size="xs"
                className="w-full mt-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={handleServiceChange}
              >
                Change Selection
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

        {/* RIGHT SECTION - Time Selection */}
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
                  leftSection={<ArrowLeftIcon className="w-4 h-4" />}
                  onClick={handleBack}
                  className="text-slate-600 hover:text-slate-800 p-0"
                >
                  Back
                </Button>
              </div>
              <Text className="text-slate-600 text-sm lg:text-base mb-2">
                Select Time
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
                Choose your time
              </Title>
              <Text className="text-slate-600 text-sm lg:text-base">
                Available times for {formatDate(state.selectedDate)}
              </Text>
            </motion.div>
          </div>

          {/* Time Slots */}
          <div className="flex-1 overflow-y-auto lg:ml-8 booking-mobile-content-with-footer">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingOverlay visible={true} />
              </div>
            ) : error ? (
              <Alert 
                icon={<InfoIcon className="w-5 h-5" />} 
                color="red" 
                title="Error Loading Times"
                className="mb-6"
              >
                Unable to load available time slots. Please try again later.
              </Alert>
            ) : availableSlots.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">😔</div>
                <Title order={3} className="text-slate-800 mb-2">
                  No times available
                </Title>
                <Text className="text-slate-600 mb-4">
                  There are no available time slots for the selected date.
                </Text>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="btn-green-subtle"
                >
                  Choose Different Date
                </Button>
              </motion.div>
            ) : (
              <div className="max-w-2xl">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {availableSlots
                      .filter(slot => slot.capacity_status === 'available' && slot.available_spots > 0)
                      .map((slot, index) => (
                        <motion.div
                          key={`${slot.date}-${slot.start_time}-${slot.session_id}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card
                            className="p-6 cursor-pointer border-2 border-slate-200 hover:border-emerald-300 bg-white/80 hover:bg-emerald-25 transition-all duration-300 hover:shadow-lg"
                            radius="lg"
                            onClick={() => handleSlotSelect(slot)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <Group gap="md" className="mb-3">
                                  <div className="flex items-center gap-2">
                                    <ClockIcon className="w-5 h-5 text-emerald-600" />
                                    <Text className="font-bold text-xl text-slate-900">
                                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                    </Text>
                                  </div>
                                </Group>
                                
                                <Text className="font-semibold text-slate-700 mb-2">
                                  {slot.session_title}
                                </Text>
                                
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                  {slot.location && (
                                    <span className="flex items-center gap-1">
                                      <LocationIcon className="w-4 h-4" />
                                      {slot.location}
                                    </span>
                                  )}
                                  {slot.staff_name && (
                                    <span className="flex items-center gap-1">
                                      👤 {slot.staff_name}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    ⏱️ {slot.duration_minutes} min
                                  </span>
                                </div>
                              </div>
                              
                              <div className="text-right ml-6">
                                <Badge
                                  color={slot.available_spots > 10 ? "green" : slot.available_spots > 5 ? "yellow" : "orange"}
                                  variant="light"
                                  size="lg"
                                  className="font-semibold"
                                >
                                  {slot.available_spots} spots left
                                </Badge>
                                <Text size="xs" className="text-slate-500 mt-1">
                                  of {slot.total_spots} total
                                </Text>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Mobile Footer with Cookie Settings and Support */}
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
        </motion.div>
      </div>
    </div>
  );
} 