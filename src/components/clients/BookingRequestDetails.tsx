import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Button,
  Divider,
  Stack,
  Grid,
  Card,
  ActionIcon,
  Tooltip,
  Modal,
  Textarea,
  Alert,
  Loader,
  Avatar,
  Container,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { formatDistanceToNow } from "date-fns";
import { BookingRequest } from "../../types/clientTypes";
import {
  useGetBookingRequests,
  useApproveBookingRequest,
  useRejectBookingRequest,
  useCancelBookingRequest,
} from "../../hooks/reactQuery";
import {
  IconArrowLeft,
  IconCalendar,
  IconUser,
  IconPhone,
  IconMail,
  IconClock,
  IconUsers,
  IconMapPin,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconStethoscope,
  IconCategory,
} from "@tabler/icons-react";
import { formatSessionTimes } from "../../utils/timezone";

interface ExtendedBookingRequest extends BookingRequest {
  selected_staff?: {
    user?: {
      first_name: string;
      last_name: string;
    };
  };
  selected_location?: {
    name: string;
  };
  business_timezone?: string;
}

const BookingRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rejectionReason, setRejectionReason] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [
    rejectModalOpened,
    { open: openRejectModal, close: closeRejectModal },
  ] = useDisclosure(false);
  const [
    cancelModalOpened,
    { open: openCancelModal, close: closeCancelModal },
  ] = useDisclosure(false);

  const approveBookingMutation = useApproveBookingRequest();
  const rejectBookingMutation = useRejectBookingRequest();
  const cancelBookingMutation = useCancelBookingRequest();

  const { data: bookingRequestsData, isLoading } = useGetBookingRequests();

  const booking = React.useMemo(() => {
    if (!bookingRequestsData?.items || !id) return null;
    return bookingRequestsData.items.find(
      (b) => b.id === parseInt(id)
    ) as ExtendedBookingRequest | null;
  }, [bookingRequestsData?.items, id]);

  const handleBack = () => {
    navigate("/clients?tab=bookings");
  };

  const handleApprove = async () => {
    if (!booking) return;

    setActionLoading(true);
    try {
      await approveBookingMutation.mutateAsync(booking.id);
    } catch {
      // Error notification handled by mutation
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!booking) return;

    setActionLoading(true);
    try {
      await rejectBookingMutation.mutateAsync({
        requestId: booking.id,
        reason: rejectionReason,
      });
      closeRejectModal();
      setRejectionReason("");
    } catch {
      // Error notification handled by mutation
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;

    setActionLoading(true);
    try {
      await cancelBookingMutation.mutateAsync({
        requestId: booking.id,
        reason: cancellationReason,
      });
      closeCancelModal();
      setCancellationReason("");
    } catch {
      // Error notification handled by mutation
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: BookingRequest["status"]) => {
    switch (status) {
      case "pending":
        return "yellow";
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "expired":
        return "gray";
      case "cancelled":
        return "orange";
      default:
        return "blue";
    }
  };

  const getStatusIcon = (status: BookingRequest["status"]) => {
    switch (status) {
      case "pending":
        return <IconClock size={14} />;
      case "approved":
        return <IconCheck size={14} />;
      case "rejected":
        return <IconX size={14} />;
      case "expired":
        return <IconAlertCircle size={14} />;
      case "cancelled":
        return <IconX size={14} />;
      default:
        return <IconClock size={14} />;
    }
  };

  // Helper function to format booking times with proper timezone conversion
  const formatBookingTime = (startTime: string, endTime: string) => {
    const businessTimezone = booking?.business_timezone || "Africa/Nairobi";
    return formatSessionTimes(startTime, endTime, businessTimezone);
  };

  if (isLoading) {
    return (
      <Container
        size="xl"
        className="flex justify-center items-center h-screen"
      >
        <Loader size="lg" color="green" />
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container size="xl" className="p-4">
        <Paper className="p-6 text-center">
          <IconAlertCircle size={48} className="mx-auto mb-3 text-gray-400" />
          <Title order={4} className="mb-3">
            Booking Request Not Found
          </Title>
          <Text className="mb-4" c="dimmed" size="sm">
            The booking request you're looking for doesn't exist or has been
            removed.
          </Text>
          <Button onClick={handleBack} variant="outline">
            Back to Booking Requests
          </Button>
        </Paper>
      </Container>
    );
  }

  const isPending = booking.status === "pending";
  const isApproved = booking.status === "approved";
  const isExpired = new Date(booking.expires_at) < new Date();
  const canTakeAction = isPending && !isExpired;
  const canCancel = isApproved && !isExpired;

  // Format the booking times with proper timezone conversion
  const sessionTimes = formatBookingTime(
    booking.session_date,
    booking.session_end_time
  );

  return (
    <Container size="xl" className="p-4 pt-6">
      <div className="space-y-4">
        <div className="px-2 py-4">
          <Group justify="space-between" align="flex-start">
            <Group>
              <ActionIcon
                variant="subtle"
                onClick={handleBack}
                size="lg"
                radius="md"
              >
                <IconArrowLeft size={18} />
              </ActionIcon>
              <div>
                <Title order={2} className="text-lg font-bold mb-1">
                  Booking Request Details
                </Title>
                <Text c="dimmed" size="xs" className="font-mono">
                  #{booking.booking_reference}
                </Text>
              </div>
            </Group>

            <Group gap="xs">
              <Badge
                color={getStatusColor(booking.status)}
                variant="light"
                size="md"
                leftSection={getStatusIcon(booking.status)}
              >
                {booking.status_display ||
                  booking.status.charAt(0).toUpperCase() +
                    booking.status.slice(1)}
              </Badge>

              {canTakeAction && (
                <>
                  <Button
                    color="green"
                    onClick={handleApprove}
                    loading={actionLoading}
                    leftSection={<IconCheck size={14} />}
                    size="sm"
                  >
                    Approve
                  </Button>
                  <Button
                    color="red"
                    variant="outline"
                    onClick={openRejectModal}
                    loading={actionLoading}
                    size="sm"
                  >
                    Reject
                  </Button>
                </>
              )}

              {canCancel && (
                <Button
                  color="red"
                  variant="outline"
                  onClick={openCancelModal}
                  loading={actionLoading}
                  size="sm"
                >
                  Cancel
                </Button>
              )}
            </Group>
          </Group>
        </div>

        {isExpired && (
          <Alert
            color="red"
            title="Expired"
            icon={<IconAlertCircle size={14} />}
          >
            <Text size="xs">
              This booking request has expired and can no longer be processed.
            </Text>
          </Alert>
        )}

        {booking.status === "approved" && booking.approved_at && (
          <Alert color="green" title="Approved" icon={<IconCheck size={14} />}>
            <Text size="xs">
              Approved on {new Date(booking.approved_at).toLocaleDateString()}.
              {booking.status === "approved" &&
                " Client account created and notification sent."}
            </Text>
          </Alert>
        )}

        {booking.status === "rejected" && booking.rejection_reason && (
          <Alert color="orange" title="Rejected" icon={<IconX size={14} />}>
            <Text size="xs">Reason: {booking.rejection_reason}</Text>
          </Alert>
        )}

        {booking.status === "cancelled" && booking.cancellation_info && (
          <Alert color="orange" title="Cancelled" icon={<IconX size={14} />}>
            <Text size="xs">
              Cancelled{" "}
              {booking.cancellation_info.cancelled_by_client
                ? "by client"
                : "by admin"}
              {booking.cancellation_info.cancellation_reason && (
                <>: {booking.cancellation_info.cancellation_reason}</>
              )}
            </Text>
          </Alert>
        )}

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 1, md: 1 }}>
            <Card withBorder className="h-full">
              <Stack gap="md">
                <Group>
                  <IconCalendar size={20} className="text-green-600" />
                  <Title order={4} size="md">
                    Session Information
                  </Title>
                </Group>
                <Divider />

                <div className="space-y-3">
                  <div className="p-2 bg-green-50 rounded">
                    <Text size="xs" c="dimmed" fw={500} className="mb-1">
                      Session
                    </Text>
                    <Text fw={600} size="sm">
                      {booking.session_title}
                    </Text>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <IconCategory size={16} className="text-purple-600" />
                    <div>
                      <Text size="xs" c="dimmed" fw={500}>
                        Category
                      </Text>
                      <Text fw={500} size="xs">
                        {booking.category_name}
                      </Text>
                    </div>
                  </div>

                  <div className="p-2 bg-blue-50 rounded">
                    <Group gap="xs" className="mb-1">
                      <IconClock size={16} className="text-blue-600" />
                      <Text size="xs" c="dimmed" fw={500}>
                        Date & Time
                      </Text>
                    </Group>
                    <div>
                      <Text fw={600} size="sm">
                        {new Date(booking.session_date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </Text>
                      <Text size="sm" fw={500} className="text-blue-700">
                        {sessionTimes.timeRange}
                      </Text>
                    </div>
                  </div>
                </div>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 2, md: 2 }}>
            <Card withBorder className="h-full">
              <Stack gap="md">
                <Group>
                  <IconUser size={20} className="text-blue-600" />
                  <Title order={4} size="md">
                    Client Information
                  </Title>
                </Group>
                <Divider />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      size="md"
                      radius="lg"
                      color="blue"
                      className="font-semibold text-sm"
                    >
                      {booking.client_name.charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                      <Text fw={600} size="sm">
                        {booking.client_name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Client
                      </Text>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <IconMail size={16} className="text-blue-600" />
                      <div>
                        <Text size="xs" c="dimmed" fw={500}>
                          Email
                        </Text>
                        <Text fw={500} size="xs">
                          {booking.client_email}
                        </Text>
                      </div>
                    </div>

                    {booking.client_phone && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <IconPhone size={16} className="text-green-600" />
                        <div>
                          <Text size="xs" c="dimmed" fw={500}>
                            Phone
                          </Text>
                          <Text fw={500} size="xs">
                            {booking.client_phone}
                          </Text>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 3, md: 3 }}>
            <Card withBorder>
              <Stack gap="md">
                <Group>
                  <IconUsers size={20} className="text-orange-600" />
                  <Title order={4} size="md">
                    Booking Details
                  </Title>
                </Group>
                <Divider />

                <Grid>
                  <Grid.Col span={6}>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <Text size="xs" c="dimmed" fw={500} className="mb-1">
                        Type
                      </Text>
                      <Badge
                        variant="light"
                        color={booking.is_group_booking ? "blue" : "green"}
                        size="sm"
                      >
                        {booking.is_group_booking ? "Group" : "Individual"}
                      </Badge>
                    </div>
                  </Grid.Col>

                  <Grid.Col span={6}>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <Text size="xs" c="dimmed" fw={500} className="mb-1">
                        Spots
                      </Text>
                      <Text fw={700} size="lg" className="text-green-700">
                        {booking.quantity}
                      </Text>
                    </div>
                  </Grid.Col>

                  <Grid.Col span={6}>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <Text size="xs" c="dimmed" fw={500} className="mb-1">
                        Requested
                      </Text>
                      <Tooltip
                        label={new Date(booking.created_at).toLocaleString()}
                      >
                        <Text fw={500} size="xs">
                          {formatDistanceToNow(new Date(booking.created_at), {
                            addSuffix: true,
                          })}
                        </Text>
                      </Tooltip>
                    </div>
                  </Grid.Col>

                  <Grid.Col span={6}>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <Text size="xs" c="dimmed" fw={500} className="mb-1">
                        Expires
                      </Text>
                      <Tooltip
                        label={new Date(booking.expires_at).toLocaleString()}
                      >
                        <Text
                          c={isExpired ? "red" : "dimmed"}
                          fw={500}
                          size="xs"
                        >
                          {isExpired
                            ? "Expired"
                            : formatDistanceToNow(
                                new Date(booking.expires_at),
                                { addSuffix: true }
                              )}
                        </Text>
                      </Tooltip>
                    </div>
                  </Grid.Col>
                </Grid>

                {(booking.notes || booking.group_booking_notes) && (
                  <>
                    <Divider />
                    <div className="p-3 bg-yellow-50 rounded">
                      <Text size="xs" c="dimmed" fw={500} className="mb-2">
                        {booking.is_group_booking
                          ? "Group Notes"
                          : "Client Notes"}
                      </Text>
                      <Text className="whitespace-pre-wrap" size="xs">
                        {booking.is_group_booking
                          ? booking.group_booking_notes
                          : booking.notes}
                      </Text>
                    </div>
                  </>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          {(booking.selected_staff || booking.selected_location) && (
            <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 4, md: 4 }}>
              <Card withBorder className="h-full">
                <Stack gap="md">
                  <Group>
                    <IconStethoscope size={20} className="text-purple-600" />
                    <Title order={4} size="md">
                      Client Selections
                    </Title>
                  </Group>
                  <Divider />

                  <div className="space-y-3">
                    {booking.selected_staff && (
                      <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                        <IconUser size={16} className="text-purple-600" />
                        <div>
                          <Text size="xs" c="dimmed" fw={500}>
                            Preferred Staff
                          </Text>
                          <Text fw={500} size="xs">
                            {booking.selected_staff.user?.first_name}{" "}
                            {booking.selected_staff.user?.last_name}
                          </Text>
                        </div>
                      </div>
                    )}

                    {booking.selected_location && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <IconMapPin size={16} className="text-red-600" />
                        <div>
                          <Text size="xs" c="dimmed" fw={500}>
                            Preferred Location
                          </Text>
                          <Text fw={500} size="xs">
                            {booking.selected_location.name}
                          </Text>
                        </div>
                      </div>
                    )}
                  </div>
                </Stack>
              </Card>
            </Grid.Col>
          )}
        </Grid>

        <Modal
          opened={rejectModalOpened}
          onClose={closeRejectModal}
          title="Reject Booking Request"
          centered
          size="sm"
        >
          <Stack gap="sm">
            <Text size="sm">
              Reject booking request from <strong>{booking.client_name}</strong>
              ?
            </Text>

            <Textarea
              label="Rejection Reason (Optional)"
              placeholder="Let the client know why..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              minRows={2}
              size="sm"
            />

            <Group justify="flex-end" gap="xs">
              <Button variant="outline" onClick={closeRejectModal} size="sm">
                Cancel
              </Button>
              <Button
                color="red"
                onClick={handleReject}
                loading={actionLoading}
                size="sm"
              >
                Reject
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={cancelModalOpened}
          onClose={closeCancelModal}
          title="Cancel Booking Request"
          centered
          size="sm"
        >
          <Stack gap="sm">
            <Text size="sm">
              Cancel booking request from <strong>{booking.client_name}</strong>
              ?
            </Text>

            <Textarea
              label="Cancellation Reason (Optional)"
              placeholder="Let the client know why..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              minRows={2}
              size="sm"
            />

            <Group justify="flex-end" gap="xs">
              <Button variant="outline" onClick={closeCancelModal} size="sm">
                Cancel
              </Button>
              <Button
                color="red"
                onClick={handleCancel}
                loading={actionLoading}
                size="sm"
              >
                Cancel Booking
              </Button>
            </Group>
          </Stack>
        </Modal>
      </div>
    </Container>
  );
};

export default BookingRequestDetails;
