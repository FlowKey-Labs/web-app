import React from "react";
import {
  Card,
  TextInput,
  Button,
  Group,
  Text,
  Alert,
  CopyButton,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  useGetUserProfile,
  useGetBusinessProfile,
} from "../../hooks/reactQuery";
import successIcon from "../../assets/icons/success.svg";
import { FlowKeyIcon } from "../../assets/icons";
import config from "../../utils/config";
import { QRCodePosterSystem } from "./qr-code-poster";

const BookingLink: React.FC = () => {
  const { data: userProfile, isLoading: userLoading } = useGetUserProfile();
  const { data: businessProfile, isLoading: businessLoading } =
    useGetBusinessProfile();

  const isLoading = userLoading || businessLoading;

  const business = businessProfile?.[0];

  const generateBookingLink = () => {
    return config.getBookingUrl(business?.slug);
  };

  const bookingLink = generateBookingLink();

  const generatePreviewLink = () => {
    return config.getPreviewBookingUrl(business?.slug);
  };

  const previewLink = generatePreviewLink();

  const setupRequired = !business?.slug;

  const handleCopySuccess = () => {
    notifications.show({
      title: "Link Copied!",
      message: "Booking link has been copied to your clipboard",
      color: "green",
      icon: <img src={successIcon} alt="Success" className="w-4 h-4" />,
    });
  };

  const handlePreviewClick = () => {
    if (!business?.slug) {
      notifications.show({
        title: "Setup Required",
        message:
          "Please complete your business information setup to preview your booking page.",
        color: "yellow",
      });
      return;
    }

    window.open(previewLink, "_blank", "noopener,noreferrer");
  };

  const generateQRCode = () => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      bookingLink
    )}`;
    return qrCodeUrl;
  };

  const shareToSocial = (platform: string) => {
    const message = `Book your session with ${
      business?.business_name || "us"
    } at ${bookingLink}`;

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        bookingLink
      )}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        message
      )}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        bookingLink
      )}`,
    };

    if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <Card className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Link & Sharing
        </h2>
        <p className="text-gray-600">
          Share your booking link with clients to allow them to book sessions
          directly with you.
        </p>
      </div>

      {setupRequired && (
        <Alert color="yellow" title="Setup Required" className="mb-6">
          <p className="text-sm">
            To activate your booking link, please complete your business
            information setup in the
            <strong> Business Information</strong> tab, including setting your
            business slug.
          </p>
        </Alert>
      )}

      <Card className="p-6" radius="md" withBorder>
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <FlowKeyIcon className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Your Booking Link
              </h3>
              <p className="text-sm text-gray-500">
                Share this link with your clients
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Text size="sm" fw={500} mb={8}>
                Booking URL
              </Text>
              <Group gap="xs">
                <TextInput
                  value={bookingLink}
                  readOnly
                  className="flex-1"
                  styles={{
                    input: {
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #e9ecef",
                      color: "#495057",
                      fontSize: "14px",
                    },
                  }}
                />
                <CopyButton value={bookingLink}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? "Copied!" : "Copy link"}>
                      <ActionIcon
                        color={copied ? "green" : "blue"}
                        variant="light"
                        onClick={() => {
                          copy();
                          if (!copied) handleCopySuccess();
                        }}
                        size="lg"
                      >
                        {copied ? (
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                          </svg>
                        )}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>

              <div className="mt-3">
                <Button
                  variant="light"
                  size="sm"
                  leftSection={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  }
                  onClick={handlePreviewClick}
                  disabled={setupRequired}
                  className="text-sm"
                  aria-label="Preview your booking page in a new tab"
                >
                  Preview & Test Page
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Text size="xs" color="dimmed" fw={500} mb={4}>
                  BUSINESS NAME
                </Text>
                <Text size="sm" fw={500}>
                  {business?.business_name || "Not set"}
                </Text>
              </div>
              <div>
                <Text size="xs" color="dimmed" fw={500} mb={4}>
                  BUSINESS SLUG
                </Text>
                <Text size="sm" fw={500}>
                  {business?.slug || "Not set"}
                </Text>
              </div>
              <div>
                <Text size="xs" color="dimmed" fw={500} mb={4}>
                  BUSINESS TYPE
                </Text>
                <Text size="sm" fw={500}>
                  {business?.business_type || "Not set"}
                </Text>
              </div>
              <div>
                <Text size="xs" color="dimmed" fw={500} mb={4}>
                  CONTACT EMAIL
                </Text>
                <Text size="sm" fw={500}>
                  {business?.contact_email || userProfile?.email || "Not set"}
                </Text>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900">
                    Share Your Link
                  </h4>
                  <p className="text-sm text-gray-500">
                    Spread the word on social media
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  leftSection={
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  onClick={() => shareToSocial("facebook")}
                  size="sm"
                  className="text-sm"
                >
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  leftSection={
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  }
                  onClick={() => shareToSocial("twitter")}
                  size="sm"
                  className="text-sm"
                >
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  leftSection={
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                    </svg>
                  }
                  onClick={() => shareToSocial("whatsapp")}
                  size="sm"
                  className="text-sm"
                >
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  leftSection={
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  onClick={() => shareToSocial("linkedin")}
                  size="sm"
                  className="text-sm"
                >
                  LinkedIn
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6" radius="md" withBorder>
        <div>
          <h3 className="text-lg font-semibold mb-1" style={{ color: '#162F3B' }}>
            Professional QR Code Posters
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Create branded QR code posters for your business
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Quick QR Code
                </h4>
                <p className="text-xs text-gray-500">
                  Basic QR code for immediate use
                </p>
              </div>
              
              <div className="text-center mb-4">
                <div className="inline-block p-3 bg-gray-50 rounded-lg border">
                  <img
                    src={generateQRCode()}
                    alt="QR Code"
                    className="rounded"
                    style={{ width: '120px', height: '120px' }}
                  />
                </div>
              </div>
              
              <Button
                fullWidth
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = generateQRCode();
                  link.download = "booking-qr-code.png";
                  link.click();
                }}
              >
                Download Basic QR
              </Button>
            </div>

            <div 
              className="p-4 rounded-lg border-2 flex flex-col h-full"
              style={{ 
                backgroundColor: '#f8fffe',
                borderColor: '#1D9B5E'
              }}
            >
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Professional Posters
                </h4>
                <p className="text-xs text-gray-500">
                  Branded, print-ready posters
                </p>
              </div>
              
              <div className="space-y-1 mb-6 flex-grow">
                <div className="text-xs text-gray-600">
                  • Multiple paper formats (A4, A3, Letter)
                </div>
                <div className="text-xs text-gray-600">
                  • High-resolution print quality
                </div>
                <div className="text-xs text-gray-600">
                  • Professional Flowkey branding
                </div>
              </div>
              
              <div className="mt-auto">
                <QRCodePosterSystem
                  bookingLink={bookingLink}
                  businessName={business?.business_name || "Your Business"}
                  businessType={business?.business_type}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
                <span className="font-medium">💡 Pro Tip:</span> Test scan your QR codes before printing to ensure they work properly.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BookingLink;
