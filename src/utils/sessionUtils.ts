import { CalendarSessionType, Attendance, BookingRequest } from '../types/sessionTypes';

export interface ProcessedParticipant {
  id: string;
  name: string;
  type: 'attendance' | 'booking';
  status: string;
  isAttended?: boolean;
  booking_reference?: string;
  email?: string;
  phone?: string;
  quantity?: number;
  is_group_booking?: boolean;
}

/**
 * Processes session participants from both attendances and booking requests
 * Returns a unified list of participants for display
 */
export function processSessionParticipants(session: CalendarSessionType | null): ProcessedParticipant[] {
  if (!session) return [];

  const participants: ProcessedParticipant[] = [];

  // Process traditional attendances
  if (session.attendances) {
    session.attendances.forEach((attendance: Attendance, index: number) => {
      if (attendance.client) {
        participants.push({
          id: `attendance-${attendance.id}`,
          name: `${attendance.client.first_name} ${attendance.client.last_name}`,
          type: 'attendance',
          status: attendance.status_display,
          isAttended: attendance.attended,
          booking_reference: attendance.booking_reference,
          email: attendance.client.email,
        });
      } else if (attendance.client_name) {
        // Handle null client case with fallback name (from booking-created attendances)
        participants.push({
          id: `attendance-${attendance.id || index}`,
          name: attendance.client_name,
          type: 'attendance',
          status: attendance.status_display,
          isAttended: attendance.attended,
          booking_reference: attendance.booking_reference,
        });
      }
    });
  }

  // Process approved booking requests
  if (session.booking_requests) {
    session.booking_requests.forEach((booking: BookingRequest) => {
      if (booking.status === 'approved') {
        participants.push({
          id: `booking-${booking.id}`,
          name: booking.client_name,
          type: 'booking',
          status: 'Approved Booking',
          booking_reference: booking.booking_reference,
          email: booking.client_email,
          phone: booking.client_phone,
          quantity: booking.quantity,
          is_group_booking: booking.is_group_booking,
        });
      }
    });
  }

  return participants;
}

/**
 * Gets participant count summary for a session
 */
export function getParticipantSummary(session: CalendarSessionType | null) {
  if (!session) {
    return {
      total: 0,
      attended: 0,
      capacity: 0,
      available: 0,
    };
  }

  // Use backend calculated totals if available
  if (session.total_participants) {
    return {
      total: session.total_participants.total,
      attended: session.total_participants.attendance_count, // This might need adjustment based on backend
      capacity: session.total_participants.capacity,
      available: session.total_participants.available,
    };
  }

  // Fallback calculation
  const participants = processSessionParticipants(session);
  const total = participants.length;
  const attended = participants.filter(p => p.isAttended).length;
  const capacity = session.spots || 0;
  const available = Math.max(0, capacity - total);

  return {
    total,
    attended,
    capacity,
    available,
  };
}

/**
 * Checks if a client name appears to be empty/invalid
 */
export function isValidClientName(name: string): boolean {
  return Boolean(name && name.trim().length > 0 && name.trim() !== 'null' && name.trim() !== 'undefined');
}

/**
 * Formats a client name safely, handling null/empty cases
 */
export function formatClientName(firstName?: string, lastName?: string, fallback: string = 'Unnamed Client'): string {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  const fullName = `${first} ${last}`.trim();
  
  return isValidClientName(fullName) ? fullName : fallback;
}

/**
 * Checks if a participant should be shown in the main clients list
 * Returns true if it's a traditional client or a booking that was converted to a client
 */
export function shouldShowInClientsList(participant: any): boolean {
  // Traditional clients should always show
  if (participant.type === 'client' || (participant.clientId && participant.first_name && participant.last_name)) {
    return true;
  }
  
  // Booking clients that have been converted should show
  if (participant.type === 'booking' && participant.clientId) {
    return true;
  }
  
  // Pure booking participants without client records should not show in main client list
  return false;
}

/**
 * Gets display statistics for session participants
 */
export function getSessionParticipantStats(session: CalendarSessionType | null) {
  if (!session) return { clients: 0, bookings: 0, total: 0 };
  
  const participants = processSessionParticipants(session);
  const clients = participants.filter(p => p.type === 'attendance').length;
  const bookings = participants.filter(p => p.type === 'booking').length;
  
  return {
    clients,
    bookings,
    total: clients + bookings
  };
}

/**
 * Determines the best UX approach for client management
 */
export const CLIENT_MANAGEMENT_CONFIG = {
  // Should booking clients appear in main client list?
  SHOW_BOOKING_CLIENTS_IN_MAIN_LIST: false, // Keep separate for now
  
  // Should booking clients be editable in session management?
  ALLOW_BOOKING_CLIENT_EDIT: false, // Read-only for booking clients
  
  // Should we auto-create client records for approved bookings?
  AUTO_CREATE_CLIENT_FROM_BOOKING: true, // For future use
  
  // Should we allow converting booking to traditional client?
  ALLOW_BOOKING_TO_CLIENT_CONVERSION: true
}; 