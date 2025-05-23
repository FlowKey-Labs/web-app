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
import { mapSessionToFullCalendarEvents as convertSessionToEvents } from "./calendarUtils";
import { CalendarSessionType } from "../../types/sessionTypes";

// Constants for popup positioning
const popupWidth = 400;
const popupHeight = 500;

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
    type: "Day",
    view: "timeGridDay",
  },
  {
    type: "Month",
    view: "dayGridMonth",
  },
  {
    type: "Week",
    view: "timeGridWeek",
  },
];

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
  // Track visible date range for optimized event generation
  const [visibleDateRange, setVisibleDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });

  const permisions = useAuthStore((state) => state.role);

  // Memoize the mapping function to improve performance
  const processSessionToEvents = useCallback((session: unknown) => {
    try {
      return convertSessionToEvents(
        session as unknown as CalendarSessionType,
        visibleDateRange.start || undefined,
        visibleDateRange.end || undefined
      );
    } catch (error) {
      console.error('Error processing session:', error);
      return [];
    }
  }, [visibleDateRange.start, visibleDateRange.end]);

  // Update visible date range when the view changes
  const handleDatesSet = useCallback((dateInfo: { start: Date; end: Date }) => {
    setVisibleDateRange({
      start: dateInfo.start,
      end: dateInfo.end,
    });
  }, []);

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
    try {
      setCurrentView(view);
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.changeView(view.view);
      }
      setDropdownOpen(false);
    } catch (error) {
      console.error('Failed to change view:', error);
    }
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
      try {
        // Safely parse the time or fall back to event start time
        let displayTime;
        if (eventInfo.timeText) {
          // Clean the time string (remove any AM/PM or other non-time characters)
          const cleanTime = eventInfo.timeText.replace(/[^0-9:]/g, '').trim();
          const parsedTime = parse(cleanTime, "HH:mm", new Date());
          
          // Only use if parsing succeeded
          if (!isNaN(parsedTime.getTime())) {
            displayTime = parsedTime;
          }
        }
        
        // Fallback to event start time if time parsing failed
        if (!displayTime && eventInfo.event.start) {
          displayTime = new Date(addHours(eventInfo.event.start, -3));
        }
  
        // Format the time safely
        const timeString = displayTime 
          ? format(displayTime, "HH:mm a") 
          : eventInfo.timeText || '';
  
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
              {timeString}
            </b>
          </div>
        );
      } catch (error) {
        console.error('Error rendering event content:', error);
        // Fallback rendering
        return (
          <div className="flex justify-between w-full h-full py-1 cursor-pointer">
            <div className="flex items-center gap-1 w-[70%]">
              <div className="rounded-full w-2 h-2 bg-green-400" />
              <i className="text-xs truncate">{eventInfo.event.title}</i>
            </div>
            <b className="text-xs flex items-center">
              {eventInfo.timeText || ''}
            </b>
          </div>
        );
      }
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
                key={view.type}
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
            sessionsData?.flatMap(processSessionToEvents) as EventInput
          }
          datesSet={handleDatesSet}
          eventContent={renderEventContent}
          dayMaxEventRows={true}
          allDaySlot={false}
          headerToolbar={headerToolbar}
          timeZone="Africa/Nairobi"
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
