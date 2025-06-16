import React from 'react';
import { Box, Container, Title, Text, Stack } from '@mantine/core';
import { PublicBookingWidget } from '../components/publicBooking';

export default function PublicBookingDemo() {
  // This is a demo page to showcase the public booking widget
  // In a real implementation, the businessSlug would come from the URL params
  const demoBusinessSlug = 'demo-business';

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Container size="lg" py="xl">
        <Stack gap="xl" align="center" mb="xl">
          <Title order={1} ta="center" c="#1D9B5E">
            FlowKey Public Booking System
          </Title>
          <Text size="lg" ta="center" c="dimmed" maw={600}>
            This is a demonstration of the comprehensive public booking calendar system.
            The system supports service selection, date/time booking, client details collection,
            and handles both individual and group bookings with approval workflows.
          </Text>
        </Stack>
        
        <PublicBookingWidget businessSlug={demoBusinessSlug} />
      </Container>
    </Box>
  );
} 