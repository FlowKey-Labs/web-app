import { useEffect, useMemo } from "react";
import { LoadingOverlay, Alert, Box } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ExclamationIcon } from "./bookingIcons";
import { PublicBookingProvider, useBookingFlow } from "./PublicBookingProvider";
import { ServiceSelectionStep } from "./steps/ServiceSelectionStep";
import { SubcategorySelectionStep } from "./steps/SubcategorySelectionStep";
import { StaffSelectionStep } from "./steps/StaffSelectionStep";
import { LocationSelectionStep } from "./steps/LocationSelectionStep";
import { DateSelectionStep } from "./steps/DateSelectionStep";
import { TimeSelectionStep } from "./steps/TimeSelectionStep";
import { BookingDetailsStep } from "./steps/BookingDetailsStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";
import { BookingSidebar } from "./BookingSidebar";
import { useGetPublicBusinessInfo } from "../../hooks/reactQuery";
import WithBrandingLayout from "../common/WithBrandingLayout";
import ErrorBoundary from "../common/ErrorBoundary";
import { StateDebugger } from "./StateDebugger";

interface PublicBookingWidgetProps {
  businessSlug: string;
  className?: string;
}

function BookingWidgetContent({ businessSlug }: { businessSlug: string }) {
  const {
    state,
    dispatch,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    resetFlow,
  } = useBookingFlow();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const {
    data: businessInfo,
    isLoading: businessLoading,
    error: businessError,
  } = useGetPublicBusinessInfo(businessSlug);

  const memoizedBusinessInfo = useMemo(() => businessInfo, [businessInfo]);

  useEffect(() => {
    if (
      memoizedBusinessInfo &&
      (!state.businessInfo ||
        state.businessInfo.slug !== memoizedBusinessInfo.slug)
    ) {
      dispatch({ type: "SET_BUSINESS_INFO", payload: memoizedBusinessInfo });
    }
  }, [dispatch, memoizedBusinessInfo, state.businessInfo]);

  if (businessLoading) {
    return (
      <WithBrandingLayout showHelpText={false}>
        <Box
          style={{
            minHeight: "400px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LoadingOverlay visible={true} />
        </Box>
      </WithBrandingLayout>
    );
  }

  if (businessError || !businessInfo) {
    return (
      <WithBrandingLayout>
        <Box
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <Alert
            icon={<ExclamationIcon className="w-5 h-5" />}
            color="red"
            title="Unable to Load Booking"
            style={{ maxWidth: "500px" }}
          >
            {businessError?.message ||
              "The booking system is currently unavailable. Please try again later."}
          </Alert>
        </Box>
      </WithBrandingLayout>
    );
  }

  const renderCurrentStep = () => {
    try {
      switch (state.currentStep) {
        case "service":
          return (
            <ServiceSelectionStep
              businessSlug={businessSlug}
              businessInfo={businessInfo}
            />
          );
        case "subcategory":
          return (
            <SubcategorySelectionStep
              businessSlug={businessSlug}
              businessInfo={businessInfo}
            />
          );
        case "location":
          return (
            <LocationSelectionStep
              businessSlug={businessSlug}
              businessInfo={businessInfo}
            />
          );
        case "staff":
          return (
            <StaffSelectionStep
              businessSlug={businessSlug}
              businessInfo={businessInfo}
            />
          );
        case "date":
          return (
            <DateSelectionStep
              businessSlug={businessSlug}
              businessInfo={businessInfo}
            />
          );
        case "time":
          return (
            <TimeSelectionStep
              businessSlug={businessSlug}
              businessInfo={businessInfo}
            />
          );
        case "details":
          return <BookingDetailsStep businessInfo={businessInfo} />;
        case "confirmation":
          return (
            <ConfirmationStep
              businessSlug={businessSlug}
              businessInfo={businessInfo}
            />
          );
        default:
          return (
            <ServiceSelectionStep
              businessSlug={businessSlug}
              businessInfo={businessInfo}
            />
          );
      }
    } catch (error) {
      console.error("Error rendering step:", error);
      return (
        <Alert
          icon={<ExclamationIcon className="w-5 h-5" />}
          color="red"
          title="Error Loading Step"
          style={{ margin: "2rem 0" }}
        >
          Unable to load this booking step. Please refresh the page and try
          again.
        </Alert>
      );
    }
  };

  // Mobile layout - stacked
  if (isMobile) {
    return (
      <div className="relative">
        <StateDebugger />
        <WithBrandingLayout showHelpText={false}>
          <Box style={{ width: "100%", minHeight: "100vh" }}>
            <ErrorBoundary>{renderCurrentStep()}</ErrorBoundary>
          </Box>
        </WithBrandingLayout>
      </div>
    );
  }

  return (
    <div className="relative">
      <StateDebugger />
      {["service", "date"].includes(state.currentStep) && (
        <div className="absolute top-4 right-4 z-50">
          <h3 className="text-sm text-primary">
            Having trouble?{" "}
            <span className="text-secondary cursor-pointer hover:underline">
              Get Help
            </span>
          </h3>
        </div>
      )}

      <WithBrandingLayout showHelpText={false}>
        <Box style={{ display: "flex", width: "100%", height: "100vh" }}>
          <Box style={{ width: "400px", flexShrink: 0 }}>
            <BookingSidebar
              businessInfo={businessInfo}
              bookingConfirmation={state.bookingConfirmation}
              onEditStep={goToStep}
              onStartOver={resetFlow}
              onBookAnother={resetFlow}
            />
          </Box>
          <Box style={{ flex: 1, overflow: "hidden" }}>
            <ErrorBoundary>{renderCurrentStep()}</ErrorBoundary>
          </Box>
        </Box>
      </WithBrandingLayout>
    </div>
  );
}

export function PublicBookingWidget({
  businessSlug,
  className,
}: PublicBookingWidgetProps) {
  return (
    <div className={className}>
      <ErrorBoundary>
        <PublicBookingProvider>
          <BookingWidgetContent businessSlug={businessSlug} />
        </PublicBookingProvider>
      </ErrorBoundary>
    </div>
  );
}
