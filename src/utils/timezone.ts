/**
 * Core Timezone Utilities for Production Booking System
 * Provides safe, reliable timezone conversion and validation
 */

import { DateTime } from 'luxon';

// TypeScript interface for timezone options
export interface TimezoneOption {
  value: string;
  label: string;
  region: string;
}

// Common timezone options for the application - single source of truth
export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  // Africa (Primary focus for East Africa)
  { value: 'Africa/Nairobi', label: 'East Africa Time (Nairobi)', region: 'Africa' },
  { value: 'Africa/Kampala', label: 'East Africa Time (Kampala)', region: 'Africa' },
  { value: 'Africa/Dar_es_Salaam', label: 'East Africa Time (Dar es Salaam)', region: 'Africa' },
  { value: 'Africa/Addis_Ababa', label: 'East Africa Time (Addis Ababa)', region: 'Africa' },
  { value: 'Africa/Johannesburg', label: 'South Africa Standard Time', region: 'Africa' },
  { value: 'Africa/Cairo', label: 'Egypt Standard Time', region: 'Africa' },
  { value: 'Africa/Lagos', label: 'West Africa Time', region: 'Africa' },
  
  // UTC and common international zones
  { value: 'UTC', label: 'Coordinated Universal Time', region: 'Global' },
  { value: 'Europe/London', label: 'Greenwich Mean Time / British Summer Time', region: 'Europe' },
  { value: 'Europe/Paris', label: 'Central European Time', region: 'Europe' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)', region: 'Americas' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)', region: 'Americas' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)', region: 'Americas' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)', region: 'Americas' },
  
  // Asia Pacific
  { value: 'Asia/Dubai', label: 'Gulf Standard Time', region: 'Asia' },
  { value: 'Asia/Kolkata', label: 'India Standard Time', region: 'Asia' },
  { value: 'Asia/Singapore', label: 'Singapore Standard Time', region: 'Asia' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time', region: 'Asia' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time', region: 'Asia Pacific' },
];

// Default timezone for the application
export const DEFAULT_TIMEZONE = 'Africa/Nairobi';

export interface TimezoneConversionResult {
  success: boolean;
  convertedTime?: DateTime;
  error?: string;
  warnings?: string[];
}

export interface BookingTimeConversionResult extends TimezoneConversionResult {
  originalTime?: DateTime;
  timezone: string;
  formattedTime?: string;
}

export interface AvailabilitySlot {
  id?: string;
  start_time: string;
  end_time: string;
  available_spots: number;
  total_spots: number;
  date?: string;
  start_utc?: string;
  end_utc?: string;
  start_local?: string;
  end_local?: string;
  display_time?: string;
  timezone?: string;
}

export interface TimezoneValidationResult {
  isValid: boolean;
  normalizedTimezone: string;
  warnings: string[];
  supportedRegions: string[];
}

/**
 * Safely convert time between timezones with comprehensive error handling
 */
export function safeConvertTimezone(
  time: string | DateTime,
  fromTimezone: string,
  toTimezone: string
): TimezoneConversionResult {
  try {
    let dt: DateTime;
    
    if (typeof time === 'string') {
      // Handle ISO strings with timezone info
      if (time.includes('T') && (time.includes('Z') || time.includes('+') || time.endsWith('-'))) {
        dt = DateTime.fromISO(time);
      } else {
        // Assume local time in source timezone
        dt = DateTime.fromISO(time, { zone: fromTimezone });
      }
    } else {
      dt = time;
    }

    if (!dt.isValid) {
      return {
        success: false,
        error: `Invalid datetime: ${dt.invalidReason || 'Unknown error'}`
      };
    }

    // Validate timezones
    if (!isValidTimezone(fromTimezone)) {
      return {
        success: false,
        error: `Invalid source timezone: ${fromTimezone}`
      };
    }

    if (!isValidTimezone(toTimezone)) {
      return {
        success: false,
        error: `Invalid target timezone: ${toTimezone}`
      };
    }

    // Convert timezone
    const converted = dt.setZone(toTimezone);
    
    if (!converted.isValid) {
      return {
        success: false,
        error: `Conversion failed: ${converted.invalidReason || 'Unknown error'}`
      };
    }

    return {
      success: true,
      convertedTime: converted
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error'
    };
  }
}

/**
 * Convert booking time from client timezone to display timezone
 */
export function convertBookingTime(
  date: string,
  time: string,
  clientTimezone: string,
  displayTimezone: string
): BookingTimeConversionResult {
  try {
    // Combine date and time
    const dateTimeString = `${date}T${time}:00`;
    
    // Create DateTime in client timezone
    const clientTime = DateTime.fromISO(dateTimeString, { zone: clientTimezone });
    
    if (!clientTime.isValid) {
      return {
        success: false,
        timezone: displayTimezone,
        error: `Invalid date/time: ${clientTime.invalidReason}`
      };
    }

    // Convert to display timezone
    const result = safeConvertTimezone(clientTime, clientTimezone, displayTimezone);
    
    if (!result.success) {
      return {
        success: false,
        timezone: displayTimezone,
        error: result.error
      };
    }

    return {
      success: true,
      originalTime: clientTime,
      convertedTime: result.convertedTime,
      timezone: displayTimezone,
      formattedTime: result.convertedTime?.toFormat('h:mm a')
    };
  } catch (error) {
    return {
      success: false,
      timezone: displayTimezone,
      error: error instanceof Error ? error.message : 'Conversion failed'
    };
  }
}

