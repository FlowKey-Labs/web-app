import React from "react";
import {
  Box,
  Stack,
  Text,
  Title,
  Group,
  Badge,
  Button,
  Progress,
  ScrollArea,
} from "@mantine/core";
import { motion } from "framer-motion";
import { CheckIcon, ClockIcon, EmailIcon } from "./bookingIcons";
import { FlowKeyIcon } from "../../assets/icons";
import { BookingStep, PublicBusinessInfo, BookingConfirmation } from "../../types/clientTypes";
import { useBookingFlow } from "./PublicBookingProvider";

interface BookingProgressItem {
  step: BookingStep;
  label: string;
  shortLabel?: string;
}

interface BookingSidebarProps {
  businessInfo?: PublicBusinessInfo;
  bookingConfirmation?: BookingConfirmation | null;
  onEditStep?: (step: BookingStep) => void;
  onStartOver?: () => void;
  onBookAnother?: () => void;
  className?: string;
}

const progressSteps: BookingProgressItem[] = [
  { step: "service", label: "Service", shortLabel: "Service" },
  { step: "date", label: "Date", shortLabel: "Date" },
  { step: "staff", label: "Staff", shortLabel: "Staff" },
  { step: "location", label: "Location", shortLabel: "Location" },
  { step: "details", label: "Details", shortLabel: "Details" },
  { step: "confirmation", label: "Confirm", shortLabel: "Confirm" },
];

const howItWorksSteps = [
  "Select a service from the available options",
  "Choose your preferred date and time",
  "Fill in your details to complete booking",
];

