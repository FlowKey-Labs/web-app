import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Title,
  Text,
  Alert,
  LoadingOverlay,
  TextInput,
  Select,
  Badge,
  Card,
  Collapse,
  Progress,
  ActionIcon,
} from "@mantine/core";
import {
  ClockIcon,
  UserIcon,
  InfoIcon,
  SearchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "../bookingIcons";
import { useGetPublicBusinessServices } from "../../../hooks/reactQuery";
import { useBookingFlow } from "../PublicBookingProvider";
import { PublicService, PublicServiceCategory, PublicBusinessInfo } from "../../../types/clientTypes";
import { useViewportSize } from "@mantine/hooks";

interface ServiceSelectionStepProps {
  businessSlug: string;
  businessInfo: PublicBusinessInfo;
}

export function ServiceSelectionStep({
  businessSlug,
  businessInfo,
}: ServiceSelectionStepProps) {
  const { state, dispatch, goToNextStep } = useBookingFlow();
  const {
    data: services,
    isLoading,
    error,
  } = useGetPublicBusinessServices(businessSlug);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");


  const { width } = useViewportSize();
  const isMobile = width < 768;
  const [isBusinessProfileExpanded, setIsBusinessProfileExpanded] =
    useState(false);
  const [scrollY, setScrollY] = useState(0);


  React.useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  // Parse services to detect categories vs individual services
  const parsedServices = useMemo(() => {
    if (!services) return { categories: [], individualServices: [] };

    const categories: PublicServiceCategory[] = [];
    const individualServices: PublicService[] = [];

    services.forEach((item: any) => {
      // Check if this is a service category with subcategories
      if (item.subcategories && Array.isArray(item.subcategories) && item.subcategories.length > 0) {
        categories.push({
          id: item.id,
          name: item.name,
          description: item.description,
          subcategories: item.subcategories,
          image_url: item.image_url,
        });
      } else {
        // This is an individual service (session-based/fixed booking)
        individualServices.push({
          id: item.id,
          name: item.name,
          description: item.description,
          duration_minutes: item.duration_minutes,
          capacity: item.capacity,
          price: item.price,
          category_type: item.category_type,
          image_url: item.image_url,
          session_id: item.session_id,
          is_session: true,
        });
      }
    });

    return { categories, individualServices };
  }, [services]);

  const handleServiceCategorySelect = async (category: PublicServiceCategory) => {
    console.log('🎯 Selected service category:', category);
    dispatch({ type: "SELECT_SERVICE_CATEGORY", payload: category });

    setTimeout(() => goToNextStep(), 300);
  };

  const handleIndividualServiceSelect = async (service: PublicService) => {
    console.log('📅 Selected individual service (fixed booking):', service);
    dispatch({ type: "SELECT_SERVICE", payload: service });

    setTimeout(() => goToNextStep(), 300);
  };

  const handleServiceSelect = async (service: PublicService) => {
    // For now, all services in the filteredServices array are individual services
    // since categories are handled separately
    await handleIndividualServiceSelect(service);
  };



  // Filter services based on search and filters
  const filteredServices = useMemo(() => {
    return parsedServices.individualServices.filter((service: PublicService) => {
      const serviceName = service.name || "";
      const serviceDescription = service.description || "";
      const matchesSearch =
        serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        serviceDescription.toLowerCase().includes(searchQuery.toLowerCase());

      const serviceCategory = service.category_type || "";
      const matchesCategory =
        categoryFilter === "all" || serviceCategory === categoryFilter;

      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "free" && !service.price) ||
        (priceFilter === "paid" && service.price);

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [parsedServices.individualServices, searchQuery, categoryFilter, priceFilter]);

  // Filter categories based on search and selected category filter
  const filteredCategories = useMemo(() => {
    return parsedServices.categories.filter((category: PublicServiceCategory) => {
      const categoryName = category.name || "";
      const categoryDescription = category.description || "";
      const matchesSearch =
        categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        categoryDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.subcategories.some(sub => 
          sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (sub.description && sub.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );

      // Filter by category if one is selected
      const matchesCategory = categoryFilter === "all" || categoryName === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [parsedServices.categories, searchQuery, categoryFilter]);


  const categories = useMemo(() => {
    // Get categories from both flexible service categories and individual service types
    const flexibleCategories = parsedServices.categories.map(cat => cat.name);
    const individualServiceTypes = [
      ...new Set(parsedServices.individualServices.map((s: PublicService) => s.category_type).filter(Boolean)),
    ];
    
    const allCategories = [...new Set([...flexibleCategories, ...individualServiceTypes])];
    
    return allCategories.map((cat) => ({
      value: String(cat),
      label: String(cat),
    }));
  }, [parsedServices.categories, parsedServices.individualServices]);

  const getCategoryIcon = (type: string) => {
    if (!type) return "📋";
    switch (type.toLowerCase()) {
      case "individual":
        return "🎯";
      case "group":
        return "👥";
      case "private":
        return "🔒";
      case "therapy":
        return "🧠";
      case "fitness":
        return "💪";
      case "music":
        return "🎵";
      case "spa":
        return "💆";
      default:
        return "📋";
    }
  };

  const progressPercentage = 20;
  if (!businessInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Alert
          icon={<InfoIcon className="w-5 h-5" />}
          color="red"
          title="Business Information Missing"
          radius="md"
          className="max-w-md"
        >
          Unable to load business information. Please refresh the page and try
          again.
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-gray-50 relative">
        <LoadingOverlay visible={true} />
      </div>
    );
  }

  if (error || !services || services.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Alert
          icon={<InfoIcon className="w-5 h-5" />}
          color="blue"
          title="No Services Available"
          radius="md"
          className="max-w-md"
        >
          {error?.message ||
            "No services are currently available for booking. Please check back later or contact us directly."}
        </Alert>
      </div>
    );
  }


  const businessName = businessInfo.business_name || "Business";
  const businessType = businessInfo.business_type || "Service Provider";
  const businessAbout = businessInfo.about || "";

  const hasCategories = filteredCategories.length > 0;
  const hasIndividualServices = filteredServices.length > 0;


  const MobileBusinessHeader = () => {
    const isCompact = scrollY > 100;

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
              <span>Step 1 of 4</span>
              <span>{progressPercentage}% Complete</span>
            </div>
            <Progress value={progressPercentage} size="sm" color="green" />
          </motion.div>


          <Collapse in={isBusinessProfileExpanded && !isCompact}>
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
            </div>
          </Collapse>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full w-full bg-none relative overflow-hidden">

      <MobileBusinessHeader />

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
              <Text className="text-slate-600 text-xs lg:text-sm mb-2">
                Select a Service
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
                Choose the service you'd like to book
              </Title>
              <Text className="text-slate-600 text-xs lg:text-sm">
                Click on any service to see more details and continue with
                booking.
              </Text>
            </motion.div>
          </div>


          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:ml-8 mb-4 lg:mb-6"
          >
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <TextInput
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftSection={<SearchIcon className="w-4 h-4 text-slate-400" />}
                className="flex-1"
                classNames={{
                  input:
                    "bg-white/60 backdrop-blur-sm border-white/30 focus:border-green-300 focus:bg-white/80 transition-all duration-200",
                }}
              />

              <div className="flex gap-2 lg:gap-3">
                <Select
                  placeholder="All Categories"
                  value={categoryFilter}
                  onChange={(value) => setCategoryFilter(value || "all")}
                  data={[
                    { value: "all", label: "All Categories" },
                    ...categories,
                  ]}
                  className="min-w-36"
                  classNames={{
                    input:
                      "bg-white/60 backdrop-blur-sm border-white/30 focus:border-green-300",
                  }}
                  searchable={categories.length > 5}
                />

                <Select
                  placeholder="All Prices"
                  value={priceFilter}
                  onChange={(value) => setPriceFilter(value || "all")}
                  data={[
                    { value: "all", label: "All Prices" },
                    { value: "free", label: "Free" },
                    { value: "paid", label: "Paid" },
                  ]}
                  className="min-w-28"
                  classNames={{
                    input:
                      "bg-white/60 backdrop-blur-sm border-white/30 focus:border-green-300",
                  }}
                />
              </div>
            </div>
          </motion.div>


          <div className="flex-1 overflow-y-auto lg:ml-8 booking-mobile-content">
            <AnimatePresence mode="popLayout">
              {(!hasCategories && !hasIndividualServices) ? (
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
                    Try adjusting your search or filter criteria
                  </Text>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Service Categories (Flexible Booking) */}
                  {hasCategories && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="light" color="green" size="sm">
                          Flexible Services
                        </Badge>
                        <Text size="sm" className="text-slate-500">
                          Choose a service category to continue
                        </Text>
                      </div>
                      
                      {filteredCategories.map((category: PublicServiceCategory, index: number) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                          whileHover={{ scale: 1.02 }}
                          className="group cursor-pointer md:px-4 mt-1"
                          onClick={() => handleServiceCategorySelect(category)}
                        >
                          <Card
                            className="bg-white/70 backdrop-blur-sm border border-white/30 hover:bg-white/90 hover:border-green-200 hover:shadow-lg transition-all duration-300 group-hover:shadow-green-100/50"
                            radius="lg"
                            p="lg"
                          >
                            <div className="flex items-start gap-3 lg:gap-4">
                              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-base lg:text-lg group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300">
                                📋
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <Title
                                      order={4}
                                      className="text-sm lg:text-base font-semibold text-slate-800 group-hover:text-green-700 transition-colors duration-200 mb-1"
                                    >
                                      {category.name}
                                    </Title>

                                    {category.description && (
                                      <Text
                                        size="xs"
                                        className="text-slate-600 line-clamp-2 mb-2"
                                        lineClamp={2}
                                      >
                                        {category.description}
                                      </Text>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 lg:gap-4 mt-2 lg:mt-3">
                                  <Badge
                                    variant="light"
                                    color="green"
                                    size="xs"
                                  >
                                    {category.subcategories.length} services
                                  </Badge>
                                  <Badge
                                    variant="light"
                                    color="gray"
                                    size="xs"
                                  >
                                    Flexible Booking
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Individual Services (Fixed Booking) */}
                  {hasIndividualServices && (
                    <div className="space-y-3">
                      {hasCategories && (
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="light" color="green" size="sm">
                            Scheduled Classes
                          </Badge>
                          <Text size="sm" className="text-slate-500">
                            Fixed schedule sessions
                          </Text>
                        </div>
                      )}
                      
                      {filteredServices.map((service: PublicService, index: number) => (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: (hasCategories ? filteredCategories.length : 0 + index) * 0.1, duration: 0.4 }}
                          whileHover={{ scale: 1.02 }}
                          className="group cursor-pointer md:px-4 mt-1"
                          onClick={() => handleServiceSelect(service)}
                        >
                          <Card
                            className="bg-white/70 backdrop-blur-sm border border-white/30 hover:bg-white/90 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 group-hover:shadow-emerald-100/50"
                            radius="lg"
                            p="lg"
                          >
                            <div className="flex items-start gap-3 lg:gap-4">
                              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center text-base lg:text-lg group-hover:from-emerald-200 group-hover:to-green-200 transition-all duration-300">
                                {getCategoryIcon(service.category_type)}
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

                                    {service.description && (
                                      <Text
                                        size="xs"
                                        className="text-slate-600 line-clamp-2 mb-2"
                                        lineClamp={2}
                                      >
                                        {service.description}
                                      </Text>
                                    )}
                                  </div>

                                  <div className="text-right flex-shrink-0">
                                    {service.price ? (
                                      <Text className="text-base lg:text-lg font-bold text-emerald-600">
                                        KSh {service.price}
                                      </Text>
                                    ) : (
                                      <Badge
                                        color="green"
                                        variant="light"
                                        size="sm"
                                      >
                                        Free
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 lg:gap-4 mt-2 lg:mt-3">
                                  {service.duration_minutes && (
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                      <ClockIcon className="w-3 h-3" />
                                      <span>{service.duration_minutes} min</span>
                                    </div>
                                  )}

                                  {service.capacity && (
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                      <UserIcon className="w-3 h-3" />
                                      <span>Max {service.capacity}</span>
                                    </div>
                                  )}

                                  {service.category_type && (
                                    <Badge
                                      variant="light"
                                      color="gray"
                                      size="xs"
                                      className="capitalize"
                                    >
                                      {service.category_type}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
