import {
  CalendarSessionType,
  Attendance,
  BookingRequest,
} from '../types/sessionTypes';

interface ClientBasicInfo {
  id: number | string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  phone?: string;
}

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

// Extend the CalendarSessionType with additional properties we need
type ExtendedSession = CalendarSessionType & {
  clients?: ClientBasicInfo[];
  client_ids?: (number | string)[];
  attendees?: Array<{
    id?: number | string;
    first_name?: string;
    last_name?: string;
    name?: string;
    email?: string;
    phone_number?: string;
    phone?: string;
  }>;
  [key: string]: unknown;
};

/**
 * Processes session participants from both attendances and booking requests
 * Returns a unified list of participants for display
 */
export function processSessionParticipants(
  session: ExtendedSession | null
): ProcessedParticipant[] {
  if (!session) return [];

  const participants: ProcessedParticipant[] = [];



  if (session.clients && session.clients.length > 0) {
    session.clients.forEach((client) => {
      if (client) {
        let displayName = client.name;

        // If name is not directly available, try to construct it
        if (!displayName) {
          const firstName = client.first_name || '';
          const lastName = client.last_name || '';
          displayName = `${firstName} ${lastName}`.trim();
        }

        if (!displayName) {
          displayName = client.email || 'Client';
        }

        if (!participants.some((p) => p.id === `client-${client.id}`)) {
          participants.push({
            id: `client-${client.id || 'temp'}`,
            name: displayName,
            type: 'attendance' as const,
            status: 'Attending',
            isAttended: true,
            email: client.email,
            phone: client.phone_number || client.phone,
          });
        }
      }
    });
  }

  if (session.attendances && session.attendances.length > 0) {
    // Handle attendance format
    session.attendances.forEach((attendance: Attendance, index: number) => {
      let displayName = '';
      let email = '';

      if (attendance.participant_name) {
        displayName = attendance.participant_name;
      }
      else if (attendance.client) {
        if (typeof attendance.client === 'object') {
          const firstName = attendance.client.first_name || '';
          const lastName = attendance.client.last_name || '';
          displayName = `${firstName} ${lastName}`.trim();
          email = attendance.client.email || '';
        }
      }
      else if (attendance.client_name) {
        displayName = attendance.client_name;
      }

      if (!displayName) {
        displayName =
          attendance.participant_email ||
          `Client #${attendance.client || attendance.id || index}`;
      }

      if (displayName) {
        participants.push({
          id: `attendance-${attendance.id || index}`,
          name: displayName,
          type: 'attendance' as const,
          status: attendance.status_display || 'Attending',
          isAttended: attendance.attended,
          booking_reference: attendance.booking_reference,
          email: email || attendance.participant_email,
          phone: attendance.participant_phone,
        });
      }
    });
  }

  // Process approved booking requests
  if (session.booking_requests && session.booking_requests.length > 0) {
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

export function getParticipantSummary(session: CalendarSessionType | null) {
  if (!session) {
    return {
      total: 0,
      attended: 0,
      capacity: 0,
      available: 0,
    };
  }

  if (session.total_participants) {
    return {
      total: session.total_participants.total,
      attended: session.total_participants.attendance_count,
      capacity: session.total_participants.capacity,
      available: session.total_participants.available,
    };
  }

  const participants = processSessionParticipants(session);
  const total = participants.length;
  const attended = participants.filter((p) => p.isAttended).length;
  const capacity = session.spots || 0;
  const available = Math.max(0, capacity - total);

  return {
    total,
    attended,
    capacity,
    available,
  };
}


export function isValidClientName(name: string): boolean {
  return Boolean(
    name &&
      name.trim().length > 0 &&
      name.trim() !== 'null' &&
      name.trim() !== 'undefined'
  );
}


export function formatClientName(
  firstName?: string,
  lastName?: string,
  fallback: string = 'Unnamed Client'
): string {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  const fullName = `${first} ${last}`.trim();

  return isValidClientName(fullName) ? fullName : fallback;
}

export function shouldShowInClientsList(participant: any): boolean {
  if (
    participant.type === 'client' ||
    (participant.clientId && participant.first_name && participant.last_name)
  ) {
    return true;
  }

  if (participant.type === 'booking' && participant.clientId) {
    return true;
  }

  return false;
}

export function getSessionParticipantStats(
  session: CalendarSessionType | null
) {
  if (!session) return { clients: 0, bookings: 0, total: 0 };

  const participants = processSessionParticipants(session);
  const clients = participants.filter((p) => p.type === 'attendance').length;
  const bookings = participants.filter((p) => p.type === 'booking').length;

  return {
    clients,
    bookings,
    total: clients + bookings,
  };
}


export const CLIENT_MANAGEMENT_CONFIG = {
  SHOW_BOOKING_CLIENTS_IN_MAIN_LIST: false, 
  ALLOW_BOOKING_CLIENT_EDIT: false, 
  AUTO_CREATE_CLIENT_FROM_BOOKING: true, 
  ALLOW_BOOKING_TO_CLIENT_CONVERSION: true,
};
