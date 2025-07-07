import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Title,
  Text,
  Alert,
  LoadingOverlay,
  TextInput,
  Badge,
  Card,
  Button,
  ActionIcon,
  Select,
} from "@mantine/core";
import {
  SearchIcon,
  InfoIcon,
  ArrowLeftIcon,
  UserIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "../bookingIcons";
import { useBookingFlow } from "../PublicBookingProvider";
import { PublicStaff, PublicBusinessInfo } from "../../../types/clientTypes";
import { useGetPublicAvailableStaff } from "../../../hooks/reactQuery";
import { useViewportSize } from "@mantine/hooks";

interface StaffSelectionStepProps {
  businessSlug: string;
  businessInfo: PublicBusinessInfo;
}

export function StaffSelectionStep({
  businessSlug,
  businessInfo,
}: StaffSelectionStepProps) {
  const { state, dispatch, goToNextStep, goToPreviousStep } = useBookingFlow();
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isBusinessProfileExpanded, setIsBusinessProfileExpanded] = useState(false);

  const { width } = useViewportSize();
  const isMobile = width < 768;

  const selectedSubcategory = state.selectedServiceSubcategory;
  const selectedService = state.selectedService;
  const selectedLocation = state.selectedLocation;
  const selectedDate = state.selectedDate;

  const serviceId = selectedSubcategory?.id || selectedService?.id || 0;
  const locationId = selectedLocation?.id || 0;

  const { data: staffResponse, isLoading, error } = useGetPublicAvailableStaff(
    businessSlug,
    serviceId,
    typeof selectedDate === 'string' ? selectedDate : selectedDate?.toISOString()?.split('T')[0],
    true,
    locationId
  );

  const staff = useMemo(() => {
    if (!staffResponse) return [];
    
    if (Array.isArray(staffResponse)) {
      return staffResponse;
    }
    
    if (staffResponse.staff && Array.isArray(staffResponse.staff)) {
      return staffResponse.staff;
    }
    
    if (staffResponse.data && Array.isArray(staffResponse.data)) {
      return staffResponse.data;
    }
    
    console.warn('Unexpected staff response structure:', staffResponse);
    return [];
  }, [staffResponse]);

  React.useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  const specializations = useMemo(() => {
    if (!Array.isArray(staff) || staff.length === 0) return [];
    
    const specs = staff.flatMap((member: PublicStaff) => 
      Array.isArray(member.specializations) ? member.specializations : []
    );
    return Array.from(new Set(specs.filter(Boolean)));
  }, [staff]);

  const filteredStaff = useMemo(() => {
    if (!Array.isArray(staff)) return [];

    return staff.filter((member: PublicStaff) => {
      const memberName = member.name || "";
      const memberSpecializations = Array.isArray(member.specializations) ? member.specializations : [];
      
      const matchesSearch = 
        memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memberSpecializations.some(spec => 
          spec && spec.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesSpecialization = !specializationFilter || 
        memberSpecializations.includes(specializationFilter);

      return matchesSearch && matchesSpecialization;
    });
  }, [staff, searchQuery, specializationFilter]);

  const handleStaffSelect = async (staffMember: PublicStaff) => {
    console.log('👨‍💼 Selected staff:', staffMember);
    dispatch({ type: "SELECT_STAFF", payload: staffMember });

    setTimeout(() => goToNextStep(), 300);
  };

  if (!selectedSubcategory && !selectedService) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert
          icon={<InfoIcon className="w-5 h-5" />}
          color="red"
          title="No Service Selected"
          radius="md"
          className="max-w-md"
        >
          Please go back and select a service first.
        </Alert>
      </div>
    );
  }

  const businessName = businessInfo.business_name || "Business";
  const businessType = businessInfo.business_type || "Service Provider";
  const businessAbout = businessInfo.about || "";
  const serviceName = selectedSubcategory?.name || selectedService?.name || "service";
  const locationName = selectedLocation?.name || "location";

  const MobileBusinessHeader = () => {
    const isCompact = scrollY > 100;
    const progressPercentage = 90;

    return (
      <motion.div
        className="lg:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-white/20"
        animate={{
          height: isCompact ? 80 : isBusinessProfileExpanded ? "auto" : 120,
          paddingTop: isCompact ? 8 : 16,
          paddingBottom: isCompact ? 8 : 16,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg"
                animate={{
                  width: isCompact ? 40 : 48,
                  height: isCompact ? 40 : 48,
                }}
              >
                <span
                  className={`font-bold text-white ${
                    isCompact ? "text-base" : "text-lg"
                  }`}
                >
                  {businessName.charAt(0).toUpperCase()}
                </span>
              </motion.div>

              <div className="flex-1">
                <motion.div
                  animate={{
                    fontSize: isCompact ? "14px" : "16px",
                  }}
                  className="font-bold text-slate-900 leading-tight"
                >
                  {businessName}
                </motion.div>
                {!isCompact && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-slate-600"
                  >
                    {businessType}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isCompact && (
                <ActionIcon
                  variant="subtle"
                  onClick={() =>
                    setIsBusinessProfileExpanded(!isBusinessProfileExpanded)
                  }
                  className="text-slate-600"
                >
                  {isBusinessProfileExpanded ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </ActionIcon>
              )}
            </div>
          </div>

          <motion.div
            className="mt-3"
            animate={{ opacity: isCompact ? 0.7 : 1 }}
          >
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>Step 4 of 4</span>
              <span>{progressPercentage}% Complete</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </motion.div>

          {isBusinessProfileExpanded && !isCompact && (
            <div className="mt-4 space-y-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <Text className="text-xs font-medium text-slate-800 mb-1">
                  About
                </Text>
                <Text size="xs" className="text-slate-600 line-clamp-2">
                  {businessAbout ||
                    "Professional service provider offering quality experiences."}
                </Text>
              </div>

              <div className="bg-emerald-50 rounded-lg p-3">
                <Text className="text-xs font-medium text-emerald-800 mb-1">
                  Selected Service
                </Text>
                <Text size="xs" className="text-emerald-700 font-semibold">
                  {serviceName}
                </Text>
              </div>

              {selectedLocation && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <Text className="text-xs font-medium text-blue-800 mb-1">
                    Selected Location
                  </Text>
                  <Text size="xs" className="text-blue-700 font-semibold">
                    {locationName}
                  </Text>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-none relative">
        <MobileBusinessHeader />
        <LoadingOverlay visible={true} />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-none relative overflow-hidden">
      <MobileBusinessHeader />

      <div className="flex-1 flex flex-col h-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex-1 p-4 lg:p-8 flex flex-col min-h-0"
        >
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="subtle"
                leftSection={<ArrowLeftIcon className="w-4 h-4" />}
                onClick={goToPreviousStep}
                size="sm"
                className="text-slate-600 hover:text-slate-800"
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
                  background:
                    "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Choose your preferred staff member
              </Title>
              <Text className="text-slate-600 text-xs lg:text-sm">
                Select from our skilled professionals who can provide your {serviceName} service.
              </Text>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-4 lg:mb-6"
          >
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <TextInput
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftSection={<SearchIcon className="w-4 h-4 text-slate-400" />}
                className="flex-1"
                classNames={{
                  input:
                    "bg-white/60 backdrop-blur-sm border-white/30 focus:border-green-300 focus:bg-white/80 transition-all duration-200",
                }}
              />

              <Select
                placeholder="Filter by specialization"
                value={specializationFilter}
                onChange={(value) => setSpecializationFilter(value)}
                data={[
                  { value: "", label: "All Specializations" },
                  ...specializations.map(spec => ({ value: spec, label: spec }))
                ]}
                className="min-w-48"
                classNames={{
                  input:
                    "bg-white/60 backdrop-blur-sm border-white/30 focus:border-green-300",
                }}
                clearable
                searchable={specializations.length > 5}
                disabled={specializations.length === 0}
              />
            </div>
          </motion.div>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="light" color="green" size="sm">
                  Available Staff
                </Badge>
                <Text size="sm" className="text-slate-500">
                  {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''} available
                </Text>
              </div>

              {error && (
                <Alert
                  icon={<InfoIcon className="w-5 h-5" />}
                  color="red"
                  title="Error Loading Staff"
                  radius="md"
                  className="max-w-md"
                >
                  Failed to load staff members. Please try again.
                </Alert>
              )}

              <AnimatePresence mode="popLayout">
                {filteredStaff.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {filteredStaff.map((staffMember: PublicStaff, index: number) => (
                      <motion.div
                        key={staffMember.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        whileHover={{ y: -2 }}
                        className="cursor-pointer"
                        onClick={() => handleStaffSelect(staffMember)}
                      >
                        <StaffCard
                          staffMember={staffMember}
                          onClick={handleStaffSelect}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : !error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 lg:py-12"
                  >
                    <div className="text-3xl lg:text-5xl mb-4">👨‍💼</div>
                    <Title order={4} className="text-slate-700 mb-2">
                      No staff members found
                    </Title>
                    <Text size="sm" className="text-slate-500">
                      {searchQuery || specializationFilter
                        ? "No staff members match your search criteria"
                        : "No staff members are currently available for this service"}
                    </Text>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const StaffCard: React.FC<{
  staffMember: PublicStaff;
  onClick: (staffMember: PublicStaff) => void;
}> = ({ staffMember }) => {
  const getAvailabilityColor = (availability: string) => {
    switch (availability.toLowerCase()) {
      case 'available':
        return 'green';
      case 'busy':
        return 'orange';
      case 'unavailable':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getCompetencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert':
        return 'green';
      case 'advanced':
        return 'emerald';
      case 'intermediate':
        return 'blue';
      case 'beginner':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <Card
      className="bg-white/80 backdrop-blur-sm border border-white/40 hover:bg-white/95 transition-all duration-300 hover:shadow-emerald-100/60 group cursor-pointer"
      radius="xl"
      p="md"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 flex items-center justify-center group-hover:from-emerald-100 group-hover:to-green-100 group-hover:border-emerald-200 transition-all duration-300 flex-shrink-0">
          {staffMember.image_url ? (
            <img 
              src={staffMember.image_url} 
              alt={staffMember.name}
              className="w-full h-full rounded-lg object-cover"
            />
          ) : (
            <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-medium">
              {staffMember.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Title
                  order={4}
                  className="text-sm lg:text-base font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors duration-200 truncate"
                >
                  {staffMember.name}
                </Title>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Badge 
                    color={getAvailabilityColor(staffMember.availability || 'available')} 
                    variant="light" 
                    size="xs"
                    className="text-xs"
                  >
                    {staffMember.availability || 'Available'}
                  </Badge>
                  {staffMember.competency_level && (
                    <Badge 
                      color={getCompetencyColor(staffMember.competency_level)} 
                      variant="outline" 
                      size="xs"
                      className="text-xs"
                    >
                      {staffMember.competency_level}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                {staffMember.years_of_experience && staffMember.years_of_experience > 0 && (
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>{staffMember.years_of_experience}y exp</span>
                  </div>
                )}
                
              </div>
            </div>
            
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {staffMember.bio && (
            <Text
              size="xs"
              className="text-slate-600 mb-2 line-clamp-1 group-hover:text-slate-700 transition-colors duration-200"
            >
              {staffMember.bio}
            </Text>
          )}

          {staffMember.specializations && staffMember.specializations.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {staffMember.specializations.slice(0, 3).map((specialization, index) => (
                <div
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium"
                >
                  {specialization}
                </div>
              ))}
              {staffMember.specializations.length > 3 && (
                <div className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-xs">
                  +{staffMember.specializations.length - 3} more
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

