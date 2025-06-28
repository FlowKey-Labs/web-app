import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Title,
  Text,
  Button,
  Card,
  Badge,
  Alert,
  LoadingOverlay,
  Collapse,
  TextInput,
  Select,
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  LocationIcon,
  InfoIcon,
  CheckIcon,
  SearchIcon,
} from "../bookingIcons";
import { useBookingFlow } from "../PublicBookingProvider";
import { MobileBusinessHeader } from "../components/MobileBusinessHeader";
import { PublicLocation } from "../../../types/clientTypes";
import { useGetPublicAvailableLocations } from "../../../hooks/reactQuery";


interface LocationSelectionStepProps {
  onNext: () => void;
  onBack: () => void;
}

function LocationSelectionStepComponent({
  onNext,
  onBack,
}: LocationSelectionStepProps) {
  const { state, dispatch } = useBookingFlow();
  const { width } = useViewportSize();
  const isMobile = width < 768;
  const [selectedLocation, setSelectedLocation] =
    useState<PublicLocation | null>(state.selectedLocation);
  const [expandedLocation, setExpandedLocation] = useState<number | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");

  // Mobile-specific state
  const [isBusinessProfileExpanded, setIsBusinessProfileExpanded] =
    useState(false);
  const [scrollY, setScrollY] = useState(0);

  const businessSlug =
    window.location.pathname.split("/book/")[1]?.split("/")[0] || "";
  const {
    data: locationsResponse,
    isLoading: locationsLoading,
    error: locationsError,
  } = useGetPublicAvailableLocations(
    businessSlug,
    state.selectedTimeSlot?.session_id || 0,
    state.selectedStaff?.id,
    typeof state.selectedDate === "string"
      ? state.selectedDate
      : state.selectedDate?.toISOString()?.split("T")[0]
  );

  const locationsList = locationsResponse?.locations || [];

  React.useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  const handleLocationSelect = (location: PublicLocation) => {
    setSelectedLocation(location);
    dispatch({ type: "SELECT_LOCATION", payload: location });

    setTimeout(() => {
      onNext();
    }, 500);
  };

  const handleBack = () => {
    onBack();
  };

  const handleServiceChange = () => {
    dispatch({ type: "SET_CURRENT_STEP", payload: "service" });
  };

  const filteredLocations = useMemo(() => {
    if (!locationsList) return [];

    return locationsList.filter((location: PublicLocation) => {
      const locationName = location.name || "";
      const locationAddress = location.address || "";
      const locationCity = location.city || "";
      const matchesSearch =
        locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        locationAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        locationCity.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && location.is_available !== false);

      return matchesSearch && matchesAvailability;
    });
  }, [locationsList, searchQuery, availabilityFilter]);
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
          Business information is missing. Please refresh the page and try
          again.
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-none relative overflow-hidden">
      <MobileBusinessHeader
        businessInfo={businessInfo}
        scrollY={scrollY}
        isExpanded={isBusinessProfileExpanded}
        onToggleExpanded={() =>
          setIsBusinessProfileExpanded(!isBusinessProfileExpanded)
        }
        onServiceChange={handleServiceChange}
      />

      <div className="flex h-full relative z-10">
        {/* Main Content Area */}
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
                  Select your preferred location
                </Title>
                <Text className="text-slate-600 text-xs lg:text-sm">
                  {state.selectedStaff ? (
                    <>
                      Select a convenient location for your appointment with{" "}
                      <span className="font-bold text-emerald-700">
                        {state.selectedStaff.name}
                      </span>
                    </>
                  ) : (
                    "Select a convenient location for your appointment"
                  )}
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
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftSection={
                      <SearchIcon className="w-4 h-4 text-slate-400" />
                    }
                    className="flex-1"
                    classNames={{
                      input:
                        "bg-white/60 backdrop-blur-sm border-white/30 focus:border-emerald-300 focus:bg-white/80 transition-all duration-200",
                    }}
                  />

                  <div className="flex gap-2 lg:gap-3">
                    <Select
                      placeholder="Availability"
                      value={availabilityFilter}
                      onChange={(value) =>
                        setAvailabilityFilter(value || "all")
                      }
                      data={[
                        { value: "all", label: "All Locations" },
                        { value: "available", label: "Available Only" },
                      ]}
                      className="min-w-32"
                      classNames={{
                        input:
                          "bg-white/60 backdrop-blur-sm border-white/30 focus:border-emerald-300",
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8">
            <div className="max-w-none">
              {locationsLoading && (
                <div className="relative min-h-[200px]">
                  <LoadingOverlay visible={true} />
                </div>
              )}

              {locationsError && (
                <Alert
                  icon={<InfoIcon className="w-5 h-5" />}
                  color="red"
                  title="Error Loading Locations"
                  radius="md"
                >
                  Failed to load available locations. Please refresh and try
                  again.
                </Alert>
              )}

              <AnimatePresence mode="popLayout">
                {!locationsLoading &&
                  !locationsError &&
                  filteredLocations.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-8 lg:py-12"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                        <LocationIcon className="w-8 h-8 text-slate-400" />
                      </div>
                      <Title order={4} className="text-slate-700 mb-2">
                        {searchQuery || availabilityFilter !== "all"
                          ? "No locations found"
                          : "No locations available"}
                      </Title>
                      <Text size="sm" className="text-slate-500">
                        {searchQuery || availabilityFilter !== "all"
                          ? "Try adjusting your search or filter criteria"
                          : "No locations are currently available for this service"}
                      </Text>
                    </motion.div>
                  )}

                {!locationsLoading &&
                  !locationsError &&
                  filteredLocations.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3 lg:space-y-4 pb-6"
                    >
                      {filteredLocations.map(
                        (location: PublicLocation, index: number) => {
                          const isSelected =
                            selectedLocation?.id === location.id;
                          const isExpanded = expandedLocation === location.id;

                          return (
                            <motion.div
                              key={location.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.1, duration: 0.4 }}
                              className="group cursor-pointer"
                              onClick={() => handleLocationSelect(location)}
                            >
                              <Card
                                className={`relative transition-all duration-200 border-2 ${
                                  isSelected
                                    ? "border-emerald-500 bg-emerald-50 shadow-lg"
                                    : "border-transparent bg-white/70 backdrop-blur-sm hover:border-emerald-200 hover:bg-white/90 hover:shadow-md"
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
                                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <LocationIcon className="w-5 h-5 text-emerald-600" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <Title
                                          order={5}
                                          className="font-semibold text-slate-900 text-sm mb-1"
                                        >
                                          {location.name}
                                        </Title>
                                        <div className="flex items-center gap-2 mb-2">
                                          <div
                                            className={`w-2 h-2 rounded-full ${
                                              location.is_available !== false
                                                ? "bg-emerald-500"
                                                : "bg-gray-400"
                                            }`}
                                          ></div>
                                          <Badge
                                            color={
                                              location.is_available !== false
                                                ? "green"
                                                : "gray"
                                            }
                                            variant="light"
                                            size="xs"
                                            className="font-medium"
                                          >
                                            {location.is_available !== false
                                              ? "Available"
                                              : "Unavailable"}
                                          </Badge>
                                        </div>

                                        <Text
                                          size="xs"
                                          className="text-slate-600 mb-2"
                                        >
                                          {location.address}
                                          {location.city &&
                                            `, ${location.city}`}
                                        </Text>
                                        {location.amenities &&
                                          location.amenities.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2">
                                              {location.amenities
                                                .slice(0, 3)
                                                .map(
                                                  (
                                                    amenity: string,
                                                    amenityIndex: number
                                                  ) => (
                                                    <Badge
                                                      key={amenityIndex}
                                                      variant="outline"
                                                      color="gray"
                                                      size="xs"
                                                    >
                                                      {amenity}
                                                    </Badge>
                                                  )
                                                )}
                                              {location.amenities.length >
                                                3 && (
                                                <Badge
                                                  variant="outline"
                                                  color="gray"
                                                  size="xs"
                                                >
                                                  +
                                                  {location.amenities.length -
                                                    3}{" "}
                                                  more
                                                </Badge>
                                              )}
                                            </div>
                                          )}

                                        {location.amenities &&
                                          location.amenities.length > 3 && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedLocation(
                                                  isExpanded
                                                    ? null
                                                    : location.id
                                                );
                                              }}
                                              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                                            >
                                              {isExpanded
                                                ? "Show less"
                                                : "Show more amenities"}
                                            </button>
                                          )}
                                      </div>
                                    </div>

                                    <Collapse in={isExpanded}>
                                      <div className="mt-3 pt-3 border-t border-slate-100">
                                        {location.amenities &&
                                          location.amenities.length > 3 && (
                                            <div className="mb-3">
                                              <Text
                                                size="xs"
                                                className="font-medium text-slate-700 mb-1"
                                              >
                                                All Amenities:
                                              </Text>
                                              <div className="flex flex-wrap gap-1">
                                                {location.amenities.map(
                                                  (
                                                    amenity: string,
                                                    amenityIndex: number
                                                  ) => (
                                                    <Badge
                                                      key={amenityIndex}
                                                      variant="outline"
                                                      color="gray"
                                                      size="xs"
                                                    >
                                                      {amenity}
                                                    </Badge>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                      </div>
                                    </Collapse>
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          );
                        }
                      )}
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          </div>

          {selectedLocation && (
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
                  Continue with {selectedLocation.name}
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const LocationSelectionStep = LocationSelectionStepComponent;
