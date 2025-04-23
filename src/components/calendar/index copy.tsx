import React, { useCallback, useEffect, useRef, useState } from "react";
import Calendar from '@toast-ui/react-calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import Button from "../common/Button";
import plusIcon from "../../assets/icons/plusWhite.svg";
import { addHours, format, isPast, parse, subHours } from "date-fns";
import DropDownMenu from "../common/DropdownMenu";
import dropdownIcon from "../../assets/icons/dropIcon.svg";
import { cn } from "../../utils/mergeClass";
import EventCard from "./eventCard";
import { useGetSessions } from "../../hooks/reactQuery";
import AddSession from "../sessions/AddSession";
import "./index.css";
import AddClients from "../clients/AddClient";
import moment from "moment";

const headerToolbar = {
  start: "title",
  center: "prev today next",
  end: "",
};

type CalendarView = {
  type: string;
  view: string;
  tuiView: 'day' | 'week' | 'month';
};

const calendarViews: CalendarView[] = [
  {
    type: "Month",
    view: "dayGridMonth",
    tuiView: "month"
  },
  {
    type: "Week",
    view: "timeGridWeek",
    tuiView: "week"
  },
  {
    type: "Day",
    view: "timeGridDay",
    tuiView: "day"
  },
];

const popupWidth = 400;
const popupHeight = 500;

