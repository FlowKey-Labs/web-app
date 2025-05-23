import { FullCalendarEvent, mapSessionToFullCalendarEvents } from '../components/calendar/calendarUtils';
import { CalendarSessionType } from '../types/sessionTypes';

describe('Calendar Event Generation', () => {
    const oneTimeSession: CalendarSessionType = {
    id: 1,
    title: 'One-time Session',
    date: '2025-05-23',
    start_time: '2025-05-23T14:00:00Z',
    end_time: '2025-05-23T15:00:00Z',
    is_active: true,
    session_type: 'class',
    class_type: 'regular',
    spots: 10,
    staff: 1,
    category: { id: 1, name: 'General' },
    assigned_staff: null
  };

    const weeklySession: CalendarSessionType = {
    id: 2,
    title: 'Weekly Saturday Session',
    date: '2025-05-24',
    start_time: '2025-05-24T09:00:00Z',
    end_time: '2025-05-24T10:00:00Z',
    repeat_unit: 'weeks',
    repeat_every: 1,
    repeat_on: ['Saturday'],
    repeat_end_type: 'on',
    repeat_end_date: '2025-06-21',
    is_active: true,
    session_type: 'class',
    class_type: 'regular',
    spots: 8,
    staff: 1,
    category: { id: 1, name: 'General' },
    assigned_staff: null
  };

    const mismatchStartSession: CalendarSessionType = {
    id: 3,
    title: 'Thursday Start, Saturday Repeat',
    date: '2025-05-29',
    start_time: '2025-05-29T08:30:00Z',
    end_time: '2025-05-29T12:30:00Z',
    repeat_unit: 'weeks',
    repeat_every: 1,
    repeat_on: ['Saturday'],
    repeat_end_type: 'after',
    repeat_end_date: null,
    repeat_occurrences: 5,
    is_active: true,
    session_type: 'class',
    class_type: 'regular',
    spots: 8,
    staff: 1,
    category: { id: 1, name: 'General' },
    assigned_staff: null
  };

    const neverEndingSession: CalendarSessionType = {
    id: 4,
    title: 'Never Ending Session',
    date: '2025-05-23',
    start_time: '2025-05-23T11:00:00Z',
    end_time: '2025-05-23T12:00:00Z',
    repeat_unit: 'weeks',
    repeat_every: 1,
    repeat_on: [],
    repeat_end_type: 'never',
    repeat_end_date: null,
    repeat_occurrences: null,
    is_active: true,
    session_type: 'class',
    class_type: 'regular',
    spots: 10,
    staff: 1,
    category: { id: 1, name: 'General' },
    assigned_staff: null
  };

    const abbreviatedDaySession: CalendarSessionType = {
    id: 5,
    title: 'Abbreviated Days Session',
    date: '2025-05-26',
    start_time: '2025-05-26T14:00:00Z',
    end_time: '2025-05-26T15:00:00Z',
    repeat_unit: 'weeks',
    repeat_every: 1,
    repeat_on: ['mon', 'fri'],
    repeat_end_type: 'on',
    repeat_end_date: '2025-06-06',
    is_active: true,
    session_type: 'class',
    class_type: 'regular',
    spots: 12,
    staff: 1,
    category: { id: 1, name: 'General' },
    assigned_staff: null
  };

  describe('mapSessionToFullCalendarEvents', () => {
    test('should correctly handle one-time sessions', () => {
      const events = mapSessionToFullCalendarEvents(oneTimeSession);
      
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('One-time Session');
      expect(events[0].start).toBe('2025-05-23T14:00:00.000Z');
      expect(events[0].end).toBe('2025-05-23T15:00:00.000Z');
    });

    test('should generate correct number of events for weekly sessions', () => {
      const events = mapSessionToFullCalendarEvents(weeklySession);
      
      // 5 Saturdays from May 24 to Jun 21, 2025
      expect(events).toHaveLength(5);
      
      // Check first event
      expect(events[0].start).toContain('2025-05-24');
      
      // Check last event
      expect(events[events.length - 1].start).toContain('2025-06-21');
    });

    test('should handle start dates not matching repeat days', () => {
      const events = mapSessionToFullCalendarEvents(mismatchStartSession);
      
      expect(events).toHaveLength(5);
      expect(events[0].start).toContain('2025-05-31');
      events.forEach((event: FullCalendarEvent) => {
        const date = new Date(event.start);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        expect(dayOfWeek).toBe('Saturday');
      });
    });

    test('should generate multiple events for never-ending sessions', () => {
      const events = mapSessionToFullCalendarEvents(neverEndingSession);
      
      expect(events.length).toBeGreaterThan(50);
      expect(events[0].start).toContain('2025-05-23');
      const firstDate = new Date(events[0].start);
      const secondDate = new Date(events[1].start);
      const daysDiff = (secondDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBe(7);
    });

    test('should handle abbreviated day names in repeat_on', () => {
      const events = mapSessionToFullCalendarEvents(abbreviatedDaySession);
      
      // 2 Mondays (May 26, Jun 2) and 2 Fridays (May 30, Jun 6)
      expect(events).toHaveLength(4);
      events.forEach((event: FullCalendarEvent) => {
        const date = new Date(event.start);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        expect(['Monday', 'Friday']).toContain(dayOfWeek);
      });
    });

    test('should optimize event generation with date range boundaries', () => {
      const viewStartDate = new Date('2025-06-01');
      const viewEndDate = new Date('2025-06-30');
      
      const events = mapSessionToFullCalendarEvents(
        weeklySession, 
        viewStartDate, 
        viewEndDate
      );
      
      expect(events).toHaveLength(3); // Jun 7, 14, 21
      events.forEach((event: FullCalendarEvent) => {
        const date = new Date(event.start);
        expect(date.getMonth()).toBe(5); // June is month 5 (zero-indexed)
        expect(date.getFullYear()).toBe(2025);
      });
    });

    test('should handle invalid input gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const events = mapSessionToFullCalendarEvents({
        id: 999,
        // Missing required fields
      });
      
      expect(events).toHaveLength(0);
    });
  });
}); 