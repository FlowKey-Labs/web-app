import { 
  safeParseDate, 
  mergeDateAndTime, 
  normalizeDayName,
  isDateOnDayOfWeek,
  findNextDayOfWeek,
  addDays
} from '../utils/dateUtils';

describe('Date Utilities', () => {
  describe('safeParseDate', () => {
    test('should parse a valid date string', () => {
      const result = safeParseDate('2025-05-23');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
      expect(result?.getMonth()).toBe(4); // May is 4 (zero-indexed)
      expect(result?.getDate()).toBe(23);
    });

    test('should handle invalid date strings', () => {
      const result = safeParseDate('invalid-date');
      expect(result).toBeNull();
    });

    test('should handle null and undefined', () => {
      expect(safeParseDate(null)).toBeNull();
      expect(safeParseDate(undefined)).toBeNull();
    });
  });

  describe('mergeDateAndTime', () => {
    test('should correctly merge date and time components', () => {
      const date = new Date('2025-05-23');
      const time = new Date('2025-01-01T14:30:00Z');
      
      const result = mergeDateAndTime(date, time);
      
      // Should preserve the date
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(4); // May
      expect(result.getDate()).toBe(23);
      
      // Should adopt the time
      expect(result.getUTCHours()).toBe(14);
      expect(result.getUTCMinutes()).toBe(30);
    });

    test('should handle invalid inputs gracefully', () => {
      // Create a date with invalid time fields
      const invalidTime = new Date('invalid');
      const date = new Date('2025-05-23');
      
      // Should fall back to the original date
      const result = mergeDateAndTime(date, invalidTime);
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(4);
      expect(result.getDate()).toBe(23);
    });
  });

  describe('normalizeDayName', () => {
    test('should normalize abbreviated day names', () => {
      expect(normalizeDayName('mon')).toBe('Monday');
      expect(normalizeDayName('tue')).toBe('Tuesday');
      expect(normalizeDayName('wed')).toBe('Wednesday');
      expect(normalizeDayName('thu')).toBe('Thursday');
      expect(normalizeDayName('fri')).toBe('Friday');
      expect(normalizeDayName('sat')).toBe('Saturday');
      expect(normalizeDayName('sun')).toBe('Sunday');
    });

    test('should handle case-insensitive inputs', () => {
      expect(normalizeDayName('MON')).toBe('Monday');
      expect(normalizeDayName('Mon')).toBe('Monday');
    });

    test('should capitalize first letter of full day names', () => {
      expect(normalizeDayName('monday')).toBe('Monday');
      expect(normalizeDayName('TUESDAY')).toBe('Tuesday');
    });

    test('should handle invalid inputs gracefully', () => {
      expect(normalizeDayName('')).toBe('');
      const malformedDay = 'xyz';
      expect(normalizeDayName(malformedDay)).toBe('Xyz');
    });
  });

  describe('isDateOnDayOfWeek', () => {
    test('should correctly identify the day of week', () => {
      // May 20, 2025 is a Tuesday
      const tuesday = new Date('2025-05-20');
      expect(isDateOnDayOfWeek(tuesday, 'Tuesday')).toBe(true);
      expect(isDateOnDayOfWeek(tuesday, 'tue')).toBe(true);
      expect(isDateOnDayOfWeek(tuesday, 'Monday')).toBe(false);
    });

    test('should be case insensitive', () => {
      const friday = new Date('2025-05-23');
      expect(isDateOnDayOfWeek(friday, 'FRIDAY')).toBe(true);
      expect(isDateOnDayOfWeek(friday, 'friday')).toBe(true);
      expect(isDateOnDayOfWeek(friday, 'fri')).toBe(true);
    });
  });

  describe('findNextDayOfWeek', () => {
    test('should find the next occurrence of a day', () => {
      // May 20, 2025 is a Tuesday
      const tuesday = new Date('2025-05-20');
      
      // Find next Friday
      const nextFriday = findNextDayOfWeek(tuesday, 'Friday');
      expect(nextFriday.getDate()).toBe(23); // May 23, 2025
      
      // Find next Tuesday (should be the same day)
      const nextTuesday = findNextDayOfWeek(tuesday, 'Tuesday');
      expect(nextTuesday.getDate()).toBe(20);
    });

    test('should work with abbreviated day names', () => {
      const wednesday = new Date('2025-05-21');
      const nextSat = findNextDayOfWeek(wednesday, 'sat');
      expect(nextSat.getDate()).toBe(24); // May 24, 2025
    });
  });

  describe('addDays', () => {
    test('should correctly add days to a date', () => {
      const start = new Date('2025-05-20');
      
      const plus1 = addDays(start, 1);
      expect(plus1.getDate()).toBe(21);
      
      const plus7 = addDays(start, 7);
      expect(plus7.getDate()).toBe(27);
      
      // Test month overflow
      const monthEnd = new Date('2025-05-30');
      const nextMonth = addDays(monthEnd, 2);
      expect(nextMonth.getMonth()).toBe(5); // June
      expect(nextMonth.getDate()).toBe(1);
    });

    test('should handle negative days', () => {
      const start = new Date('2025-05-10');
      const minus5 = addDays(start, -5);
      expect(minus5.getDate()).toBe(5);
    });

    test('should return the original date on error', () => {
      const start = new Date('2025-05-20');
      // Pass NaN as days
      const result = addDays(start, NaN);
      expect(result.getTime()).toBe(start.getTime());
    });
  });
}); 