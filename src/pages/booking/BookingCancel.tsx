import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Text, 
  Button, 
  Group, 
  Textarea, 
  Alert,
  Loader,
  Stack,
  Badge,
  Title,
  ActionIcon,
  Divider
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconCalendar, IconClock, IconMapPin, IconInfoCircle, IconCheck } from '@tabler/icons-react';
import { useGetClientBookingInfo, useCancelClientBooking } from '../../hooks/reactQuery';
import { formatBookingTimeRange, getTimezoneAbbreviation } from '../../utils/timezone';
import { withBranding } from '../../hoc/withBranding';

const BookingCancel: React.FC = () => {
  const { bookingReference } = useParams<{ bookingReference: string }>();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const { data: bookingInfo, isLoading, error } = useGetClientBookingInfo(bookingReference!);
  const cancelMutation = useCancelClientBooking();

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

      // Navigate to success page or home
      navigate('/booking/cancelled', { 
        state: { 
          bookingReference,
          sessionTitle: bookingInfo?.session_title 
        }
      });
    } catch (error: any) {
      notifications.show({
        title: 'Cancellation Failed',
        message: error.response?.data?.error || 'Failed to cancel booking. Please try again.',
        color: 'red'
      });
    }
  };

  if (isLoading) {
    return (
      <Container size="sm" py="xl">
        <Paper p="xl" withBorder>
          <Group justify="center">
            <Loader />
            <Text>Loading booking details...</Text>
          </Group>
        </Paper>
      </Container>
    );
  }

  if (error || !bookingInfo) {
    return (
      <Container size="sm" py="xl">
        <Paper p="xl" withBorder>
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Booking Not Found"
            color="red"
          >
            The booking reference could not be found or may have already been cancelled.
          </Alert>
          <Group mt="md">
            <Button variant="light" onClick={() => navigate('/')}>
              Return Home
            </Button>
          </Group>
        </Paper>
      </Container>
    );
  }

  // Check if booking can be cancelled
  if (!bookingInfo.can_cancel) {
    return (
      <Container size="sm" py="xl">
        <Paper p="xl" withBorder>
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Cancellation Not Available"
            color="orange"
          >
            This booking cannot be cancelled. {bookingInfo.cancellation_message || 'Please contact the business directly for assistance.'}
          </Alert>
          <Group mt="md">
            <Button variant="light" onClick={() => navigate('/')}>
              Return Home
            </Button>
          </Group>
        </Paper>
      </Container>
    );
  }

  const timeDisplay = formatBookingTimeRange(
    bookingInfo.start_time,
    bookingInfo.end_time,
    bookingInfo.client_timezone || 'Africa/Nairobi',
    'Africa/Nairobi',
    bookingInfo.date
  );

  if (isConfirming) {
    return (
      <Container size="sm" py="xl">
        <Paper p="xl" withBorder>
          <Stack gap="md">
            <Group>
              <ActionIcon 
                variant="subtle" 
                onClick={() => setIsConfirming(false)}
                disabled={cancelMutation.isPending}
              >
                <IconArrowLeft size={16} />
              </ActionIcon>
              <Title order={2} c="red">Confirm Cancellation</Title>
            </Group>

            <Alert
              icon={<IconInfoCircle size={16} />}
              title="Are you sure?"
              color="red"
            >
              This action cannot be undone. Your booking will be cancelled and the slot will become available for other clients.
            </Alert>

            <Paper bg="gray.0" p="md" radius="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={500}>Booking Reference:</Text>
                  <Badge variant="light" color="blue">{bookingInfo.booking_reference}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text fw={500}>Session:</Text>
                  <Text>{bookingInfo.session_title}</Text>
                </Group>
                <Group justify="space-between">
                  <Text fw={500}>Date & Time:</Text>
                  <Text>{bookingInfo.date} at {timeDisplay}</Text>
                </Group>
                <Group justify="space-between">
                  <Text fw={500}>Business:</Text>
                  <Text>{bookingInfo.business_name}</Text>
                </Group>
              </Stack>
            </Paper>

            {reason.trim() && (
              <Paper bg="gray.0" p="md" radius="md">
                <Text fw={500} mb="xs">Cancellation Reason:</Text>
                <Text size="sm" c="dimmed">{reason}</Text>
              </Paper>
            )}

            <Group justify="flex-end" mt="md">
              <Button 
                variant="outline" 
                onClick={() => setIsConfirming(false)}
                disabled={cancelMutation.isPending}
              >
                Go Back
              </Button>
              <Button 
                color="red" 
                onClick={handleCancel}
                loading={cancelMutation.isPending}
              >
                Cancel Booking
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Paper p="xl" withBorder>
        <Stack gap="md">
          <Group>
            <ActionIcon variant="subtle" onClick={() => navigate(-1)}>
              <IconArrowLeft size={16} />
            </ActionIcon>
            <Title order={2}>Cancel Booking</Title>
          </Group>

          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Cancel Your Booking"
            color="blue"
          >
            You can cancel your booking here. Please note that cancellation policies may apply.
          </Alert>

          {/* Booking Details */}
          <Paper bg="gray.0" p="lg" radius="md">
            <Stack gap="md">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={600} size="lg">{bookingInfo.session_title}</Text>
                  <Text c="dimmed" size="sm">{bookingInfo.business_name}</Text>
                </div>
                <Badge variant="light" color="green" size="lg">
                  {bookingInfo.status.charAt(0).toUpperCase() + bookingInfo.status.slice(1)}
                </Badge>
              </Group>

              <Divider />

              <Stack gap="sm">
                <Group>
                  <IconCalendar size={16} />
                  <Text fw={500}>Date:</Text>
                  <Text>{new Date(bookingInfo.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</Text>
                </Group>

                <Group>
                  <IconClock size={16} />
                  <Text fw={500}>Time:</Text>
                  <Text>{timeDisplay}</Text>
                </Group>

                <Group>
                  <IconMapPin size={16} />
                  <Text fw={500}>Location:</Text>
                  <Text>{bookingInfo.business_name}</Text>
                </Group>

                <Group>
                  <Text fw={500}>Booking Reference:</Text>
                  <Badge variant="light" color="blue">{bookingInfo.booking_reference}</Badge>
                </Group>

                {bookingInfo.quantity > 1 && (
                  <Group>
                    <Text fw={500}>Participants:</Text>
                    <Text>{bookingInfo.quantity} people</Text>
                  </Group>
                )}

                {bookingInfo.notes && (
                  <div>
                    <Text fw={500}>Notes:</Text>
                    <Text size="sm" c="dimmed">{bookingInfo.notes}</Text>
                  </div>
                )}
              </Stack>
            </Stack>
          </Paper>

          {/* Cancellation Policy */}
          {bookingInfo.cancellation_policy && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              title="Cancellation Policy"
              color="orange"
            >
              {bookingInfo.cancellation_policy}
            </Alert>
          )}

          {/* Reason for Cancellation */}
          <Stack gap="xs">
            <Text fw={500}>Reason for Cancellation (Optional)</Text>
            <Textarea
              placeholder="Let us know why you're cancelling (optional)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              minRows={3}
              maxRows={5}
            />
            <Text size="xs" c="dimmed">
              This helps us improve our service and may be shared with the business.
            </Text>
          </Stack>

          {/* Action Buttons */}
          <Group justify="flex-end" mt="lg">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Keep Booking
            </Button>
            <Button 
              color="red" 
              onClick={() => setIsConfirming(true)}
            >
              Cancel Booking
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
};

export default withBranding(BookingCancel); 