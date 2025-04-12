import { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import dayGridWeek from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Button from "../common/Button";
import plusIcon from "../../assets/icons/plusWhite.svg";
import { format, parse } from "date-fns";
import DropDownMenu from "../common/DropdownMenu";
import dropdownIcon from "../../assets/icons/dropIcon.svg";
import { cn } from "../../utils/mergeClass";
import "./index.css";
import { EventClickArg } from "@fullcalendar/core/index.js";

const formatTimeTo12Hour = (timeStr: string): string => {
  try {
    // Handle time range format: "12:33 - 16:33"
    if (timeStr.includes(" - ")) {
      const [start, end] = timeStr.split(" - ");
      return `${format(parse(start, "HH:mm", new Date()), "h:mm a")} - ${format(
        parse(end, "HH:mm", new Date()),
        "h:mm a"
      )}`;
    }

    // Handle single time format: "12:33" or "12:33p"
    return format(
      parse(timeStr.replace(/[ap]$/, ""), "HH:mm", new Date()),
      "h:mm a"
    );
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeStr; // Return original if parsing fails
  }
};

import EventCard from "./eventCard";
import { Dictionary, EventImpl } from "@fullcalendar/core/internal";
import { useGetSessions } from "../../hooks/reactQuery";
import AddSession from "../sessions/AddSession";

const headerToolbar = {
  start: "title",
  center: "",
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
  end?: string;  // ISO string
  extendedProps?: Record<string, unknown>; // for additional metadata
}

function mapSessionToFullCalendarEvents(session: any): FullCalendarEvent[] {
  const events: FullCalendarEvent[] = [];

  const startDate = new Date(session.date);
  const repeatEndDate = new Date(session.repeat_end_date || session.date);
  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);

  // Helper to merge date and time
  const mergeDateAndTime = (date: Date, time: Date): Date => {
    const merged = new Date(date);
    merged.setHours(time.getUTCHours(), time.getUTCMinutes(), time.getUTCSeconds());
    return merged;
  };

  // Handle recurring sessions
  if (session.repeat_on && session.repeat_on.length > 0) {
    const currentDate = new Date(startDate);

    while (currentDate <= repeatEndDate) {
      const weekday = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

      if (session.repeat_on.includes(weekday)) {
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
      }

      currentDate.setDate(currentDate.getDate() + 1);
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
        session
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
    (eventInfo: { timeText: string; event: { title: string } }) => {
      return (
        <div className="flex justify-between w-full h-full py-1 cursor-pointer">
          <div
            className={cn("flex items-center gap-1 w-[70%]", {
              "w-[40%]": currentView.type === "Week",
            })}
          >
            <div className="rounded-full w-2 h-2 bg-green-400" />
            <i className="text-xs truncate">{eventInfo.event.title}</i>
          </div>
          <b className="text-xs flex items-center">
            {formatTimeTo12Hour(eventInfo.timeText)}
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
        <div className="absolute top-4 right-[20px]">
          <Button
            w={140}
            h={52}
            size="sm"
            radius="md"
            leftSection={<img src={plusIcon} alt="Icon" className="w-3 h-3" />}
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
        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            dayGridWeek,
            interactionPlugin,
          ]}
          initialView={currentView.view}
          events={sessionsData?.flatMap(mapSessionToFullCalendarEvents)}
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
          dateClick={() => setIsModalOpen(true)}
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
            />
          </div>
        )}
      </div>
    <AddSession isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} /> 
    </div>
  );
};

export default CalendarView;
