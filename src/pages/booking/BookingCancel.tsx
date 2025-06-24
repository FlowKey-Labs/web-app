import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Text, 
  Button, 
  Textarea, 
  Badge,
  Title,
  Divider,
  TextInput,
  Alert,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCalendar,
  IconInfoCircle,
  IconCheck,
  IconTrash,
  IconX,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { 
  useGetClientBookingInfo, 
  useCancelClientBooking 
} from '../../hooks/reactQuery';
import { withBranding } from '../../hoc/withBranding';
import { useTimezone } from '../../contexts/TimezoneContext';
import { DateTime } from 'luxon';
import { FlowKeyIcon } from '../../assets/icons';
import AnimatedKeyIcon from '../../components/common/AnimatedKeyIcon';
import { 
  ArrowLeftIcon,
  CheckIcon,
  InfoIcon,
  UserIcon,
  EmailIcon,
  PhoneIcon,
  CalendarIcon
} from '../../components/publicBooking/bookingIcons';
import { RescheduleInfo } from '../../types/clientTypes';

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

// Enhanced Business Profile Component (reused from BookingManage)
interface EnhancedBusinessProfileProps {
  businessInfo: RescheduleInfo['business'];
  bookingInfo: RescheduleInfo['current_booking'];
}

const EnhancedBusinessProfile = ({ businessInfo, bookingInfo }: EnhancedBusinessProfileProps) => {
  const businessName = businessInfo?.name || 'Business';
  const businessLetter = businessName.charAt(0).toUpperCase();

  return (
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
        <Title order={3} className="text-base font-bold text-slate-900 leading-tight">
          {businessName}
        </Title>
        
        <Badge 
          variant="light" 
          color="gray" 
          size="md"
          className="bg-slate-100 text-slate-700 border border-slate-200"
          style={{ textTransform: "capitalize" }}
        >
          {businessInfo.business_type || 'Service Provider'}
        </Badge>

        {/* Business details */}
        {businessInfo.address && (
          <Text size="xs" className="text-slate-600 leading-relaxed text-center">
            📍 {businessInfo.address}
          </Text>
        )}
      </motion.div>

      {/* Current Booking Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30"
      >
        <div className='mb-4'>
          <Text size="xs" fw={600} className="text-slate-700 uppercase tracking-wide mb-3">
            YOUR BOOKING
          </Text>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <Text size="sm" fw={600} className="text-slate-900 leading-tight truncate">
                {bookingInfo.session.title}
              </Text>
              <Text size="xs" className="text-slate-600">
                Ref: {bookingInfo.booking_reference}
              </Text>
            </div>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <Text className="text-slate-600">Date:</Text>
              <Text fw={600} className="text-slate-900">
                {DateTime.fromISO(bookingInfo.session.start_time).toFormat('DDD')}
              </Text>
            </div>
            <div className="flex items-center justify-between">
              <Text className="text-slate-600">Time:</Text>
              <Text fw={600} className="text-slate-900">
                {DateTime.fromISO(bookingInfo.session.start_time).toFormat('h:mm a')} - {DateTime.fromISO(bookingInfo.session.end_time).toFormat('h:mm a')}
              </Text>
            </div>
            <div className="flex items-center justify-between">
              <Text className="text-slate-600">Duration:</Text>
              <Text fw={600} className="text-slate-900">
                {bookingInfo.session.duration_minutes ||
                 (bookingInfo.session.start_time && bookingInfo.session.end_time ? 
                   Math.round((DateTime.fromISO(bookingInfo.session.end_time).toMillis() - DateTime.fromISO(bookingInfo.session.start_time).toMillis()) / (1000 * 60)) : 
                   60
                 )} min
              </Text>
            </div>
            {bookingInfo.session.location && (
              <div className="flex items-center justify-between">
                <Text className="text-slate-600">Location:</Text>
                <Text fw={600} className="text-slate-900 truncate max-w-[120px]">
                  {bookingInfo.session.location}
                </Text>
              </div>
            )}
            {bookingInfo.flexible_booking_info?.selected_staff && (
              <div className="flex items-center justify-between">
                <Text className="text-slate-600">Staff:</Text>
                <Text fw={600} className="text-slate-900 truncate max-w-[120px]">
                  {bookingInfo.flexible_booking_info.selected_staff.name}
                </Text>
              </div>
            )}
          </div>
        </div>

        <Divider className="my-3" />
        
        <div className="flex items-center justify-between">
          <Badge color="blue" variant="light" size="sm">
            {bookingInfo.status.charAt(0).toUpperCase() + bookingInfo.status.slice(1)}
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

      {/* Powered by FlowKey Footer */}
      <div
        className="mt-auto p-4"
        style={{
          borderTop: "1px solid #e2e8f0",
          background: "rgba(248, 250, 252, 0.8)",
          backdropFilter: "blur(8px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-1">
            <Text size="xs" className="text-slate-500">
              Powered by
            </Text>
            <div className="flex items-center gap-1">
              <FlowKeyIcon className="w-4 h-auto opacity-60" />
              <Text size="xs" className="text-slate-600 font-medium">
                FlowKey
              </Text>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Mobile Business Header Component (reused from BookingManage)
interface MobileBusinessHeaderProps {
  businessInfo: RescheduleInfo['business'];
  bookingInfo: RescheduleInfo['current_booking'];
  businessName: string;
}

const MobileBusinessHeader: React.FC<MobileBusinessHeaderProps> = ({ 
  businessInfo, 
  bookingInfo, 
  businessName 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { state: timezoneState } = useTimezone();
  
  // Get timezone abbreviation
  const getTimezoneAbbr = () => {
    if (timezoneState.selectedTimezone === 'Africa/Nairobi') {
      return "EAT";
    } else {
      try {
        return DateTime.now().setZone(timezoneState.selectedTimezone).toFormat('ZZZZ');
      } catch {
        return "UTC";
      }
    }
  };

  return (
    <div className="lg:hidden border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      {/* Collapsed State */}
      <motion.div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        animate={{
          backgroundColor: !isExpanded ? 
            ["rgba(255, 255, 255, 0.8)", "rgba(240, 253, 244, 0.9)", "rgba(255, 255, 255, 0.8)"] : 
            "rgba(255, 255, 255, 0.8)"
        }}
        transition={{
          backgroundColor: { repeat: Infinity, duration: 3, ease: "easeInOut" }
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {businessName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <Text className="font-bold text-slate-900 text-sm truncate leading-tight">
              {businessName}
            </Text>
            {/* Essential booking info in condensed state */}
            <div className="text-xs text-emerald-600 font-medium">
              {bookingInfo.session?.start_time && bookingInfo.session?.end_time ? 
                `${DateTime.fromISO(bookingInfo.session.start_time).toFormat('MMM dd')} • ${DateTime.fromISO(bookingInfo.session.start_time).toFormat('HH:mm')}-${DateTime.fromISO(bookingInfo.session.end_time).toFormat('HH:mm')} ${getTimezoneAbbr()}` :
                `Ref: ${bookingInfo.booking_reference}`
              }
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.div
            className="flex items-center justify-center w-8 h-8 rounded-full"
            animate={{
              scale: !isExpanded ? [1, 1.1, 1] : 1,
              background: !isExpanded ? 
                ["rgba(16, 185, 129, 0)", "rgba(16, 185, 129, 0.1)", "rgba(16, 185, 129, 0)"] : 
                "rgba(16, 185, 129, 0)"
            }}
            transition={{
              scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
              background: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-slate-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.div>
          <motion.div
            className="text-xs text-slate-400 font-medium"
            animate={{
              color: !isExpanded ? ["#94a3b8", "#059669", "#94a3b8"] : "#94a3b8"
            }}
            transition={{
              color: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            }}
          >
            {isExpanded ? 'Less' : 'More'}
          </motion.div>
        </div>
      </motion.div>

      {/* Expanded State */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden bg-slate-50/80"
      >
        <div className="p-4 pt-0">
          <div className="flex justify-end mb-3">
            <Badge 
              size="sm" 
              variant="light" 
              className="bg-slate-100 text-slate-700"
            >
              {businessInfo?.business_type?.toUpperCase() || 'THERAPY'}
            </Badge>
          </div>
          
          <div className="bg-white/60 rounded-lg p-4 border border-white/50">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Date:</span>
                <span className="font-medium text-slate-800 text-right max-w-[180px]">
                  {bookingInfo.session?.start_time ? 
                    DateTime.fromISO(bookingInfo.session.start_time).toFormat('EEEE, MMM dd, yyyy') : 
                    'TBD'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Time:</span>
                <div className="text-right">
                  <div className="font-medium text-slate-800">
                    {bookingInfo.session?.start_time && bookingInfo.session?.end_time ? 
                      `${DateTime.fromISO(bookingInfo.session.start_time).toFormat('HH:mm')} - ${DateTime.fromISO(bookingInfo.session.end_time).toFormat('HH:mm')}` :
                      `${bookingInfo.session?.start_time} - ${bookingInfo.session?.end_time}`
                    }
                  </div>
                  <div className="text-xs text-emerald-600 font-semibold mt-0.5">
                    {getTimezoneAbbr()}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Duration:</span>
                <span className="font-medium text-slate-800">
                  {bookingInfo.session?.duration_minutes ||
                   (bookingInfo.session?.start_time && bookingInfo.session?.end_time ? 
                     Math.round((DateTime.fromISO(bookingInfo.session.end_time).toMillis() - DateTime.fromISO(bookingInfo.session.start_time).toMillis()) / (1000 * 60)) : 
                     60
                   )} minutes
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Location:</span>
                <span className="font-medium text-slate-800 text-right max-w-[180px] truncate">
                  {bookingInfo.session?.location || 'Main Location'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const BookingCancel: React.FC = () => {
  const { bookingReference } = useParams<{ bookingReference: string }>();
  const navigate = useNavigate();
  
  // Component state
  const [step, setStep] = useState<'identity-verification' | 'confirmation'>('identity-verification');
  const [reason, setReason] = useState('');
  
  // Identity verification state
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    email: string | null;
    phone: string | null;
  }>({
    email: null,
    phone: null,
  });

  const { data: bookingInfo, isLoading, error } = useGetClientBookingInfo(bookingReference!);
  const cancelMutation = useCancelClientBooking();

  // Validation functions
  const validateEmail = useCallback((email: string): string | null => {
    if (!email.trim()) {
      return 'Email address is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    return null;
  }, []);

  const validatePhone = useCallback((phone: string): string | null => {
    if (!phone.trim()) {
      return 'Phone number is required';
    }
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return 'Phone number must be at least 10 digits';
    }
    if (digitsOnly.length > 15) {
      return 'Phone number must be no more than 15 digits';
    }
    return null;
  }, []);

  const validateForm = useCallback((): boolean => {
    const emailError = validateEmail(clientEmail);
    const phoneError = validatePhone(clientPhone);
    
    setValidationErrors({
      email: emailError,
      phone: phoneError,
    });

    return !emailError && !phoneError;
  }, [clientEmail, clientPhone, validateEmail, validatePhone]);



  const handleCancel = async () => {
    if (!bookingReference) return;

    // Validate form before proceeding
    if (!validateForm()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fix the validation errors before submitting.',
        color: 'red',
        icon: <IconX size={16} />
      });
      return;
    }

    try {
      // Identity verification is handled by backend
      await cancelMutation.mutateAsync({
        bookingReference,
        reason: reason.trim() || undefined,
        client_email: clientEmail.trim(),
        client_phone: clientPhone.trim()
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
          sessionTitle: bookingInfo?.session?.title,
          businessName: bookingInfo?.business?.name,
          reason: reason.trim() || undefined
        }
      });
    } catch (error: unknown) {
      let errorMessage = 'Failed to cancel booking. Please try again.';
      
      // Type guard for error with response property
      const errorWithResponse = error as { response?: { data?: { code?: string; error?: string; message?: string } } };
      
      if (errorWithResponse?.response?.data?.code === 'IDENTITY_VERIFICATION_FAILED' ||
          errorWithResponse?.response?.data?.message?.includes('verification failed') ||
          errorWithResponse?.response?.data?.message?.includes('not match')) {
        // For identity verification failures, just show an error without navigating away
        // This allows the user to correct their input and try again
        notifications.show({
          title: 'Identity Verification Failed',
          message: errorWithResponse?.response?.data?.message || 'The email and phone number you provided do not match our records. Please double-check and try again.',
          color: 'red',
          icon: <IconX size={16} />,
          autoClose: 8000,
        });
        
        // Focus on the first field to help user retry
        setTimeout(() => {
          (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus();
        }, 100);
        return; // Don't navigate away - let user retry
      } else if (errorWithResponse?.response?.data?.error) {
        errorMessage = errorWithResponse.response.data.error;
      }
      
      notifications.show({
        title: 'Cancellation Failed',
        message: errorMessage,
        color: 'red',
        icon: <IconX size={16} />
      });
    }
  };

  const handleBack = () => {
    if (step === 'confirmation') {
      setStep('identity-verification');
    } else {
      navigate(-1);
    }
  };

  const handleProceedToConfirmation = () => {
    if (validateForm()) {
      setStep('confirmation');
    } else {
      // Focus on first invalid field
      setTimeout(() => {
        if (validationErrors.email) {
          (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus();
        } else if (validationErrors.phone) {
          (document.querySelector('input[type="tel"]') as HTMLInputElement)?.focus();
        } else if (!clientEmail.trim()) {
          (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus();
        } else if (!clientPhone.trim()) {
          (document.querySelector('input[type="tel"]') as HTMLInputElement)?.focus();
        }
      }, 100);
    }
  };

  const businessName = bookingInfo?.business?.name || 'Business';

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-sm mx-auto p-6"
          >
                    {/* FlowKey Logo Loading Animation */}
          <motion.div
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-white shadow-lg flex items-center justify-center relative overflow-hidden"
            animate={{ 
              boxShadow: [
                "0 10px 25px rgba(16, 185, 129, 0.1)",
                "0 20px 40px rgba(16, 185, 129, 0.2)",
                "0 10px 25px rgba(16, 185, 129, 0.1)"
              ]
            }}
            transition={{ 
              boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <AnimatedKeyIcon size={60} animated={true} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Text className="text-slate-800 font-semibold text-lg mb-2">Loading booking details</Text>
            <Text className="text-slate-600 text-sm">Please wait while we securely retrieve your information...</Text>
          </motion.div>
          </motion.div>
      </div>
    );
  }

  // Error states
  if (error || !bookingInfo) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
          className="text-center max-w-md mx-auto"
        >
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <IconX size={40} className="text-white" />
            </motion.div>
            
            <div className="space-y-4">
                <div>
                <Title order={2} className="text-slate-900 font-bold text-xl mb-2">Booking Not Found</Title>
                <Text className="text-slate-600 text-sm leading-relaxed">
            The booking reference could not be found or may have already been cancelled.
                  </Text>
                </div>
                
              <div className="pt-4">
                  <Button 
                    onClick={() => navigate('/')}
                    className="w-full font-semibold py-3 px-6 rounded-xl btn-green-primary"
                  >
              Return Home
            </Button>
        </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Check if booking is already cancelled
  if (bookingInfo.status === 'cancelled') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
          className="text-center max-w-md mx-auto"
        >
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <IconAlertTriangle size={40} className="text-white" />
            </motion.div>
            
            <div className="space-y-4">
                <div>
                <Title order={2} className="text-slate-900 font-bold text-xl mb-2">Already Cancelled</Title>
                <Text className="text-slate-600 text-sm leading-relaxed max-w-sm mx-auto">
                    This booking has already been cancelled. No further action is needed.
                  </Text>
                </div>
                
              <div className="pt-4">
                  <Button 
                    onClick={() => navigate('/')}
                    className="w-full font-semibold py-3 px-6 rounded-xl btn-green-primary"
                  >
              Return Home
            </Button>
        </div>
      </div>
                </div>
          </motion.div>
      </div>
    );
  }

  // Transform booking data to match RescheduleInfo structure
  const transformedBookingInfo = {
    booking_reference: bookingInfo.booking_reference,
    client_name: bookingInfo.client_name,
    client_email_hint: bookingInfo.client_email_hint || 'Email not available',
    client_phone_hint: bookingInfo.client_phone_hint || 'Phone not available',
    session: {
      id: bookingInfo.session.id,
      title: bookingInfo.session.title,
      start_time: `${bookingInfo.session.date}T${bookingInfo.session.start_time}`,
      end_time: `${bookingInfo.session.date}T${bookingInfo.session.end_time}`,
      duration_minutes: 60, // Default fallback
      location: bookingInfo.session.location || '',
      category_name: bookingInfo.session.category_name,
    },
    quantity: bookingInfo.quantity,
    status: bookingInfo.status,
  };
      
  // Main component layout with identity verification step
  if (step === 'confirmation') {
  return (
      <div className="min-h-screen w-full relative">
        <div className="flex flex-col lg:flex-row h-screen relative z-10">
          {/* LEFT SECTION - Business Profile (Desktop Only) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
            className="hidden lg:block w-96 flex-shrink-0 overflow-y-auto h-full p-6 business-section"
          >
            <EnhancedBusinessProfile 
              businessInfo={bookingInfo.business}
              bookingInfo={transformedBookingInfo}
            />
          </motion.div>

          {/* RIGHT SECTION - Confirmation */}
            <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="flex-1 overflow-y-auto h-full services-section flex flex-col"
          >
            {/* Mobile Business Header */}
            <MobileBusinessHeader 
              businessInfo={bookingInfo.business}
              bookingInfo={transformedBookingInfo}
              businessName={businessName}
            />

            <div className="max-w-2xl mx-auto space-y-6 lg:space-y-8 lg:ml-8 px-4 lg:px-8 py-4 lg:py-0">
              {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
                className="lg:mt-12"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    variant="subtle"
                    size="sm"
                    leftSection={<ArrowLeftIcon className="w-4 h-4" />}
                    onClick={handleBack}
                    className="p-0 btn-green-subtle"
                  >
                    Back
                  </Button>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white border-2 border-emerald-500 flex items-center justify-center shadow-lg">
                    <span className="text-lg">🚫</span>
                  </div>
                  <Text className="text-slate-600 text-xs lg:text-sm font-medium">
                    Confirm Cancellation
                  </Text>
                </div>
              <Title 
                  order={1} 
                  className="text-xl lg:text-3xl font-bold mb-2 lg:mb-4 text-slate-800"
              >
                  Confirm Your Cancellation
              </Title>
                <Text className="text-slate-600 text-xs lg:text-sm">
                  Please review your details and confirm the cancellation of your booking.
                </Text>
            </motion.div>

              {/* Booking Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
              >
                <Title order={3} className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-red-600">🚫</span>
                  Booking to Cancel
                  </Title>
                
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-red-600">❌</span>
                    <Text className="font-semibold text-red-800">Your Booking</Text>
                </div>
                  <div className="space-y-2 text-xs">
                    <div><strong>Session:</strong> {transformedBookingInfo.session.title}</div>
                    <div><strong>Date:</strong> {DateTime.fromISO(transformedBookingInfo.session.start_time).toFormat('DDDD')}</div>
                    <div><strong>Time:</strong> {DateTime.fromISO(transformedBookingInfo.session.start_time).toFormat('h:mm a')} - {DateTime.fromISO(transformedBookingInfo.session.end_time).toFormat('h:mm a')}</div>
                    <div><strong>Duration:</strong> {transformedBookingInfo.session.duration_minutes} min</div>
                    <div><strong>Location:</strong> {transformedBookingInfo.session.location}</div>
                </div>
              </div>
            </motion.div>

              {/* Reason Summary */}
              {reason && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                >
                  <Title order={3} className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-orange-600">💬</span>
                    Cancellation Reason
                  </Title>
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <Text className="text-orange-700 text-sm">{reason}</Text>
              </div>
            </motion.div>
              )}

              {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 justify-start pt-4"
              >
                <Button 
                  onClick={handleCancel}
                  loading={cancelMutation.isPending}
                  leftSection={<IconTrash size={18} />}
                  size="lg"
                  className="btn-green-primary font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
                </Button>
              </motion.div>

              {/* Error Display */}
              {cancelMutation.error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <Alert color="red" variant="light" radius="md" className="bg-red-50/80">
                    {cancelMutation.error instanceof Error
                      ? cancelMutation.error.message
                      : 'Failed to cancel booking. Please try again.'}
                  </Alert>
                </motion.div>
              )}
              </div>
            </motion.div>
          </div>
      </div>
    );
  }

  // Identity Verification Step
  return (
    <div className="min-h-screen w-full relative">
      <div className="flex flex-col lg:flex-row h-screen relative z-10">
        {/* LEFT SECTION - Business Profile (Desktop Only) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="hidden lg:block w-96 flex-shrink-0 overflow-y-auto h-full p-6 business-section"
        >
          <EnhancedBusinessProfile 
            businessInfo={bookingInfo.business}
            bookingInfo={transformedBookingInfo}
          />
        </motion.div>

        {/* RIGHT SECTION - Identity Verification Form */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="flex-1 overflow-y-auto h-full services-section flex flex-col"
        >
          {/* Mobile Business Header */}
          <MobileBusinessHeader 
            businessInfo={bookingInfo.business}
            bookingInfo={transformedBookingInfo}
            businessName={businessName}
          />

          <div className="max-w-2xl mx-auto space-y-6 lg:space-y-8 lg:ml-8 px-4 lg:px-8 py-4 lg:py-0">
          {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="lg:mt-12"
            >
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="subtle"
                  size="sm"
                  leftSection={<ArrowLeftIcon className="w-4 h-4" />}
                  onClick={handleBack}
                  className="p-0 btn-green-subtle"
                >
                  Back
                </Button>
              </div>
                              <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white border-2 border-red-500 flex items-center justify-center shadow-lg">
                    <span className="text-lg">🚫</span>
                  </div>
                  <Text className="text-slate-600 text-xs lg:text-sm font-medium">
                Cancel Your Booking
              </Text>
                </div>
              <Title 
                order={1} 
                className="text-xl lg:text-3xl font-bold mb-2 lg:mb-4"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                We're sorry to see you go
              </Title>
              <Text className="text-slate-600 text-xs lg:text-sm">
                Let us know why you're cancelling to help us improve our service.
              </Text>
            </motion.div>

            {/* Identity Verification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
            >
              <Title order={3} className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-emerald-600" />
                Verify Your Identity
              </Title>
              
              <div className="mb-6">
                <Alert 
                  color="emerald" 
                  variant="light" 
                  className="bg-emerald-50/80 border-emerald-200/50"
                  icon={<InfoIcon className="w-4 h-4 text-emerald-600" />}
                >
                  <Text size="sm" className="text-emerald-800">
                    For security, please verify your identity by providing your email address and phone number used for this booking.
                  </Text>
                  <Text size="xs" className="text-emerald-700 mt-2">
                    💡 Tip: Use the exact email and phone number from when you originally made the booking. Both fields are required and must match our records.
                  </Text>
                </Alert>
              </div>

              <div className="space-y-4">
                <TextInput
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  value={clientEmail}
                  onChange={(event) => {
                    const newEmail = event.currentTarget.value;
                    setClientEmail(newEmail);
                    if (validationErrors.email) {
                      setValidationErrors(prev => ({ ...prev, email: null }));
                    }
                  }}
                  onBlur={() => {
                    const emailError = validateEmail(clientEmail);
                    setValidationErrors(prev => ({ ...prev, email: emailError }));
                  }}
                  error={validationErrors.email}
                  leftSection={<EmailIcon className="w-4 h-4 text-slate-400" />}
                  required
                  disabled={cancelMutation.isPending}
                  description={validationErrors.email ? undefined : `Hint: ${bookingInfo.client_email_hint || 'Email not available'}`}
                  classNames={{
                    input: "bg-white/80 border-slate-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200",
                    label: "text-slate-700 font-medium"
                  }}
                />
                <TextInput
                  type="tel"
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={clientPhone}
                  onChange={(event) => {
                    const newPhone = event.currentTarget.value;
                    setClientPhone(newPhone);
                    if (validationErrors.phone) {
                      setValidationErrors(prev => ({ ...prev, phone: null }));
                    }
                  }}
                  onBlur={() => {
                    const phoneError = validatePhone(clientPhone);
                    setValidationErrors(prev => ({ ...prev, phone: phoneError }));
                  }}
                  error={validationErrors.phone}
                  leftSection={<PhoneIcon className="w-4 h-4 text-slate-400" />}
                  required
                  disabled={cancelMutation.isPending}
                  description={validationErrors.phone ? undefined : `Hint: ${bookingInfo.client_phone_hint || 'Phone not available'}`}
                  classNames={{
                    input: "bg-white/80 border-slate-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200",
                    label: "text-slate-700 font-medium"
                  }}
                />
              </div>
            </motion.div>

            {/* Cancellation Reason */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
            >
              <div className="space-y-4">
                <div>
                  <Title order={3} className="text-base font-semibold text-slate-800 mb-2">
                    Reason for Cancellation (Optional)
                  </Title>
                  <Text className="text-slate-600 text-sm">
                    Help us understand why you're cancelling to improve our service.
                  </Text>
                </div>
                  
            <Textarea
                    placeholder="Let us know why you're cancelling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
                  minRows={3}
                  maxRows={5}
                    radius="md"
                  disabled={cancelMutation.isPending}
                  classNames={{
                    input: "bg-white/80 border-slate-200 focus:border-emerald-300"
                  }}
                  />
                  
                  <Text size="xs" className="text-slate-500">
                  This feedback may be shared with the business to improve their service.
            </Text>
                </div>
            </motion.div>

                {/* Alternative Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-200/50"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <IconCalendar className="w-4 h-4 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <Text className="font-semibold text-orange-900">
                    Before you cancel, consider rescheduling instead
                  </Text>
                  <Text size="sm" className="text-orange-700">
                    Keep your appointment and simply choose a new time that works better for you.
                  </Text>
            <Button 
                    variant="light" 
                    color="orange"
                        onClick={() => navigate(`/booking/manage/${bookingReference}`)}
                        leftSection={<IconCalendar size={16} />}
                    className="bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-300"
                        size="sm"
            >
                    Reschedule Instead
            </Button>
                  </div>
                </div>
            </motion.div>
                


            {/* Action Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="pt-4"
                >
            <Button 
                onClick={handleProceedToConfirmation}
                disabled={!clientEmail.trim() || !clientPhone.trim() || !!validationErrors.email || !!validationErrors.phone || cancelMutation.isPending}
                      size="lg"
                className="w-full lg:w-auto font-semibold py-3 px-8 rounded-xl btn-green-primary shadow-lg hover:shadow-xl"
                rightSection={<CheckIcon className="w-4 h-4" />}
            >
                Proceed to Confirmation
            </Button>
                  </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default withBranding(BookingCancel, { showHelpText: false }); 