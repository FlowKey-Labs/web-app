import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Title,
  Text,
  Alert,
  Select,
  Paper,
  Badge,
  Switch,
  ScrollArea,
  Card,
  LoadingOverlay,
  Button,
} from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { ArrowLeftIcon, InfoIcon } from '../bookingIcons';
import { useBookingFlow } from '../PublicBookingProvider';
import { useTimezone } from '../../../contexts/TimezoneContext';
import { PublicBusinessInfo, AvailabilitySlot, PublicAvailabilityResponse } from '../../../types/clientTypes';
import { TIMEZONE_OPTIONS } from '../../../utils/timezone';
import { DateTime } from 'luxon';
import { useGetPublicAvailability } from '../../../hooks/reactQuery';
import { useViewportSize, useScrollIntoView } from '@mantine/hooks';
import { MobileBusinessHeader } from '../components/MobileBusinessHeader';

interface DateSelectionStepProps {
  businessSlug: string;
  businessInfo: PublicBusinessInfo;
}

export function DateSelectionStep({ businessSlug, businessInfo }: DateSelectionStepProps) {
  const { state, dispatch, goToPreviousStep, goToNextStep } = useBookingFlow();
  const { state: timezoneState, actions: timezoneActions } = useTimezone();
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    state.selectedDate ? 
      (typeof state.selectedDate === 'string' ? new Date(state.selectedDate) : state.selectedDate) 
      : null
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<AvailabilitySlot | null>(state.selectedTimeSlot || null);
  
  const isNavigating = useRef(false);
  const API_BASE_URL = import.meta.env.VITE_APP_BASEURL || 'http://localhost:8000';
  
  const selectedTimezone = timezoneState.selectedTimezone;
  const businessTimezone = businessInfo?.timezone || timezoneState.businessTimezone || 'Africa/Nairobi';
  const use24Hour = timezoneState.use24Hour;

  useEffect(() => {
    if (businessInfo?.timezone && businessInfo.timezone !== timezoneState.businessTimezone) {
      timezoneActions.setBusinessTimezone(businessInfo.timezone);
    }
  }, [businessInfo?.timezone, timezoneState.businessTimezone, timezoneActions]);

  const { width } = useViewportSize();
  const isMobile = width < 768;
  const [isBusinessProfileExpanded, setIsBusinessProfileExpanded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({ offset: 60 });

  const formatDateForAPI = (date: Date) => {
    const formatted = DateTime.fromJSDate(date).toFormat('yyyy-MM-dd');
    return formatted;
  };

  const startDate = DateTime.now().toFormat('yyyy-MM-dd');
  const endDate = DateTime.now().plus({ days: 30 }).toFormat('yyyy-MM-dd');

  // Get service ID for API call - handle both flexible and fixed booking
  const serviceId = state.isFlexibleBooking 
    ? state.selectedServiceSubcategory?.id 
    : state.selectedService?.id;

  // Get selected staff and location for flexible booking - use selected objects or fall back to preselected IDs
  const selectedStaffId = state.isFlexibleBooking ? (state.selectedStaff?.id || (state as { preselectedStaffId?: number }).preselectedStaffId) : null;
  const selectedLocationId = state.isFlexibleBooking ? (state.selectedLocation?.id || (state as { preselectedLocationId?: number }).preselectedLocationId) : null;

  // Debug location access
  console.log('🔍 DateSelectionStep DEBUG - Location access details:', {
    'state.isFlexibleBooking': state.isFlexibleBooking,
    'state.selectedLocation': state.selectedLocation,
    'state.selectedLocation?.id': state.selectedLocation?.id,
    'typeof state.selectedLocation?.id': typeof state.selectedLocation?.id,
    'selectedLocationId': selectedLocationId,
    'typeof selectedLocationId': typeof selectedLocationId
  });

  console.log('🔍 DateSelectionStep DEBUG - Fetching availability with:', {
    serviceId,
    selectedStaffId,
    selectedLocationId,
    isFlexibleBooking: state.isFlexibleBooking,
    selectedStaff: state.selectedStaff,
    selectedLocation: state.selectedLocation
  });

  const { 
    data: availabilityData, 
    isLoading: slotsLoading, 
    error: slotsError 
  } = useGetPublicAvailability(
    businessSlug,
    serviceId || null,
    startDate,
    endDate,
    selectedStaffId,
    selectedLocationId
  );

  const typedAvailabilityData = availabilityData as PublicAvailabilityResponse | undefined;
  const availableSlots: AvailabilitySlot[] = typedAvailabilityData?.slots || [];
  
  const slotsForSelectedDate = selectedDate 
    ? availableSlots.filter((slot: AvailabilitySlot) => {
        const formattedDate = formatDateForAPI(selectedDate);
        return slot.date === formattedDate;
      })
    : [];

  // Track scroll position for mobile header morphing
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  useEffect(() => {
    if (selectedTimeSlot && selectedDate) {
      dispatch({ 
        type: 'SELECT_TIME_SLOT', 
        payload: {
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          timezone: selectedTimezone
        }
      });
    }
  }, [selectedTimeSlot, selectedDate, selectedTimezone, dispatch]);

  const handleDateSelect = (date: Date | null) => {
    if (!date) {
      return;
    }
    
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    
    const formattedDate = formatDateForAPI(date);
    
    dispatch({ 
      type: 'SELECT_DATE', 
      payload: { date, timezone: selectedTimezone }
    });
    
    const matchingSlots = availableSlots.filter((slot: AvailabilitySlot) => slot.date === formattedDate);
    
    if (isMobile && matchingSlots.length > 0) {
      setTimeout(() => {
        scrollIntoView();
      }, 300);
    }
  };

  const handleTimeSelect = async (slot: AvailabilitySlot) => {
    if (isNavigating.current) {
      return;
    }
    
    setSelectedTimeSlot(slot);
    
    const slotDate = slot.date;
    
    dispatch({ 
      type: 'SELECT_TIME_SLOT', 
      payload: {
        date: slotDate,
        timeSlot: slot,
        timezone: selectedTimezone
      }
    });
    
    // Only fetch session flexible settings for fixed session bookings, not service-based flexible bookings
    if (!state.isFlexibleBooking && slot.session_id) {
    try {
      const apiUrl = `${API_BASE_URL}/api/booking/${businessSlug}/session-flexible-settings/?session_id=${slot.session_id}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      const sessionSettings = JSON.parse(responseText);
      
      if (sessionSettings.success && sessionSettings.settings) {
        dispatch({ 
          type: 'SET_FLEXIBLE_SETTINGS', 
          payload: sessionSettings.settings 
        });
        }
        
      } catch (error) {
        console.warn('Failed to fetch session flexible settings:', error);
        // Continue without flexible settings for fixed sessions
      }
    }
    
    // Navigate to next step after handling settings
      setTimeout(() => {
        isNavigating.current = false;
        goToNextStep();
    }, 100);
  };

  const handleBack = () => {
    goToPreviousStep();
  };

  const handleServiceChange = () => {
    dispatch({ type: 'RESET_SELECTIONS' });
    goToPreviousStep();
  };

  
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    if (checkDate < today) {
      return true;
    }
    
    const dateString = formatDateForAPI(date);
    const hasSlots = availableSlots.some((slot: AvailabilitySlot) => 
      slot.date === dateString && (slot.capacity_status === 'available' || slot.available === true)
    );
    
    return !hasSlots;
  };

  const hasAvailability = (date: Date) => {
    const dateString = formatDateForAPI(date);
    return availableSlots.some((slot: AvailabilitySlot) => 
      slot.date === dateString && (slot.capacity_status === 'available' || slot.available === true)
    );
  };

  const getTimezoneOptionsForSelect = () => {
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
  const formatTime = (time: string, date?: string) => {
    try {
      const baseDate = date || (selectedDate ? formatDateForAPI(selectedDate) : DateTime.now().toFormat('yyyy-MM-dd'));
      const businessDateTime = DateTime.fromISO(`${baseDate}T${time}:00`, { zone: businessTimezone });
      const convertedDateTime = businessDateTime.setZone(selectedTimezone);
      
      if (use24Hour) {
        return convertedDateTime.toFormat('HH:mm');
      }
      
      return convertedDateTime.toFormat('h:mm a');
    } catch {
      return time;
    }
  };

  const getCurrentTime = () => {
    try {
      const now = DateTime.now().setZone(selectedTimezone);
      return use24Hour 
        ? now.toFormat('HH:mm') 
        : now.toFormat('h:mm a');
    } catch {
      return '';
    }
  };

  // Validate required information based on booking type
  const hasRequiredServiceInfo = state.isFlexibleBooking 
    ? state.selectedServiceSubcategory
    : state.selectedService;

  if (!businessInfo || !hasRequiredServiceInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Alert 
          icon={<InfoIcon className="w-5 h-5" />} 
          color="red" 
          title="Missing Information"
          radius="md"
          className="max-w-md"
        >
          Business information or selected service is missing. Please go back and try again.
        </Alert>
      </div>
    );
  }



  return (
    <div className="h-full w-full bg-none relative overflow-hidden">
      {/* Mobile Header */}
      <MobileBusinessHeader 
        businessInfo={businessInfo}
        scrollY={scrollY}
        isExpanded={isBusinessProfileExpanded}
        onToggleExpanded={() => setIsBusinessProfileExpanded(!isBusinessProfileExpanded)}
        onServiceChange={handleServiceChange}
      />
      
      <div className="flex flex-col h-full relative z-10">
        {/* Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex-1 p-4 lg:p-8 flex flex-col min-h-0"
        >
          {/* Header with Welcome Back styling */}
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
              <Text className="text-slate-600 text-xs lg:text-sm mb-2">
                Select Date & Time
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
                When would you like to book?
              </Title>
              <Text className="text-slate-600 text-xs lg:text-sm">
                Choose your preferred date and available time slot.
              </Text>
            </motion.div>
          </div>

          {/* Timezone and Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:ml-8 mb-4 lg:mb-6"
          >
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 items-start">
              <Select
                label="Timezone"
                value={selectedTimezone}
                                  onChange={(value) => {
                    const newTimezone = value || 'Africa/Nairobi';
                    timezoneActions.setSelectedTimezone(newTimezone);
                  }}
                  data={getTimezoneOptionsForSelect()}
                className="flex-1"
                classNames={{
                  input: "bg-white/60 backdrop-blur-sm border-white/30 focus:border-emerald-300",
                  label: "text-slate-700 font-medium text-xs"
                }}
              />
              
              <div className="flex items-center gap-2 mt-6">
                <Switch
                  checked={use24Hour}
                  onChange={(event) => timezoneActions.setUse24Hour(event.currentTarget.checked)}
                  size="sm"
                  color="teal"
                />
                <Text size="xs" className="text-slate-600">
                  24-hour format
                </Text>
              </div>
              
              <div className="mt-6">
                <Text size="xs" className="text-slate-500">
                  Current time: {getCurrentTime()}
                </Text>
              </div>
            </div>
          </motion.div>

          {/* Calendar and Time Selection */}
          <div className="flex-1 overflow-y-auto lg:ml-8 booking-mobile-content">
            {slotsLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingOverlay visible={true} />
              </div>
            ) : slotsError ? (
              <Alert 
                icon={<InfoIcon className="w-5 h-5" />} 
                color="red" 
                title="Error Loading Availability"
                className="mb-6"
              >
                Unable to load available time slots. Please try again later.
              </Alert>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Calendar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Card
                    className="bg-white/70 backdrop-blur-sm border border-white/30"
                    radius="lg"
                    p="lg"
                  >
                    <Title order={4} className="text-base font-semibold text-slate-800 mb-4">
                      Choose Date
                    </Title>
                    
                    {/* Selected Date Indicator */}
                    {selectedDate && (
                      <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <Text size="xs" className="font-medium text-emerald-800 mb-1">Selected Date</Text>
                        <Text size="sm" className="text-emerald-700 font-semibold">
                          {selectedDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Text>
                      </div>
                    )}
                    
                    <Calendar
                      date={selectedDate || undefined}
                      onDateChange={handleDateSelect}
                      getDayProps={(date) => {
                        const disabled = isDateDisabled(date);
                        const isSelected = selectedDate && 
                          date.toDateString() === selectedDate.toDateString();
                        const hasSlots = hasAvailability(date);
                        
                        return {
                          onClick: () => {
                            if (!disabled) {
                              handleDateSelect(date);
                            }
                          },
                          style: {
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            opacity: disabled ? 0.4 : 1,
                            fontWeight: disabled ? 'normal' : '500',
                            backgroundColor: isSelected 
                              ? '#10b981' 
                              : hasSlots && !disabled 
                                ? '#f0fdf4' 
                                : undefined,
                            color: isSelected ? 'white' : undefined,
                            border: isSelected 
                              ? '2px solid #059669' 
                              : hasSlots && !disabled 
                                ? '1px solid #bbf7d0' 
                                : undefined,
                          }
                        };
                      }}
                      minDate={new Date()}
                      maxDate={DateTime.now().plus({ days: 30 }).toJSDate()}
                      excludeDate={isDateDisabled}
                      size="md"
                      classNames={{
                        day: "transition-all duration-200",
                        month: "text-slate-800 font-semibold",
                        weekday: "text-slate-600 font-medium",
                        calendarHeader: "text-slate-800 font-semibold",
                        calendarHeaderControl: "hover:bg-emerald-50 text-slate-700 transition-colors duration-200"
                      }}
                    />
                  </Card>
                </motion.div>

                {/* Available Times */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  ref={targetRef}
                >
                  <Card
                    className="bg-white/70 backdrop-blur-sm border border-white/30"
                    radius="lg"
                    p="lg"
                  >
                    <div className='mb-2'>
                    <Title order={4} className="text-base font-semibold text-slate-800 mb-4">
                      Available Times
                    </Title>
                    </div>
                    
                    {!selectedDate ? (
                      <div className="text-center py-8">
                        <div className="text-3xl mb-4">📅</div>
                        <Text size="sm" className="text-slate-600">
                          Please select a date to view available times
                        </Text>
                      </div>
                    ) : slotsForSelectedDate.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-3xl mb-4">😔</div>
                        <Text size="sm" className="text-slate-600 font-medium mb-1">
                          No times available
                        </Text>
                        <Text size="xs" className="text-slate-500">
                          Please try a different date
                        </Text>
                      </div>
                    ) : (
                      <ScrollArea className="h-64">
                        <div className="space-y-3">
                          {slotsForSelectedDate
                            .filter((slot: AvailabilitySlot) => 
                              (slot.capacity_status === 'available' || slot.available === true) && 
                              (slot.available_spots > 0 || slot.available === true)
                            )
                            .map((slot: AvailabilitySlot, index: number) => {
                              return (
                                <motion.div
                                  key={`${slot.date}-${slot.start_time}-${slot.session_id}`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <Paper
                                    className={`p-4 cursor-pointer border-2 transition-all duration-300 ${
                                      selectedTimeSlot?.session_id === slot.session_id
                                        ? 'bg-emerald-50 border-emerald-400 shadow-lg ring-2 ring-emerald-200'
                                        : 'bg-white/80 border-slate-200 hover:bg-emerald-25 hover:border-emerald-300 hover:shadow-md'
                                    }`}
                                    radius="lg"
                                    onClick={() => handleTimeSelect(slot)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <Text className="font-bold text-base text-slate-900 mb-1">
                                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                        </Text>
                                        <Text size="sm" className="font-semibold text-slate-700 mb-2">
                                          {slot.session_title}
                                        </Text>
                                        <div className="flex items-center gap-3 text-xs text-slate-600">
                                          {slot.location && (
                                            <span className="flex items-center gap-1">
                                              📍 {slot.location}
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
                                      <div className="text-right ml-4">
                                        <Badge
                                          color={slot.available_spots > 10 ? "green" : slot.available_spots > 5 ? "yellow" : "orange"}
                                          variant="light"
                                          size="sm"
                                          className="font-semibold"
                                        >
                                          {slot.available_spots} spots left
                                        </Badge>
                                        <Text size="xs" className="text-slate-500 mt-1">
                                          of {slot.total_spots} total
                                        </Text>
                                      </div>
                                    </div>
                                  </Paper>
                                </motion.div>
                              );
                            })}
                        </div>
                      </ScrollArea>
                    )}
                  </Card>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 