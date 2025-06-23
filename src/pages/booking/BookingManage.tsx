import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Title,
  Text,
  Alert,
  Select,
  Badge,
  Card,
  LoadingOverlay,
  Button,
  TextInput,
  Textarea,
  Paper,
  ScrollArea,
} from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import {
  ArrowLeftIcon, 
  InfoIcon, 
  ClockIcon, 
  CheckIcon,
  UserIcon,
  PhoneIcon,
  EmailIcon,
  LocationIcon 
} from '../../components/publicBooking/bookingIcons';
import { 
  useGetClientBookingInfo, 
  useGetClientRescheduleOptions, 
  useRescheduleClientBooking 
} from '../../hooks/reactQuery';
import { useTimezone } from '../../contexts/TimezoneContext';
import { RescheduleInfo, RescheduleOption } from '../../types/clientTypes';
import { TIMEZONE_OPTIONS } from '../../utils/timezone';
import { DateTime } from 'luxon';
import { FlowKeyIcon } from '../../assets/icons';
import { useViewportSize, useScrollIntoView } from '@mantine/hooks';
import { withBranding } from '../../hoc/withBranding';

// Animation variants
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

// Error Screen Component
interface RescheduleErrorScreenProps {
  bookingReference: string;
  rescheduleError: Error | null;
  onNavigateBack: () => void;
}

