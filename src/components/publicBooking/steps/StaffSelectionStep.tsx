import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Title, 
  Text, 
  Button, 
  Card, 
  Badge, 
  Avatar, 
  Alert, 
  LoadingOverlay, 
  Collapse,
  TextInput,
  Select
} from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  UserIcon, 
  InfoIcon, 
  CheckIcon,
  SearchIcon
} from '../bookingIcons';
import { useBookingFlow } from '../PublicBookingProvider';
import { MobileBusinessHeader } from '../components/MobileBusinessHeader';
import { useGetPublicAvailableStaff } from '../../../hooks/reactQuery';
import { PublicStaff } from '../../../types/clientTypes';

interface StaffSelectionStepProps {
  onNext: () => void;
  onBack: () => void;
}

function StaffSelectionStepComponent({ onNext, onBack }: StaffSelectionStepProps) {
  const { state, dispatch } = useBookingFlow();
  const { width } = useViewportSize();
  const isMobile = width < 768;
  const [selectedStaff, setSelectedStaff] = useState<PublicStaff | null>(state.selectedStaff);
  const [expandedStaff, setExpandedStaff] = useState<number | null>(null);
  

  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  

  const [isBusinessProfileExpanded, setIsBusinessProfileExpanded] = useState(false);
  const [scrollY, setScrollY] = useState(0);


  const businessSlug = window.location.pathname.split('/book/')[1]?.split('/')[0] || '';
  

  const { 
    data: staffResponse, 
    isLoading: staffLoading, 
    error: staffError 
  } = useGetPublicAvailableStaff(
    businessSlug, 
    state.selectedTimeSlot?.session_id || 0,
    typeof state.selectedDate === 'string' ? state.selectedDate : state.selectedDate?.toISOString()?.split('T')[0]
  );

  const staffList = staffResponse?.staff || [];


  React.useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  const handleStaffSelect = (staff: PublicStaff) => {
    setSelectedStaff(staff);
    dispatch({ type: 'SELECT_STAFF', payload: staff });
    

    setTimeout(() => {
      onNext();
    }, 500);
  };

  const handleBack = () => {
    onBack();
  };

  const handleServiceChange = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 'service' });
  };


  const filteredStaff = useMemo(() => {
    if (!staffList) return [];

          return staffList.filter((staff: PublicStaff) => {
      const staffName = staff.name || '';
      const staffSpecializations = staff.specializations?.join(' ') || '';
      const matchesSearch = staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           staffSpecializations.toLowerCase().includes(searchQuery.toLowerCase());

      
      const matchesSpecialization = specializationFilter === 'all' || 
                                   staff.specializations?.includes(specializationFilter);

      
      const matchesAvailability = availabilityFilter === 'all' || 
                                 (availabilityFilter === 'available' && staff.is_available !== false);

      return matchesSearch && matchesSpecialization && matchesAvailability;
    });
  }, [staffList, searchQuery, specializationFilter, availabilityFilter]);


  const specializations = useMemo(() => {
    if (!staffList) return [];
    const uniqueSpecs = [...new Set(staffList.flatMap((s: PublicStaff) => s.specializations || []))];
    return uniqueSpecs.map(spec => ({ 
      value: String(spec), 
      label: String(spec)
    }));
  }, [staffList]);


  const businessInfo = state.businessInfo;
  
  if (!businessInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Alert 
          icon={<InfoIcon className="w-5 h-5" />} 
          color="red" 
          title="Missing Information"
          radius="md"
          className="max-w-md"
        >
          Business information is missing. Please refresh the page and try again.
        </Alert>
      </div>
    );
  }


  const getStaffSpecializations = (staff: PublicStaff) => {
    if (staff.specializations && staff.specializations.length > 0) {
      return staff.specializations;
    }
    return [];
  };

  return (
    <div className="h-screen w-full bg-none relative overflow-hidden">

      <MobileBusinessHeader 
        businessInfo={businessInfo}
        scrollY={scrollY}
        isExpanded={isBusinessProfileExpanded}
        onToggleExpanded={() => setIsBusinessProfileExpanded(!isBusinessProfileExpanded)}
        onServiceChange={handleServiceChange}
      />
      
      <div className="flex h-full relative z-10">

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          <div className="flex-shrink-0 p-4 lg:p-8 bg-none border-b border-gray-100">
            <div className="max-w-none">

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
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <Text className="text-slate-600 text-xs lg:text-sm mb-2">
                  Select Staff Member
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
                  Choose your preferred staff member
                </Title>
                <Text className="text-slate-600 text-xs lg:text-sm">
                  Select from our available team members for your session.
                </Text>
              </motion.div>


              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-6"
              >
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                  <TextInput
                    placeholder="Search staff members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftSection={<SearchIcon className="w-4 h-4 text-slate-400" />}
                    className="flex-1"
                    classNames={{
                      input: "bg-white/60 backdrop-blur-sm border-white/30 focus:border-emerald-300 focus:bg-white/80 transition-all duration-200"
                    }}
                  />
                  
                  <div className="flex gap-2 lg:gap-3">
                    <Select
                      placeholder="All Specializations"
                      value={specializationFilter}
                      onChange={(value) => setSpecializationFilter(value || 'all')}
                      data={[
                        { value: 'all', label: 'All Specializations' },
                        ...specializations
                      ]}
                      className="min-w-36"
                      classNames={{
                        input: "bg-white/60 backdrop-blur-sm border-white/30 focus:border-emerald-300"
                      }}
                    />
                    
                    <Select
                      placeholder="Availability"
                      value={availabilityFilter}
                      onChange={(value) => setAvailabilityFilter(value || 'all')}
                      data={[
                        { value: 'all', label: 'All Staff' },
                        { value: 'available', label: 'Available Only' }
                      ]}
                      className="min-w-28"
                      classNames={{
                        input: "bg-white/60 backdrop-blur-sm border-white/30 focus:border-emerald-300"
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>


          <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8">
            <div className="max-w-none">
              {staffLoading && (
                <div className="relative min-h-[200px]">
                  <LoadingOverlay visible={true} />
                </div>
              )}

              {staffError && (
                <Alert 
                  icon={<InfoIcon className="w-5 h-5" />} 
                  color="red" 
                  title="Error Loading Staff"
                  radius="md"
                >
                  Failed to load available staff members. Please refresh and try again.
                </Alert>
              )}

              <AnimatePresence mode="popLayout">
                {!staffLoading && !staffError && filteredStaff.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 lg:py-12"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <Title order={4} className="text-slate-700 mb-2">
                      {searchQuery || specializationFilter !== 'all' || availabilityFilter !== 'all' 
                        ? 'No staff found' 
                        : 'No staff available'
                      }
                    </Title>
                    <Text size="sm" className="text-slate-500">
                      {searchQuery || specializationFilter !== 'all' || availabilityFilter !== 'all'
                        ? 'Try adjusting your search or filter criteria'
                        : 'No staff members are currently available for this service'
                      }
                    </Text>
                  </motion.div>
                )}

                {!staffLoading && !staffError && filteredStaff.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3 lg:space-y-4 pb-6"
                  >
                    {filteredStaff.map((staff: PublicStaff, index: number) => {
                      const isSelected = selectedStaff?.id === staff.id;
                      const isExpanded = expandedStaff === staff.id;
                      const specializations = getStaffSpecializations(staff);

                      return (
                        <motion.div
                          key={staff.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                          className="group cursor-pointer"
                          onClick={() => handleStaffSelect(staff)}
                        >
                          <Card
                            className={`relative transition-all duration-200 border-2 ${
                              isSelected 
                                ? 'border-emerald-500 bg-emerald-50 shadow-lg' 
                                : 'border-transparent bg-white/70 backdrop-blur-sm hover:border-emerald-200 hover:bg-white/90 hover:shadow-md'
                            }`}
                            radius="lg"
                            p="md"
                          >

                            {isSelected && (
                              <div className="absolute top-3 right-3">
                                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                  <CheckIcon className="w-3 h-3 text-white" />
                                </div>
                              </div>
                            )}

                            <div className="flex items-start gap-3">
                              <Avatar
                                size="sm"
                                radius="lg"
                                className="border-2 border-white shadow-sm flex-shrink-0"
                                src={staff.image_url}
                              >
                                <UserIcon className="w-5 h-5 text-slate-400" />
                              </Avatar>


                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <Title order={5} className="font-semibold text-slate-900 text-sm mb-1">
                                      {staff.name}
                                    </Title>
                                    

                                    <div className="flex items-center gap-2 mb-2">
                                      <div className={`w-2 h-2 rounded-full ${
                                        staff.is_available !== false ? 'bg-emerald-500' : 'bg-gray-400'
                                      }`}></div>
                                      <Badge 
                                        color={staff.is_available !== false ? "green" : "gray"}
                                        variant="light" 
                                        size="xs"
                                        className="font-medium"
                                      >
                                        {staff.is_available !== false ? 'Available' : 'Busy'}
                                      </Badge>
                                      
                                    
                                    </div>


                                    {staff.bio && (
                                      <Text size="xs" className="text-slate-600 line-clamp-2 mb-2">
                                        {staff.bio}
                                      </Text>
                                    )}


                                    {specializations.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-2">
                                        {specializations.slice(0, 3).map((spec: string, specIndex: number) => (
                                          <Badge 
                                            key={specIndex}
                                            variant="outline" 
                                            color="gray" 
                                            size="xs"
                                          >
                                            {spec}
                                          </Badge>
                                        ))}
                                        {specializations.length > 3 && (
                                          <Badge 
                                            variant="outline" 
                                            color="gray" 
                                            size="xs"
                                          >
                                            +{specializations.length - 3} more
                                          </Badge>
                                        )}
                                      </div>
                                    )}


                                    {(specializations.length > 3 || staff.bio) && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedStaff(isExpanded ? null : staff.id);
                                        }}
                                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                                      >
                                        {isExpanded ? 'Show less' : 'Show more'}
                                      </button>
                                    )}
                                  </div>
                                </div>


                                <Collapse in={isExpanded}>
                                  <div className="mt-3 pt-3 border-t border-slate-100">
                                    {specializations.length > 3 && (
                                      <div className="mb-3">
                                        <Text size="xs" className="font-medium text-slate-700 mb-1">
                                          All Specializations:
                                        </Text>
                                        <div className="flex flex-wrap gap-1">
                                          {specializations.map((spec: string, specIndex: number) => (
                                            <Badge 
                                              key={specIndex}
                                              variant="outline" 
                                              color="gray" 
                                              size="xs"
                                            >
                                              {spec}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {staff.bio && (
                                      <div>
                                        <Text size="xs" className="font-medium text-slate-700 mb-1">
                                          About:
                                        </Text>
                                        <Text size="xs" className="text-slate-600">
                                          {staff.bio}
                                        </Text>
                                      </div>
                                    )}
                                  </div>
                                </Collapse>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>


          {selectedStaff && (
            <div className="flex-shrink-0 p-4 lg:p-8 border-t border-slate-100 bg-white/90 backdrop-blur-sm fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto lg:left-auto lg:right-auto z-50">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:max-w-none max-w-sm mx-auto"
              >
                <Button
                  onClick={onNext}
                  size="lg"
                  variant="filled"
                  className="w-full !bg-emerald-500 hover:!bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  rightSection={<ArrowRightIcon className="w-5 h-5" />}
                >
                  Continue with {selectedStaff.name}
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const StaffSelectionStep = StaffSelectionStepComponent