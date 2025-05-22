import { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import dayGridWeek from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Button from "../common/Button";
import plusIcon from "../../assets/icons/plusWhite.svg";
import { addHours, format, isPast, parse } from "date-fns";
import DropDownMenu from "../common/DropdownMenu";
import dropdownIcon from "../../assets/icons/dropIcon.svg";
import { cn } from "../../utils/mergeClass";
import { EventClickArg, EventInput } from "@fullcalendar/core/index.js";
import EventCard from "./eventCard";
import { Dictionary, EventImpl } from "@fullcalendar/core/internal";
import { useGetSessions } from "../../hooks/reactQuery";
import AddSession from "../sessions/AddSession";
import "./index.css";
import AddClients from "../clients/AddClient";
import UpdateSession from "../sessions/UpdateSession";
import { useAuthStore } from "../../store/auth";

const headerToolbar = {
  start: "title",
  center: "prev today next",
  end: "",
};

type CalendarView = {
  type: string;
  view: string;
};

const calendarViews: CalendarView[] = [
  {
    type: "Month",
    view: "dayGridMonth",
  },
  {
    type: "Week",
    view: "timeGridWeek",
  },
  {
    type: "Day",
    view: "timeGridDay",
  },
];

const popupWidth = 400;
const popupHeight = 500;

interface FullCalendarEvent {
  id: string | number;
  title: string;
  start: string; // ISO string
  end?: string; // ISO string
  extendedProps?: Record<string, unknown>; // for additional metadata
}

interface SessionType {
  id: number;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  repeat_on?: string[];
  repeat_end_date?: string | null;
  repeat_end_type?: string;
  repeat_every?: number;
  repeat_unit?: string;
  repeat_occurrences?: number;
  [key: string]: unknown;
}

function mapSessionToFullCalendarEvents(session: SessionType): FullCalendarEvent[] {
  const events: FullCalendarEvent[] = [];

  const startDate = new Date(session.date);
  
  // Set end date based on repeat_end_type
  let repeatEndDate: Date;
  if (session.repeat_end_type === 'never') {
    // For 'never' ending events, set end date to 2 years from start
    repeatEndDate = new Date(startDate);
    repeatEndDate.setFullYear(repeatEndDate.getFullYear() + 2);
  } else if (session.repeat_end_type === 'after' && session.repeat_occurrences) {
    // For 'after' with specific occurrences, set a far future date
    // The actual count will be handled in the event generation logic
    repeatEndDate = new Date(startDate);
    repeatEndDate.setFullYear(repeatEndDate.getFullYear() + 2);
  } else {
    repeatEndDate = session.repeat_end_date ? new Date(session.repeat_end_date) : new Date(session.date);
  }
  
  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);

  // Helper to merge date and time
  const mergeDateAndTime = (date: Date, time: Date): Date => {
    const merged = new Date(date);
    merged.setHours(
      time.getUTCHours(),
      time.getUTCMinutes(),
      time.getUTCSeconds()
    );
    return merged;
  };

  // Helper to normalize day names for comparison
  const normalizeDayName = (day: string): string => {
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
    
    // Otherwise, capitalize the first letter and make the rest lowercase
    return lowerDay.charAt(0).toUpperCase() + lowerDay.slice(1).toLowerCase();
  };

  // Determine if this is a recurring session
  const isRecurring = 
    // Either has repeat days specified
    (session.repeat_on && session.repeat_on.length > 0) ||
    // Or is set to repeat weekly/monthly/etc with repeat_end_type
    (session.repeat_unit && session.repeat_every && 
     (session.repeat_end_type === 'never' || session.repeat_end_date || session.repeat_end_type === 'after'));

  if (isRecurring) {
    // Create events array based on recurrence pattern
    let occurrenceCount = 0;
    const maxOccurrences = session.repeat_end_type === 'after' ? (session.repeat_occurrences || 0) : Number.MAX_SAFE_INTEGER;
    
    // Handle specific days of the week if specified
    let normalizedRepeatOn: string[] = [];
    if (session.repeat_on && session.repeat_on.length > 0) {
      normalizedRepeatOn = session.repeat_on.map(day => normalizeDayName(day));
    }

    // For weekly repeating events with empty repeat_on, use the start date's day of week
    const isWeeklyWithEmptyRepeatOn = 
      session.repeat_unit === 'weeks' && 
      (!session.repeat_on || session.repeat_on.length === 0);
    
    if (isWeeklyWithEmptyRepeatOn) {
      const startDayOfWeek = startDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      normalizedRepeatOn = [startDayOfWeek];
    }

    // If start date doesn't match any day in repeat_on, find the first matching date
    let currentDate = new Date(startDate);
    
    // Special handling for sessions that specify specific days different from start date
    if (normalizedRepeatOn.length > 0) {
      const startDayOfWeek = currentDate.toLocaleDateString("en-US", { weekday: "long" });
      
      // If start date day doesn't match any repeat day, find the first matching day
      if (!normalizedRepeatOn.includes(startDayOfWeek)) {
        let daysChecked = 0;
        let foundMatchingDay = false;
        
        // Look ahead up to 7 days to find the first matching day
        while (daysChecked < 7 && !foundMatchingDay) {
          currentDate.setDate(currentDate.getDate() + 1);
          daysChecked++;
          
          const dayOfWeek = currentDate.toLocaleDateString("en-US", { weekday: "long" });
          if (normalizedRepeatOn.includes(dayOfWeek)) {
            foundMatchingDay = true;
          }
        }
        
        // If no matching day found in the next week, use original start date
        if (!foundMatchingDay) {
          currentDate = new Date(startDate);
        }
      }
    }

    // Generate events
    while (currentDate <= repeatEndDate && occurrenceCount < maxOccurrences) {
      const weekday = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
      });

      // For specific day repeats, check if this day is in the repeat_on array
      const isDayMatch = normalizedRepeatOn.length === 0 || normalizedRepeatOn.includes(weekday);
      
      if (isDayMatch) {
        const eventStart = mergeDateAndTime(currentDate, startTime);
        const eventEnd = mergeDateAndTime(currentDate, endTime);

        events.push({
          id: `${session.id}-${eventStart.toISOString()}`,
          title: session.title,
          start: eventStart.toISOString(),
          end: eventEnd.toISOString(),
          extendedProps: {
            session,
          },
        });
        
        occurrenceCount++;

        // For repeat_end_type 'after', if we've reached the desired occurrences, break
        if (session.repeat_end_type === 'after' && occurrenceCount >= maxOccurrences) {
          break;
        }
      }
      
      // Advance date based on pattern
      if (session.repeat_unit === 'weeks' && normalizedRepeatOn.length > 0) {
        // For weekly repeats with specific days, advance by 1 day
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (session.repeat_unit) {
        // For other repeats, jump ahead based on repeat_every
        const repeatEvery = session.repeat_every || 1;
        
        if (session.repeat_unit === 'days') {
          currentDate.setDate(currentDate.getDate() + repeatEvery);
        } else if (session.repeat_unit === 'weeks') {
          currentDate.setDate(currentDate.getDate() + (7 * repeatEvery));
        } else if (session.repeat_unit === 'months') {
          currentDate.setMonth(currentDate.getMonth() + repeatEvery);
        }
      } else {
        // Default to daily advance
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  } else {
    // Handle one-time session
    const eventStart = new Date(session.start_time);
    const eventEnd = new Date(session.end_time);

    events.push({
      id: `${session.id}`,
      title: session.title,
      start: eventStart.toISOString(),
      end: eventEnd.toISOString(),
      extendedProps: {
        session,
      },
    });
  }

  return events;
}

const CalendarView = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [currentView, setCurrentView] = useState<CalendarView>(
    calendarViews[0]
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSessionDrawerOpen, setIsSessionDrawerOpen] = useState(false);
  const [sessionID, setSessionID] = useState<string>();
  const [popupData, setPopupData] = useState<{
    title: string;
    description: string;
    extendedProps: Dictionary;
    x: number;
    y: number;
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventImpl | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const { data: sessionsData } = useGetSessions();

  const permisions = useAuthStore((state) => state.role);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const { event, el } = clickInfo;
    const rect = el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let x = rect.left + 5;
    let y = rect.top - 300; // Default: above the event

    // Available space around the event
    const spaceBottom = viewportHeight - rect.bottom;
    const spaceTop = rect.top;
    const spaceLeft = rect.left;
    const spaceRight = viewportWidth - rect.right;

    // Positioning Logic
    if (spaceBottom < popupHeight && spaceTop >= popupHeight) {
      y = rect.top + window.scrollY - popupHeight - 10; // Move above event
      if (spaceRight < popupHeight) {
        x = rect.left - popupWidth - 260; // Move to the left
      } else {
        x = rect.right - 237; // Move to the right
      }
    }
    if (spaceTop < popupHeight && spaceBottom < popupHeight) {
      if (spaceRight >= popupWidth) {
        x = rect.right - 237; // Move to the right
      } else if (spaceLeft >= popupWidth || spaceRight <= popupWidth) {
        x = rect.left - popupWidth - 260; // Move to the left
      } else {
        y = rect.bottom + window.scrollY + 10; // Stay below
      }
    }
    if (spaceTop < popupHeight && spaceRight < popupWidth) {
      x = rect.left - popupWidth - 260; // Move to the left
    } else if (spaceTop < popupHeight && spaceRight > popupWidth) {
      x = rect.right - 237; // Move to the right
    }

    if (spaceTop <= popupHeight - 200 && spaceLeft <= popupWidth) {
      x = rect.right - 237; // Move to the right
    }

    setPopupData({
      title: event.title,
      description: event.extendedProps?.description || "No additional details",
      extendedProps: event.extendedProps,
      x,
      y,
    });
    setSelectedEvent(clickInfo.event);
  };

  const changeView = (view: CalendarView) => {
    setCurrentView(view);
    calendarRef.current?.getApi().changeView(view.view);
    setDropdownOpen(false);
  };

  const handleAddEvent = () => {
    setIsModalOpen(true);
  };

  const renderEventContent = useCallback(
    (eventInfo: {
      timeText: string;
      event: {
        extendedProps: { session: { date: string } };
        title: string;
        start: Date;
      };
    }) => {
      const time = parse(eventInfo.timeText, "HH:mm", new Date());
      const formattedTime = addHours(time, -3);

      return (
        <div className="flex justify-between w-full h-full py-1 cursor-pointer">
          <div
            className={cn("flex items-center gap-1 w-[70%]", {
              "w-[40%]": currentView.type === "Week",
            })}
          >
            <div
              className={cn("rounded-full w-2 h-2 bg-green-400", {
                "bg-gray-500": isPast(new Date(eventInfo.event.start)),
              })}
            />
            <i className="text-xs truncate">{eventInfo.event.title}</i>
          </div>
          <b className="text-xs flex items-center">
            {format(formattedTime, "HH:mm a")}
          </b>
        </div>
      );
    },
    [currentView]
  );

  const handleRemoveEvent = () => {
    if (selectedEvent) {
      selectedEvent.remove();
      setPopupData(null);
      setSelectedEvent(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setSelectedEvent(null);
        setPopupData(null);
      }
    };

    if (selectedEvent) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedEvent]);

  return (
    <div className="pt-5 px-5 bg-[#f5f5f5]">
      <h1 className="text-[32px] font-bold text-primary pb-4">Calendar</h1>
      <div className="relative pt-5 bg-white">
        <div className="absolute top-5 left-[250px]">
          <DropDownMenu
            show={dropdownOpen}
            setShow={setDropdownOpen}
            dropDownPosition="center"
            actionElement={
              <div
                id="viewSelect"
                className="p-2 border rounded w-20 h-10 outline-none cursor-pointer flex items-center justify-between"
              >
                <p>{currentView?.type}</p>
                <img src={dropdownIcon} />
              </div>
            }
          >
            {calendarViews.map((view) => (
              <div
                className={cn("w-20 p-2 cursor-pointer hover:bg-[#DAF8E6]", {
                  "bg-[#EAFCF3]": view.type === currentView.type,
                })}
                onClick={() => changeView(view)}
              >
                <p>{view.type}</p>
              </div>
            ))}
          </DropDownMenu>
        </div>
        {permisions?.can_create_sessions && (
          <div className="absolute top-4 right-[20px]">
            <Button
              w={140}
              h={52}
              size="sm"
              radius="md"
              leftSection={
                <img src={plusIcon} alt="Icon" className="w-3 h-3" />
              }
              style={{
                backgroundColor: "#1D9B5E",
                color: "#fff",
                fontSize: "16px",
              }}
              onClick={handleAddEvent}
            >
              New Event
            </Button>
          </div>
        )}
        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            dayGridWeek,
            interactionPlugin,
          ]}
          initialView={currentView.view}
          events={
            sessionsData?.flatMap(session => mapSessionToFullCalendarEvents(session as unknown as SessionType)) as EventInput
          }
          eventContent={renderEventContent}
          dayMaxEventRows={true}
          allDaySlot={false}
          headerToolbar={headerToolbar}
          height={`calc(100vh - 130px)`}
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          eventClick={handleEventClick}
          dateClick={() => permisions?.can_create_sessions && setIsModalOpen(true)}
        />
        {popupData && (
          <div
            className="absolute bg-white shadow-md p-6 border shadow-lg min-w-[350px] min-h-[400px] z-[1000] rounded-2xl"
            style={{
              top: popupData.y,
              left: popupData.x,
            }}
            ref={popupRef}
          >
            <EventCard
              onClose={() => setPopupData(null)}
              handleRemoveEvent={handleRemoveEvent}
              data={popupData.extendedProps}
              handleEditEvent={(id) => {
                setSessionID(id);
                setPopupData(null);
                setIsSessionDrawerOpen(true);
              }}
            />
          </div>
        )}
      </div>
      <AddSession isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <AddClients
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
      <UpdateSession
        isOpen={isSessionDrawerOpen}
        onClose={() => setIsSessionDrawerOpen(false)}
        sessionId={sessionID || ""}
      />
    </div>
  );
};

export default CalendarView;
