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
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "../bookingIcons";
import { useBookingFlow } from "../PublicBookingProvider";
import { PublicServiceSubcategory, PublicBusinessInfo } from "../../../types/clientTypes";
import { useViewportSize } from "@mantine/hooks";

interface SubcategorySelectionStepProps {
  businessSlug: string;
  businessInfo: PublicBusinessInfo;
}

export function SubcategorySelectionStep({
  businessSlug,
  businessInfo,
}: SubcategorySelectionStepProps) {
  const { state, dispatch, goToNextStep, goToPreviousStep } = useBookingFlow();
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [isBusinessProfileExpanded, setIsBusinessProfileExpanded] = useState(false);

  const { width } = useViewportSize();
  const isMobile = width < 768;

  const selectedCategory = state.selectedServiceCategory;

  // Use subcategories from the selected category - no need for additional API call
  const subcategories = selectedCategory?.subcategories || [];
  const isLoading = false;
  const error = null;

  // Handle scroll for mobile header
  React.useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  const filteredSubcategories = useMemo(() => {
    if (!subcategories) return [];

    return subcategories.filter((subcategory: PublicServiceSubcategory) => {
      const subcategoryName = subcategory.name || "";
      const subcategoryDescription = subcategory.description || "";
      const matchesSearch =
        subcategoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subcategoryDescription.toLowerCase().includes(searchQuery.toLowerCase());

      // Only show subcategories that are marked as services
      const isMarkedAsService = subcategory.is_service === true;

      return matchesSearch && isMarkedAsService;
    });
  }, [subcategories, searchQuery]);

  const handleSubcategorySelect = async (subcategory: PublicServiceSubcategory) => {
    console.log('🔧 Selected subcategory:', subcategory);
    dispatch({ type: "SELECT_SERVICE_SUBCATEGORY", payload: subcategory });

    setTimeout(() => goToNextStep(), 300);
  };

  if (!selectedCategory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert
          icon={<InfoIcon className="w-5 h-5" />}
          color="red"
          title="No Category Selected"
          radius="md"
          className="max-w-md"
        >
          Please go back and select a service category first.
        </Alert>
      </div>
    );
  }

  const businessName = businessInfo.business_name || "Business";
  const businessType = businessInfo.business_type || "Service Provider";
  const businessAbout = businessInfo.about || "";
  const categoryName = selectedCategory.name || "Services";

  // Mobile Business Header Component
  const MobileBusinessHeader = () => {
    const isCompact = scrollY > 100;
    const progressPercentage = 50;

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
              <span>Step 2 of 4</span>
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
                  Selected Category
                </Text>
                <Text size="xs" className="text-emerald-700 font-semibold">
                  {categoryName}
                </Text>
              </div>
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
                Select {categoryName} Service
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
                Choose the specific service you'd like to book
              </Title>
              <Text className="text-slate-600 text-xs lg:text-sm">
                {selectedCategory.description || `Learning sessions for ${categoryName.toLowerCase()} techniques`}
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
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftSection={<SearchIcon className="w-4 h-4 text-slate-400" />}
              className="max-w-md"
              classNames={{
                input:
                  "bg-white/60 backdrop-blur-sm border-white/30 focus:border-emerald-300 focus:bg-white/80 transition-all duration-200",
              }}
            />
          </motion.div>

          {/* Services List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="light" color="green" size="sm">
                  Available Services
                </Badge>
                <Text size="sm" className="text-slate-500">
                  {filteredSubcategories.length} service{filteredSubcategories.length !== 1 ? 's' : ''} available
                </Text>
              </div>

              {error && (
                <Alert
                  icon={<InfoIcon className="w-5 h-5" />}
                  color="red"
                  title="Error Loading Services"
                  radius="md"
                  className="max-w-md"
                >
                  Failed to load services. Please try again.
                </Alert>
              )}

              <AnimatePresence mode="popLayout">
                {filteredSubcategories.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {filteredSubcategories.map((subcategory: PublicServiceSubcategory, index: number) => (
                      <motion.div
                        key={subcategory.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        whileHover={{ y: -2 }}
                        className="cursor-pointer"
                        onClick={() => handleSubcategorySelect(subcategory)}
                      >
                        <ServiceCard
                          service={subcategory}
                          onClick={handleSubcategorySelect}
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
                    <div className="text-3xl lg:text-5xl mb-4">🔍</div>
                    <Title order={4} className="text-slate-700 mb-2">
                      No services found
                    </Title>
                    <Text size="sm" className="text-slate-500">
                      {searchQuery
                        ? "No services match your search criteria"
                        : "No services are available in this category"}
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

// Service Card Component - Updated to green color scheme and fixed hover overflow
const ServiceCard: React.FC<{
  service: PublicServiceSubcategory;
  onClick: (service: PublicServiceSubcategory) => void;
}> = ({ service }) => {
  return (
    <Card
      className="bg-white/70 backdrop-blur-sm border border-white/30 hover:bg-white/90 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:shadow-emerald-100/50 group"
      radius="lg"
      p="lg"
      style={{ transform: 'none' }} // Prevent scaling overflow
    >
      <div className="flex items-start gap-3 lg:gap-4">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center text-base lg:text-lg group-hover:from-emerald-200 group-hover:to-green-200 transition-all duration-300 flex-shrink-0">
          <span className="text-emerald-600 font-bold">
            {service.name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <Title
                order={4}
                className="text-sm lg:text-base font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors duration-200 mb-1"
              >
                {service.name}
              </Title>
              <Badge color="green" variant="light" size="xs">
                Service
              </Badge>
            </div>
            <div className="text-right">
              <Text
                size="lg"
                fw={600}
                className="text-slate-900 group-hover:text-emerald-700 transition-colors duration-200"
              >
                {service.base_price && Number(service.base_price) > 0
                  ? `KSh ${service.base_price}`
                  : "Free"}
              </Text>
            </div>
          </div>

          <Text
            size="sm"
            className="text-slate-600 mb-3 line-clamp-2 group-hover:text-slate-700 transition-colors duration-200"
          >
            {service.description ||
              "A professional service tailored to your specific needs."}
          </Text>

          <div className="flex items-center gap-4 text-sm text-slate-500">
            {service.default_duration && (
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span>{service.default_duration} min</span>
              </div>
            )}
            {service.base_price && Number(service.base_price) > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-emerald-600 font-semibold">
                  Starting from KSh {service.base_price}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}; 