import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Title, Text, Group, Card, Badge, Alert, LoadingOverlay, ScrollArea } from '@mantine/core';
import { ArrowLeftIcon, InfoIcon, ClockIcon, LocationIcon } from '../bookingIcons';
import { useBookingFlow } from '../PublicBookingProvider';
import { PublicBusinessInfo, AvailabilitySlot } from '../../../types/clientTypes';
import { useGetPublicAvailability } from '../../../hooks/reactQuery';
import { useViewportSize } from '@mantine/hooks';
import { MobileBusinessHeader } from '../components/MobileBusinessHeader';
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
  const handleScroll = useCallback(() => {
    if (!isMobile) return;
    setScrollY(window.scrollY);
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

  const availableSlots: AvailabilitySlot[] = (availabilityData as { slots?: AvailabilitySlot[] })?.slots || [];

  const handleSlotSelect = useCallback((slot: AvailabilitySlot) => {
    const slotDate = slot.date;
    
    dispatch({ 
      type: 'SELECT_TIME_SLOT', 
      payload: {
        date: slotDate,
        timeSlot: slot,
        timezone: 'Africa/Nairobi'
      }
    });
    
    setTimeout(() => {
      goToNextStep();
    }, 500);
  }, [dispatch, goToNextStep]);

  const handleBack = useCallback(() => {
    goToPreviousStep();
  }, [goToPreviousStep]);

  const handleServiceChange = useCallback(() => {
    dispatch({ type: 'RESET_SELECTIONS' });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 'service' });
  }, [dispatch]);

  const formatTime = useCallback((time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    return `${hour12}:${minutes} ${period}`;
  }, []);

  const formatDate = useCallback((dateInput: Date | string) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, handleScroll]);

  if (!businessInfo || !state.selectedService || !state.selectedDate) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
                      .filter((slot: AvailabilitySlot) => slot.capacity_status === 'available' && slot.available_spots > 0)
                      .map((slot: AvailabilitySlot, index: number) => (
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
        </motion.div>
      </div>
    </div>
  );
} 