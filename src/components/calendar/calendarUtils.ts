import { CalendarSessionType } from "../../types/sessionTypes";
import { convertSessionToCalendarEvent } from "../../utils/calendarTimeUtils";

export interface FullCalendarEvent {
  id: string | number;
  title: string;
  start: string;
  end: string;
  extendedProps?: Record<string, unknown>;
}

export function mapSessionToFullCalendarEvents(
  session: CalendarSessionType, 
  viewStartDate?: Date,
  viewEndDate?: Date
): FullCalendarEvent[] {
  if (!session || !session.date || !session.start_time || !session.end_time) {
    console.warn('Invalid session data:', session);
    return [];
  }

  // Use our new calendar timezone utility for proper conversion
  const calendarEvent = convertSessionToCalendarEvent({
    id: session.id,
    title: session.title,
    start_time: session.start_time,
    end_time: session.end_time,
    business_timezone: session.business_timezone || 'Africa/Nairobi'
  });

  if (!calendarEvent) {
    console.warn('Failed to convert session to calendar event:', session);
    return [];
  }

  // For one-time session (no recurrence)
  if (!session.repeat_unit || !session.repeat_every) {
    return [calendarEvent as FullCalendarEvent];
  }

  // Handle recurring sessions
  const sessionDate = new Date(session.date);
  let repeatEndDate: Date;

  if (session.repeat_end_type === 'on' && session.repeat_end_date) {
    repeatEndDate = new Date(session.repeat_end_date);
  } else if (session.repeat_end_type === 'after' && session.repeat_occurrences) {
    repeatEndDate = new Date(sessionDate);
    repeatEndDate.setDate(repeatEndDate.getDate() + (session.repeat_occurrences * 7 * session.repeat_every));
  } else {
    // Default to 2 years for 'never' or invalid settings
    repeatEndDate = new Date(sessionDate);
    repeatEndDate.setFullYear(repeatEndDate.getFullYear() + 2);
  }

  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);

  return generateRecurringEvents(
    session,
    sessionDate,
    repeatEndDate,
    startTime,
    endTime,
    viewStartDate,
    viewEndDate
  );
}

export function generateRecurringEvents(
  session: CalendarSessionType,
  startDate: Date,
  repeatEndDate: Date,
  startTime: Date,
  endTime: Date,
  viewStartDate?: Date,
  viewEndDate?: Date
): FullCalendarEvent[] {
  const events: FullCalendarEvent[] = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayAbbreviations: Record<string, number> = {
    'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6
  };
  
  // Normalize repeat days to day indexes (0-6)
  const repeatDays: number[] = [];
  if (session.repeat_on && session.repeat_on.length > 0) {
    session.repeat_on.forEach(day => {
      if (typeof day === 'string') {
        const dayLower = day.toLowerCase();
        const dayIndex = dayNames.findIndex(d => d.toLowerCase() === dayLower);
        if (dayIndex !== -1) {
          repeatDays.push(dayIndex);
        } else if (dayAbbreviations[dayLower] !== undefined) {
          repeatDays.push(dayAbbreviations[dayLower]);
        }
      }
    });
  } else {
    repeatDays.push(startDate.getDay());
  }

  const actualViewStartDate = viewStartDate || new Date(startDate);
  const actualViewEndDate = viewEndDate || new Date(repeatEndDate);
  const eventDurationMs = endTime.getTime() - startTime.getTime();

  const currentDate = new Date(startDate);
  let occurrence = 0;

  while (currentDate <= repeatEndDate) {
    const currentDay = currentDate.getDay();

    if (repeatDays.includes(currentDay)) {
      if (currentDate >= actualViewStartDate && currentDate <= actualViewEndDate) {
        const eventStart = new Date(currentDate);
        eventStart.setHours(startTime.getHours(), startTime.getMinutes(), startTime.getSeconds());
        
        const eventEnd = new Date(eventStart);
        eventEnd.setTime(eventStart.getTime() + eventDurationMs);

        events.push({
          id: `${session.id}-${occurrence}`,
          title: session.title,
          start: eventStart.toISOString(),
          end: eventEnd.toISOString(),
          extendedProps: { session }
        });
      }

      occurrence++;
      
      if (session.repeat_end_type === 'after' && session.repeat_occurrences && occurrence >= session.repeat_occurrences) {
        break;
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return events;
} 