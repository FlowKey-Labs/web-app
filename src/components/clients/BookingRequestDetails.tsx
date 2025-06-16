import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Box
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { formatDistanceToNow } from 'date-fns';
import { BookingRequest } from '../../types/clientTypes';
import { 
  useGetBookingRequests, 
  useApproveBookingRequest, 
  useRejectBookingRequest,
  useCancelBookingRequest
} from '../../hooks/reactQuery';
import { IconArrowLeft, IconCalendar, IconUser, IconPhone, IconMail, IconClock, IconUsers } from '@tabler/icons-react';
import { formatToEATTime } from '../../utils/formatTo12Hour';

const BookingRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rejectionReason, setRejectionReason] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpened, { open: openRejectModal, close: closeRejectModal }] = useDisclosure(false);
  const [cancelModalOpened, { open: openCancelModal, close: closeCancelModal }] = useDisclosure(false);

  const approveBookingMutation = useApproveBookingRequest();
  const rejectBookingMutation = useRejectBookingRequest();
  const cancelBookingMutation = useCancelBookingRequest();

  // For now, we'll get the booking from the list. In a real app, you'd have a dedicated endpoint
  const { data: bookingRequestsData, isLoading, refetch } = useGetBookingRequests();
  
  const booking = React.useMemo(() => {
    if (!bookingRequestsData?.items || !id) return null;
    return bookingRequestsData.items.find(b => b.id === parseInt(id));
  }, [bookingRequestsData?.items, id]);

  const handleBack = () => {
    navigate('/clients?tab=bookings');
  };

  const handleApprove = async () => {
    if (!booking) return;
    
    setActionLoading(true);
    try {
      await approveBookingMutation.mutateAsync(booking.id);
      notifications.show({
        title: 'Success',
        message: `Booking request from ${booking.client_name} has been approved`,
        color: 'green',
      });
      refetch();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to approve booking request',
        color: 'red',
      });
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
        reason: rejectionReason 
      });
      notifications.show({
        title: 'Success',
        message: `Booking request from ${booking.client_name} has been rejected`,
        color: 'orange',
      });
      closeRejectModal();
      setRejectionReason('');
      refetch();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to reject booking request',
        color: 'red',
      });
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
        reason: cancellationReason 
      });
      notifications.show({
        title: 'Success',
        message: `Booking request from ${booking.client_name} has been cancelled`,
        color: 'orange',
      });
      closeCancelModal();
      setCancellationReason('');
      refetch();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to cancel booking request',
        color: 'red',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: BookingRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'expired':
        return 'gray';
      default:
        return 'blue';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="xl" color="green" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6">
        <Paper className="p-6 text-center">
          <Title order={3} className="mb-4">Booking Request Not Found</Title>
          <Text className="mb-4" c="dimmed">
            The booking request you're looking for doesn't exist or has been removed.
          </Text>
          <Button onClick={handleBack} variant="outline">
            Back to Booking Requests
          </Button>
        </Paper>
      </div>
    );
  }

  const isPending = booking.status === 'pending';
  const isApproved = booking.status === 'approved';
  const isExpired = new Date(booking.expires_at) < new Date();
  const canTakeAction = isPending && !isExpired;
  const canCancel = isApproved && !isExpired;

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Group>
          <ActionIcon 
            variant="subtle" 
            onClick={handleBack}
            size="lg"
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <div>
            <Title order={2}>Booking Request Details</Title>
            <Text c="dimmed" size="sm">#{booking.booking_reference}</Text>
          </div>
        </Group>
        
        <Group>
          <Badge color={getStatusColor(booking.status)} variant="light" size="lg">
            {booking.status_display || booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
          
          {canTakeAction && (
            <Group gap="xs">
              <Button
                color="green"
                onClick={handleApprove}
                loading={actionLoading}
                leftSection={<IconUser size={16} />}
              >
                Approve
              </Button>
              <Button
                color="red"
                variant="outline"
                onClick={openRejectModal}
                loading={actionLoading}
              >
                Reject
              </Button>
            </Group>
          )}
          
          {canCancel && (
            <Button
              color="red"
              variant="outline"
              onClick={openCancelModal}
              loading={actionLoading}
            >
              Cancel Booking
            </Button>
          )}
        </Group>
      </Group>

      {/* Status Alerts */}
      {isExpired && (
        <Alert color="red" title="Expired Request">
          This booking request has expired and can no longer be processed.
        </Alert>
      )}

      {booking.status === 'approved' && booking.approved_at && (
        <Alert color="green" title="Approved">
          This booking request was approved on {new Date(booking.approved_at).toLocaleDateString()}.
          {booking.status === 'approved' && " A client account has been created and the client has been notified."}
        </Alert>
      )}

      {booking.status === 'rejected' && booking.rejection_reason && (
        <Alert color="orange" title="Rejected">
          <Text size="sm">Reason: {booking.rejection_reason}</Text>
        </Alert>
      )}

      <Grid>
        {/* Client Information */}
        <Grid.Col span={12} md={6}>
          <Card withBorder className="h-full">
            <Stack gap="md">
              <Group>
                <IconUser size={20} color="var(--mantine-color-blue-6)" />
                <Title order={4}>Client Information</Title>
              </Group>
              <Divider />
              
              <div className="space-y-3">
                <div>
                  <Text size="sm" c="dimmed" fw={500}>Full Name</Text>
                  <Text>{booking.client_name}</Text>
                </div>
                
                <div>
                  <Text size="sm" c="dimmed" fw={500}>Email</Text>
                  <Group gap="xs">
                    <IconMail size={16} />
                    <Text>{booking.client_email}</Text>
                  </Group>
                </div>
                
                {booking.client_phone && (
                  <div>
                    <Text size="sm" c="dimmed" fw={500}>Phone</Text>
                    <Group gap="xs">
                      <IconPhone size={16} />
                      <Text>{booking.client_phone}</Text>
                    </Group>
                  </div>
                )}
              </div>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Session Information */}
        <Grid.Col span={12} md={6}>
          <Card withBorder className="h-full">
            <Stack gap="md">
              <Group>
                <IconCalendar size={20} color="var(--mantine-color-green-6)" />
                <Title order={4}>Session Information</Title>
              </Group>
              <Divider />
              
              <div className="space-y-3">
                <div>
                  <Text size="sm" c="dimmed" fw={500}>Session Title</Text>
                  <Text fw={500}>{booking.session_title}</Text>
                </div>
                
                <div>
                  <Text size="sm" c="dimmed" fw={500}>Category</Text>
                  <Text>{booking.category_name}</Text>
                </div>
                
                <div>
                  <Text size="sm" c="dimmed" fw={500}>Date & Time</Text>
                  <Group gap="xs">
                    <IconClock size={16} />
                    <Box>
                      <Text>{new Date(booking.session_date).toLocaleDateString()}</Text>
                      <Text size="sm" c="dimmed">
                        {formatToEATTime(booking.session_date)} - {formatToEATTime(booking.session_end_time)}
                      </Text>
                    </Box>
                  </Group>
                </div>
                
                <div>
                  <Text size="sm" c="dimmed" fw={500}>Business</Text>
                  <Text>{booking.business_name}</Text>
                </div>
              </div>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Booking Details */}
        <Grid.Col span={12}>
          <Card withBorder>
            <Stack gap="md">
              <Group>
                <IconUsers size={20} color="var(--mantine-color-orange-6)" />
                <Title order={4}>Booking Details</Title>
              </Group>
              <Divider />
              
              <Grid>
                <Grid.Col span={6} md={3}>
                  <div>
                    <Text size="sm" c="dimmed" fw={500}>Booking Type</Text>
                    <Badge variant="light" color={booking.is_group_booking ? 'blue' : 'green'}>
                      {booking.is_group_booking ? 'Group Booking' : 'Individual'}
                    </Badge>
                  </div>
                </Grid.Col>
                
                <Grid.Col span={6} md={3}>
                  <div>
                    <Text size="sm" c="dimmed" fw={500}>Spots Requested</Text>
                    <Text fw={500}>{booking.quantity}</Text>
                  </div>
                </Grid.Col>
                
                <Grid.Col span={6} md={3}>
                  <div>
                    <Text size="sm" c="dimmed" fw={500}>Requested</Text>
                    <Tooltip label={new Date(booking.created_at).toLocaleString()}>
                      <Text>{formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}</Text>
                    </Tooltip>
                  </div>
                </Grid.Col>
                
                <Grid.Col span={6} md={3}>
                  <div>
                    <Text size="sm" c="dimmed" fw={500}>Expires</Text>
                    <Tooltip label={new Date(booking.expires_at).toLocaleString()}>
                      <Text c={isExpired ? 'red' : 'dimmed'}>
                        {isExpired ? 'Expired' : formatDistanceToNow(new Date(booking.expires_at), { addSuffix: true })}
                      </Text>
                    </Tooltip>
                  </div>
                </Grid.Col>
              </Grid>
              
              {(booking.notes || booking.group_booking_notes) && (
                <>
                  <Divider />
                  <div>
                    <Text size="sm" c="dimmed" fw={500} className="mb-2">
                      {booking.is_group_booking ? 'Group Booking Notes' : 'Notes'}
                    </Text>
                    <Text className="whitespace-pre-wrap">
                      {booking.is_group_booking ? booking.group_booking_notes : booking.notes}
                    </Text>
                  </div>
                </>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Rejection Modal */}
      <Modal
        opened={rejectModalOpened}
        onClose={closeRejectModal}
        title="Reject Booking Request"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to reject the booking request from{' '}
            <strong>{booking.client_name}</strong>?
          </Text>
          
          <Textarea
            label="Rejection Reason (Optional)"
            placeholder="Let the client know why their request was rejected..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            minRows={3}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={closeRejectModal}>
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={handleReject}
              loading={actionLoading}
            >
              Reject Request
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Cancellation Modal */}
      <Modal
        opened={cancelModalOpened}
        onClose={closeCancelModal}
        title="Cancel Booking Request"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to cancel the booking request from{' '}
            <strong>{booking.client_name}</strong>?
          </Text>
          
          <Textarea
            label="Cancellation Reason (Optional)"
            placeholder="Let the client know why their booking was cancelled..."
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            minRows={3}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={closeCancelModal}>
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={handleCancel}
              loading={actionLoading}
            >
              Cancel Booking
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default BookingRequestDetails; 