const CalendarView = () => {
  const calendarRef = useRef<any>(null);
  const [currentView, setCurrentView] = useState<CalendarView>(calendarViews[0]); // Default to week view
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [popupData, setPopupData] = useState<{
    title: string;
    description: string;
    extendedProps: any;
    x: number;
    y: number;
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const { data: sessionsData } = useGetSessions();

  // Map sessions to TUI Calendar format
  const mapSessionToTUIEvents = useCallback((session: any) => {
    const events: any[] = [];
    const startDate = new Date(session.date);
    const repeatEndDate = new Date(session.repeat_end_date || session.date);
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);

    const mergeDateAndTime = (date: Date, time: Date): Date => {
      const merged = new Date(date);
      merged.setHours(
        time.getUTCHours(),
        time.getUTCMinutes(),
        time.getUTCSeconds()
      );
      return merged;
    };

    if (session.repeat_on && session.repeat_on.length > 0) {
      const currentDate = new Date(startDate);
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

      while (currentDate <= repeatEndDate) {
        const weekday = currentDate.getDay();
        const weekdayName = daysOfWeek[weekday];

        if (session.repeat_on.includes(weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1))) {
          const eventStart = mergeDateAndTime(currentDate, startTime);
          const eventEnd = mergeDateAndTime(currentDate, endTime);

          events.push({
            id: `${session.id}-${eventStart.toISOString()}`,
            calendarId: '1',
            title: session.title,
            start: eventStart,
            end: eventEnd,
            category: 'time',
            isReadOnly: true,
            raw: {
              session,
            },
            backgroundColor: isPast(eventStart) ? '#9CA3AF' : '#10B981',
            borderColor: isPast(eventStart) ? '#9CA3AF' : '#10B981',
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      const eventStart = new Date(session.start_time);
      const eventEnd = new Date(session.end_time);

      events.push({
        id: `${session.id}`,
        calendarId: '1',
        title: session.title,
        start: eventStart,
        end: eventEnd,
        category: 'time',
        isReadOnly: true,
        raw: {
          session,
        },
        backgroundColor: isPast(eventStart) ? '#9CA3AF' : '#10B981',
        borderColor: isPast(eventStart) ? '#9CA3AF' : '#10B981',
      });
    }

    return events;
  }, []);

  // Handle event click
  const handleEventClick = useCallback(({ event }: { event: any }) => {
    const calendarInstance = calendarRef.current?.getInstance();
    const element = calendarInstance?.getElement(event.id, event.calendarId);
    
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let x = rect.left + 5;
    let y = rect.top - 300;

    // Positioning logic (same as your original)
    const spaceBottom = viewportHeight - rect.bottom;
    const spaceTop = rect.top;
    const spaceLeft = rect.left;
    const spaceRight = viewportWidth - rect.right;

    if (spaceBottom < popupHeight && spaceTop >= popupHeight) {
      y = rect.top + window.scrollY - popupHeight - 10;
      if (spaceRight < popupHeight) {
        x = rect.left - popupWidth - 260;
      } else {
        x = rect.right - 237;
      }
    }
    if (spaceTop < popupHeight && spaceBottom < popupHeight) {
      if (spaceRight >= popupWidth) {
        x = rect.right - 237;
      } else if (spaceLeft >= popupWidth || spaceRight <= popupWidth) {
        x = rect.left - popupWidth - 260;
      } else {
        y = rect.bottom + window.scrollY + 10;
      }
    }
    if (spaceTop < popupHeight && spaceRight < popupWidth) {
      x = rect.left - popupWidth - 260;
    } else if (spaceTop < popupHeight && spaceRight > popupWidth) {
      x = rect.right - 237;
    }

    if (spaceTop <= popupHeight - 200 && spaceLeft <= popupWidth) {
      x = rect.right - 237;
    }

    setPopupData({
      title: event.title,
      description: event.raw?.session?.description || "No additional details",
      extendedProps: event.raw,
      x,
      y,
    });
    setSelectedEvent(event);
  }, []);

  // Handle date click
  const handleDateClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // Change view
  const changeView = useCallback((view: CalendarView) => {
    setCurrentView(view);
    calendarRef.current?.getInstance().changeView(view.tuiView);
    setDropdownOpen(false);
  }, []);

  const handleAddEvent = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleRemoveEvent = useCallback(() => {
    if (selectedEvent && calendarRef.current) {
      const calendarInstance = calendarRef.current.getInstance();
      calendarInstance.deleteEvent(selectedEvent.id, selectedEvent.calendarId);
      setPopupData(null);
      setSelectedEvent(null);
    }
  }, [selectedEvent]);

  // Initialize calendar
  useEffect(() => {
    if (calendarRef.current) {
      const calendarInstance = calendarRef.current.getInstance();
      
      // Set event handlers
      calendarInstance.on('clickEvent', handleEventClick);
      calendarInstance.on('selectDateTime', handleDateClick);
      
      // Set theme
      calendarInstance.setTheme({
        common: {
          fontFamily: 'inherit',
        },
        week: {
          dayGridLeft: {
            width: '40px',
          },
          timeGridLeft: {
            width: '40px',
          },
          timeGrid: {
            timeLeft: {
              width: '40px',
            }
          },
          dayGridHeader: {
            height: '30px',
          },
          nowIndicatorLabel: {
            color: '#1D9B5E',
          },
          nowIndicatorBullet: {
            backgroundColor: '#1D9B5E',
          },
          pastTime: {
            color: '#9CA3AF',
          },
          futureTime: {
            color: '#1F2937',
          },
          today: {
            color: '#1D9B5E',
          },
          weekend: {
            color: '#1F2937',
          },
          gridSelection: {
            backgroundColor: 'rgba(29, 155, 94, 0.05)',
            border: '1px dashed #1D9B5E',
          },
        },
      });
    }
  }, [handleDateClick, handleEventClick]);

  // Custom template for events
  const eventTemplate = useCallback((event: any) => {
    const time = parse(format(event.start, 'HH:mm'), 'HH:mm', new Date());
    const formattedTime = addHours(time, -3);

    return `
      <div class="flex justify-between w-full h-full py-1 cursor-pointer">
        <div class="${cn('flex items-center gap-1 w-[70%]', {
          'w-[40%]': currentView.type === 'Week',
        })}">
          <div class="${cn('rounded-full w-2 h-2', {
            'bg-gray-500': isPast(new Date(event.start)),
            'bg-green-400': !isPast(new Date(event.start)),
          })}" />
          <i class="text-xs truncate">${event.title}</i>
        </div>
        <b class="text-xs flex items-center">
          ${format(formattedTime, 'HH:mm a')}
        </b>
      </div>
    `;
  }, [currentView]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
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
                <img src={dropdownIcon} alt="Dropdown" />
              </div>
            }
          >
            {calendarViews.map((view) => (
              <div
                key={view.type}
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
        <div className="">
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
        <div style={{ height: 'calc(100vh - 200px)' }}>
          <Calendar
            ref={calendarRef}
            usageStatistics={false}
            calendars={[
              {
                id: '1',
                name: 'Default',
                backgroundColor: '#1D9B5E',
              },
            ]}
            events={sessionsData?.flatMap(mapSessionToTUIEvents)}
            template={{
              time: eventTemplate,
            }}
            useFormPopup={false}
            useDetailPopup={false}
            gridSelection={false}
            isReadOnly={false}
            view={currentView.tuiView}
            week={{
              showTimezoneCollapseButton: false,
              timezonesCollapsed: false,
              hourStart: 0,
              hourEnd: 24,
              taskView: false,
              eventView: ['time'],
              collapseDuplicateEvents: false,
            }}
            month={{
              dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
              visibleWeeksCount: 6,
              startDayOfWeek: 0,
            }}
            timezone={{
              zones: [
                {
                  timezoneName: 'UTC',
                  displayLabel: 'UTC',
                },
              ],
            }}
          />
        </div>
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
              handleAddClient={() => {
                setPopupData(null);
                setIsModalOpen(true);
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
    </div>
  );
};

export default CalendarView;