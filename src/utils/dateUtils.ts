/**
 * Date utilities for handling date operations throughout the application
 */

/**
 * Safely parses a date string into a Date object
 * @param dateString The date string to parse, can be ISO or any valid date format
 * @returns A Date object or null if parsing failed
 */
export function safeParseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  } catch (error) {
    console.error(`Error parsing date: ${dateString}`, error);
    return null;
  }
}

/**
 * Merges a date and time into a single Date object
 * @param date The Date object providing the date portion
 * @param time The Date object providing the time portion
 * @returns A new Date object with combined date and time
 */
export function mergeDateAndTime(date: Date, time: Date): Date {
  // Create a new date to avoid mutating the original
  const merged = new Date(date);
  
  // Only set time parts if the time is valid
  if (!isNaN(time.getTime())) {
    merged.setHours(time.getHours());
    merged.setMinutes(time.getMinutes());
    merged.setSeconds(time.getSeconds());
    merged.setMilliseconds(time.getMilliseconds());
  }
  
  return merged;
}

/**
 * Normalizes day names for consistency in comparisons
 * @param day The day name or abbreviation
 * @returns The full day name with first letter capitalized
 */
export function normalizeDayName(day: string): string {
  if (!day) return '';
  
  const dayMap: Record<string, string> = {
    'mon': 'Monday',
    'tue': 'Tuesday',
    'wed': 'Wednesday',
    'thu': 'Thursday',
    'fri': 'Friday',
    'sat': 'Saturday',
    'sun': 'Sunday'
  };
  
  const lowerDay = day.toLowerCase();
  
  // Check if it's an abbreviated day
  if (dayMap[lowerDay]) {
    return dayMap[lowerDay];
  }
  
  // If it's already a full day name, just capitalize the first letter
  return lowerDay.charAt(0).toUpperCase() + lowerDay.slice(1);
}

/**
 * Checks if a date falls on a specified day of the week
 * @param date The date to check
 * @param dayName The day name to check against (e.g., 'Monday', 'mon')
 * @returns True if the date is on the specified day
 */
export function isDateOnDayOfWeek(date: Date, dayName: string): boolean {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
  const normalizedDayName = normalizeDayName(dayName);
  return dayOfWeek === normalizedDayName;
}

/**
 * Finds the next occurrence of a specified day of the week from a date
 * @param date The starting date
 * @param dayName The day to find (e.g., 'Monday', 'mon')
 * @returns A new Date object representing the next occurrence of that day
 */
export function findNextDayOfWeek(date: Date, dayName: string): Date {
  const result = new Date(date);
  const normalizedDayName = normalizeDayName(dayName);
  
  // If the current date is already the desired day, return it
  if (isDateOnDayOfWeek(result, normalizedDayName)) {
    return result;
  }
  
  // Otherwise, advance the date until we find the desired day
  for (let i = 1; i <= 7; i++) {
    result.setDate(result.getDate() + 1);
    if (isDateOnDayOfWeek(result, normalizedDayName)) {
      break;
    }
  }
  
  return result;
}

/**
 * Adds a specified number of days to a date
 * @param date The starting date
 * @param days The number of days to add (can be negative)
 * @returns A new Date object with the days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  if (isNaN(days)) {
    return result; // Return original date if days is not a number
  }
  result.setDate(result.getDate() + days);
  return result;
} 