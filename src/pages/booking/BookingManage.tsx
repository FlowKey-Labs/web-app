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
  Divider,
  Grid,
  Card,
  Select
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconCalendar, IconClock, IconMapPin, IconInfoCircle, IconCheck, IconRefresh } from '@tabler/icons-react';
import { 
  useGetClientBookingInfo, 
  useGetClientRescheduleOptions, 
  useRescheduleClientBooking 
} from '../../hooks/reactQuery';
import { formatBookingTimeRange, getTimezoneAbbreviation } from '../../utils/timezone';
import { withBranding } from '../../hoc/withBranding';
import { RescheduleOption } from '../../types/clientTypes';

const BookingManage: React.FC = () => {
  const { bookingReference } = useParams<{ bookingReference: string }>();
  const navigate = useNavigate();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const { data: bookingInfo, isLoading, error } = useGetClientBookingInfo(bookingReference!);
  const { data: rescheduleOptions, isLoading: isLoadingOptions } = useGetClientRescheduleOptions(
    bookingReference!,
    undefined, // dateFrom
    undefined  // dateTo
  );
  const rescheduleMutation = useRescheduleClientBooking();

  const handleReschedule = async () => {
    if (!bookingReference || !selectedSessionId) return;

    try {
      await rescheduleMutation.mutateAsync({
        bookingReference,
        newSessionId: selectedSessionId
      });

      notifications.show({
        title: 'Booking Rescheduled',
        message: 'Your booking has been successfully rescheduled.',
        color: 'green',
        icon: <IconCheck size={16} />
      });

      // Navigate to success page
      navigate('/booking/rescheduled', { 
        state: { 
          bookingReference,
          sessionTitle: bookingInfo?.session_title 
        }
      });
    } catch (error: any) {
      notifications.show({
        title: 'Reschedule Failed',
        message: error.response?.data?.error || 'Failed to reschedule booking. Please try again.',
        color: 'red'
      });
    }
  };

  if (isLoading) {
    return (
      <Container size="md" py="xl">
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
      <Container size="md" py="xl">
        <Paper p="xl" withBorder>
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Booking Not Found"
            color="red"
          >
            The booking reference could not be found or may have been cancelled.
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

  // Check if booking can be rescheduled
  if (!rescheduleOptions?.reschedule_policy?.can_reschedule) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" withBorder>
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Reschedule Not Available"
            color="orange"
          >
            This booking cannot be rescheduled. {rescheduleOptions?.reschedule_policy?.deadline ? 
              `Reschedules must be made at least ${rescheduleOptions.reschedule_policy.deadline_hours} hours in advance.` : 
              'Please contact the business directly for assistance.'
            }
          </Alert>
          <Group mt="md">
            <Button 
              variant="light" 
              onClick={() => navigate(`/booking/cancel/${bookingReference}`)}
            >
              Cancel Booking Instead
            </Button>
            <Button variant="light" onClick={() => navigate('/')}>
              Return Home
            </Button>
          </Group>
        </Paper>
      </Container>
    );
  }

  const currentTimeDisplay = formatBookingTimeRange(
    bookingInfo.start_time,
    bookingInfo.end_time,
    bookingInfo.client_timezone || 'Africa/Nairobi',
    'Africa/Nairobi',
    bookingInfo.date
  );

  const selectedSession = rescheduleOptions?.available_sessions?.find(
    session => session.session_id === selectedSessionId
  );

  if (isConfirming && selectedSession) {
    const newTimeDisplay = formatBookingTimeRange(
      selectedSession.start_time,
      selectedSession.end_time,
      bookingInfo.client_timezone || 'Africa/Nairobi',
      'Africa/Nairobi',
      selectedSession.date
    );

    return (
      <Container size="md" py="xl">
        <Paper p="xl" withBorder>
          <Stack gap="md">
            <Group>
              <ActionIcon 
                variant="subtle" 
                onClick={() => setIsConfirming(false)}
                disabled={rescheduleMutation.isPending}
              >
                <IconArrowLeft size={16} />
              </ActionIcon>
              <Title order={2} c="blue">Confirm Reschedule</Title>
            </Group>

            <Alert
              icon={<IconInfoCircle size={16} />}
              title="Confirm Your New Booking Time"
              color="blue"
            >
              Please review the changes before confirming your reschedule.
            </Alert>

            <Grid>
              <Grid.Col span={6}>
                <Card withBorder p="md">
                  <Stack gap="xs">
                    <Text fw={600} c="red" size="sm">CURRENT BOOKING</Text>
                    <Text fw={500}>{bookingInfo.session_title}</Text>
                    <Group gap="xs">
                      <IconCalendar size={14} />
                      <Text size="sm">{bookingInfo.date}</Text>
                    </Group>
                    <Group gap="xs">
                      <IconClock size={14} />
                      <Text size="sm">{currentTimeDisplay}</Text>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Card withBorder p="md" bg="blue.0">
                  <Stack gap="xs">
                    <Text fw={600} c="blue" size="sm">NEW BOOKING</Text>
                    <Text fw={500}>{selectedSession.title}</Text>
                    <Group gap="xs">
                      <IconCalendar size={14} />
                      <Text size="sm">{selectedSession.date}</Text>
                    </Group>
                    <Group gap="xs">
                      <IconClock size={14} />
                      <Text size="sm">{newTimeDisplay}</Text>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>

            {reason.trim() && (
              <Paper bg="gray.0" p="md" radius="md">
                <Text fw={500} mb="xs">Reason for Reschedule:</Text>
                <Text size="sm" c="dimmed">{reason}</Text>
              </Paper>
            )}

            <Group justify="flex-end" mt="md">
              <Button 
                variant="outline" 
                onClick={() => setIsConfirming(false)}
                disabled={rescheduleMutation.isPending}
              >
                Go Back
              </Button>
              <Button 
                color="blue" 
                onClick={handleReschedule}
                loading={rescheduleMutation.isPending}
                leftSection={<IconRefresh size={16} />}
              >
                Confirm Reschedule
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Paper p="xl" withBorder>
        <Stack gap="md">
          <Group>
            <ActionIcon variant="subtle" onClick={() => navigate(-1)}>
              <IconArrowLeft size={16} />
            </ActionIcon>
            <Title order={2}>Reschedule Booking</Title>
          </Group>

          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Reschedule Your Booking"
            color="blue"
          >
            Choose a new time slot for your booking. Your current booking will be automatically cancelled.
          </Alert>

          {/* Current Booking Details */}
          <Paper bg="gray.0" p="lg" radius="md">
            <Stack gap="md">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={600} size="lg">{bookingInfo.session_title}</Text>
                  <Text c="dimmed" size="sm">{bookingInfo.business_name}</Text>
                </div>
                <Badge variant="light" color="blue" size="lg">
                  Current Booking
                </Badge>
              </Group>

              <Divider />

              <Grid>
                <Grid.Col span={6}>
                  <Group>
                    <IconCalendar size={16} />
                    <div>
                      <Text fw={500} size="sm">Date</Text>
                      <Text>{new Date(bookingInfo.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</Text>
                    </div>
                  </Group>
                </Grid.Col>

                <Grid.Col span={6}>
                  <Group>
                    <IconClock size={16} />
                    <div>
                      <Text fw={500} size="sm">Time</Text>
                      <Text>{currentTimeDisplay}</Text>
                    </div>
                  </Group>
                </Grid.Col>
              </Grid>

              <Group>
                <Text fw={500}>Booking Reference:</Text>
                <Badge variant="light" color="blue">{bookingInfo.booking_reference}</Badge>
              </Group>
            </Stack>
          </Paper>

          {/* Reschedule Policy */}
          {rescheduleOptions?.reschedule_policy && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              title="Reschedule Policy"
              color="orange"
            >
              <Stack gap="xs">
                <Text size="sm">
                  • You can reschedule up to {rescheduleOptions.reschedule_policy.deadline_hours} hours before your session
                </Text>
                <Text size="sm">
                  • You have {rescheduleOptions.reschedule_policy.reschedules_remaining} reschedule(s) remaining for this booking
                </Text>
                {rescheduleOptions.reschedule_fee_policy?.has_fee && (
                  <Text size="sm">
                    • Reschedule fee may apply: {rescheduleOptions.reschedule_fee_policy.fee_amount}
                  </Text>
                )}
              </Stack>
            </Alert>
          )}

          {/* Available Time Slots */}
          <Stack gap="xs">
            <Text fw={500}>Choose New Time Slot</Text>
            {isLoadingOptions ? (
              <Group justify="center" p="xl">
                <Loader size="sm" />
                <Text>Loading available times...</Text>
              </Group>
            ) : rescheduleOptions?.available_sessions?.length === 0 ? (
              <Alert
                icon={<IconInfoCircle size={16} />}
                title="No Available Sessions"
                color="yellow"
              >
                There are currently no available time slots for rescheduling. Please try again later or contact the business directly.
              </Alert>
            ) : (
              <Grid>
                {rescheduleOptions?.available_sessions?.map((session: RescheduleOption) => {
                  const timeDisplay = formatBookingTimeRange(
                    session.start_time,
                    session.end_time,
                    bookingInfo.client_timezone || 'Africa/Nairobi',
                    'Africa/Nairobi',
                    session.date
                  );

                  return (
                    <Grid.Col span={6} key={session.session_id}>
                      <Card 
                        withBorder 
                        p="md" 
                        style={{ 
                          cursor: 'pointer',
                          border: selectedSessionId === session.session_id ? '2px solid #228be6' : undefined,
                          backgroundColor: selectedSessionId === session.session_id ? '#e7f5ff' : undefined
                        }}
                        onClick={() => setSelectedSessionId(session.session_id)}
                      >
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <Text fw={500}>{session.title}</Text>
                            {session.available_spots < 3 && (
                              <Badge color="orange" size="xs">
                                {session.available_spots} left
                              </Badge>
                            )}
                          </Group>
                          
                          <Group gap="xs">
                            <IconCalendar size={14} />
                            <Text size="sm">{new Date(session.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}</Text>
                          </Group>
                          
                          <Group gap="xs">
                            <IconClock size={14} />
                            <Text size="sm">{timeDisplay}</Text>
                          </Group>

                          {session.category_name !== bookingInfo.category_name && (
                            <Badge variant="light" color="blue" size="xs">
                              {session.category_name}
                            </Badge>
                          )}
                        </Stack>
                      </Card>
                    </Grid.Col>
                  );
                })}
              </Grid>
            )}
          </Stack>

          {selectedSessionId && (
            <>
              {/* Reason for Reschedule */}
              <Stack gap="xs">
                <Text fw={500}>Reason for Reschedule (Optional)</Text>
                <Textarea
                  placeholder="Let us know why you're rescheduling (optional)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  minRows={2}
                  maxRows={4}
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
                  Cancel
                </Button>
                <Button 
                  color="blue" 
                  onClick={() => setIsConfirming(true)}
                  leftSection={<IconRefresh size={16} />}
                >
                  Reschedule Booking
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default withBranding(BookingManage); 