const RescheduleErrorScreen: React.FC<RescheduleErrorScreenProps> = ({ 
  bookingReference, 
  rescheduleError,
  onNavigateBack 
}) => {
  const navigate = useNavigate();
  
  // Load booking info independently for better error display
  const { data: bookingInfo, isLoading: bookingInfoLoading, error: bookingInfoError } = useGetClientBookingInfo(bookingReference);

  // Check if it's a reschedule not allowed error
  const isRescheduleNotAllowed = rescheduleError && 
    rescheduleError.message?.includes('cannot be rescheduled by client');

  // If we can't load booking info either, show minimal error
  if (bookingInfoLoading) {
    return (
      <div className="min-h-screen w-full relative">
        <div className="flex items-center justify-center h-screen">
          <LoadingOverlay visible={true} />
        </div>
      </div>
    );
  }

  // If no booking info available, show basic error with branding
  if (bookingInfoError || !bookingInfo) {
    return (
      <div className="min-h-screen w-full relative">
        <div className="flex flex-col lg:flex-row h-screen relative z-10">
          {/* LEFT SECTION - Minimal Business Profile */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="hidden lg:block w-96 flex-shrink-0 overflow-y-auto h-full p-6 business-section"
          >
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center mx-auto relative overflow-hidden">
                <motion.div
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent"
                />
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">?</span>
                </div>
              </div>
              <div>
                <Title order={2} className="text-xl font-bold text-slate-900 mb-2">
                  Booking Management
                </Title>
                <Text className="text-slate-600">
                  Manage your booking details
                </Text>
              </div>
            </div>

            {/* Powered by FlowKey */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-center pt-6 mt-8"
            >
              <div className="flex items-center justify-center gap-2">
                <Text size="xs" className="text-slate-500">Powered by</Text>
                <div className="flex items-center gap-1">
                  <FlowKeyIcon className="w-8 h-auto opacity-60" />
                  <Text size="xs" className="text-slate-600 font-medium">FlowKey</Text>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT SECTION - Error Message */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="flex-1 overflow-y-auto h-full p-4 lg:p-8 services-section flex items-center justify-center"
          >
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto"
              >
                <InfoIcon className="w-12 h-12 text-red-600" />
              </motion.div>

              <div className="space-y-3">
                <Title order={1} className="text-2xl lg:text-3xl font-bold text-slate-900">
                  Booking Not Found
                </Title>
                <Text size="lg" className="text-slate-600">
                  We couldn't locate your booking. Please check your booking reference and try again.
                </Text>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={onNavigateBack}
                  variant="filled"
                  size="lg"
                  className="btn-green-primary"
                  leftSection={<ArrowLeftIcon className="w-4 h-4" />}
                >
                  Go Home
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // We have booking info - show proper error with business branding
  const businessName = bookingInfo.business?.name || 'Business';
  const contactEmail = bookingInfo.business?.contact_email || 'support@example.com';

  return (
    <div className="min-h-screen w-full relative">
      <div className="flex flex-col lg:flex-row h-screen relative z-10">
        {/* LEFT SECTION - Business Profile */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="hidden lg:block w-96 flex-shrink-0 overflow-y-auto h-full p-6 business-section"
        >
          {/* Business Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center mx-auto relative overflow-hidden">
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent"
              />
              <div className="w-12 h-12 bg-emerald-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {businessName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Title order={2} className="text-xl font-bold text-slate-900">
                {businessName}
              </Title>
              <Badge 
                variant="light" 
                color="gray" 
                size="md"
                className="bg-slate-100 text-slate-700 border border-slate-200"
              >
                {bookingInfo.business?.business_type || 'Service Provider'}
              </Badge>
            </div>
          </motion.div>

          {/* Current Booking Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mt-8"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div className="flex-1">
                <Title order={4} className="text-slate-800 mb-1 text-base">
                  Your Booking
                </Title>
                <Text className="text-slate-600 text-sm font-medium">
                  {bookingInfo.session?.title}
                </Text>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Date:</span>
                <span className="font-medium">
                  {bookingInfo.session?.date}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Time:</span>
                <span className="font-medium">
                  {bookingInfo.session?.start_time} - {bookingInfo.session?.end_time}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Location:</span>
                <span className="font-medium">
                  {bookingInfo.session?.location || 'Main Location'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Reference:</span>
                <span className="font-medium text-emerald-600">
                  {bookingInfo.booking_reference}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Powered by FlowKey */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center pt-6 mt-8"
          >
            <div className="flex items-center justify-center gap-2">
              <Text size="xs" className="text-slate-500">Powered by</Text>
              <div className="flex items-center gap-1">
                <FlowKeyIcon className="w-8 h-auto opacity-60" />
                <Text size="xs" className="text-slate-600 font-medium">FlowKey</Text>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT SECTION - Error Message */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="flex-1 overflow-y-auto h-full p-4 lg:p-8 services-section flex items-center justify-center"
        >
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
              className="w-24 h-24 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto"
            >
              <InfoIcon className="w-12 h-12 text-orange-600" />
            </motion.div>

            <div className="space-y-3">
              <Title order={1} className="text-2xl lg:text-3xl font-bold text-slate-900">
                {isRescheduleNotAllowed ? 'Reschedule Not Available' : 'Unable to Load Reschedule Options'}
              </Title>
              <Text size="lg" className="text-slate-600">
                {isRescheduleNotAllowed 
                  ? "You've reached the maximum number of reschedules allowed for this booking"
                  : "We're having trouble loading your reschedule options"
                }
              </Text>
            </div>

            {/* Detailed explanation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 text-left max-w-md mx-auto"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-orange-600">ℹ️</span>
                <Text className="font-semibold text-slate-800">Possible reasons:</Text>
              </div>
              
              {isRescheduleNotAllowed ? (
                <ul className="space-y-2 text-sm text-slate-600">
                  {/* Always highlight max reschedules as the primary reason since this is why we're here */}
                  <li className="flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-200">
                    <span className="text-red-600 mt-0.5 text-lg">🚫</span>
                    <div>
                      <span className="font-bold text-red-800 block">
                        Maximum reschedules reached - This is why your booking cannot be rescheduled
                      </span>
                      <span className="text-red-700 text-sm">
                        You've used {bookingInfo.reschedule_policy?.current_reschedules || 2} of {bookingInfo.reschedule_policy?.max_reschedules || 2} allowed reschedules
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Reschedule deadline passed ({bookingInfo.reschedule_policy?.deadline_hours || 24} hours before session)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Session has already started or finished</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Booking status doesn't allow changes</span>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Temporary system issue</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>No available alternative sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Session schedule not yet published</span>
                  </li>
                </ul>
              )}
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => window.location.href = `mailto:${contactEmail}?subject=Reschedule Request - ${bookingInfo.booking_reference}&body=Hi,\n\nI would like to reschedule my booking (Reference: ${bookingInfo.booking_reference}) for ${bookingInfo.session?.title} on ${bookingInfo.session?.date}.\n\nPlease let me know available alternative times.\n\nThank you!`}
                variant="filled"
                size="lg"
                className="btn-green-primary"
                leftSection={<EmailIcon className="w-4 h-4" />}
              >
                Contact {businessName}
              </Button>
                             <Button
                 onClick={() => navigate(`/booking/cancel/${bookingReference}`)}
                 variant="light"
                 size="lg"
                 color="red"
                 leftSection={<InfoIcon className="w-4 h-4" />}
               >
                 Cancel Booking Instead
               </Button>
            </motion.div>

            {/* Mobile booking details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="lg:hidden bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30 text-left"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-emerald-600">📅</span>
                <Text className="font-semibold text-slate-800">Your Booking</Text>
              </div>
              <div className="space-y-1 text-sm text-slate-600">
                <div><strong>Service:</strong> {bookingInfo.session?.title}</div>
                <div><strong>Date:</strong> {bookingInfo.session?.date}</div>
                <div><strong>Time:</strong> {bookingInfo.session?.start_time} - {bookingInfo.session?.end_time}</div>
                <div><strong>Reference:</strong> {bookingInfo.booking_reference}</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Success Screen Component
interface RescheduleSuccessProps {
  businessInfo: RescheduleInfo['business'];
  bookingInfo: RescheduleInfo['current_booking'];
  onBackToBooking: () => void;
}

const RescheduleSuccess: React.FC<RescheduleSuccessProps> = ({ 
  businessInfo, 
  bookingInfo, 
  onBackToBooking 
}) => {
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
            businessInfo={businessInfo}
            bookingInfo={bookingInfo}
          />
        </motion.div>

        {/* RIGHT SECTION - Success Message */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="flex-1 overflow-y-auto h-full p-4 lg:p-8 services-section flex items-center justify-center"
        >
          <div className="max-w-2xl mx-auto text-center space-y-6 lg:space-y-8">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
              className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl"
            >
              <CheckIcon className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
            </motion.div>

            {/* Success Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-3"
            >
              <Title order={1} className="text-3xl lg:text-5xl font-bold text-slate-900">
                Booking Rescheduled Successfully
              </Title>
              <Text size="lg" className="text-slate-600 lg:text-xl max-w-lg mx-auto">
                Your booking has been rescheduled. You will receive a confirmation email shortly.
              </Text>
            </motion.div>

            {/* Booking Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 text-left max-w-md mx-auto"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-emerald-600">📅</span>
                <Text className="font-semibold text-slate-800">New Booking Details</Text>
              </div>
              <div className="space-y-2 text-sm">
                <div><strong>Session:</strong> {bookingInfo.session.title}</div>
                <div><strong>Reference:</strong> {bookingInfo.booking_reference}</div>
                <div className="pt-2 border-t border-slate-200">
                  <Text size="xs" className="text-slate-500">
                    Please save this reference number for your records.
                  </Text>
                </div>
              </div>
            </motion.div>

            {/* What's Next Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50 text-left max-w-md mx-auto"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-blue-600">ℹ️</span>
                <Text className="font-semibold text-blue-800">What happens next?</Text>
              </div>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>You'll receive a confirmation email with your new booking details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Add the new session to your calendar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Arrive 10-15 minutes early for your session</span>
                </li>
              </ul>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
            >
              <Button
                onClick={onBackToBooking}
                variant="filled"
                size="lg"
                className="btn-green-primary shadow-lg hover:shadow-xl"
                leftSection={<ArrowLeftIcon className="w-4 h-4" />}
              >
                Back to Booking
              </Button>
              <Button
                onClick={() => window.location.href = `mailto:${businessInfo.contact_email}`}
                variant="light"
                size="lg"
                color="blue"
                leftSection={<EmailIcon className="w-4 h-4" />}
              >
                Contact Us
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Enhanced Business Profile Component
interface EnhancedBusinessProfileProps {
  businessInfo: RescheduleInfo['business'];
  bookingInfo: RescheduleInfo['current_booking'];
}

const EnhancedBusinessProfile = ({ businessInfo, bookingInfo }: EnhancedBusinessProfileProps) => {
  const businessName = businessInfo?.name || 'Business';
  const businessLetter = businessName.charAt(0).toUpperCase();
  
  return (
    <div className="space-y-6">
      {/* Business Logo */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative mx-auto w-fit"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl border-4 border-white/50 business-logo">
          <span className="text-2xl font-bold text-white relative z-10">
            {businessLetter}
          </span>
        </div>
        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-3xl blur-xl"></div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center space-y-3"
      >
        <Title order={2} className="text-xl font-bold text-slate-900 leading-tight">
          {businessName}
        </Title>
        
        <Badge 
          variant="light" 
          color="gray" 
          size="md"
          className="bg-slate-100 text-slate-700 border border-slate-200"
        >
          {businessInfo.business_type || 'Service Provider'}
        </Badge>
        
        {/* Business contact */}
        {businessInfo.contact_email && (
          <div className="text-sm text-slate-600">
            📧 {businessInfo.contact_email}
          </div>
        )}
        
        {businessInfo.phone && (
          <div className="text-sm text-slate-600">
            📞 {businessInfo.phone}
          </div>
        )}
      </motion.div>

      {/* Current Booking Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
            <span className="text-2xl">📅</span>
          </div>
          <div className="flex-1">
            <Title order={4} className="text-slate-800 mb-1 text-base">
              Current Booking
            </Title>
            <Text className="text-slate-600 text-sm font-medium">
              {bookingInfo.session.title}
            </Text>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Date:</span>
            <span className="font-medium">
              {DateTime.fromISO(bookingInfo.session.start_time).toFormat('DDDD')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Time:</span>
            <span className="font-medium">
              {DateTime.fromISO(bookingInfo.session.start_time).toFormat('h:mm a')} - {DateTime.fromISO(bookingInfo.session.end_time).toFormat('h:mm a')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Duration:</span>
            <span className="font-medium">
              {bookingInfo.session.duration_minutes} min
            </span>
          </div>
          {bookingInfo.session.location && (
            <div className="flex items-center justify-between">
              <span>Location:</span>
              <span className="font-medium">
                {bookingInfo.session.location}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Clock Toggle Component
interface ClockToggleProps {
  variant?: 'minimal' | 'card' | 'inline';
}

const ClockToggle = ({ variant = 'inline' }: ClockToggleProps) => {
  const { state: timezoneState, actions: timezoneActions } = useTimezone();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = DateTime.now().setZone(timezoneState.selectedTimezone);
        const timeFormat = timezoneState.use24Hour ? 'HH:mm:ss' : 'h:mm:ss a';
        setCurrentTime(now.toFormat(timeFormat));
      } catch {
        setCurrentTime('--:--');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezoneState.selectedTimezone, timezoneState.use24Hour]);

  const timeZoneAbbr = DateTime.now().setZone(timezoneState.selectedTimezone).toFormat('ZZZZ');

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <ClockIcon className="w-4 h-4" />
        </motion.div>
        <span>{currentTime}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-lg border border-white/30">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <ClockIcon className="w-4 h-4 text-slate-600" />
      </motion.div>
      <div className="text-sm">
        <div className="font-semibold text-slate-800">{currentTime}</div>
        <div className="text-xs text-slate-500">{timeZoneAbbr}</div>
      </div>
      <Button
        size="xs"
        variant="subtle"
        onClick={() => timezoneActions.setUse24Hour(!timezoneState.use24Hour)}
        className="ml-2 text-slate-600 hover:text-slate-800"
      >
        {timezoneState.use24Hour ? '12h' : '24h'}
      </Button>
    </div>
  );
};

const BookingManage: React.FC = () => {
  const { bookingReference } = useParams<{ bookingReference: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state: timezoneState, actions: timezoneActions } = useTimezone();
  const { width } = useViewportSize();
  const isMobile = width < 768;

  // Check for success state from URL parameters
  const isSuccess = searchParams.get('success') === 'rescheduled';

  // Component state
  const [step, setStep] = useState<'date-selection' | 'confirmation'>('date-selection');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<RescheduleOption | null>(null);
  const [calendarMonth] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<'all' | 'similar' | 'same_category'>('similar');
  
  // Identity verification state
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [reason, setReason] = useState('');

  // Scroll handling
  const { targetRef, scrollIntoView } = useScrollIntoView<HTMLDivElement>();

  // Fixed date range for API calls - don't change this based on selectedDate
  const fixedDateFrom = useMemo(() => {
    // Start from tomorrow or day after current booking, whichever is later
    const tomorrow = DateTime.now().plus({ days: 1 });
    return tomorrow.toFormat('yyyy-MM-dd');
  }, []);

  // API calls - use fixed date range, not selectedDate
  const { 
    data: rescheduleData, 
    isLoading: rescheduleLoading,
    error: rescheduleError 
  } = useGetClientRescheduleOptions(
    bookingReference || '', 
    fixedDateFrom,
    DateTime.now().plus({ months: 3 }).toFormat('yyyy-MM-dd'),
    filterType
  );

  const { 
    error: bookingError 
  } = useGetClientBookingInfo(bookingReference || '');
  
  const rescheduleMutation = useRescheduleClientBooking();

  // Type the data properly
  const typedRescheduleData = rescheduleData as RescheduleInfo | undefined;
  
  // Update business timezone when data loads
  useEffect(() => {
    if (typedRescheduleData?.business?.timezone && typedRescheduleData.business.timezone !== timezoneState.businessTimezone) {
      timezoneActions.setBusinessTimezone(typedRescheduleData.business.timezone);
    }
  }, [typedRescheduleData?.business?.timezone, timezoneState.businessTimezone, timezoneActions]);

  // Set default selected date based on available sessions
  useEffect(() => {
    if (typedRescheduleData?.available_sessions?.length && !selectedDate) {
      // Find the first available session date that's not today
      const firstAvailableSession = typedRescheduleData.available_sessions
        .map(session => DateTime.fromISO(session.date))
        .filter(date => date > DateTime.now())
        .sort((a, b) => a.toMillis() - b.toMillis())[0];
        
      if (firstAvailableSession) {
        setSelectedDate(firstAvailableSession.toJSDate());
      } else {
        // Fallback to tomorrow if no available sessions
        setSelectedDate(DateTime.now().plus({ days: 1 }).toJSDate());
      }
    }
  }, [typedRescheduleData?.available_sessions, selectedDate]);

  // Auto-redirect to success screen after successful mutation
  useEffect(() => {
    if (rescheduleMutation.isSuccess && !isSuccess) {
      // Wait a moment to show the success state, then redirect
      const timer = setTimeout(() => {
        navigate(`/booking/manage/${bookingReference}?success=rescheduled`, { replace: true });
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [rescheduleMutation.isSuccess, isSuccess, navigate, bookingReference]);

  const availableSlots: RescheduleOption[] = useMemo(
    () => typedRescheduleData?.available_sessions || [],
    [typedRescheduleData?.available_sessions]
  );
  
  // Filter slots for the selected date - memoized for performance
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    return availableSlots.filter((slot: RescheduleOption) => {
      const slotDate = DateTime.fromISO(slot.date);
      const selectedDateTime = DateTime.fromJSDate(selectedDate);
      return slotDate.hasSame(selectedDateTime, 'day');
    });
  }, [selectedDate, availableSlots]);



  const isDateDisabled = useCallback((date: Date) => {
    // Disable past dates
    if (date < new Date()) return true;
    
    // If we have a current booking, disable dates before the day after current session
    if (typedRescheduleData?.current_booking?.session?.start_time) {
      const currentSessionDate = DateTime.fromISO(typedRescheduleData.current_booking.session.start_time);
      const dayAfterSession = currentSessionDate.plus({ days: 1 });
      if (DateTime.fromJSDate(date) < dayAfterSession) return true;
    }
    
    // Disable dates more than 3 months out
    const threeMonthsOut = DateTime.now().plus({ months: 3 });
    if (DateTime.fromJSDate(date) > threeMonthsOut) return true;
    
    return false;
  }, [typedRescheduleData?.current_booking?.session?.start_time]);

  const hasAvailability = useCallback((date: Date) => {
    const dateString = DateTime.fromJSDate(date).toFormat('yyyy-MM-dd');
    return availableSlots.some((slot: RescheduleOption) => slot.date === dateString);
  }, [availableSlots]);

  const formatTime = useCallback((time: string, date?: string) => {
    try {
      let timeToFormat: DateTime;
      
      if (date) {
        timeToFormat = DateTime.fromISO(`${date}T${time}:00`, { 
          zone: timezoneState.businessTimezone 
        }).setZone(timezoneState.selectedTimezone);
      } else {
        timeToFormat = DateTime.fromISO(`2000-01-01T${time}:00`);
      }
      
      const format = timezoneState.use24Hour ? 'HH:mm' : 'h:mm a';
      return timeToFormat.toFormat(format);
    } catch {
      return time;
    }
  }, [timezoneState.businessTimezone, timezoneState.selectedTimezone, timezoneState.use24Hour]);

  const getTimezoneOptionsForSelect = useMemo(() => {
    const grouped = TIMEZONE_OPTIONS.reduce((acc, tz) => {
      const region = tz.region || 'Other';
      if (!acc[region]) {
        acc[region] = { group: region, items: [] };
      }
      acc[region].items.push({ value: tz.value, label: tz.label });
      return acc;
    }, {} as Record<string, { group: string; items: { value: string; label: string }[] }>);
    
    return Object.values(grouped);
  }, []);

  const handleDateSelect = useCallback((date: Date | null) => {
    if (!date) return;
    
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    
    // On mobile, scroll to time slots section after date selection
    if (isMobile) {
      setTimeout(() => {
        scrollIntoView();
      }, 300);
    }
  }, [isMobile, scrollIntoView]);

  const handleTimeSelect = useCallback((slot: RescheduleOption) => {
    setSelectedTimeSlot(slot);
    setStep('confirmation');
  }, []);

  const getDayProps = useCallback((date: Date) => {
    const disabled = isDateDisabled(date);
    const isSelected = selectedDate && 
      date.toDateString() === selectedDate.toDateString();
    const hasSlots = hasAvailability(date);
    
    return {
      onClick: disabled ? undefined : () => handleDateSelect(date),
      disabled: disabled || !hasSlots,
      style: {
        cursor: (disabled || !hasSlots) ? 'not-allowed' : 'pointer',
        opacity: (disabled || !hasSlots) ? 0.3 : 1,
        fontWeight: (disabled || !hasSlots) ? 'normal' : hasSlots ? '600' : '400',
        backgroundColor: isSelected 
          ? '#10b981' 
          : hasSlots && !disabled 
            ? '#f0fdf4' 
            : undefined,
        color: isSelected 
          ? 'white' 
          : (disabled || !hasSlots) 
            ? '#9ca3af' 
            : undefined,
        border: isSelected 
          ? '2px solid #059669' 
          : hasSlots && !disabled 
            ? '1px solid #bbf7d0' 
            : undefined,
      }
    };
  }, [isDateDisabled, selectedDate, hasAvailability, handleDateSelect]);

  const excludeDate = useCallback((date: Date) => {
    return isDateDisabled(date) || !hasAvailability(date);
  }, [isDateDisabled, hasAvailability]);

  const handleBack = () => {
    if (step === 'confirmation') {
      setStep('date-selection');
    } else {
      navigate('/booking/cancel/' + bookingReference);
    }
  };

  const handleBackToBooking = () => {
    // Navigate back to booking info without success parameter
    navigate(`/booking/manage/${bookingReference}`);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedTimeSlot || !bookingReference) return;

    console.log('🔍 DEBUG: Reschedule payload:', {
      bookingReference,
      newSessionId: selectedTimeSlot.session_id,
      newDate: selectedTimeSlot.date,
      newStartTime: selectedTimeSlot.start_time,
      newEndTime: selectedTimeSlot.end_time,
      selectedTimeSlot,
      identityVerification: {
        email: clientEmail,
        phone: clientPhone,
      },
      reason: reason || 'Client requested reschedule'
    });

    try {
      await rescheduleMutation.mutateAsync({
        bookingReference,
        newSessionId: selectedTimeSlot.session_id,
        newDate: selectedTimeSlot.date,
        newStartTime: selectedTimeSlot.start_time,
        newEndTime: selectedTimeSlot.end_time,
        identityVerification: {
          email: clientEmail,
          phone: clientPhone,
        },
        reason: reason || 'Client requested reschedule'
      });

      notifications.show({
        title: 'Booking Rescheduled Successfully',
        message: 'Your booking has been rescheduled. You will receive a confirmation email shortly.',
        color: 'green',
        icon: <CheckIcon className="w-4 h-4" />
      });

      // Navigation handled by useEffect to show success state first
    } catch (error) {
      let errorMessage = 'Failed to reschedule booking. Please try again.';
      
      // Type guard for error with response property
      const errorWithResponse = error as { response?: { data?: { code?: string; error?: string } } };
      
      if (errorWithResponse?.response?.data?.code === 'IDENTITY_VERIFICATION_FAILED') {
        errorMessage = 'Identity verification failed. Please check your email and phone number.';
      } else if (errorWithResponse?.response?.data?.code === 'SESSION_NOT_AVAILABLE') {
        errorMessage = 'The selected session is no longer available. Please choose a different time.';
      } else if (errorWithResponse?.response?.data?.error) {
        errorMessage = errorWithResponse.response.data.error;
      }
      
      notifications.show({
        title: 'Reschedule Failed',
        message: errorMessage,
        color: 'red',
        icon: <InfoIcon className="w-4 h-4" />
      });
    }
  };

  // Loading states
  if (rescheduleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingOverlay visible={true} />
      </div>
    );
  }

  // Error states - Load booking info separately for better error handling
  if (bookingError || rescheduleError || !typedRescheduleData) {
    // Even if reschedule data failed, try to load basic booking info for better UX
    return <RescheduleErrorScreen 
      bookingReference={bookingReference || ''} 
      rescheduleError={rescheduleError}
      onNavigateBack={() => navigate('/')}
    />;
  }

  // Show success screen if rescheduled successfully
  if (isSuccess) {
    return (
      <RescheduleSuccess
        businessInfo={typedRescheduleData.business}
        bookingInfo={typedRescheduleData.current_booking}
        onBackToBooking={handleBackToBooking}
      />
    );
  }

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
              businessInfo={typedRescheduleData.business}
              bookingInfo={typedRescheduleData.current_booking}
            />
          </motion.div>

          {/* RIGHT SECTION - Confirmation */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="flex-1 overflow-y-auto h-full p-4 lg:p-8 services-section"
          >
            <div className="max-w-2xl mx-auto space-y-6 lg:space-y-8 lg:ml-8">
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                    <span className="text-xl">✅</span>
                  </div>
                  <Text className="text-slate-600 text-sm lg:text-base font-medium">
                    Confirm Reschedule
                  </Text>
                </div>
                <Title 
                  order={1} 
                  className="text-2xl lg:text-4xl font-bold mb-2 lg:mb-4 text-slate-800"
                >
                  Confirm Your Reschedule
                </Title>
                <Text className="text-slate-600 text-sm lg:text-base">
                  Please verify your details and confirm the new booking time.
                </Text>
              </motion.div>

              {/* Session Comparison */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
              >
                <Title order={3} className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-emerald-600">🔄</span>
                  Session Change
                </Title>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Current Session */}
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-red-600">❌</span>
                      <Text className="font-semibold text-red-800">Current Session</Text>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><strong>Session:</strong> {typedRescheduleData.current_booking.session.title}</div>
                      <div><strong>Date:</strong> {DateTime.fromISO(typedRescheduleData.current_booking.session.start_time).toFormat('DDDD')}</div>
                      <div><strong>Time:</strong> {formatTime(DateTime.fromISO(typedRescheduleData.current_booking.session.start_time).toFormat('HH:mm'))} - {formatTime(DateTime.fromISO(typedRescheduleData.current_booking.session.end_time).toFormat('HH:mm'))}</div>
                      <div><strong>Duration:</strong> {typedRescheduleData.current_booking.session.duration_minutes} min</div>
                      <div><strong>Location:</strong> {typedRescheduleData.current_booking.session.location}</div>
                    </div>
                  </div>

                  {/* New Session */}
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-green-600">✅</span>
                      <Text className="font-semibold text-green-800">New Session</Text>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><strong>Session:</strong> {selectedTimeSlot?.title}</div>
                      <div><strong>Date:</strong> {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <div><strong>Time:</strong> {formatTime(selectedTimeSlot?.start_time || '', selectedTimeSlot?.date)} - {formatTime(selectedTimeSlot?.end_time || '', selectedTimeSlot?.date)}</div>
                      <div><strong>Duration:</strong> {selectedTimeSlot?.duration_minutes} min</div>
                      <div><strong>Location:</strong> {selectedTimeSlot?.location}</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Identity Verification with Security Quiz */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
              >
                <Title order={3} className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-emerald-600" />
                  Verify Your Identity
                </Title>

            <Alert
                  icon={<InfoIcon className="w-4 h-4" />}
              color="blue"
                  variant="light"
                  className="mb-4"
            >
                  <Text size="sm">
                    For security, please verify your identity by providing the email and phone number used for this booking.
                  </Text>
            </Alert>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput
                    label="Email Address"
                    placeholder="Enter your email"
                    value={clientEmail}
                    onChange={(event) => setClientEmail(event.currentTarget.value)}
                    leftSection={<EmailIcon className="w-4 h-4 text-slate-400" />}
                    required
                    disabled={rescheduleMutation.isPending || rescheduleMutation.isSuccess}
                    description={`Hint: ${typedRescheduleData.current_booking.client_email_masked}`}
                  />
                  <TextInput
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    value={clientPhone}
                    onChange={(event) => setClientPhone(event.currentTarget.value)}
                    leftSection={<PhoneIcon className="w-4 h-4 text-slate-400" />}
                    required
                    disabled={rescheduleMutation.isPending || rescheduleMutation.isSuccess}
                    description={`Hint: ${typedRescheduleData.current_booking.client_phone_masked}`}
                  />
                </div>
                
                <Textarea
                  label="Reason for Reschedule (Optional)"
                  placeholder="Let us know why you're rescheduling..."
                  value={reason}
                  onChange={(event) => setReason(event.currentTarget.value)}
                  rows={3}
                  className="mt-4"
                  disabled={rescheduleMutation.isPending || rescheduleMutation.isSuccess}
                />
              </motion.div>

              {/* Error Display */}
              {rescheduleMutation.error && (
                <Alert 
                  icon={<InfoIcon className="w-5 h-5" />} 
                  color="red" 
                  title="Reschedule Failed"
                >
                  {rescheduleMutation.error instanceof Error 
                    ? rescheduleMutation.error.message 
                    : 'Failed to reschedule booking. Please try again.'}
                </Alert>
              )}

              {/* Confirm Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="pt-2"
              >
              <Button 
                  onClick={handleConfirmReschedule}
                loading={rescheduleMutation.isPending}
                disabled={rescheduleMutation.isPending || rescheduleMutation.isSuccess}
                  size="lg"
                  variant="filled"
                  className="w-full lg:w-auto font-semibold py-3 px-8 rounded-xl btn-green-primary shadow-lg hover:shadow-xl"
                  rightSection={rescheduleMutation.isSuccess ? <CheckIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
              >
                  {rescheduleMutation.isPending 
                    ? 'Confirming...' 
                    : rescheduleMutation.isSuccess 
                      ? 'Rescheduled!' 
                      : 'Confirm Reschedule'}
              </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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
            businessInfo={typedRescheduleData.business}
            bookingInfo={typedRescheduleData.current_booking}
          />

          {/* Powered by FlowKey */}
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
        </motion.div>

        {/* RIGHT SECTION - Date & Time Selection */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="flex-1 overflow-y-auto h-full p-4 lg:p-8 flex flex-col"
        >
          {/* Header */}
          <div className="mb-6 lg:mb-8 lg:ml-8 lg:mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                  <span className="text-xl">🔄</span>
                </div>
                <Text className="text-slate-600 text-sm lg:text-base font-medium">
                  Reschedule Your Booking
                </Text>
              </div>
              <Title 
                order={1} 
                className="text-2xl lg:text-4xl font-bold mb-2 lg:mb-4 text-slate-900"
              >
                Choose a <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">new time slot</span>
              </Title>
              <Text className="text-slate-600 text-sm lg:text-base">
                Select your preferred date and available time slot to reschedule your booking.
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
                value={timezoneState.selectedTimezone}
                onChange={(value) => {
                  const newTimezone = value || 'Africa/Nairobi';
                  timezoneActions.setSelectedTimezone(newTimezone);
                }}
                data={getTimezoneOptionsForSelect}
                className="flex-1"
                classNames={{
                  input: "bg-white/60 backdrop-blur-sm border-white/30 focus:border-emerald-300",
                  label: "text-slate-700 font-medium text-sm"
                }}
              />
              
              <div className="mt-6">
                <ClockToggle variant="inline" />
              </div>

              {/* Filter Options */}
              <Select
                label="Show Sessions"
                value={filterType}
                onChange={(value) => setFilterType(value as 'all' | 'similar' | 'same_category')}
                data={[
                  { value: 'similar', label: 'Similar Sessions' },
                  { value: 'same_category', label: 'Same Category' },
                  { value: 'all', label: 'All Available' },
                ]}
                className="flex-1"
                classNames={{
                  input: "bg-white/60 backdrop-blur-sm border-white/30 focus:border-emerald-300",
                  label: "text-slate-700 font-medium text-sm"
                }}
              />
            </div>
          </motion.div>

          {/* Calendar and Time Selection */}
          <div className="flex-1 lg:ml-8">
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
                  <Title order={3} className="text-lg font-semibold text-slate-800 mb-4">
                    Choose Date
                  </Title>
                  
                  {selectedDate && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <Text className="text-sm font-medium text-emerald-800 mb-1">Selected Date</Text>
                      <Text className="text-emerald-700 font-semibold">
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
                    defaultDate={calendarMonth}
                    getDayProps={getDayProps}
                    minDate={new Date()}
                    maxDate={DateTime.now().plus({ months: 6 }).toJSDate()}
                    excludeDate={excludeDate}
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
                  <Title order={3} className="text-lg font-semibold text-slate-800 mb-4">
                    Available Times
                  </Title>
                  
                  {!selectedDate ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📅</div>
                      <Text className="text-slate-600">
                        Please select a date to view available times
                      </Text>
                    </div>
                  ) : slotsForSelectedDate.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">😔</div>
                      <Text className="text-slate-600 font-medium mb-1">
                        No times available
                      </Text>
                      <Text className="text-slate-500 text-sm">
                        Please try a different date or change the filter
                      </Text>
                    </div>
                  ) : (
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {slotsForSelectedDate
                          .filter((slot: RescheduleOption) => slot.capacity_status === 'available' && slot.available_spots > 0)
                          .map((slot: RescheduleOption, index: number) => {
                            return (
                              <motion.div
                                key={`${slot.date}-${slot.start_time}-${slot.session_id}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Paper
                                  className="p-4 cursor-pointer border-2 transition-all duration-300 bg-white/80 border-slate-200 hover:bg-emerald-25 hover:border-emerald-300 hover:shadow-md"
                                  radius="lg"
                                  onClick={() => handleTimeSelect(slot)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <Text className="font-bold text-lg text-slate-900 mb-1">
                                        {formatTime(slot.start_time, slot.date)} - {formatTime(slot.end_time, slot.date)}
                                      </Text>
                                      <Text className="font-semibold text-slate-700 mb-2">
                                        {slot.title}
                                      </Text>
                                      <div className="flex items-center gap-3 text-sm text-slate-600">
                                        {slot.location && (
                                          <span className="flex items-center gap-1">
                                            <LocationIcon className="w-4 h-4" />
                                            {slot.location}
                                          </span>
                                        )}
                                        {slot.staff_name && (
                                          <span className="flex items-center gap-1">
                                            <UserIcon className="w-4 h-4" />
                                            {slot.staff_name}
                                          </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                          <ClockIcon className="w-4 h-4" />
                                          {slot.duration_minutes} min
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-right ml-4">
                                      <Badge
                                        color={slot.available_spots > 10 ? "green" : slot.available_spots > 5 ? "yellow" : "orange"}
                                        variant="light"
                                        size="md"
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default withBranding(BookingManage, { showHelpText: false }); 