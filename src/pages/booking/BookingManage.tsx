import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
} from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  ArrowLeftIcon,
  InfoIcon,
  ClockIcon,
  CheckIcon,
  UserIcon,
  PhoneIcon,
  EmailIcon,
  LocationIcon,
  CalendarIcon,
} from "../../components/publicBooking/bookingIcons";
import {
  useGetClientBookingInfo,
  useGetClientRescheduleOptions,
  useRescheduleClientBooking,
} from "../../hooks/reactQuery";
import { useTimezone } from "../../contexts/TimezoneContext";
import {
  RescheduleInfo,
  RescheduleOption,
  RescheduleErrorReason,
} from "../../types/clientTypes";
import { TIMEZONE_OPTIONS } from "../../utils/timezone";
import { DateTime } from "luxon";
import { FlowKeyIcon } from "../../assets/icons";
import { useViewportSize, useScrollIntoView } from "@mantine/hooks";
import { withBranding } from "../../hoc/withBranding";

interface RescheduleErrorScreenProps {
  bookingReference: string;
  rescheduleError: Error | null;
  onNavigateBack: () => void;
}

const RescheduleErrorScreen: React.FC<RescheduleErrorScreenProps> = ({
  bookingReference,
  rescheduleError,
  onNavigateBack,
}) => {
  const navigate = useNavigate();

  const {
    data: bookingInfo,
    isLoading: bookingInfoLoading,
    error: bookingInfoError,
  } = useGetClientBookingInfo(bookingReference);

  const apiErrorData =
    rescheduleError && "response" in rescheduleError && rescheduleError.response
      ? (
          rescheduleError.response as {
            data?: {
              error?: string;
              can_reschedule?: boolean;
              reasons?: RescheduleErrorReason[];
              policy?: {
                max_reschedules: number;
                current_reschedules: number;
                deadline_hours: number;
              };
            };
          }
        ).data
      : null;

  const errorReasons: RescheduleErrorReason[] = apiErrorData?.reasons || [];
  const errorPolicy = apiErrorData?.policy;

  if (bookingInfoLoading) {
    return (
      <div className="min-h-screen w-full relative">
        <div className="flex items-center justify-center h-screen">
          <LoadingOverlay visible={true} />
        </div>
      </div>
    );
  }

  if (bookingInfoError || !bookingInfo) {
    return (
      <div className="min-h-screen w-full relative">
        <div className="flex flex-col lg:flex-row h-screen relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="hidden lg:flex lg:flex-col w-96 flex-shrink-0 h-full business-section border-r border-slate-200"
            style={{
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            }}
          >
            <ScrollArea style={{ flex: 1 }} scrollbars="y" offsetScrollbars>
              <div className="p-6">
                <div className="text-center space-y-6">
                  <div className="relative mx-auto w-fit">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl border-4 border-white/50 business-logo relative overflow-hidden">
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear",
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform skew-x-12"
                      />
                      <span className="text-2xl font-bold text-white relative z-10">
                        ?
                      </span>
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-3xl blur-xl"></div>
                  </div>
                  <div>
                    <Title
                      order={3}
                      className="text-base font-bold text-slate-900 leading-tight mb-2"
                    >
                      Booking Management
                    </Title>
                    <Text size="xs" className="text-slate-600">
                      Manage your booking details
                    </Text>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div
              className="p-4"
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
          </motion.div>

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
                <Title
                  order={1}
                  className="text-2xl lg:text-3xl font-bold text-slate-900"
                >
                  Booking Not Found
                </Title>
                <Text size="lg" className="text-slate-600">
                  We couldn't locate your booking. Please check your booking
                  reference and try again.
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

  const businessName = bookingInfo.business?.name || "Business";
  const contactEmail =
    bookingInfo.business?.contact_email || "support@example.com";

  return (
    <div className="min-h-screen w-full relative">
      <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="hidden lg:flex lg:flex-col w-80 flex-shrink-0 h-full business-section border-r border-slate-200"
          style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          }}
        >
          <ScrollArea style={{ flex: 1 }} scrollbars="y" offsetScrollbars>
            <div className="">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-center space-y-6"
              >
                <div className="relative mx-auto w-fit">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl border-4 border-white/50 business-logo relative overflow-hidden">
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "linear",
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform skew-x-12"
                    />
                    <span className="text-2xl font-bold text-white relative z-10">
                      {businessName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-3xl blur-xl"></div>
                </div>

                <div className="space-y-3">
                  <Title
                    order={3}
                    className="text-base font-bold text-slate-900 leading-tight"
                  >
                    {businessName}
                  </Title>
                  <Badge
                    variant="light"
                    color="gray"
                    size="md"
                    className="bg-slate-100 text-slate-700 border border-slate-200"
                    style={{ textTransform: "capitalize" }}
                  >
                    {bookingInfo.business?.business_type || "Service Provider"}
                  </Badge>

                  {bookingInfo.business?.address && (
                    <Text
                      size="xs"
                      className="text-slate-600 leading-relaxed text-center"
                    >
                      📍 {bookingInfo.business.address}
                    </Text>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/30 mt-8"
              >
                <Text
                  size="xs"
                  fw={600}
                  className="text-slate-700 uppercase tracking-wide mb-4"
                >
                  YOUR BOOKING
                </Text>

                <div className="space-y-4 my-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200/50">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">📅</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text
                        size="sm"
                        fw={600}
                        className="text-slate-900 leading-tight truncate"
                      >
                        {bookingInfo.session?.title}
                      </Text>
                      <Text size="xs" className="text-slate-600 font-medium">
                        Ref: {bookingInfo.booking_reference}
                      </Text>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between py-1">
                      <Text className="text-slate-600 font-medium">Date:</Text>
                      <Text fw={600} className="text-slate-900">
                        {bookingInfo.session?.date}
                      </Text>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <Text className="text-slate-600 font-medium">Time:</Text>
                      <div className="text-right">
                        <Text fw={600} className="text-slate-900 block">
                          {bookingInfo.session?.start_time} -{" "}
                          {bookingInfo.session?.end_time}
                        </Text>
                        {bookingInfo?.client_timezone && (
                          <Text
                            size="xs"
                            className="text-emerald-600 font-semibold"
                          >
                            {bookingInfo.client_timezone}
                          </Text>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <Text className="text-slate-600 font-medium">
                        Location:
                      </Text>
                      <Text fw={600} className="text-slate-900 text-right">
                        {bookingInfo.session?.location || "Main Location"}
                      </Text>
                    </div>
                    {bookingInfo.flexible_booking_info?.selected_staff && (
                      <div className="flex items-center justify-between py-1">
                        <Text className="text-slate-600 font-medium">
                          Staff:
                        </Text>
                        <Text fw={600} className="text-slate-900 text-right">
                          {
                            bookingInfo.flexible_booking_info.selected_staff
                              .name
                          }
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </ScrollArea>

          <div
            className="p-4"
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="flex-1 overflow-y-auto lg:h-full services-section min-h-screen lg:min-h-0 flex flex-col lg:items-center lg:justify-center"
        >
          <MobileBusinessHeader
            businessInfo={bookingInfo.business}
            bookingInfo={bookingInfo}
            businessName={businessName}
          />

          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto text-center space-y-4 lg:space-y-6 px-4 py-4 lg:py-6 flex-1 lg:flex-none lg:flex lg:flex-col lg:justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="space-y-4"
            >
              <div
                className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto ${
                  errorReasons[0]?.severity === "high"
                    ? "bg-red-100"
                    : errorReasons[0]?.severity === "medium"
                    ? "bg-orange-100"
                    : "bg-blue-100"
                }`}
              >
                <span className="text-xl lg:text-2xl">
                  {errorReasons[0]?.id === "MAX_RESCHEDULES_REACHED"
                    ? "🚫"
                    : errorReasons[0]?.id === "DEADLINE_PASSED"
                    ? "⏰"
                    : errorReasons[0]?.id === "SESSION_FINISHED"
                    ? "✅"
                    : errorReasons[0]?.id === "INVALID_STATUS"
                    ? "⚠️"
                    : errorReasons[0]?.id === "BUSINESS_POLICY"
                    ? "📋"
                    : "❌"}
                </span>
              </div>

              <div className="space-y-2 text-center">
                <h1 className="text-lg lg:text-xl font-bold text-slate-900">
                  Reschedule Not Available
                </h1>
                <p className="text-sm lg:text-base text-slate-600 leading-relaxed max-w-sm mx-auto">
                  {errorReasons[0]?.message ||
                    "Unable to reschedule this booking at this time."}
                </p>
              </div>
            </motion.div>

            {errorReasons.length > 0 ? (
              <div className="space-y-4 text-center">
                {errorReasons[0]?.id === "MAX_RESCHEDULES_REACHED" &&
                  errorPolicy && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="bg-red-50/80 backdrop-blur-sm rounded-xl border border-red-200/50 p-4 max-w-sm mx-auto"
                    >
                      <div className="text-center space-y-3">
                        <div className="text-sm font-semibold text-red-800">
                          Policy Exceeded
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-slate-500 mb-1 text-xs font-medium">
                                Limit
                              </div>
                              <div className="font-bold text-slate-700 text-lg">
                                {errorPolicy.max_reschedules}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-500 mb-1 text-xs font-medium">
                                Used
                              </div>
                              <div className="font-bold text-red-600 text-lg">
                                {errorPolicy.current_reschedules}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-500 mb-1 text-xs font-medium">
                                Notice
                              </div>
                              <div className="font-bold text-slate-700 text-lg">
                                {errorPolicy.deadline_hours}h
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                {errorReasons[0]?.id &&
                  errorReasons[0].id !== "MAX_RESCHEDULES_REACHED" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className={`${
                        errorReasons[0].severity === "high"
                          ? "bg-red-50/80 border-red-200/50 text-red-700"
                          : errorReasons[0].severity === "medium"
                          ? "bg-orange-50/80 border-orange-200/50 text-orange-700"
                          : "bg-blue-50/80 border-blue-200/50 text-blue-700"
                      } backdrop-blur-sm rounded-xl border p-4 max-w-sm mx-auto text-center`}
                    >
                      <div className="text-sm font-medium leading-relaxed">
                        {errorReasons[0].id === "INVALID_STATUS"
                          ? "Booking has been cancelled"
                          : errorReasons[0].id === "BUSINESS_POLICY"
                          ? "Business policy restriction"
                          : errorReasons[0].id === "DEADLINE_PASSED"
                          ? `${
                              errorReasons[0].details?.required_hours || 24
                            }h notice required`
                          : "Policy restriction applies"}
                      </div>
                    </motion.div>
                  )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center space-y-3"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <InfoIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <Title
                    order={2}
                    className="text-lg font-semibold text-slate-900 mb-1"
                  >
                    Unable to Load Details
                  </Title>
                  <Text size="sm" className="text-slate-600">
                    We're having trouble loading your reschedule information
                  </Text>
                </div>
              </motion.div>
            )}

            {/* Priority 3: What to do - Clear Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-5"
            >
              {/* Action Guidance */}
              <div className="max-w-md mx-auto">
                <div className="bg-blue-50/80 rounded-xl border border-blue-200/50 p-4 text-center">
                  <div className="text-sm font-medium text-blue-800 leading-relaxed">
                    {errorReasons.length > 0
                      ? errorReasons[0]?.id === "MAX_RESCHEDULES_REACHED"
                        ? "Contact support or cancel to book again"
                        : errorReasons[0]?.id === "INVALID_STATUS"
                        ? "Book a new session instead"
                        : errorReasons[0]?.id === "BUSINESS_POLICY"
                        ? "Contact us for alternative options"
                        : errorReasons[0]?.id === "DEADLINE_PASSED"
                        ? "Contact support for urgent changes"
                        : "Contact support for assistance"
                      : "Contact support for assistance"}
                  </div>
                </div>
              </div>

              {/* Primary Actions */}
              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  onClick={() =>
                    (window.location.href = `mailto:${contactEmail}?subject=Reschedule Request - ${bookingInfo.booking_reference}&body=Hi,\n\nI would like to reschedule my booking (Reference: ${bookingInfo.booking_reference}) for ${bookingInfo.session?.title} on ${bookingInfo.session?.date}.\n\nPlease let me know available alternative times.\n\nThank you!`)
                  }
                  variant="filled"
                  size="md"
                  className="btn-green-primary"
                  leftSection={<EmailIcon className="w-4 h-4" />}
                >
                  Contact {businessName}
                </Button>
                <Button
                  onClick={() =>
                    navigate(`/booking/cancel/${bookingReference}`)
                  }
                  variant="light"
                  size="md"
                  color="red"
                  leftSection={<InfoIcon className="w-4 h-4" />}
                >
                  Cancel Booking Instead
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Mobile Business Header Component
interface MobileBusinessHeaderProps {
  businessInfo: RescheduleInfo["business"];
  bookingInfo: RescheduleInfo["current_booking"];
  businessName: string;
}

const MobileBusinessHeader: React.FC<MobileBusinessHeaderProps> = ({
  businessInfo,
  bookingInfo,
  businessName,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { state: timezoneState } = useTimezone();

  // Get timezone abbreviation
  const getTimezoneAbbr = () => {
    if (timezoneState.selectedTimezone === "Africa/Nairobi") {
      return "EAT";
    } else {
      try {
        return DateTime.now()
          .setZone(timezoneState.selectedTimezone)
          .toFormat("ZZZZ");
      } catch {
        return "UTC";
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="lg:hidden w-full bg-white/95 backdrop-blur-md border-b border-white/20 mb-4"
    >
      <div className="px-4 py-3">
        {/* Main Header */}
        <div
          className="cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Business Logo with Shimmer */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg relative overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform skew-x-12"
                />
                <span className="text-base font-bold text-white relative z-10">
                  {businessName?.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Business & Booking Info */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="font-bold text-slate-900 leading-tight text-base truncate">
                  {businessName}
                </div>
                <div className="text-sm text-slate-600 truncate">
                  {bookingInfo.session?.title}
                </div>
                {/* Essential booking info in condensed state */}
                <div className="text-xs text-emerald-600 font-medium">
                  {bookingInfo.session?.start_time &&
                  bookingInfo.session?.end_time
                    ? `${DateTime.fromISO(
                        bookingInfo.session.start_time
                      ).toFormat("MMM dd")} • ${DateTime.fromISO(
                        bookingInfo.session.start_time
                      ).toFormat("HH:mm")}-${DateTime.fromISO(
                        bookingInfo.session.end_time
                      ).toFormat("HH:mm")} ${getTimezoneAbbr()}`
                    : `Ref: ${bookingInfo.booking_reference}`}
                </div>
              </div>
            </div>

            {/* Expand/Collapse Section with Animation */}
            <motion.div
              className="flex flex-col items-center gap-1 px-2"
              animate={{
                scale: !isExpanded ? [1, 1.1, 1] : 1,
                background: !isExpanded
                  ? [
                      "rgba(16, 185, 129, 0)",
                      "rgba(16, 185, 129, 0.1)",
                      "rgba(16, 185, 129, 0)",
                    ]
                  : "rgba(16, 185, 129, 0)",
              }}
              transition={{
                scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                background: {
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                },
              }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-slate-400"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </motion.div>
              <motion.div
                className="text-xs text-slate-400 font-medium"
                animate={{
                  color: !isExpanded
                    ? ["#94a3b8", "#059669", "#94a3b8"]
                    : "#94a3b8",
                }}
                transition={{
                  color: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                }}
              >
                {isExpanded ? "Less" : "More"}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Expanded Business Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="mt-4 space-y-3 overflow-hidden"
            >
              {/* Business Type Only */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="light"
                  color="gray"
                  size="sm"
                  className="bg-slate-100 text-slate-700"
                >
                  {businessInfo?.business_type?.toUpperCase() || "THERAPY"}
                </Badge>
              </div>

              {businessInfo?.address && (
                <div className="text-sm text-slate-600 flex items-start gap-1">
                  <span className="text-red-500 mt-0.5">📍</span>
                  <span>{businessInfo.address}</span>
                </div>
              )}

              {/* Booking Summary */}
              <div className="bg-white/60 rounded-lg p-4 border border-white/30">
                <div className="text-xs font-semibold text-slate-800 tracking-wide mb-3 uppercase flex items-center gap-1">
                  📋 Complete Booking Details
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">
                      Reference:
                    </span>
                    <span className="font-semibold text-emerald-600">
                      {bookingInfo.booking_reference}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Date:</span>
                    <span className="font-medium text-slate-800 text-right max-w-[180px]">
                      {bookingInfo.session?.start_time
                        ? DateTime.fromISO(
                            bookingInfo.session.start_time
                          ).toFormat("EEEE, MMM dd, yyyy")
                        : "TBD"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Time:</span>
                    <div className="text-right">
                      <div className="font-medium text-slate-800">
                        {bookingInfo.session?.start_time &&
                        bookingInfo.session?.end_time
                          ? `${DateTime.fromISO(
                              bookingInfo.session.start_time
                            ).toFormat("HH:mm")} - ${DateTime.fromISO(
                              bookingInfo.session.end_time
                            ).toFormat("HH:mm")}`
                          : `${bookingInfo.session?.start_time} - ${bookingInfo.session?.end_time}`}
                      </div>
                      <div className="text-xs text-emerald-600 font-semibold mt-0.5">
                        {getTimezoneAbbr()}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">
                      Duration:
                    </span>
                    <span className="font-medium text-slate-800">
                      {bookingInfo.session?.duration_minutes ||
                        (bookingInfo.session?.start_time &&
                        bookingInfo.session?.end_time
                          ? Math.round(
                              (DateTime.fromISO(
                                bookingInfo.session.end_time
                              ).toMillis() -
                                DateTime.fromISO(
                                  bookingInfo.session.start_time
                                ).toMillis()) /
                                (1000 * 60)
                            )
                          : 60)}{" "}
                      minutes
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">
                      Location:
                    </span>
                    <span className="font-medium text-slate-800 text-right max-w-[180px] truncate">
                      {bookingInfo.session?.location || "Main Location"}
                    </span>
                  </div>
                  {bookingInfo.flexible_booking_info?.selected_staff && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500 font-medium">Staff:</span>
                      <span className="font-medium text-slate-800 text-right max-w-[180px] truncate">
                        {bookingInfo.flexible_booking_info.selected_staff.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Success Screen Component
interface RescheduleSuccessProps {
  businessInfo: RescheduleInfo["business"];
  bookingInfo: RescheduleInfo["current_booking"];
  onBackToBooking: () => void;
}

const RescheduleSuccess: React.FC<RescheduleSuccessProps> = ({
  businessInfo,
  bookingInfo,
  onBackToBooking,
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
          className="flex-1 overflow-y-auto h-full p-4 lg:p-8 services-section flex items-start justify-center pt-8 lg:pt-16"
        >
          <div className="max-w-md mx-auto text-center space-y-6">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.3,
                duration: 0.6,
                type: "spring",
                bounce: 0.4,
              }}
              className="relative"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl relative z-10">
                <CheckIcon className="w-8 h-8 text-white stroke-[3]" />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 w-16 h-16 bg-emerald-400 rounded-full blur-lg opacity-25 mx-auto animate-pulse"></div>
            </motion.div>

            {/* Success Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="space-y-2"
            >
              <Title
                order={2}
                className="text-xl font-bold text-slate-900 leading-tight"
              >
                Booking Rescheduled Successfully
              </Title>
              <Text size="sm" className="text-slate-600 leading-relaxed">
                Your booking has been rescheduled. You will receive a
                confirmation email shortly.
              </Text>
            </motion.div>

            {/* Booking Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-white border border-emerald-100 rounded-xl p-4 text-left max-w-sm mx-auto shadow-lg relative overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-50 to-green-50 rounded-full blur-2xl -translate-y-12 translate-x-12 opacity-40"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                    <CalendarIcon className="w-4 h-4 text-white" />
                  </div>
                  <Text size="sm" className="font-bold text-slate-800">
                    New Booking Details
                  </Text>
                </div>
                <div className="space-y-3">
                  <div className="bg-emerald-50/60 rounded-lg p-3 border border-emerald-100">
                    <Text
                      size="xs"
                      className="text-emerald-600 font-medium uppercase tracking-wider mb-1"
                    >
                      Session
                    </Text>
                    <Text size="sm" className="font-semibold text-slate-900">
                      {bookingInfo.session.title}
                    </Text>
                  </div>
                  <div className="bg-slate-50/60 rounded-lg p-3 border border-slate-100">
                    <Text
                      size="xs"
                      className="text-slate-600 font-medium uppercase tracking-wider mb-1"
                    >
                      Reference
                    </Text>
                    <Text
                      size="sm"
                      className="font-mono font-bold text-slate-900 tracking-wide"
                    >
                      {bookingInfo.booking_reference}
                    </Text>
                    <Text
                      size="xs"
                      className="text-slate-500 mt-1 leading-relaxed"
                    >
                      Please save this reference number for your records.
                    </Text>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* What's Next Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-sm rounded-xl p-4 border border-blue-100 text-left max-w-sm mx-auto shadow-md relative overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-xl -translate-y-6 -translate-x-6 opacity-40"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <InfoIcon className="w-3 h-3 text-white" />
                  </div>
                  <Text size="sm" className="font-semibold text-blue-900">
                    What happens next?
                  </Text>
                </div>
                <ul className="space-y-2 text-xs text-blue-800">
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <span className="text-white text-xs">1</span>
                    </div>
                    <span className="leading-relaxed">
                      You'll receive a confirmation email with your new booking
                      details
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <span className="text-white text-xs">2</span>
                    </div>
                    <span className="leading-relaxed">
                      Add the new session to your calendar
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <span className="text-white text-xs">3</span>
                    </div>
                    <span className="leading-relaxed">
                      Arrive 10-15 minutes early for your session
                    </span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto pt-1"
            >
              <Button
                onClick={onBackToBooking}
                variant="filled"
                size="md"
                className="btn-green-primary shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                leftSection={<ArrowLeftIcon className="w-4 h-4" />}
              >
                Back to Booking
              </Button>
              <Button
                onClick={() =>
                  (window.location.href = `mailto:${businessInfo.contact_email}`)
                }
                variant="outline"
                size="md"
                className="border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
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
  businessInfo: RescheduleInfo["business"];
  bookingInfo: RescheduleInfo["current_booking"];
}

const EnhancedBusinessProfile = ({
  businessInfo,
  bookingInfo,
}: EnhancedBusinessProfileProps) => {
  const businessName = businessInfo?.name || "Business";
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
          {/* Shimmer effect overlay */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform skew-x-12"
          />
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
        <Title
          order={3}
          className="text-base font-bold text-slate-900 leading-tight"
        >
          {businessName}
        </Title>

        <Badge
          variant="light"
          color="gray"
          size="md"
          className="bg-slate-100 text-slate-700 border border-slate-200"
          style={{ textTransform: "capitalize" }}
        >
          {businessInfo.business_type || "Service Provider"}
        </Badge>

        {/* Business details */}
        {businessInfo.address && (
          <Text
            size="xs"
            className="text-slate-600 leading-relaxed text-center"
          >
            📍 {businessInfo.address}
          </Text>
        )}
      </motion.div>

      {/* Current Booking Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30"
      >
        <div className="mb-4">
          <Text
            size="xs"
            fw={600}
            className="text-slate-700 uppercase tracking-wide mb-3"
          >
            YOUR BOOKING
          </Text>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
              <span className="text-lg">📅</span>
            </div>
            <div className="flex-1 min-w-0">
              <Text
                size="sm"
                fw={600}
                className="text-slate-900 leading-tight truncate"
              >
                {bookingInfo.session.title}
              </Text>
              <Text size="xs" className="text-slate-600">
                {bookingInfo.booking_reference}
              </Text>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <Text className="text-slate-600">Date:</Text>
              <Text fw={600} className="text-slate-900">
                {DateTime.fromISO(bookingInfo.session.start_time).toFormat(
                  "DDD"
                )}
              </Text>
            </div>
            <div className="flex items-center justify-between">
              <Text className="text-slate-600">Time:</Text>
              <Text fw={600} className="text-slate-900">
                {DateTime.fromISO(bookingInfo.session.start_time).toFormat(
                  "h:mm a"
                )}{" "}
                -{" "}
                {DateTime.fromISO(bookingInfo.session.end_time).toFormat(
                  "h:mm a"
                )}
              </Text>
            </div>
            <div className="flex items-center justify-between">
              <Text className="text-slate-600">Duration:</Text>
              <Text fw={600} className="text-slate-900">
                {bookingInfo.session.duration_minutes ||
                  (bookingInfo.session.start_time &&
                  bookingInfo.session.end_time
                    ? Math.round(
                        (DateTime.fromISO(
                          bookingInfo.session.end_time
                        ).toMillis() -
                          DateTime.fromISO(
                            bookingInfo.session.start_time
                          ).toMillis()) /
                          (1000 * 60)
                      )
                    : 60)}{" "}
                min
              </Text>
            </div>
            {bookingInfo.session.location && (
              <div className="flex items-center justify-between">
                <Text className="text-slate-600">Location:</Text>
                <Text
                  fw={600}
                  className="text-slate-900 truncate max-w-[120px]"
                >
                  {bookingInfo.session.location}
                </Text>
              </div>
            )}
            {bookingInfo.flexible_booking_info?.selected_staff && (
              <div className="flex items-center justify-between">
                <Text className="text-slate-600">Staff:</Text>
                <Text
                  fw={600}
                  className="text-slate-900 truncate max-w-[120px]"
                >
                  {bookingInfo.flexible_booking_info.selected_staff.name}
                </Text>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Clock Toggle Component
interface ClockToggleProps {
  variant?: "minimal" | "card" | "inline";
}

const ClockToggle = ({ variant = "inline" }: ClockToggleProps) => {
  const { state: timezoneState, actions: timezoneActions } = useTimezone();
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = DateTime.now().setZone(timezoneState.selectedTimezone);
        const timeFormat = timezoneState.use24Hour ? "HH:mm:ss" : "h:mm:ss a";
        setCurrentTime(now.toFormat(timeFormat));
      } catch {
        setCurrentTime("--:--");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezoneState.selectedTimezone, timezoneState.use24Hour]);

  // Get timezone abbreviation
  const getTimezoneAbbr = () => {
    if (timezoneState.selectedTimezone.includes("Nairobi")) {
      return "EAT";
    } else if (timezoneState.selectedTimezone.includes("GMT")) {
      return "GMT+3";
    } else {
      try {
        return DateTime.now()
          .setZone(timezoneState.selectedTimezone)
          .toFormat("ZZZZ");
      } catch {
        return "UTC";
      }
    }
  };

  const timeZoneAbbr = getTimezoneAbbr();

  if (variant === "minimal") {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <ClockIcon className="w-4 h-4" />
        </motion.div>
        <span>{currentTime}</span>
        <span className="text-xs text-slate-500">{timeZoneAbbr}</span>
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
        {timezoneState.use24Hour ? "12h" : "24h"}
      </Button>
    </div>
  );
};

const BookingManage: React.FC = () => {
  const { bookingReference } = useParams<{ bookingReference: string }>();
  const navigate = useNavigate();
  const { state: timezoneState, actions: timezoneActions } = useTimezone();
  const { width } = useViewportSize();
  const isMobile = width < 768;

  // Initialize mutation hook first
  const rescheduleMutation = useRescheduleClientBooking();

  // Use mutation state directly instead of URL parameters
  const isSuccess = rescheduleMutation.isSuccess;

  // Component state
  const [step, setStep] = useState<"date-selection" | "confirmation">(
    "date-selection"
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] =
    useState<RescheduleOption | null>(null);
  const [calendarMonth] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<
    "all" | "similar" | "same_category"
  >("similar");

  // Identity verification state
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [reason, setReason] = useState("");

  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    email?: string | null;
    phone?: string | null;
  }>({});

  // Scroll handling
  const { targetRef, scrollIntoView } = useScrollIntoView<HTMLDivElement>();

  // Fixed date range for API calls - don't change this based on selectedDate
  const fixedDateFrom = useMemo(() => {
    // Start from tomorrow or day after current booking, whichever is later
    const tomorrow = DateTime.now().plus({ days: 1 });
    return tomorrow.toFormat("yyyy-MM-dd");
  }, []);

  // API calls - only fetch reschedule options if not on success page and not during/after mutation
  // 🔧 FIX: Prevent race conditions by being more conservative about when to stop fetching
  const shouldFetchOptions =
    !isSuccess &&
    !rescheduleMutation.isSuccess &&
    !rescheduleMutation.isPending;
  const isMutationComplete =
    rescheduleMutation.isSuccess || rescheduleMutation.isError;

  const {
    data: rescheduleData,
    isLoading: rescheduleLoading,
    error: rescheduleError,
    isFetching: rescheduleIsFetching,
  } = useGetClientRescheduleOptions(
    shouldFetchOptions ? bookingReference || "" : "", // Don't fetch if on success page or during mutation
    shouldFetchOptions ? fixedDateFrom : "",
    shouldFetchOptions
      ? DateTime.now().plus({ months: 3 }).toFormat("yyyy-MM-dd")
      : "",
    shouldFetchOptions ? filterType : ""
  );

  const {
    data: bookingInfo,
    error: bookingError,
    isLoading: bookingInfoLoading,
  } = useGetClientBookingInfo(bookingReference || "");

  // 🐛 DEBUG: Add detailed logging to catch race condition
  console.log("🔍 RESCHEDULE DEBUG - Component State:", {
    isSuccess,
    bookingReference,
    mutation: {
      isPending: rescheduleMutation.isPending,
      isSuccess: rescheduleMutation.isSuccess,
      isError: rescheduleMutation.isError,
    },
    shouldFetchOptions,
    rescheduleDataExists: !!rescheduleData,
    bookingInfoExists: !!bookingInfo,
    rescheduleLoading,
    rescheduleError: !!rescheduleError,
    bookingError: !!bookingError,
    step: "render-start",
  });

  // Type the data properly
  const typedRescheduleData = rescheduleData as RescheduleInfo | undefined;

  // Update business timezone when data loads
  useEffect(() => {
    if (
      typedRescheduleData?.business?.timezone &&
      typedRescheduleData.business.timezone !== timezoneState.businessTimezone
    ) {
      timezoneActions.setBusinessTimezone(
        typedRescheduleData.business.timezone
      );
    }
  }, [
    typedRescheduleData?.business?.timezone,
    timezoneState.businessTimezone,
    timezoneActions,
  ]);

  // Set default selected date based on available sessions
  useEffect(() => {
    if (
      typedRescheduleData?.available_sessions?.length &&
      !selectedDate &&
      !isSuccess
    ) {
      // Find the first available session date that's not today
      const firstAvailableSession = typedRescheduleData.available_sessions
        .map((session) => DateTime.fromISO(session.date))
        .filter((date) => date > DateTime.now())
        .sort((a, b) => a.toMillis() - b.toMillis())[0];

      if (firstAvailableSession) {
        setSelectedDate(firstAvailableSession.toJSDate());
      } else {
        // Fallback to tomorrow if no available sessions
        setSelectedDate(DateTime.now().plus({ days: 1 }).toJSDate());
      }
    }
  }, [typedRescheduleData?.available_sessions, selectedDate, isSuccess]);

  // No need for redirect since we're using mutation state directly

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
      return slotDate.hasSame(selectedDateTime, "day");
    });
  }, [selectedDate, availableSlots]);

  const isDateDisabled = useCallback(
    (date: Date) => {
      // Disable past dates
      if (date < new Date()) return true;

      // If we have a current booking, disable dates before the day after current session
      if (typedRescheduleData?.current_booking?.session?.start_time) {
        const currentSessionDate = DateTime.fromISO(
          typedRescheduleData.current_booking.session.start_time
        );
        const dayAfterSession = currentSessionDate.plus({ days: 1 });
        if (DateTime.fromJSDate(date) < dayAfterSession) return true;
      }

      // Disable dates more than 3 months out
      const threeMonthsOut = DateTime.now().plus({ months: 3 });
      if (DateTime.fromJSDate(date) > threeMonthsOut) return true;

      return false;
    },
    [typedRescheduleData?.current_booking?.session?.start_time]
  );

  const hasAvailability = useCallback(
    (date: Date) => {
      const dateString = DateTime.fromJSDate(date).toFormat("yyyy-MM-dd");
      return availableSlots.some(
        (slot: RescheduleOption) => slot.date === dateString
      );
    },
    [availableSlots]
  );

  const formatTime = useCallback(
    (time: string, date?: string) => {
      try {
        let timeToFormat: DateTime;

        if (date) {
          timeToFormat = DateTime.fromISO(`${date}T${time}:00`, {
            zone: timezoneState.businessTimezone,
          }).setZone(timezoneState.selectedTimezone);
        } else {
          timeToFormat = DateTime.fromISO(`2000-01-01T${time}:00`);
        }

        const format = timezoneState.use24Hour ? "HH:mm" : "h:mm a";
        return timeToFormat.toFormat(format);
      } catch {
        return time;
      }
    },
    [
      timezoneState.businessTimezone,
      timezoneState.selectedTimezone,
      timezoneState.use24Hour,
    ]
  );

  const getTimezoneOptionsForSelect = useMemo(() => {
    const grouped = TIMEZONE_OPTIONS.reduce((acc, tz) => {
      const region = tz.region || "Other";
      if (!acc[region]) {
        acc[region] = { group: region, items: [] };
      }
      acc[region].items.push({ value: tz.value, label: tz.label });
      return acc;
    }, {} as Record<string, { group: string; items: { value: string; label: string }[] }>);

    return Object.values(grouped);
  }, []);

  const handleDateSelect = useCallback(
    (date: Date | null) => {
      if (!date) return;

      setSelectedDate(date);
      setSelectedTimeSlot(null);

      // On mobile, scroll to time slots section after date selection
      if (isMobile) {
        setTimeout(() => {
          scrollIntoView();
        }, 300);
      }
    },
    [isMobile, scrollIntoView]
  );

  const handleTimeSelect = useCallback((slot: RescheduleOption) => {
    setSelectedTimeSlot(slot);
    setStep("confirmation");
  }, []);

  const getDayProps = useCallback(
    (date: Date) => {
      const disabled = isDateDisabled(date);
      const isSelected =
        selectedDate && date.toDateString() === selectedDate.toDateString();
      const hasSlots = hasAvailability(date);

      return {
        onClick: disabled ? undefined : () => handleDateSelect(date),
        disabled: disabled || !hasSlots,
        style: {
          cursor: disabled || !hasSlots ? "not-allowed" : "pointer",
          opacity: disabled || !hasSlots ? 0.3 : 1,
          fontWeight:
            disabled || !hasSlots ? "normal" : hasSlots ? "600" : "400",
          backgroundColor: isSelected
            ? "#10b981"
            : hasSlots && !disabled
            ? "#f0fdf4"
            : undefined,
          color: isSelected
            ? "white"
            : disabled || !hasSlots
            ? "#9ca3af"
            : undefined,
          border: isSelected
            ? "2px solid #059669"
            : hasSlots && !disabled
            ? "1px solid #bbf7d0"
            : undefined,
        },
      };
    },
    [isDateDisabled, selectedDate, hasAvailability, handleDateSelect]
  );

  const excludeDate = useCallback(
    (date: Date) => {
      return isDateDisabled(date) || !hasAvailability(date);
    },
    [isDateDisabled, hasAvailability]
  );

  const handleBack = () => {
    if (step === "confirmation") {
      setStep("date-selection");
    } else {
      navigate("/booking/cancel/" + bookingReference);
    }
  };

  const handleBackToBooking = () => {
    // Navigate back to booking info without success parameter
    navigate(`/booking/manage/${bookingReference}`);
  };

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return "Email address is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) {
      return "Phone number is required";
    }
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      return "Phone number must be at least 10 digits";
    }
    if (digitsOnly.length > 15) {
      return "Phone number must be no more than 15 digits";
    }
    return null;
  };

  const validateForm = (): boolean => {
    const emailError = validateEmail(clientEmail);
    const phoneError = validatePhone(clientPhone);

    setValidationErrors({
      email: emailError,
      phone: phoneError,
    });

    return !emailError && !phoneError;
  };

  const handleConfirmReschedule = async () => {
    if (!selectedTimeSlot || !bookingReference) return;

    // Validate form before submission
    if (!validateForm()) {
      notifications.show({
        title: "Validation Error",
        message: "Please fix the validation errors before submitting.",
        color: "red",
        icon: <InfoIcon className="w-4 h-4" />,
      });
      return;
    }

    console.log("🔍 DEBUG: Reschedule payload:", {
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
      reason: reason || "Client requested reschedule",
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
        reason: reason || "Client requested reschedule",
      });

      notifications.show({
        title: "Booking Rescheduled Successfully",
        message:
          "Your booking has been rescheduled. You will receive a confirmation email shortly.",
        color: "green",
        icon: <CheckIcon className="w-4 h-4" />,
      });

      // Navigation handled by useEffect to show success state first
    } catch (error) {
      let errorMessage = "Failed to reschedule booking. Please try again.";

      // Type guard for error with response property
      const errorWithResponse = error as {
        response?: { data?: { code?: string; error?: string } };
      };

      if (
        errorWithResponse?.response?.data?.code ===
        "IDENTITY_VERIFICATION_FAILED"
      ) {
        errorMessage =
          "Identity verification failed. Please check your email and phone number.";
      } else if (
        errorWithResponse?.response?.data?.code === "SESSION_NOT_AVAILABLE"
      ) {
        errorMessage =
          "The selected session is no longer available. Please choose a different time.";
      } else if (errorWithResponse?.response?.data?.error) {
        errorMessage = errorWithResponse.response.data.error;
      }

      notifications.show({
        title: "Reschedule Failed",
        message: errorMessage,
        color: "red",
        icon: <InfoIcon className="w-4 h-4" />,
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

  // 🔧 FIX: Early return for success state - don't show any error screens during success flow
  // Also handle the mutation success case to prevent flashing of error screens
  if (isSuccess || (isMutationComplete && rescheduleMutation.isSuccess)) {
    console.log("🟢 SUCCESS STATE - Showing success page:", {
      hasBookingInfo: !!bookingInfo,
      bookingInfoKeys: bookingInfo ? Object.keys(bookingInfo) : null,
      isSuccess,
      mutationSuccess: rescheduleMutation.isSuccess,
      isMutationComplete,
    });

    if (bookingInfo) {
      // Transform ClientBookingInfo to match RescheduleInfo structure
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
          location: bookingInfo.session.location || "",
          category_name: bookingInfo.session.category_name,
        },
        quantity: bookingInfo.quantity,
        status: bookingInfo.status,
      };

      return (
        <RescheduleSuccess
          businessInfo={bookingInfo.business}
          bookingInfo={transformedBookingInfo}
          onBackToBooking={handleBackToBooking}
        />
      );
    } else if (bookingInfoLoading || rescheduleIsFetching) {
      console.log("🟡 SUCCESS STATE - Loading booking info...");
      // If on success page but no booking info yet, show loading
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <LoadingOverlay visible={true} />
        </div>
      );
    } else {
      console.log("🟡 SUCCESS STATE - No booking info, retry loading...");
      // Brief wait before showing error if booking info is missing
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <LoadingOverlay visible={true} />
        </div>
      );
    }
  }

  const isInitialLoading = rescheduleLoading && !typedRescheduleData;
  const isTransitioning =
    rescheduleMutation.isPending ||
    (rescheduleMutation.isSuccess && !isSuccess);
  const hasRealError =
    (bookingError || rescheduleError) && !isTransitioning && !isInitialLoading;

  if (isInitialLoading || isTransitioning || rescheduleIsFetching) {
    console.log("🟡 LOADING STATE - Showing loading overlay:", {
      isInitialLoading,
      isTransitioning,
      rescheduleIsFetching,
      mutationPending: rescheduleMutation.isPending,
      mutationSuccess: rescheduleMutation.isSuccess,
      isSuccess,
    });

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingOverlay visible={true} />
      </div>
    );
  }

  if (hasRealError || (!typedRescheduleData && !rescheduleLoading)) {
    console.log("🔴 ERROR STATE - Showing error screen:", {
      bookingError: !!bookingError,
      rescheduleError: !!rescheduleError,
      hasTypedRescheduleData: !!typedRescheduleData,
      hasRealError,
      isSuccess,
      mutationPending: rescheduleMutation.isPending,
      mutationSuccess: rescheduleMutation.isSuccess,
      rescheduleLoading,
    });

    return (
      <RescheduleErrorScreen
        bookingReference={bookingReference || ""}
        rescheduleError={rescheduleError}
        onNavigateBack={() => navigate("/")}
      />
    );
  }

  if (rescheduleMutation.isSuccess && !isSuccess) {
    console.log("🟡 MUTATION SUCCESS - Waiting for redirect...");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingOverlay visible={true} />
      </div>
    );
  }

  if (!rescheduleLoading && !typedRescheduleData) {
    return (
      <RescheduleErrorScreen
        bookingReference={bookingReference || ""}
        rescheduleError={rescheduleError}
        onNavigateBack={() => navigate("/")}
      />
    );
  }

  if (!typedRescheduleData) {
    return null;
  }

  if (step === "confirmation") {
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

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="flex-1 overflow-y-auto h-full services-section flex flex-col"
          >
            <MobileBusinessHeader
              businessInfo={typedRescheduleData.business}
              bookingInfo={typedRescheduleData.current_booking}
              businessName={typedRescheduleData.business?.name || "Business"}
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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                    <span className="text-lg">✅</span>
                  </div>
                  <Text className="text-slate-600 text-xs lg:text-sm font-medium">
                    Confirm Reschedule
                  </Text>
                </div>
                <Title
                  order={1}
                  className="text-xl lg:text-3xl font-bold mb-2 lg:mb-4 text-slate-800"
                >
                  Confirm Your Reschedule
                </Title>
                <Text className="text-slate-600 text-xs lg:text-sm">
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
                <Title
                  order={3}
                  className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2"
                >
                  <span className="text-emerald-600">🔄</span>
                  Session Change
                </Title>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Current Session */}
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-red-600">❌</span>
                      <Text className="font-semibold text-red-800">
                        Current Session
                      </Text>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <strong>Session:</strong>{" "}
                        {typedRescheduleData.current_booking.session.title}
                      </div>
                      <div>
                        <strong>Date:</strong>{" "}
                        {DateTime.fromISO(
                          typedRescheduleData.current_booking.session.start_time
                        ).toFormat("DDDD")}
                      </div>
                      <div>
                        <strong>Time:</strong>{" "}
                        {formatTime(
                          DateTime.fromISO(
                            typedRescheduleData.current_booking.session
                              .start_time
                          ).toFormat("HH:mm")
                        )}{" "}
                        -{" "}
                        {formatTime(
                          DateTime.fromISO(
                            typedRescheduleData.current_booking.session.end_time
                          ).toFormat("HH:mm")
                        )}
                      </div>
                      <div>
                        <strong>Duration:</strong>{" "}
                        {
                          typedRescheduleData.current_booking.session
                            .duration_minutes
                        }{" "}
                        min
                      </div>
                      <div>
                        <strong>Location:</strong>{" "}
                        {typedRescheduleData.current_booking.session.location}
                      </div>
                    </div>
                  </div>

                  {/* New Session */}
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-green-600">✅</span>
                      <Text className="font-semibold text-green-800">
                        New Session
                      </Text>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <strong>Session:</strong> {selectedTimeSlot?.title}
                      </div>
                      <div>
                        <strong>Date:</strong>{" "}
                        {selectedDate?.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div>
                        <strong>Time:</strong>{" "}
                        {formatTime(
                          selectedTimeSlot?.start_time || "",
                          selectedTimeSlot?.date
                        )}{" "}
                        -{" "}
                        {formatTime(
                          selectedTimeSlot?.end_time || "",
                          selectedTimeSlot?.date
                        )}
                      </div>
                      <div>
                        <strong>Duration:</strong>{" "}
                        {selectedTimeSlot?.duration_minutes} min
                      </div>
                      <div>
                        <strong>Location:</strong> {selectedTimeSlot?.location}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
              >
                <Title
                  order={3}
                  className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-emerald-600" />
                  Verify Your Identity
                </Title>

                <Alert
                  icon={<InfoIcon className="w-4 h-4" />}
                  color="blue"
                  variant="light"
                  className="mb-4"
                >
                  <Text size="sm">
                    For security, please verify your identity by providing BOTH
                    the email address AND phone number used for this booking.
                    Both must match our records exactly.
                  </Text>
                </Alert>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput
                    label="Email Address"
                    placeholder="Enter your email"
                    value={clientEmail}
                    onChange={(event) => {
                      const newEmail = event.currentTarget.value;
                      setClientEmail(newEmail);
                      if (validationErrors.email) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          email: null,
                        }));
                      }
                    }}
                    onBlur={() => {
                      const emailError = validateEmail(clientEmail);
                      setValidationErrors((prev) => ({
                        ...prev,
                        email: emailError,
                      }));
                    }}
                    error={validationErrors.email}
                    leftSection={
                      <EmailIcon className="w-4 h-4 text-slate-400" />
                    }
                    required
                    disabled={
                      rescheduleMutation.isPending ||
                      rescheduleMutation.isSuccess
                    }
                    description={
                      validationErrors.email
                        ? undefined
                        : `Hint: ${typedRescheduleData.current_booking.client_email_hint || 'Email not available'}`
                    }
                  />
                  <TextInput
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    value={clientPhone}
                    onChange={(event) => {
                      const newPhone = event.currentTarget.value;
                      setClientPhone(newPhone);
                      if (validationErrors.phone) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          phone: null,
                        }));
                      }
                    }}
                    onBlur={() => {
                      const phoneError = validatePhone(clientPhone);
                      setValidationErrors((prev) => ({
                        ...prev,
                        phone: phoneError,
                      }));
                    }}
                    error={validationErrors.phone}
                    leftSection={
                      <PhoneIcon className="w-4 h-4 text-slate-400" />
                    }
                    required
                    disabled={
                      rescheduleMutation.isPending ||
                      rescheduleMutation.isSuccess
                    }
                    description={
                      validationErrors.phone
                        ? undefined
                        : `Hint: ${typedRescheduleData.current_booking.client_phone_hint || 'Phone not available'}`
                    }
                  />
                </div>

                <Textarea
                  label="Reason for Reschedule (Optional)"
                  placeholder="Let us know why you're rescheduling..."
                  value={reason}
                  onChange={(event) => setReason(event.currentTarget.value)}
                  rows={3}
                  className="mt-4"
                  disabled={
                    rescheduleMutation.isPending || rescheduleMutation.isSuccess
                  }
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
                    : "Failed to reschedule booking. Please try again."}
                </Alert>
              )}

              {/* Form Validation Summary */}
              {(validationErrors.email ||
                validationErrors.phone ||
                !clientEmail.trim() ||
                !clientPhone.trim()) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Alert
                    icon={<InfoIcon className="w-4 h-4" />}
                    color="orange"
                    variant="light"
                    title="Please complete all required fields"
                  >
                    <Text size="sm">
                      Both email address and phone number are required and must
                      be valid to proceed with rescheduling.
                    </Text>
                  </Alert>
                </motion.div>
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
                  disabled={
                    rescheduleMutation.isPending ||
                    rescheduleMutation.isSuccess ||
                    !clientEmail.trim() ||
                    !clientPhone.trim() ||
                    !!validationErrors.email ||
                    !!validationErrors.phone
                  }
                  size="lg"
                  variant="filled"
                  className="w-full lg:w-auto font-semibold py-3 px-8 rounded-xl btn-green-primary shadow-lg hover:shadow-xl"
                  rightSection={
                    rescheduleMutation.isSuccess ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <CheckIcon className="w-4 h-4" />
                    )
                  }
                >
                  {rescheduleMutation.isPending
                    ? "Confirming..."
                    : rescheduleMutation.isSuccess
                    ? "Rescheduled!"
                    : "Confirm Reschedule"}
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
          className="hidden lg:flex lg:flex-col w-96 flex-shrink-0 h-full business-section border-r border-slate-200"
          style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          }}
        >
          <ScrollArea style={{ flex: 1 }} scrollbars="y" offsetScrollbars>
            <div className="p-6">
              <EnhancedBusinessProfile
                businessInfo={typedRescheduleData.business}
                bookingInfo={typedRescheduleData.current_booking}
              />
            </div>
          </ScrollArea>

          {/* Powered by FlowKey Footer */}
          <div
            className="p-4"
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
        </motion.div>

        {/* RIGHT SECTION - Date & Time Selection */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="flex-1 overflow-y-auto overflow-x-hidden h-full flex flex-col services-section"
        >
          {/* Mobile Business Header */}
          <MobileBusinessHeader
            businessInfo={typedRescheduleData.business}
            bookingInfo={typedRescheduleData.current_booking}
            businessName={typedRescheduleData.business?.name || "Business"}
          />

          {/* Header with proper spacing */}
          <div className="mb-6 lg:mb-8 mt-4 lg:mt-12 px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                  <span className="text-lg">🔄</span>
                </div>
                <Text className="text-slate-600 text-sm lg:text-base font-medium">
                  Reschedule Your Booking
                </Text>
              </div>
              <Title
                order={1}
                className="text-2xl lg:text-4xl font-bold mb-3 lg:mb-4 text-slate-900"
              >
                Choose a{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                  new time slot
                </span>
              </Title>
              <Text className="text-slate-600 text-sm lg:text-base leading-relaxed">
                Select your preferred date and available time slot to reschedule
                your booking.
              </Text>
            </motion.div>
          </div>

          {/* Timezone and Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-6 lg:mb-8 px-4 lg:px-8"
          >
            <div className="max-w-4xl">
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 items-start">
                <Select
                  label="Timezone"
                  value={timezoneState.selectedTimezone}
                  onChange={(value) => {
                    const newTimezone = value || "Africa/Nairobi";
                    timezoneActions.setSelectedTimezone(newTimezone);
                  }}
                  data={getTimezoneOptionsForSelect}
                  className="flex-1 min-w-0"
                  classNames={{
                    input:
                      "bg-white/60 backdrop-blur-sm border-white/30 focus:border-emerald-300",
                    label: "text-slate-700 font-medium text-sm",
                  }}
                />

                <div className="mt-6 flex-shrink-0">
                  <ClockToggle variant="inline" />
                </div>

                {/* Filter Options */}
                <Select
                  label="Show Sessions"
                  value={filterType}
                  onChange={(value) =>
                    setFilterType(value as "all" | "similar" | "same_category")
                  }
                  data={[
                    { value: "similar", label: "Similar Sessions" },
                    { value: "same_category", label: "Same Category" },
                    { value: "all", label: "All Available" },
                  ]}
                  className="flex-1 min-w-0"
                  classNames={{
                    input:
                      "bg-white/60 backdrop-blur-sm border-white/30 focus:border-emerald-300",
                    label: "text-slate-700 font-medium text-sm",
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Calendar and Time Selection - Improved Mobile Layout */}
          <div className="flex-1 px-4 lg:px-8 pb-6">
            <div className="max-w-7xl mx-auto">
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
                    <Title
                      order={3}
                      className="text-base font-semibold text-slate-800 mb-4"
                    >
                      Choose Date
                    </Title>

                    {selectedDate && (
                      <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <Text className="text-sm font-medium text-emerald-800 mb-1">
                          Selected Date
                        </Text>
                        <Text className="text-emerald-700 font-semibold">
                          {selectedDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
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
                        calendarHeaderControl:
                          "hover:bg-emerald-50 text-slate-700 transition-colors duration-200",
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
                    <div className="mb-4">
                      <Title
                        order={3}
                        className="text-base font-semibold text-slate-800 mb-4"
                      >
                        Available Times
                      </Title>
                    </div>

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
                      <ScrollArea className="h-72 sm:h-64">
                        <div className="space-y-3">
                          {slotsForSelectedDate
                            .filter(
                              (slot: RescheduleOption) =>
                                slot.capacity_status === "available" &&
                                slot.available_spots > 0
                            )
                            .map((slot: RescheduleOption, index: number) => {
                              return (
                                <motion.div
                                  key={`${slot.date}-${slot.start_time}-${slot.session_id}`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <Paper
                                    className="p-3 sm:p-4 cursor-pointer border-2 transition-all duration-300 bg-white/80 border-slate-200 hover:bg-emerald-25 hover:border-emerald-300 hover:shadow-md"
                                    radius="lg"
                                    onClick={() => handleTimeSelect(slot)}
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <Text className="font-bold text-lg sm:text-base text-slate-900 mb-1">
                                          {formatTime(
                                            slot.start_time,
                                            slot.date
                                          )}{" "}
                                          -{" "}
                                          {formatTime(slot.end_time, slot.date)}
                                        </Text>
                                        <Text className="font-semibold text-base sm:text-sm text-slate-700 mb-2 leading-tight">
                                          {slot.title}
                                        </Text>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm sm:text-xs text-slate-600">
                                          {slot.location && (
                                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                                              <LocationIcon className="w-4 h-4 flex-shrink-0" />
                                              <span className="truncate">
                                                {slot.location}
                                              </span>
                                            </span>
                                          )}
                                          {slot.staff_name && (
                                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                                              <UserIcon className="w-4 h-4 flex-shrink-0" />
                                              <span className="truncate">
                                                {slot.staff_name}
                                              </span>
                                            </span>
                                          )}
                                          <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                                            <ClockIcon className="w-4 h-4 flex-shrink-0" />
                                            <span>
                                              {slot.duration_minutes} min
                                            </span>
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-center sm:text-right flex-shrink-0">
                                        <Badge
                                          color={
                                            slot.available_spots > 10
                                              ? "green"
                                              : slot.available_spots > 5
                                              ? "yellow"
                                              : "orange"
                                          }
                                          variant="light"
                                          size="lg"
                                          className="font-semibold"
                                        >
                                          {slot.available_spots} spots left
                                        </Badge>
                                        <Text
                                          size="xs"
                                          className="text-slate-500 mt-1"
                                        >
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default withBranding(BookingManage, { showHelpText: false });