/**
 * Format booking time for display with timezone context
 */
export function formatBookingTime(
  time: string,
  date: string,
  sourceTimezone: string,
  displayTimezone: string,
  use24Hour: boolean = false
): string {
  const conversion = convertBookingTime(date, time, sourceTimezone, displayTimezone);
  
  if (!conversion.success || !conversion.convertedTime) {
    return `${time} (conversion error)`;
  }

  const format = use24Hour ? 'HH:mm' : 'h:mm a';
  const formattedTime = conversion.convertedTime.toFormat(format);
  const timezoneAbbr = conversion.convertedTime.offsetNameShort;
  
  return `${formattedTime} ${timezoneAbbr}`;
}

/**
 * Process availability slots with timezone conversion
 */
export function processAvailabilitySlots(
  slots: AvailabilitySlot[],
  clientTimezone: string,
  businessTimezone: string = DEFAULT_TIMEZONE
): AvailabilitySlot[] {
  return slots.map(slot => {
    try {
      // Parse the slot times (assuming they're in business timezone)
      const startTime = DateTime.fromISO(slot.start_time, { zone: businessTimezone });
      const endTime = DateTime.fromISO(slot.end_time, { zone: businessTimezone });

      if (!startTime.isValid || !endTime.isValid) {
        console.warn('Invalid slot times:', slot);
        return slot;
      }

      // Convert to client timezone
      const clientStart = startTime.setZone(clientTimezone);
      const clientEnd = endTime.setZone(clientTimezone);

      return {
        ...slot,
        start_utc: startTime.toUTC().toISO(),
        end_utc: endTime.toUTC().toISO(),
        start_local: clientStart.toISO(),
        end_local: clientEnd.toISO(),
        display_time: `${clientStart.toFormat('h:mm a')} - ${clientEnd.toFormat('h:mm a')}`,
        timezone: clientTimezone,
        date: clientStart.toFormat('yyyy-MM-dd')
      };
    } catch (error) {
      console.warn('Error processing slot:', slot, error);
      return slot;
    }
  });
}

/**
 * Validate and normalize timezone for booking operations
 */
export function validateBookingTimezone(timezone: string): TimezoneValidationResult {
  const warnings: string[] = [];
  
  if (!timezone) {
    return {
      isValid: false,
      normalizedTimezone: DEFAULT_TIMEZONE,
      warnings: ['No timezone provided, using default'],
      supportedRegions: TIMEZONE_OPTIONS.map(opt => opt.region)
    };
  }

  // Check if timezone is valid
  if (!isValidTimezone(timezone)) {
    warnings.push(`Invalid timezone: ${timezone}`);
    return {
      isValid: false,
      normalizedTimezone: DEFAULT_TIMEZONE,
      warnings,
      supportedRegions: TIMEZONE_OPTIONS.map(opt => opt.region)
    };
  }

  // Check if timezone is in our supported list
  const isSupported = TIMEZONE_OPTIONS.some(opt => opt.value === timezone);
  if (!isSupported) {
    warnings.push(`Timezone ${timezone} is valid but not in preferred list`);
  }

  return {
    isValid: true,
    normalizedTimezone: timezone,
    warnings,
    supportedRegions: TIMEZONE_OPTIONS.map(opt => opt.region)
  };
}

/**
 * Get available timezone options grouped by region
 */
export function getTimezoneOptions() {
  const grouped = TIMEZONE_OPTIONS.reduce((acc, option) => {
    if (!acc[option.region]) {
      acc[option.region] = [];
    }
    acc[option.region].push(option);
    return acc;
  }, {} as Record<string, typeof TIMEZONE_OPTIONS>);

  return {
    all: TIMEZONE_OPTIONS,
    grouped,
    regions: Object.keys(grouped)
  };
}

/**
 * Get user's detected timezone with fallback
 */
export function getUserTimezone(): string {
  try {
    // Try to get user's timezone from Intl API
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (detected && isValidTimezone(detected)) {
      return detected;
    }
  } catch (error) {
    console.warn('Could not detect user timezone:', error);
  }

  // Fallback to default
  return DEFAULT_TIMEZONE;
}

/**
 * Check if timezone is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    // Use Luxon to validate timezone
    const dt = DateTime.now().setZone(timezone);
    return dt.isValid;
  } catch {
    return false;
  }
}

/**
 * Get timezone debug information
 */
