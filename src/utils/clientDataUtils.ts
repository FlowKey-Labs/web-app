/**
 * Client Data Management Utilities
 * Helper functions for managing client data consistency between traditional clients and booking clients
 */

import { Client } from '../types/clientTypes';
import { CalendarSessionType, BookingRequest, Attendance } from '../types/sessionTypes';

export interface ClientDataIssue {
  type: 'missing_client' | 'duplicate_client' | 'invalid_data' | 'orphaned_attendance';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedId?: string | number;
  suggestedAction: string;
}

/**
 * Analyzes client data for potential issues
 */
export function analyzeClientData(
  clients: Client[],
  sessions: CalendarSessionType[]
): ClientDataIssue[] {
  const issues: ClientDataIssue[] = [];

  // Check for missing client records for attendances
  sessions.forEach(session => {
    if (session.attendances) {
      session.attendances.forEach(attendance => {
        if (!attendance.client && attendance.client_name) {
          issues.push({
            type: 'missing_client',
            severity: 'medium',
            description: `Attendance record has client name "${attendance.client_name}" but no client record`,
            affectedId: attendance.id,
            suggestedAction: 'Create client record from booking data or link to existing client'
          });
        }
      });
    }

    // Check for booking requests without proper attendances
    if (session.booking_requests) {
      session.booking_requests.forEach(booking => {
        if (booking.status === 'approved') {
          const hasAttendance = session.attendances?.some(
            att => att.booking_reference === booking.booking_reference
          );
          
          if (!hasAttendance) {
            issues.push({
              type: 'orphaned_attendance',
              severity: 'medium',
              description: `Approved booking "${booking.booking_reference}" has no attendance record`,
              affectedId: booking.id,
              suggestedAction: 'Create attendance record for approved booking'
            });
          }
        }
      });
    }
  });

  // Check for clients with invalid data
  clients.forEach(client => {
    if (!client.first_name?.trim() && !client.last_name?.trim() && !client.email?.trim()) {
      issues.push({
        type: 'invalid_data',
        severity: 'low',
        description: `Client ${client.id} has no name or email`,
        affectedId: client.id,
        suggestedAction: 'Remove empty client record or populate with valid data'
      });
    }
  });

  return issues;
}

/**
 * Suggests data migration actions for booking integration
 */
export function suggestMigrationActions(issues: ClientDataIssue[]): {
  createClients: Array<{ name: string; email?: string; phone?: string; source: 'booking' }>;
  cleanupClients: number[];
  createAttendances: Array<{ sessionId: number; bookingId: number }>;
} {
  const actions = {
    createClients: [],
    cleanupClients: [],
    createAttendances: []
  };

  issues.forEach(issue => {
    switch (issue.type) {
      case 'invalid_data':
        if (typeof issue.affectedId === 'number') {
          actions.cleanupClients.push(issue.affectedId);
        }
        break;
      // Add more action suggestions as needed
    }
  });

  return actions;
}

/**
 * Validates that all approved bookings have proper attendance records
 */
export function validateBookingAttendanceConsistency(session: CalendarSessionType): boolean {
  if (!session.booking_requests) return true;

  const approvedBookings = session.booking_requests.filter(b => b.status === 'approved');
  
  return approvedBookings.every(booking => {
    return session.attendances?.some(
      att => att.booking_reference === booking.booking_reference
    );
  });
}

/**
 * Gets booking clients that could be converted to traditional clients
 */
export function getConvertibleBookingClients(sessions: CalendarSessionType[]): Array<{
  bookingId: number;
  name: string;
  email: string;
  phone: string;
  sessionCount: number;
}> {
  const bookingClientMap = new Map();

  sessions.forEach(session => {
    if (session.booking_requests) {
      session.booking_requests.forEach(booking => {
        if (booking.status === 'approved') {
          const key = booking.client_email.toLowerCase();
          
          if (bookingClientMap.has(key)) {
            bookingClientMap.get(key).sessionCount++;
          } else {
            bookingClientMap.set(key, {
              bookingId: booking.id,
              name: booking.client_name,
              email: booking.client_email,
              phone: booking.client_phone,
              sessionCount: 1
            });
          }
        }
      });
    }
  });

  // Return clients who have booked multiple sessions (good candidates for conversion)
  return Array.from(bookingClientMap.values()).filter(client => client.sessionCount >= 2);
}

/**
 * Client management configuration for production use
 */
export const PRODUCTION_CLIENT_CONFIG = {
  // For a world-class production experience:
  
  // 1. Client List Display Strategy
  clientListStrategy: 'separate_with_conversion' as 'separate_with_conversion' | 'unified' | 'separate_only',
  
  // 2. Booking Client Management
  bookingClientFeatures: {
    showInMainList: false, // Keep booking clients separate initially
    allowConversion: true, // Allow converting frequent booking clients to regular clients
    showBookingHistory: true, // Show booking history for converted clients
    allowDirectEdit: false, // Don't allow direct editing of booking client details
  },
  
  // 3. Session Management
  sessionManagement: {
    showBothTypes: true, // Show both client types in session details
    visuallyDistinguish: true, // Use different styling for booking vs regular clients
    limitBookingActions: true, // Limit actions available for booking clients
    allowAttendanceMarking: true, // Allow marking booking clients as attended
  },
  
  // 4. Data Quality
  dataQuality: {
    autoCleanup: true, // Automatically clean up empty client records
    validateConsistency: true, // Validate booking-attendance consistency
    preventDuplicates: true, // Prevent creating duplicate clients from bookings
  }
};

/**
 * Recommended UX flow for handling booking clients
 */
export const RECOMMENDED_UX_FLOW = {
  // Phase 1: Separate but visible
  phase1: {
    description: 'Keep booking clients separate but show them in session details',
    features: [
      'Booking clients appear in session participant lists with "Booking" badge',
      'Limited actions for booking clients (attendance only)',
      'Booking clients do not appear in main client list',
      'Clear visual distinction between client types'
    ]
  },
  
  // Phase 2: Conversion option
  phase2: {
    description: 'Offer conversion for frequent booking clients',
    features: [
      'Detect booking clients with multiple sessions',
      'Offer "Convert to Client" option',
      'Merge booking history into client record',
      'Maintain booking reference for audit trail'
    ]
  },
  
  // Phase 3: Unified management
  phase3: {
    description: 'Unified client management with booking origin tracking',
    features: [
      'All clients in one list with origin indicators',
      'Booking history tab for converted clients',
      'Advanced filtering by client source',
      'Comprehensive reporting across all client types'
    ]
  }
}; 