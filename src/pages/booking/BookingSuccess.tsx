import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Text, 
  Button, 
  Group, 
  Stack,
  Title,
  ThemeIcon
} from '@mantine/core';
import { IconCalendarX, IconCalendarEvent } from '@tabler/icons-react';
import { withBranding } from '../../hoc/withBranding';

type SuccessType = 'cancelled' | 'rescheduled';

interface BookingSuccessProps {
  type: SuccessType;
}

const BookingSuccess: React.FC<BookingSuccessProps> = ({ type }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { bookingReference, sessionTitle } = location.state || {};

  const config = {
    cancelled: {
      icon: IconCalendarX,
      color: 'red',
      title: 'Booking Cancelled',
      message: 'Your booking has been successfully cancelled.',
      description: 'We understand plans can change. Your spot is now available for other clients.',
    },
    rescheduled: {
      icon: IconCalendarEvent,
      color: 'blue',
      title: 'Booking Rescheduled',
      message: 'Your booking has been successfully rescheduled.',
      description: 'You should receive a confirmation email with your new booking details shortly.',
    }
  };

  const { icon: Icon, color, title, message, description } = config[type];

  return (
    <Container size="sm" py="xl">
      <Paper p="xl" withBorder radius="md" shadow="sm">
        <Stack align="center" gap="lg">
          
          {/* Success Icon */}
          <ThemeIcon size={80} radius="xl" color={color} variant="light">
            <Icon size={40} />
          </ThemeIcon>

          {/* Success Message */}
          <Stack align="center" gap="sm">
            <Title order={2} ta="center" c={color}>
              {title}
            </Title>
            <Text size="lg" ta="center" fw={500}>
              {message}
            </Text>
            <Text ta="center" c="dimmed">
              {description}
            </Text>
          </Stack>

          {/* Booking Details */}
          {bookingReference && (
            <Paper bg="gray.0" p="md" radius="md" w="100%">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={500}>Booking Reference:</Text>
                  <Text c="blue" fw={600}>{bookingReference}</Text>
                </Group>
                {sessionTitle && (
                  <Group justify="space-between">
                    <Text fw={500}>Session:</Text>
                    <Text>{sessionTitle}</Text>
                  </Group>
                )}
              </Stack>
            </Paper>
          )}

          {/* Action Buttons */}
          <Group mt="md">
            <Button variant="light" onClick={() => navigate('/')}>
              Return Home
            </Button>
            {type === 'cancelled' && (
              <Button 
                onClick={() => navigate('/book')}
                variant="filled"
              >
                Book Another Session
              </Button>
            )}
          </Group>

          {/* Additional Info */}
          <Paper bg="blue.0" p="md" radius="md" w="100%">
            <Text size="sm" ta="center" c="blue.8">
              📧 You will receive an email confirmation shortly.
              <br />
              If you have any questions, please contact the business directly.
            </Text>
          </Paper>

        </Stack>
      </Paper>
    </Container>
  );
};

export const BookingCancelled = withBranding(() => <BookingSuccess type="cancelled" />);
export const BookingRescheduled = withBranding(() => <BookingSuccess type="rescheduled" />);

export default BookingSuccess; 