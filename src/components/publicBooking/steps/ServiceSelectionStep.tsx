import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Title, 
  Text, 
  Group, 
  Stack, 
  Alert, 
  LoadingOverlay,
  TextInput,
  Select,
  Badge,
  Avatar,
  Divider,
  Card,
  Button,
  Collapse,
  Progress,
  ActionIcon
} from '@mantine/core';
import { ClockIcon, UserIcon, InfoIcon, SearchIcon, ChevronDownIcon, ChevronUpIcon } from '../bookingIcons';
import { useGetPublicBusinessServices } from '../../../hooks/reactQuery';
import { useBookingFlow } from '../PublicBookingProvider';
import { PublicService, PublicBusinessInfo } from '../../../types/clientTypes';
import { FlowKeyIcon } from '../../../assets/icons';
import { useViewportSize } from '@mantine/hooks';

interface ServiceSelectionStepProps {
  businessSlug: string;
  businessInfo: PublicBusinessInfo;
}

export function ServiceSelectionStep({ businessSlug, businessInfo }: ServiceSelectionStepProps) {
  const { state, dispatch, goToNextStep } = useBookingFlow();
  const { 
    data: services, 
    isLoading, 
    error 
  } = useGetPublicBusinessServices(businessSlug);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [expandedService, setExpandedService] = useState<string | null>(null);

  // Mobile-specific state
  const { width } = useViewportSize();
  const isMobile = width < 768;
  const [isBusinessProfileExpanded, setIsBusinessProfileExpanded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Track scroll position for mobile header morphing
  React.useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  const handleServiceSelect = (service: PublicService) => {
    dispatch({ type: 'SELECT_SERVICE', payload: service });
    // Auto-advance to next step after selection
    setTimeout(() => goToNextStep(), 300);
  };

  // Filter and search logic
  const filteredServices = useMemo(() => {
    if (!services) return [];

    return services.filter(service => {
      // Search filter - add null checks
      const serviceName = service.name || '';
      const serviceDescription = service.description || '';
      const matchesSearch = serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           serviceDescription.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter - add null check
      const serviceCategory = service.category_type || '';
      const matchesCategory = categoryFilter === 'all' || serviceCategory === categoryFilter;

      // Price filter
      const matchesPrice = priceFilter === 'all' || 
                          (priceFilter === 'free' && !service.price) ||
                          (priceFilter === 'paid' && service.price);

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [services, searchQuery, categoryFilter, priceFilter]);

  // Get unique categories for filter with proper null checks
  const categories = useMemo(() => {
    if (!services) return [];
    const uniqueCategories = [...new Set(services.map(s => s.category_type).filter(Boolean))];
    return uniqueCategories.map(cat => ({ 
      value: cat, 
      label: cat && typeof cat === 'string' ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'Unknown' 
    }));
  }, [services]);

  const getCategoryIcon = (type: string) => {
    if (!type) return '📋';
    switch (type.toLowerCase()) {
      case 'individual': return '🎯';
      case 'group': return '👥';
      case 'private': return '🔒';
      case 'therapy': return '🧠';
      case 'fitness': return '💪';
      case 'music': return '🎵';
      case 'spa': return '💆';
      default: return '📋';
    }
  };

  // Calculate progress percentage
  const progressPercentage = 20; // Step 1 of 4

  // Add error boundary for production safety
  if (!businessInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Alert 
          icon={<InfoIcon className="w-5 h-5" />} 
          color="red" 
          title="Business Information Missing"
          radius="md"
          className="max-w-md"
        >
          Unable to load business information. Please refresh the page and try again.
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
        <LoadingOverlay visible={true} />
      </div>
    );
  }

  if (error || !services || services.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Alert 
          icon={<InfoIcon className="w-5 h-5" />} 
          color="blue" 
          title="No Services Available"
          radius="md"
          className="max-w-md"
        >
          {error?.message || 'No services are currently available for booking. Please check back later or contact us directly.'}
        </Alert>
      </div>
    );
  }

  // Safe business name access with fallback
  const businessName = businessInfo.business_name || 'Business';
  const businessType = businessInfo.business_type || 'Service Provider';
  const businessAbout = businessInfo.about || '';

  // Mobile morphing header component
  const MobileBusinessHeader = () => {
    const isCompact = scrollY > 100;
    
    return (
      <motion.div
        className="lg:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-white/20"
        animate={{
          height: isCompact ? 80 : isBusinessProfileExpanded ? 'auto' : 120,
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
                <span className={`font-bold text-white ${isCompact ? 'text-lg' : 'text-xl'}`}>
                  {businessName.charAt(0).toUpperCase()}
                </span>
              </motion.div>
              
              <div className="flex-1">
                <motion.div
                  animate={{
                    fontSize: isCompact ? '16px' : '18px',
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
                    className="text-sm text-slate-600"
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
                  onClick={() => setIsBusinessProfileExpanded(!isBusinessProfileExpanded)}
                  className="text-slate-600"
                >
                  {isBusinessProfileExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </ActionIcon>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          <motion.div
            className="mt-3"
            animate={{ opacity: isCompact ? 0.7 : 1 }}
          >
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>Step 1 of 4</span>
              <span>{progressPercentage}% Complete</span>
            </div>
            <Progress value={progressPercentage} size="sm" color="teal" />
          </motion.div>
          
          {/* Expandable details */}
          <Collapse in={isBusinessProfileExpanded && !isCompact}>
            <div className="mt-4 space-y-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <Text className="text-sm font-medium text-slate-800 mb-1">About</Text>
                <Text className="text-xs text-slate-600 line-clamp-2">
                  {businessAbout || 'Professional service provider offering quality experiences.'}
                </Text>
              </div>
            </div>
          </Collapse>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Mobile Header */}
      <MobileBusinessHeader />
      
      <div className="flex flex-col lg:flex-row h-full relative z-10">
        {/* LEFT SECTION - Business Profile (Desktop Only) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="hidden lg:block w-96 flex-shrink-0 pr-8 business-section"
        >
          {/* Business Logo & Info */}
          <div className="space-y-6">
            {/* Business Avatar with Gradient */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative mx-auto w-fit"
            >
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl border-4 border-white/50 business-logo">
                <span className="text-3xl font-bold text-white relative z-10">
                  {businessName.charAt(0).toUpperCase()}
                </span>
              </div>
              {/* Decorative elements */}
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-3xl blur-xl"></div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center space-y-3"
            >
              <Title 
                order={1} 
                className="text-2xl font-bold text-slate-900 leading-tight"
              >
                {businessName}
              </Title>
              
              <Badge 
                variant="light" 
                color="gray" 
                size="lg"
                className="bg-slate-100 text-slate-700 border border-slate-200"
                style={{ textTransform: 'capitalize' }}
              >
                {businessType}
              </Badge>
              
              {businessAbout && (
                <Text 
                  size="sm" 
                  className="text-slate-700 leading-relaxed px-2"
                >
                  {businessAbout}
                </Text>
              )}
            </motion.div>

            {/* How it works section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/40 backdrop-blur-sm rounded-2xl p-7 border border-white/20"
            >
              <Title order={4} className="text-slate-800 mb-4 text-base">
                How it works
              </Title>
              <Stack gap="md">
                <Text size="xs" className="text-slate-600 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-medium flex-shrink-0">1</span>
                  <span>Select a service from the available options</span>
                </Text>
                <Text size="xs" className="text-slate-600 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-medium flex-shrink-0">2</span>
                  <span>Choose your preferred date and time</span>
                </Text>
                <Text size="xs" className="text-slate-600 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-medium flex-shrink-0">3</span>
                  <span>Fill in your details to complete booking</span>
                </Text>
              </Stack>
            </motion.div>

            {/* Powered by */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center pt-6"
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

        {/* RIGHT SECTION - Service Selection */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="flex-1 p-4 lg:p-8 lg:pl-0 flex flex-col min-h-0"
        >
          {/* Header with Welcome Back styling */}
          <div className="mb-6 lg:mb-8 lg:ml-8 lg:mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Text className="text-slate-600 text-sm lg:text-base mb-2">
                Select a Service
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
                Choose the service you'd like to book
              </Title>
              <Text className="text-slate-600 text-sm lg:text-base">
                Click on any service to see more details and continue with booking.
              </Text>
            </motion.div>
          </div>

          {/* Search and Filters */}
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
                  input: "bg-white/60 backdrop-blur-sm border-white/30 focus:border-emerald-300 focus:bg-white/80 transition-all duration-200"
                }}
              />
              
              <div className="flex gap-2 lg:gap-3">
                <Select
                  placeholder="All Categories"
                  value={categoryFilter}
                  onChange={(value) => setCategoryFilter(value || 'all')}
                  data={[
                    { value: 'all', label: 'All Categories' },
                    ...categories
                  ]}
                  className="min-w-36"
                  classNames={{
                    input: "bg-white/60 backdrop-blur-sm border-white/30 focus:border-emerald-300"
                  }}
                />
                
                <Select
                  placeholder="All Prices"
                  value={priceFilter}
                  onChange={(value) => setPriceFilter(value || 'all')}
                  data={[
                    { value: 'all', label: 'All Prices' },
                    { value: 'free', label: 'Free' },
                    { value: 'paid', label: 'Paid' }
                  ]}
                  className="min-w-28"
                  classNames={{
                    input: "bg-white/60 backdrop-blur-sm border-white/30 focus:border-emerald-300"
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Services List */}
          <div className="flex-1 overflow-y-auto lg:ml-8 booking-mobile-content">
            <AnimatePresence mode="popLayout">
              {filteredServices.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 lg:py-12"
                >
                  <div className="text-4xl lg:text-6xl mb-4">🔍</div>
                  <Title order={3} className="text-slate-700 mb-2">No services found</Title>
                  <Text className="text-slate-500">
                    Try adjusting your search or filter criteria
                  </Text>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3 lg:space-y-4"
                >
                  {filteredServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      className="group cursor-pointer"
                      onClick={() => handleServiceSelect(service)}
                    >
                      <Card
                        className="bg-white/70 backdrop-blur-sm border border-white/30 hover:bg-white/90 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 group-hover:shadow-emerald-100/50"
                        radius="lg"
                        p="lg"
                      >
                        <div className="flex items-start gap-3 lg:gap-4">
                          {/* Service Icon */}
                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center text-lg lg:text-xl group-hover:from-emerald-200 group-hover:to-green-200 transition-all duration-300">
                            {getCategoryIcon(service.category_type)}
                          </div>

                          {/* Service Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <Title 
                                  order={3} 
                                  className="text-base lg:text-lg font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors duration-200 mb-1"
                                >
                                  {service.name}
                                </Title>
                                
                                {service.description && (
                                  <Text 
                                    className="text-xs lg:text-sm text-slate-600 line-clamp-2 mb-2"
                                    lineClamp={2}
                                  >
                                    {service.description}
                                  </Text>
                                )}
                              </div>

                              {/* Price */}
                              <div className="text-right flex-shrink-0">
                                {service.price ? (
                                  <Text className="text-lg lg:text-xl font-bold text-emerald-600">
                                    KSh {service.price}
                                  </Text>
                                ) : (
                                  <Badge color="green" variant="light" size="sm">
                                    Free
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Service Meta */}
                            <div className="flex items-center gap-3 lg:gap-4 mt-2 lg:mt-3">
                              {service.duration_minutes && (
                                <div className="flex items-center gap-1 text-xs lg:text-sm text-slate-500">
                                  <ClockIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                                  <span>{service.duration_minutes} min</span>
                                </div>
                              )}
                              
                              {service.capacity && (
                                <div className="flex items-center gap-1 text-xs lg:text-sm text-slate-500">
                                  <UserIcon className="w-3 h-3 lg:w-4 lg:h-4" />
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 