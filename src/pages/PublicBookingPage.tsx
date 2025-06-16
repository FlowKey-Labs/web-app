import React from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mantine/core';
import { PublicBookingWidget } from '../components/publicBooking';

export default function PublicBookingPage() {
  const { businessSlug } = useParams<{ businessSlug: string }>();

  if (!businessSlug) {
    return (
      <Box ta="center" p="xl">
        <h1>Invalid booking link</h1>
        <p>The booking link appears to be invalid. Please check the URL and try again.</p>
      </Box>
    );
  }

  return (
    <Box>
      <PublicBookingWidget businessSlug={businessSlug} />
    </Box>
  );
} 