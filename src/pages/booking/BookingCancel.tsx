import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Paper, 
  Text, 
  Button, 
  Group, 
  Textarea, 
  Loader,
  Stack,
  Badge,
  Title,
  Divider,
  Card,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconInfoCircle,
  IconCheck,
  IconTrash,
  IconMapPin,
  IconUser,
  IconX,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { 
  useGetClientBookingInfo, 
  useCancelClientBooking 
} from '../../hooks/reactQuery';
import { formatBookingTimeRange } from '../../utils/timezone';
import { withBranding } from '../../hoc/withBranding';
import { useTimezone } from '../../contexts/TimezoneContext';
import { useViewportSize } from '@mantine/hooks';
import { DateTime } from 'luxon';
import { FlowKeyIcon } from '../../assets/icons';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4, 
      ease: 'easeOut',
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3 }
  }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

const shimmerVariants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear'
    }
  }
};

const BookingCancel: React.FC = () => {
  const { bookingReference } = useParams<{ bookingReference: string }>();
  const navigate = useNavigate();
  const { width } = useViewportSize();
  const isMobile = width < 768;
  const { state: timezoneState } = useTimezone();
  
  const [reason, setReason] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const { data: bookingInfo, isLoading, error } = useGetClientBookingInfo(bookingReference!);
  const cancelMutation = useCancelClientBooking();

  // Handle time display with proper null checks for current booking
  const currentTimeDisplay = React.useMemo(() => {
    if (!bookingInfo?.start_time || !bookingInfo?.end_time) {
      return 'Time not available';
    }
    
    try {
      // If these are just time strings (HH:MM format), use them directly
      if (bookingInfo.start_time.length <= 8 && !bookingInfo.start_time.includes('T')) {
        const start = bookingInfo.start_time;
        const end = bookingInfo.end_time;
        const timezone = bookingInfo.client_timezone || 'Africa/Nairobi';
        
        // Format based on user preference
        const timeFormat = timezoneState.use24Hour ? 'HH:mm' : 'h:mm a';
        const formattedStart = DateTime.fromFormat(start, 'HH:mm').toFormat(timeFormat);
        const formattedEnd = DateTime.fromFormat(end, 'HH:mm').toFormat(timeFormat);
        
        return `${formattedStart} - ${formattedEnd} (${timezone})`;
      }
      
      // For full datetime strings, use the timezone conversion function
      return formatBookingTimeRange(
        bookingInfo.start_time,
        bookingInfo.end_time,
        bookingInfo.client_timezone || 'Africa/Nairobi',
        'Africa/Nairobi',
        bookingInfo.date
      );
    } catch (error) {
      console.error('Error formatting booking time:', error);
      return `${bookingInfo.start_time} - ${bookingInfo.end_time}`;
    }
  }, [bookingInfo, timezoneState.use24Hour]);

  const handleCancel = async () => {
    if (!bookingReference) return;

    try {
      await cancelMutation.mutateAsync({
        bookingReference,
        reason: reason.trim() || undefined
      });

      notifications.show({
        title: 'Booking Cancelled',
        message: 'Your booking has been successfully cancelled.',
        color: 'green',
        icon: <IconCheck size={16} />
      });

      // Navigate to success page
      navigate('/booking/cancelled', { 
        state: { 
          bookingReference,
          sessionTitle: bookingInfo?.session_title,
          reason: reason.trim() || undefined
        }
      });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to cancel booking. Please try again.'
        : 'Failed to cancel booking. Please try again.';
      
      notifications.show({
        title: 'Cancellation Failed',
        message: errorMessage,
        color: 'red'
      });
    }
  };

  const businessName = bookingInfo?.business?.name || 'Business';
  const businessLetter = businessName.charAt(0).toUpperCase();

  if (isLoading) {
    return (
      <div className="h-full w-full relative overflow-hidden">
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <Paper p="xl" radius="xl" shadow="lg" className="text-center relative overflow-hidden">
              {/* Shimmer Effect */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  style={{ width: '200%' }}
                />
              </div>
              
              <Stack gap="md" align="center" className="relative z-10">
                <ThemeIcon size="xl" variant="light" color="blue" radius="xl">
                  <Loader size="md" />
                </ThemeIcon>
                <Text className="text-gray-700 font-medium">Loading booking details...</Text>
              </Stack>
        </Paper>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !bookingInfo) {
    return (
      <div className="h-full w-full relative overflow-hidden">
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
          >
            <Paper p="xl" radius="xl" shadow="lg" className="text-center relative overflow-hidden bg-gradient-to-br from-white via-white to-red-50/30">
              <Stack gap="lg" align="center">
                <ThemeIcon size="xl" variant="light" color="red" radius="xl">
                  <IconX size={32} />
                </ThemeIcon>
                
                <div>
                  <Title order={3} className="text-gray-900 mb-2">Booking Not Found</Title>
                  <Text className="text-gray-600">
            The booking reference could not be found or may have already been cancelled.
                  </Text>
                </div>
                
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button 
                    variant="gradient" 
                    gradient={{ from: 'blue', to: 'cyan' }}
                    onClick={() => navigate('/')}
                    size="md"
                    radius="md"
                  >
              Return Home
            </Button>
                </motion.div>
              </Stack>
        </Paper>
          </motion.div>
        </div>
      </div>
    );
  }

  // Check if booking is already cancelled
  if (bookingInfo.status === 'cancelled') {
    return (
      <div className="h-full w-full relative overflow-hidden">
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
          >
            <Paper p="xl" radius="xl" shadow="lg" className="text-center relative overflow-hidden bg-gradient-to-br from-white via-white to-orange-50/30">
              <Stack gap="lg" align="center">
                <ThemeIcon size="xl" variant="light" color="orange" radius="xl">
                  <IconAlertTriangle size={32} />
                </ThemeIcon>
                
                <div>
                  <Title order={3} className="text-gray-900 mb-2">Already Cancelled</Title>
                  <Text className="text-gray-600 text-center max-w-md">
                    This booking has already been cancelled. No further action is needed.
                  </Text>
                </div>
                
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button 
                    variant="gradient" 
                    gradient={{ from: 'blue', to: 'cyan' }}
                    onClick={() => navigate('/')}
                    size="md"
                    radius="md"
                  >
              Return Home
            </Button>
                </motion.div>
              </Stack>
        </Paper>
          </motion.div>
        </div>
      </div>
    );
      }
      
  // Confirmation step
  if (isConfirming) {
    return (
      <div className="h-full w-full relative overflow-hidden">
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            className="w-full max-w-2xl px-4"
          >
            <Paper p="xl" radius="xl" shadow="lg" className="relative overflow-hidden bg-gradient-to-br from-white via-white to-red-50/30">
              <Stack gap="lg">
                <div className="text-center">
                  <ThemeIcon size="xl" variant="light" color="red" radius="xl" className="mb-4 mx-auto">
                    <IconTrash size={32} />
                  </ThemeIcon>
                  
                  <Title order={2} className="text-gray-900 mb-2">Confirm Cancellation</Title>
                  <Text className="text-gray-600">
                    Are you sure you want to cancel this booking? This action cannot be undone.
                  </Text>
                </div>
                
                {/* Booking Details Summary */}
                <Card className="bg-gray-50 border-2 border-gray-200" radius="lg" p="lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                      <IconCalendar size={20} className="text-red-600" />
                    </div>
                    <div className="flex-1">
                      <Title order={4} className="text-slate-800 mb-1">
                        {bookingInfo.session?.title || bookingInfo.session_title}
                      </Title>
                      <Text className="text-slate-600 text-sm">
                        {businessName}
                      </Text>
                    </div>
                    <Badge variant="light" color="red">
                      To be cancelled
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <IconCalendar size={14} />
                      <span>{bookingInfo.session?.date || bookingInfo.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconClock size={14} />
                      <span>{currentTimeDisplay}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconMapPin size={14} />
                      <span>{bookingInfo.session?.location || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconUser size={14} />
                      <span>{bookingInfo.quantity} {bookingInfo.quantity === 1 ? 'person' : 'people'}</span>
                    </div>
                  </div>
                </Card>

                {/* Reason */}
                {reason && (
                  <Card className="bg-orange-50 border border-orange-200" radius="lg" p="md">
                    <Text className="font-medium text-orange-800 mb-2">Cancellation Reason:</Text>
                    <Text className="text-orange-700 text-sm">{reason}</Text>
                  </Card>
            )}

                {/* Action Buttons */}
                <Group justify="center" gap="lg" className="pt-4">
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button 
                variant="outline" 
                onClick={() => setIsConfirming(false)}
                disabled={cancelMutation.isPending}
                      size="lg"
                      radius="md"
                      className="px-8"
              >
                Go Back
              </Button>
                  </motion.div>
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button 
                color="red" 
                onClick={handleCancel}
                loading={cancelMutation.isPending}
                      leftSection={<IconTrash size={18} />}
                      size="lg"
                      radius="md"
                      className="px-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                      Confirm Cancellation
              </Button>
                  </motion.div>
            </Group>
          </Stack>
        </Paper>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative overflow-hidden">
      <div className="flex flex-col lg:flex-row h-full relative z-10 bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* LEFT SECTION - Business Profile & Current Booking Summary (Desktop Only) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="hidden lg:block w-96 flex-shrink-0 pr-8 p-8 business-section"
        >
          <div className="space-y-6">
            {/* Business Logo with Shimmer */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative mx-auto w-fit"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl border-4 border-white/50 business-logo relative overflow-hidden">
                <span className="text-2xl font-bold text-white relative z-10">
                  {businessLetter}
                </span>
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  style={{ width: '200%' }}
                />
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
                Service Provider
              </Badge>
            </motion.div>

            {/* Current Booking Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                  <IconCalendar size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <Title order={4} className="text-slate-800 mb-1 text-base">
                    Your Booking
                  </Title>
                  <Text className="text-slate-600 text-sm font-medium">
                    {bookingInfo.session?.title || bookingInfo.session_title}
                  </Text>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <IconCalendar size={14} />
                  <span>{bookingInfo.session?.date || bookingInfo.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconClock size={14} />
                  <span>{currentTimeDisplay}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconMapPin size={14} />
                  <span>{bookingInfo.session?.location || 'Location not specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconUser size={14} />
                  <span>{bookingInfo.quantity} {bookingInfo.quantity === 1 ? 'person' : 'people'}</span>
                </div>
              </div>
              
              <Divider className="my-4" />
              
              <div className="flex items-center justify-between">
                <Badge color="blue" variant="light">
                  {bookingInfo.status.charAt(0).toUpperCase() + bookingInfo.status.slice(1)}
                </Badge>
                <Badge color="green" variant="light" size="xs">
                  Ref: {bookingInfo.booking_reference}
                </Badge>
              </div>
            </motion.div>

            {/* Cancellation Policy Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-orange-50/80 backdrop-blur-sm rounded-2xl p-4 border border-orange-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <IconInfoCircle size={16} className="text-orange-600" />
                <Text className="font-semibold text-orange-800 text-sm">Cancellation Policy</Text>
              </div>
              <div className="space-y-1 text-xs text-orange-700">
                <Text>• Cancellations are processed immediately</Text>
                <Text>• Refund policy depends on business terms</Text>
                <Text>• You'll receive a confirmation email</Text>
              </div>
            </motion.div>

            {/* Powered by */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
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

        {/* RIGHT SECTION - Cancellation Form */}
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
                  leftSection={<IconArrowLeft className="w-4 h-4" />}
                  onClick={() => navigate(-1)}
                  className="text-slate-600 hover:text-slate-800 p-0"
                >
                  Back
                </Button>
              </div>
              <Text className="text-slate-600 text-sm lg:text-base mb-2">
                Cancel Your Booking
              </Text>
              <Title 
                order={1} 
                className="text-2xl lg:text-4xl font-bold text-slate-900 mb-2 lg:mb-4"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                We're sorry to see you go
              </Title>
              <Text className="text-slate-600 text-sm lg:text-base">
                Let us know why you're cancelling to help us improve our service.
              </Text>
            </motion.div>
                  </div>

          {/* Cancellation Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:ml-8 flex-1"
          >
            <Card
              className="bg-white/70 backdrop-blur-sm border border-white/30 h-full"
              radius="lg"
              p="lg"
            >
              <Stack gap="lg">
                <div>
                  <Title order={3} className="text-lg font-semibold text-slate-800 mb-4">
                    Reason for Cancellation
                  </Title>
                  
                  <Text className="text-slate-600 text-sm mb-4">
                    Help us understand why you're cancelling (optional)
                  </Text>
                  
            <Textarea
                    placeholder="Let us know why you're cancelling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
                    minRows={4}
                    maxRows={6}
                    radius="md"
                    className="mb-2"
                  />
                  
                  <Text size="xs" className="text-slate-500">
                    This feedback helps us improve our service and may be shared with the business.
            </Text>
                </div>

                {/* Alternative Actions */}
                <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200/50">
                  <Text className="font-semibold text-blue-800 mb-3">Before you cancel, consider:</Text>
                  <div className="space-y-2">
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button 
              variant="outline" 
                        onClick={() => navigate(`/booking/manage/${bookingReference}`)}
                        leftSection={<IconCalendar size={16} />}
                        className="w-full justify-start"
                        size="sm"
            >
                        Reschedule to a different time instead
            </Button>
                    </motion.div>
                  </div>
                </div>
                
                {/* Cancel Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-auto pt-6 border-t border-slate-200"
                >
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button 
              onClick={() => setIsConfirming(true)}
                      size="lg"
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold"
                      leftSection={<IconTrash size={18} />}
            >
                      Cancel This Booking
            </Button>
                  </motion.div>
                </motion.div>
        </Stack>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default withBranding(BookingCancel, { showHelpText: false }); 