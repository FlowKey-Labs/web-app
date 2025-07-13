import { useParams } from 'react-router-dom';
import { Box } from '@mantine/core';
import { PublicBookingWidget } from '../components/publicBooking';

interface BookingParams {
  businessSlug: string;
  sessionId?: string;
  serviceId?: string;
  staffId?: string;
  locationId?: string;
}

export default function PublicBookingPage() {
  const params = useParams<BookingParams>();
  const { businessSlug, sessionId, serviceId, staffId, locationId } = params;

  if (!businessSlug) {
    return (
      <Box ta="center" p="xl">
        <h1>Invalid booking link</h1>
        <p>The booking link appears to be invalid. Please check the URL and try again.</p>
      </Box>
    );
  }

  // Create pre-selection object from URL parameters
  const preselection = {
    sessionId: sessionId ? parseInt(sessionId) : undefined,
    serviceId: serviceId ? parseInt(serviceId) : undefined,
    staffId: staffId ? parseInt(staffId) : undefined,
    locationId: locationId ? parseInt(locationId) : undefined,
  };

  return (
    <Box>
      <PublicBookingWidget 
        businessSlug={businessSlug} 
        preselection={preselection}
      />
    </Box>
  );
} 