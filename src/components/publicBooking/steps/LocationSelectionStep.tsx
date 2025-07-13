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
} from "@mantine/core";
import {
  SearchIcon,
  InfoIcon,
  ArrowLeftIcon,
  LocationIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "../bookingIcons";
import { useBookingFlow } from "../PublicBookingProvider";
import { PublicLocation, PublicBusinessInfo } from "../../../types/clientTypes";
import { useGetPublicAvailableLocations } from "../../../hooks/reactQuery";
import { useViewportSize } from "@mantine/hooks";

interface LocationSelectionStepProps {
  businessSlug: string;
  businessInfo: PublicBusinessInfo;
}

export function LocationSelectionStep({
  businessSlug,
  businessInfo,
}: LocationSelectionStepProps) {
  const { state, dispatch, goToNextStep, goToPreviousStep } = useBookingFlow();
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [isBusinessProfileExpanded, setIsBusinessProfileExpanded] = useState(false);

  const { width } = useViewportSize();
  const isMobile = width < 768;

  const selectedSubcategory = state.selectedServiceSubcategory;
  const selectedService = state.selectedService;
  const selectedStaff = state.selectedStaff;
  const selectedDate = state.selectedDate;

  const serviceId = selectedSubcategory?.id || selectedService?.id || 0;
  const staffId = selectedStaff?.id || undefined;

  const { data: locationsResponse, isLoading, error } = useGetPublicAvailableLocations(
    businessSlug,
    serviceId,
    staffId,
    typeof selectedDate === 'string' ? selectedDate : selectedDate?.toISOString()?.split('T')[0],
    true // isServiceId: true for flexible bookings
  );

  // Extract locations from the response - handle the API response structure
  const locations = useMemo(() => {
    if (!locationsResponse) return [];
    
    if (Array.isArray(locationsResponse)) {
      return locationsResponse;
    }
    
    if (locationsResponse.locations && Array.isArray(locationsResponse.locations)) {
      return locationsResponse.locations;
    }
    
    console.warn('Unexpected locations response structure:', locationsResponse);
    return [];
  }, [locationsResponse]);

  // Handle scroll for mobile header
  React.useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  const filteredLocations = useMemo(() => {
    if (!Array.isArray(locations)) return [];

    return locations.filter((location: PublicLocation) => {
      const locationName = location.name || "";
      const locationAddress = location.address || "";
      const locationCity = location.city || "";
      const matchesSearch =
        locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        locationAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        locationCity.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [locations, searchQuery]);

  const handleLocationSelect = async (location: PublicLocation) => {
    console.log('📍 Selected location:', location);
    dispatch({ type: "SELECT_LOCATION", payload: location });

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
  const staffName = selectedStaff?.name || "";

  // Mobile Business Header Component
  const MobileBusinessHeader = () => {
    const isCompact = scrollY > 100;
    const progressPercentage = 75;

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
              <span>Step 3 of 4</span>
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

              {selectedStaff && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <Text className="text-xs font-medium text-blue-800 mb-1">
                    Selected Staff
                  </Text>
                  <Text size="xs" className="text-blue-700 font-semibold">
                    {staffName}
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
      {/* Mobile Header */}
      <MobileBusinessHeader />

      <div className="flex-1 flex flex-col h-full relative z-10">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex-1 p-4 lg:p-8 flex flex-col min-h-0"
        >
          {/* Header Section */}
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
                Select Location
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
                Choose where you'd like to receive your {serviceName}
              </Title>
              <Text className="text-slate-600 text-xs lg:text-sm">
                Select from our available locations for your session.
              </Text>
            </motion.div>
          </div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-4 lg:mb-6"
          >
            <TextInput
              placeholder="Search locations by name, address, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftSection={<SearchIcon className="w-4 h-4 text-slate-400" />}
              className="max-w-md"
              classNames={{
                input:
                  "bg-white/60 backdrop-blur-sm border-white/30 focus:border-green-300 focus:bg-white/80 transition-all duration-200",
              }}
            />
          </motion.div>

          {/* Locations List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="light" color="green" size="sm">
                  Available Locations
                </Badge>
                <Text size="sm" className="text-slate-500">
                  {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} available
                </Text>
              </div>

              {error && (
                <Alert
                  icon={<InfoIcon className="w-5 h-5" />}
                  color="red"
                  title="Error Loading Locations"
                  radius="md"
                  className="max-w-md"
                >
                  Failed to load locations. Please try again.
                </Alert>
              )}

              <AnimatePresence mode="popLayout">
                {filteredLocations.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {filteredLocations.map((location: PublicLocation, index: number) => (
                      <motion.div
                        key={location.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        whileHover={{ y: -2 }}
                        className="cursor-pointer"
                        onClick={() => handleLocationSelect(location)}
                      >
                        <LocationCard
                          location={location}
                          onClick={handleLocationSelect}
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
                    <div className="text-3xl lg:text-5xl mb-4">📍</div>
                    <Title order={4} className="text-slate-700 mb-2">
                      No locations found
                    </Title>
                    <Text size="sm" className="text-slate-500">
                      {searchQuery
                        ? "No locations match your search criteria"
                        : "No locations are available for this service"}
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

// Location Card Component - Updated to be more compact and appealing
const LocationCard: React.FC<{
  location: PublicLocation;
  onClick: (location: PublicLocation) => void;
}> = ({ location }) => {
  return (
    <Card
      className="bg-white/80 backdrop-blur-sm border border-white/40 hover:bg-white/95 transition-all duration-300 hover:shadow-emerald-100/60 group cursor-pointer"
      radius="xl"
      p="md"
    >
      <div className="flex items-center gap-3">
        {/* Icon Section - More compact */}
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 flex items-center justify-center group-hover:from-emerald-100 group-hover:to-green-100 group-hover:border-emerald-200 transition-all duration-300 flex-shrink-0">
          <LocationIcon className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600 group-hover:text-emerald-700" />
        </div>

        {/* Content Section - Optimized layout */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Title
                  order={4}
                  className="text-sm lg:text-base font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors duration-200 truncate"
                >
                  {location.name}
                </Title>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Badge 
                    color="green" 
                    variant="light" 
                    size="xs"
                    className="text-xs"
                  >
                    Available
                  </Badge>
                  {location.is_primary && (
                    <Badge 
                      color="emerald" 
                      variant="outline" 
                      size="xs"
                      className="text-xs"
                    >
                      Primary
                    </Badge>
                  )}
                </div>
              </div>
              
              <Text
                size="xs"
                className="text-slate-600 group-hover:text-slate-700 transition-colors duration-200 line-clamp-1"
              >
                {location.address}
              </Text>
              
              <div className="flex items-center gap-1 mt-1">
                <LocationIcon className="w-3 h-3 text-slate-400" />
                <Text size="xs" className="text-slate-500">
                  {location.city}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Card>
  );
};
