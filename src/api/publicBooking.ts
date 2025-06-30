import axios from 'axios';
import { PublicBusinessInfo, PublicService, PublicBookingRequest, AvailabilitySlot } from '../types/clientTypes';

const API_BASE_URL = import.meta.env.VITE_APP_BASEURL || 'http://localhost:8000';

// Get public business information
export const getPublicBusinessInfo = async (businessSlug: string): Promise<PublicBusinessInfo> => {
  const response = await axios.get(`${API_BASE_URL}/api/public/businesses/${businessSlug}`);
  return response.data;
};

// Get public business services
export const getPublicBusinessServices = async (businessSlug: string): Promise<PublicService[]> => {
  const response = await axios.get(`${API_BASE_URL}/api/public/businesses/${businessSlug}/services`);
  return response.data;
};

// Get available time slots for a service on a specific date
export const getAvailableSlots = async (
  businessSlug: string, 
  serviceId: string, 
  date: string
): Promise<AvailabilitySlot[]> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/public/businesses/${businessSlug}/services/${serviceId}/availability`,
    {
      params: { date }
    }
  );
  return response.data;
};

// Create a public booking
export const createPublicBooking = async (bookingData: PublicBookingRequest): Promise<any> => {
  const response = await axios.post(`${API_BASE_URL}/api/public/bookings`, bookingData);
  return response.data;
};

// Get booking confirmation details
export const getBookingConfirmation = async (bookingId: string): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/api/public/bookings/${bookingId}/confirmation`);
  return response.data;
};

// Cancel a public booking
export const cancelPublicBooking = async (bookingId: string, reason?: string): Promise<any> => {
  const response = await axios.post(`${API_BASE_URL}/api/public/bookings/${bookingId}/cancel`, {
    reason
  });
  return response.data;
};

// Reschedule a public booking
export const reschedulePublicBooking = async (
  bookingId: string, 
  newSlotId: string
): Promise<any> => {
  const response = await axios.post(`${API_BASE_URL}/api/public/bookings/${bookingId}/reschedule`, {
    new_slot_id: newSlotId
  });
  return response.data;
};

// Get business availability for multiple dates (for calendar view)
export const getBusinessAvailability = async (
  businessSlug: string,
  serviceId: string,
  startDate: string,
  endDate: string
): Promise<Record<string, AvailabilitySlot[]>> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/public/businesses/${businessSlug}/services/${serviceId}/availability/range`,
    {
      params: { start_date: startDate, end_date: endDate }
    }
  );
  return response.data;
}; 