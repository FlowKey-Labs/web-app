import { DateTime } from 'luxon';
import { formatSessionTimes } from './timezone';

/**
 * Calendar-specific timezone utilities to handle session display
 * This ensures calendar events show correct times without breaking other implementations
 */

export interface CalendarTimeResult {
  displayTime: string;
  timeRange: string;
  formattedDate: string;
}

/**
 * Format session times specifically for calendar display
 * Handles timezone-aware times from session data
 */
export function formatCalendarSessionTimes(
  startTime: string,
  endTime: string,
  businessTimezone: string = 'Africa/Nairobi'
): CalendarTimeResult {
  try {
    // Use our existing timezone utility with proper timezone handling
    const { startFormatted, endFormatted, timeRange } = formatSessionTimes(
      startTime,
      endTime,
      businessTimezone
    );

    // Parse the start time to get date info
    const startDateTime = DateTime.fromISO(startTime);
    const formattedDate = startDateTime.toFormat('cccc, LLLL d');

    return {
      displayTime: startFormatted,
      timeRange: timeRange.replace(/ EAT$/, ''), // Remove timezone abbreviation for cleaner display
      formattedDate
    };
  } catch (error) {
    console.error('Error formatting calendar session times:', error);
    return {
      displayTime: 'Invalid time',
      timeRange: 'Invalid time range',
      formattedDate: 'Invalid date'
    };
  }
}

/**
 * Convert session times to proper ISO strings for FullCalendar
 * Ensures times are interpreted correctly in the business timezone
 */
export function convertSessionToCalendarEvent(session: {
  id: number | string;
  title: string;
  start_time: string;
  end_time: string;
  business_timezone?: string;
  [key: string]: any;
}): {
  id: string | number;
  title: string;
  start: string;
  end: string;
  extendedProps: { session: any };
} | null {
  try {
    const businessTz = session.business_timezone || 'Africa/Nairobi';
    
    // Parse the times which should already be in the correct timezone
    // The session times come as "2025-07-31T12:00:00+03:00" which is correct
    let startDateTime = DateTime.fromISO(session.start_time);
    let endDateTime = DateTime.fromISO(session.end_time);
    
    // If times don't have timezone info, assume they're in business timezone
    if (!startDateTime.isValid || !startDateTime.zoneName) {
      startDateTime = DateTime.fromISO(session.start_time, { zone: businessTz });
    }
    if (!endDateTime.isValid || !endDateTime.zoneName) {
      endDateTime = DateTime.fromISO(session.end_time, { zone: businessTz });
    }

    // Ensure we have valid ISO strings
    const startISO = startDateTime.toISO();
    const endISO = endDateTime.toISO();

    if (!startISO || !endISO) {
      throw new Error('Invalid datetime conversion');
    }

    return {
      id: session.id,
      title: session.title,
      start: startISO,
      end: endISO,
      extendedProps: { session }
    };
  } catch (error) {
    console.error('Error converting session to calendar event:', error);
    return null;
  }
}

/**
 * Format time for calendar tooltip display
 */
export function formatCalendarTooltipTime(
  startTime: string | Date,
  endTime?: string | Date,
  businessTimezone: string = 'Africa/Nairobi'
): string {
  try {
    const start = typeof startTime === 'string' 
      ? DateTime.fromISO(startTime)
      : DateTime.fromJSDate(startTime);
    
    if (!start.isValid) {
      return 'Invalid time';
    }

    if (endTime) {
      const end = typeof endTime === 'string'
        ? DateTime.fromISO(endTime)
        : DateTime.fromJSDate(endTime);
      
      if (end.isValid) {
        return `${start.toFormat('h:mm a')} - ${end.toFormat('h:mm a')}`;
      }
    }

    return start.toFormat('h:mm a');
  } catch (error) {
    console.error('Error formatting calendar tooltip time:', error);
    return 'Error formatting time';
  }
} 