export function BookingSidebar({
  businessInfo,
  bookingConfirmation,
  onEditStep,
  onStartOver,
  onBookAnother,
  className = "",
}: BookingSidebarProps) {
  const { state, goToStep, resetFlow } = useBookingFlow();

  const availableSteps = React.useMemo(() => {
    const steps = progressSteps.filter((step) => {
      if (
        step.step === "staff" &&
        !state.flexibleBookingSettings?.allow_staff_selection
      ) {
        return false;
      }
      if (
        step.step === "location" &&
        !state.flexibleBookingSettings?.allow_location_selection
      ) {
        return false;
      }
      return true;
    });
    return steps;
  }, [state.flexibleBookingSettings]);

  const currentStepIndex = availableSteps.findIndex(
    (step) => step.step === state.currentStep
  );
  const progressPercentage =
    currentStepIndex >= 0
      ? ((currentStepIndex + 1) / availableSteps.length) * 100
      : 0;
  const stepNumber = currentStepIndex + 1;
  const totalSteps = availableSteps.length;

  const showHowItWorks =
    state.currentStep === "service" && !state.selectedService;
  const showBookingSummary = ["details", "confirmation"].includes(
    state.currentStep
  );

  const handleEditStep = (step: BookingStep) => {
    if (onEditStep) {
      onEditStep(step);
    } else {
      goToStep(step);
    }
  };

  const handleStartOver = () => {
    if (onStartOver) {
      onStartOver();
    } else {
      resetFlow();
    }
  };

  const formatDateTime = () => {
    if (!state.selectedDate) return "";

    const date = new Date(state.selectedDate);
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    if (state.selectedSlot || state.selectedTimeSlot) {
      const slot = state.selectedSlot || state.selectedTimeSlot;
      if (!slot) return dateStr;
      const timeStr = `${slot.start_time} - ${slot.end_time}`;

      // Add timezone abbreviation
      if (state.selectedTimezone) {
        const tzAbbr = state.selectedTimezone.includes("Nairobi")
          ? "EAT"
          : state.selectedTimezone.includes("GMT")
          ? "GMT+3"
          : "";
        return `${dateStr}\n${timeStr} ${tzAbbr}`.trim();
      }

      return `${dateStr}\n${timeStr}`;
    }

    return dateStr;
  };

  const BusinessInfoSection = () => (
    <Stack gap="lg">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative mx-auto w-fit"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl border-4 border-white/50 business-logo">
          <span className="text-2xl font-bold text-white relative z-10">
            {businessInfo?.business_name?.charAt(0)?.toUpperCase() || "T"}
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
          {businessInfo?.business_name || "Triumph Therapies"}
        </Title>

        <Badge
          variant="light"
          color="gray"
          size="md"
          className="bg-slate-100 text-slate-700 border border-slate-200"
          style={{ textTransform: "capitalize" }}
        >
          {businessInfo?.business_type || "THERAPY"}
        </Badge>

        {businessInfo?.about && (
          <Text size="xs" className="text-slate-700 leading-relaxed px-2">
            {businessInfo.about}
          </Text>
        )}
      </motion.div>
    </Stack>
  );

  const HowItWorksSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="bg-white/40 backdrop-blur-sm rounded-2xl p-5 border border-white/20"
    >
      <Title order={5} className="text-slate-800 mb-4 text-sm">
        How it works
      </Title>

      <Stack gap="sm">
        {howItWorksSteps.map((step, index) => (
          <Text
            key={index}
            size="xs"
            className="text-slate-600 flex items-start gap-3"
          >
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
              {index + 1}
            </span>
            <span>{step}</span>
          </Text>
        ))}
      </Stack>
    </motion.div>
  );

  const ProgressSection = () => (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={600} className="text-slate-800">
          Progress
        </Text>
        <Text size="xs" className="text-slate-600">
          Step {stepNumber} of {totalSteps}
        </Text>
      </Group>

      <Progress
        value={progressPercentage}
        color="#10b981"
        size="md"
        radius="xl"
        className="bg-slate-100"
      />

      <Group justify="space-between" gap="xs" wrap="nowrap">
        {availableSteps.map((stepItem, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <Group
              key={stepItem.step}
              gap="xs"
              style={{
                minWidth: 0,
                cursor: isCompleted ? "pointer" : "default",
              }}
              onClick={() => isCompleted && handleEditStep(stepItem.step)}
            >
              <Box
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isCompleted
                    ? "#10b981"
                    : isCurrent
                    ? "#10b981"
                    : "#f1f5f9",
                  color: isCompleted || isCurrent ? "white" : "#94a3b8",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }}
              >
                {isCompleted ? <CheckIcon className="w-2.5 h-2.5" /> : ""}
              </Box>

              <Text
                size="xs"
                c={isCompleted || isCurrent ? "#10b981" : "#94a3b8"}
                fw={isCurrent ? 600 : 500}
                style={{
                  fontSize: "0.7rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                }}
              >
                {stepItem.shortLabel}
              </Text>
            </Group>
          );
        })}
      </Group>
    </Stack>
  );

  const SelectedServiceSection = () => {
    if (!state.selectedService) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="bg-emerald-50/80 backdrop-blur-sm rounded-lg p-3 border border-emerald-200/50"
      >
        <Stack gap="xs">
          <Text
            size="xs"
            fw={600}
            className="text-emerald-700 uppercase tracking-wide"
          >
            SERVICE
          </Text>
          <Text size="sm" fw={600} className="text-slate-900">
            {state.selectedService.name}
          </Text>
          <Group justify="space-between" align="center">
            {state.selectedService.duration_minutes && (
              <Group gap="xs">
                <ClockIcon className="w-3 h-3 text-slate-500" />
                <Text size="xs" className="text-slate-600 font-medium">
                  {state.selectedService.duration_minutes} min
                </Text>
              </Group>
            )}
            <Badge
              variant="filled"
              color="green"
              size="sm"
              className="bg-emerald-600 font-semibold"
            >
              {state.selectedService.price &&
              Number(state.selectedService.price) > 0
                ? `$${state.selectedService.price}`
                : "FREE"}
            </Badge>
          </Group>
        </Stack>
      </motion.div>
    );
  };

  const SelectedDateSection = () => {
    if (!state.selectedDate) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="bg-blue-50/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50"
      >
        <Stack gap="xs">
          <Text
            size="xs"
            fw={600}
            className="text-blue-700 uppercase tracking-wide"
          >
            DATE & TIME
          </Text>
          <Text
            size="sm"
            fw={600}
            className="text-slate-900 whitespace-pre-line"
          >
            {formatDateTime()}
          </Text>
          <Group gap="xs">
            <ClockIcon className="w-3 h-3 text-slate-500" />
            <Text size="xs" className="text-slate-600 font-medium">
              {state.selectedService?.duration_minutes || 60} min
            </Text>
          </Group>
        </Stack>
      </motion.div>
    );
  };

  const SelectedStaffSection = () => {
    if (!state.selectedStaff) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="bg-purple-50/80 backdrop-blur-sm rounded-lg p-3 border border-purple-200/50"
      >
        <Stack gap="xs">
          <Text
            size="xs"
            fw={600}
            className="text-purple-700 uppercase tracking-wide"
          >
            STAFF
          </Text>
          <Text size="sm" fw={600} className="text-slate-900">
            {state.selectedStaff.name}
          </Text>
          <Group gap="xs">
            <Box
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
              }}
            />
            <Text
              size="xs"
              className="text-emerald-600 uppercase font-semibold"
            >
              AVAILABLE
            </Text>
          </Group>
        </Stack>
      </motion.div>
    );
  };

  const SelectedLocationSection = () => {
    if (!state.selectedLocation) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="bg-orange-50/80 backdrop-blur-sm rounded-lg p-3 border border-orange-200/50"
      >
        <Stack gap="xs">
          <Text
            size="xs"
            fw={600}
            className="text-orange-700 uppercase tracking-wide"
          >
            LOCATION
          </Text>
          <Text size="sm" fw={600} className="text-slate-900">
            {state.selectedLocation.name}
          </Text>
          <Text size="xs" className="text-slate-600 leading-relaxed">
            {state.selectedLocation.address}
          </Text>
        </Stack>
      </motion.div>
    );
  };

  const BookingSuccessSection = () => {
    if (!bookingConfirmation) return null;
    
    const isApprovalRequired = bookingConfirmation.status === 'pending';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="space-y-6"
      >
        {/* Success Icon */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg mb-4"
          >
            <CheckIcon className="w-8 h-8 text-white" />
          </motion.div>
          
          <Title order={4} className="text-lg font-bold text-slate-900 mb-2">
            {isApprovalRequired ? 'Request Submitted!' : 'Booking Confirmed!'}
          </Title>
          
          <Text size="sm" className="text-slate-600 mb-4">
            {bookingConfirmation.message}
          </Text>
        </div>

        {/* Booking Details */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30">
          <Text size="xs" fw={600} className="text-slate-700 uppercase tracking-wide mb-3">
            BOOKING DETAILS
          </Text>
          
          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="xs" className="text-slate-600">Reference:</Text>
              <Text size="xs" fw={600} className="text-emerald-600">
                {bookingConfirmation.booking_reference}
              </Text>
            </Group>
            
            <Group justify="space-between">
              <Text size="xs" className="text-slate-600">Session:</Text>
              <Text size="xs" fw={600} className="text-slate-900">
                {bookingConfirmation.session_details.title}
              </Text>
            </Group>
            
            <Group justify="space-between">
              <Text size="xs" className="text-slate-600">Date:</Text>
              <Text size="xs" fw={600} className="text-slate-900">
                {new Date(bookingConfirmation.session_details.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric'
                })}
              </Text>
            </Group>
            
            <Group justify="space-between">
              <Text size="xs" className="text-slate-600">Time:</Text>
              <Text size="xs" fw={600} className="text-slate-900">
                {bookingConfirmation.session_details.start_time} - {bookingConfirmation.session_details.end_time}
              </Text>
            </Group>
          </Stack>
        </div>

        {/* What's Next */}
        <div className="bg-blue-50/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50">
          <Text size="xs" fw={600} className="text-blue-700 uppercase tracking-wide mb-3">
            WHAT'S NEXT?
          </Text>
          
          <Stack gap="sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <Text size="xs" className="text-blue-700">
                {isApprovalRequired 
                  ? 'You\'ll receive an email once your booking is approved'
                  : 'Check your email for booking confirmation and details'
                }
              </Text>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <Text size="xs" className="text-blue-700">
                Add the appointment to your calendar
              </Text>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <Text size="xs" className="text-blue-700">
                Arrive on time for your appointment
              </Text>
            </div>
          </Stack>
        </div>

        {/* Action Buttons */}
        <Stack gap="sm">
          <Button
            variant="filled"
            size="sm"
            fullWidth
            onClick={onBookAnother}
            className="btn-green-primary"
          >
            Book Another Appointment
          </Button>
          
          {businessInfo?.email && (
            <Button
              variant="outline"
              size="sm"
              fullWidth
              leftSection={<EmailIcon className="w-4 h-4" />}
              onClick={() => window.open(`mailto:${businessInfo.email}`, '_blank')}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Contact Us
            </Button>
          )}
        </Stack>
      </motion.div>
    );
  };

  const FlowKeyFooter = () => (
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
  );

  const StartOverButton = () => (
    <Button
      variant="outline"
      color="gray"
      size="sm"
      fullWidth
      onClick={handleStartOver}
      className="border-slate-200 text-slate-700 hover:bg-slate-50"
    >
      Start Over
    </Button>
  );

  return (
    <Box
      className={className}
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <ScrollArea style={{ flex: 1 }} scrollbars="y" offsetScrollbars>
        <Box p="lg">
          <Stack gap="lg">
            <BusinessInfoSection />

            {bookingConfirmation ? (
              <BookingSuccessSection />
            ) : showHowItWorks ? (
              <HowItWorksSection />
            ) : (
              <Stack gap="md">
                <ProgressSection />

                <Stack gap="sm">
                  <SelectedServiceSection />
                  <SelectedDateSection />
                  <SelectedStaffSection />
                  <SelectedLocationSection />
                </Stack>

                {showBookingSummary && <StartOverButton />}
              </Stack>
            )}
          </Stack>
        </Box>
      </ScrollArea>

      <Box
        p="md"
        style={{
          borderTop: "1px solid #e2e8f0",
          background: "rgba(248, 250, 252, 0.8)",
          backdropFilter: "blur(8px)",
        }}
      >
        <FlowKeyFooter />
      </Box>
    </Box>
  );
}