export function getTimezoneDebugInfo(timezone: string) {
  try {
    const now = DateTime.now().setZone(timezone);
    return {
      timezone,
      isValid: now.isValid,
      offset: now.offset,
      offsetHours: now.offset / 60,
      offsetName: now.offsetNameShort,
      offsetNameLong: now.offsetNameLong,
      currentTime: now.toISO(),
      isDST: now.isInDST
    };
  } catch (error) {
    return {
      timezone,
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Convert UTC datetime to user's timezone for display
 */
export function convertUTCToUserTimezone(utcDateTime: string, userTimezone: string): string {
  try {
    const dt = DateTime.fromISO(utcDateTime, { zone: 'UTC' });
    const converted = dt.setZone(userTimezone);
    return converted.toFormat('h:mm a');
  } catch (error) {
    console.warn('Error converting UTC to user timezone:', error);
    return utcDateTime;
  }
}

/**
 * Format datetime for calendar/booking display
 */
export function formatForBookingDisplay(
  datetime: string | DateTime,
  timezone: string,
  includeDate: boolean = true
): string {
  try {
    const dt = typeof datetime === 'string' 
      ? DateTime.fromISO(datetime).setZone(timezone)
      : datetime.setZone(timezone);

    if (!dt.isValid) {
      return 'Invalid time';
    }

    if (includeDate) {
      return dt.toFormat('ccc, MMM d, yyyy \'at\' h:mm a ZZZZ');
    } else {
      return dt.toFormat('h:mm a ZZZZ');
    }
  } catch (error) {
    console.warn('Error formatting datetime:', error);
    return 'Invalid time';
  }
}

/**
 * Check if two datetimes are on the same day in a given timezone
 */
export function isSameDay(dt1: DateTime, dt2: DateTime, timezone: string): boolean {
  try {
    const day1 = dt1.setZone(timezone).startOf('day');
    const day2 = dt2.setZone(timezone).startOf('day');
    return day1.equals(day2);
  } catch {
    return false;
  }
}

/**
 * Get timezone offset in hours
 */
export function getTimezoneOffset(timezone: string): number {
  try {
    const dt = DateTime.now().setZone(timezone);
    return dt.offset / 60; // Convert minutes to hours
  } catch {
    return 0;
  }
}

/**
 * Get timezone abbreviation for display
 */
export function getTimezoneAbbreviation(timezone: string): string {
  if (timezone.toUpperCase() === 'UTC') {
    return 'UTC';
  }
  
  // Simple timezone abbreviation mapping for common ones
  const tzAbbreviations: { [key: string]: string } = {
    'Africa/Nairobi': 'EAT',
    'America/New_York': 'EST/EDT',
    'America/Los_Angeles': 'PST/PDT',
    'Europe/London': 'GMT/BST',
    'Europe/Paris': 'CET/CEST',
    'Asia/Tokyo': 'JST',
    'Australia/Sydney': 'AEST/AEDT'
  };
  
  return tzAbbreviations[timezone] || timezone.split('/')[1] || timezone;
}

/**
 * Format time with timezone information for display
 */
export function formatTimeWithTimezone(time: string, timezone: string): string {
  const [hours, minutes] = time.split(':');
  const hour24 = parseInt(hours);
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const timezoneAbbr = getTimezoneAbbreviation(timezone);
  
  return `${hour12}:${minutes} ${period} ${timezoneAbbr}`;
}

/**
 * Format booking time range with proper timezone conversion
 */
export function formatBookingTimeRange(
  startTime: string, 
  endTime: string, 
  targetTimezone: string,
  sourceTimezone: string = 'Africa/Nairobi',  // Default business timezone
  date?: string
): string {
  try {
    // Use current date if not provided
    const baseDate = date || DateTime.now().toFormat('yyyy-MM-dd');
    
    // Create datetime objects in source timezone
    const startDateTime = DateTime.fromISO(`${baseDate}T${startTime}:00`, { zone: sourceTimezone });
    const endDateTime = DateTime.fromISO(`${baseDate}T${endTime}:00`, { zone: sourceTimezone });
    
    if (!startDateTime.isValid || !endDateTime.isValid) {
      console.warn('Invalid datetime for timezone conversion:', { startTime, endTime, sourceTimezone, targetTimezone });
      return `${startTime} - ${endTime}`;
    }
    
    // Convert to target timezone
    const convertedStart = startDateTime.setZone(targetTimezone);
    const convertedEnd = endDateTime.setZone(targetTimezone);
    
    // Format times
    const startFormatted = convertedStart.toFormat('h:mm a');
    const endFormatted = convertedEnd.toFormat('h:mm a');
    const timezoneAbbr = getTimezoneAbbreviation(targetTimezone);
    
    return `${startFormatted} - ${endFormatted} ${timezoneAbbr}`;
  } catch (error) {
    console.error('Error formatting booking time range:', error);
    // Fallback to simple formatting
    const timezoneAbbr = getTimezoneAbbreviation(targetTimezone);
    return `${startTime} - ${endTime} ${timezoneAbbr}`;
  }
} 