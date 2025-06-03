import { useCallback, useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import dayGridWeek from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Button from '../common/Button';
import plusIcon from '../../assets/icons/plusWhite.svg';
import { addHours, format, isPast, parse } from 'date-fns';
import DropDownMenu from '../common/DropdownMenu';
import dropdownIcon from '../../assets/icons/dropIcon.svg';
import { cn } from '../../utils/mergeClass';
import { EventClickArg, EventInput } from '@fullcalendar/core/index.js';
import EventCard from './eventCard';
import { Dictionary, EventImpl } from '@fullcalendar/core/internal';
import { useGetSessions } from '../../hooks/reactQuery';
import './index.css';
import { useAuthStore } from '../../store/auth';
import { useUIStore } from '../../store/ui';
import { mapSessionToFullCalendarEvents as convertSessionToEvents } from './calendarUtils';
import { CalendarSessionType } from '../../types/sessionTypes';
import { Loader } from '@mantine/core';

const popupWidth = 400;
const popupHeight = 500;

const headerToolbar = {
  start: 'title',
  center: 'prev today next',
  end: '',
};

type CalendarView = {
  type: string;
  view: string;
};

const calendarViews: CalendarView[] = [
  {
    type: 'Day',
    view: 'timeGridDay',
  },
  {
    type: 'Month',
    view: 'dayGridMonth',
  },
  {
    type: 'Week',
    view: 'timeGridWeek',
  },
];

const CalendarView = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [currentView, setCurrentView] = useState<CalendarView>(
    calendarViews[0]
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [popupData, setPopupData] = useState<{
    title: string;
    description: string;
    extendedProps: Dictionary;
    x: number;
    y: number;
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventImpl | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const { data: sessionsData, isLoading } = useGetSessions();
  const [visibleDateRange, setVisibleDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });

  const permisions = useAuthStore((state) => state.role);
  const { openDrawer } = useUIStore();

  const processSessionToEvents = useCallback(
    (session: unknown) => {
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
    },
    [visibleDateRange.start, visibleDateRange.end]
  );

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
    const isMobile = viewportWidth <= 768;

    let x: number;
    let y: number;

    if (isMobile) {
      const mobilePopupWidth = Math.min(popupWidth, viewportWidth - 20);
      x = (viewportWidth - mobilePopupWidth) / 2;

      const spaceAbove = rect.top;
      const spaceBelow = viewportHeight - rect.bottom;
      const requiredHeight = Math.min(popupHeight, viewportHeight * 0.8);

      if (spaceBelow >= requiredHeight + 20) {
        y = rect.bottom + window.scrollY + 10;
      } else if (spaceAbove >= requiredHeight + 20) {
        y = rect.top + window.scrollY - requiredHeight - 10;
      } else {
        y = window.scrollY + (viewportHeight - requiredHeight) / 2;
      }
    } else {
      const spaceBottom = viewportHeight - rect.bottom;
      const spaceTop = rect.top;
      const spaceLeft = rect.left;
      const spaceRight = viewportWidth - rect.right;

      let preferredX = rect.left;

      if (preferredX + popupWidth > viewportWidth - 20) {
        preferredX = viewportWidth - popupWidth - 20;
      }

      if (preferredX < 20) {
        preferredX = 20;
      }

      if (spaceRight < popupWidth / 2 && spaceLeft >= popupWidth + 20) {
        preferredX = rect.left - popupWidth - 10;
      }

      x = preferredX;

      if (spaceBottom >= popupHeight + 20) {
        y = rect.bottom + window.scrollY + 10;
      } else if (spaceTop >= popupHeight + 20) {
        y = rect.top + window.scrollY - popupHeight - 10;
      } else {
        if (spaceRight >= popupWidth + 20) {
          x = rect.right + 10;
          y = Math.max(
            10,
            Math.min(
              rect.top + window.scrollY,
              window.scrollY + viewportHeight - popupHeight - 10
            )
          );
        } else if (spaceLeft >= popupWidth + 20) {
          x = rect.left - popupWidth - 10;
          y = Math.max(
            10,
            Math.min(
              rect.top + window.scrollY,
              window.scrollY + viewportHeight - popupHeight - 10
            )
          );
        } else {
          x = (viewportWidth - popupWidth) / 2;
          y = window.scrollY + (viewportHeight - popupHeight) / 2;
        }
      }

      x = Math.max(10, Math.min(x, viewportWidth - popupWidth - 10));
      y = Math.max(window.scrollY + 10, y);
    }

    setPopupData({
      title: event.title,
      description: event.extendedProps?.description || 'No additional details',
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
    } catch (error) {
      console.error('Failed to change view:', error);
    }
  };

  const handleAddEvent = () => {
    openDrawer({
      type: 'session',
      isEditing: false,
    });
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
        let displayTime;
        if (eventInfo.timeText) {
          const cleanTime = eventInfo.timeText.replace(/[^0-9:]/g, '').trim();
          const parsedTime = parse(cleanTime, 'HH:mm', new Date());

          if (!isNaN(parsedTime.getTime())) {
            displayTime = parsedTime;
          }
        }

        if (!displayTime && eventInfo.event.start) {
          displayTime = new Date(addHours(eventInfo.event.start, -3));
        }

        const timeString = displayTime
          ? format(displayTime, 'HH:mm a')
          : eventInfo.timeText || '';

        return (
          <div className='flex justify-between w-full h-full py-1 cursor-pointer'>
            <div
              className={cn('flex items-center gap-1 w-[70%]', {
                'w-[40%]': currentView.type === 'Week',
              })}
            >
              <div
                className={cn('rounded-full w-2 h-2 bg-green-400', {
                  'bg-gray-500': isPast(new Date(eventInfo.event.start)),
                })}
              />
              <i className='text-xs truncate'>{eventInfo.event.title}</i>
            </div>
            {currentView.type !== 'Week' && (
              <b className='text-xs items-center'>{timeString}</b>
            )}
          </div>
        );
      } catch (error) {
        console.error('Error rendering event content:', error);
        return (
          <div className='flex justify-between w-full h-full py-1 cursor-pointer'>
            <div className='flex items-center gap-1 w-[70%]'>
              <div className='rounded-full w-2 h-2 bg-green-400' />
              <i className='text-xs truncate'>{eventInfo.event.title}</i>
            </div>
            <b className='text-xs flex items-center'>
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
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedEvent]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#f5f5f5]'>
        <div className='pt-3 px-3 sm:pt-5 sm:px-5 pb-4'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <div>
              <div className='h-6 sm:h-8 bg-gray-200 rounded-lg w-32 sm:w-48 animate-pulse'></div>
              <div className='h-4 bg-gray-200 rounded w-48 sm:w-64 mt-2 animate-pulse'></div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='h-10 bg-gray-200 rounded-lg w-full sm:w-32 animate-pulse'></div>
            </div>
          </div>
        </div>

        <div className='px-3 sm:px-5 pb-6'>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8'>
            <div className='flex items-center justify-center h-64 sm:h-[calc(100vh-240px)]'>
              <div className='text-center'>
                <Loader color='#1D9B5E' size='lg' />
                <p className='text-gray-500 mt-4 text-sm'>
                  Loading calendar...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='pt-3 px-3 sm:pt-4 sm:px-5 bg-[#f5f5f5]'>
      <div className='flex flex-col gap-3 pb-2 sm:pb-3'>
        <div className='flex flex-col sm:flex-row items-center sm:justify-between gap-3'>
          <div className='flex flex-col items-center md:items-start mt-5 md:mt-0'>
            <h1 className='text-2xl sm:text-[32px] font-bold text-primary'>
              Calendar
            </h1>
            <p className='text-sm text-gray-600 mt-1'>
              Manage your sessions and appointments
            </p>
          </div>

          {permisions?.can_create_sessions && (
            <Button
              w={140}
              h={42}
              size='sm'
              radius='md'
              className='w-full sm:w-auto'
              leftSection={
                <img src={plusIcon} alt='Icon' className='w-4 h-4' />
              }
              style={{
                backgroundColor: '#1D9B5E',
                color: '#fff',
                fontSize: '16px',
              }}
              onClick={handleAddEvent}
            >
              New Event
            </Button>
          )}
        </div>

        <div className='flex sm:hidden justify-center items-center'>
          <DropDownMenu
            show={mobileDropdownOpen}
            setShow={setMobileDropdownOpen}
            dropDownPosition='center'
            actionElement={
              <div className='px-4 py-2 border border-gray-300 rounded-lg w-28 h-10 outline-none cursor-pointer flex items-center justify-between bg-white hover:bg-gray-50 transition-colors mx-auto'>
                <p className='text-sm font-medium text-gray-700'>
                  {currentView?.type}
                </p>
                <img src={dropdownIcon} className='w-4 h-4' alt='Dropdown' />
              </div>
            }
          >
            {calendarViews.map((view) => (
              <div
                className={cn(
                  'w-28 p-2 cursor-pointer hover:bg-[#DAF8E6] text-sm text-center',
                  {
                    'bg-[#EAFCF3] text-[#1D9B5E] font-medium':
                      view.type === currentView.type,
                    'text-gray-700': view.type !== currentView.type,
                  }
                )}
                key={view.type}
                onClick={() => {
                  changeView(view);
                  setMobileDropdownOpen(false);
                }}
              >
                <p>{view.type}</p>
              </div>
            ))}
          </DropDownMenu>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-sm relative'>
        <div className='hidden sm:block absolute top-[22px] right-6 z-10'>
          <DropDownMenu
            show={dropdownOpen}
            setShow={setDropdownOpen}
            dropDownPosition='left'
            actionElement={
              <div className='px-2 py-2 border border-gray-300 rounded-lg w-20 h-8 sm:px-3 sm:w-24 sm:h-10 outline-none cursor-pointer flex items-center justify-between bg-white hover:bg-gray-50 transition-colors'>
                <p className='text-xs sm:text-sm font-medium text-gray-700'>
                  {currentView?.type}
                </p>
                <img
                  src={dropdownIcon}
                  className='w-3 h-3 sm:w-4 sm:h-4'
                  alt='Dropdown'
                />
              </div>
            }
          >
            {calendarViews.map((view) => (
              <div
                className={cn(
                  'w-20 sm:w-24 p-2 cursor-pointer hover:bg-[#DAF8E6] text-xs sm:text-sm',
                  {
                    'bg-[#EAFCF3] text-[#1D9B5E] font-medium':
                      view.type === currentView.type,
                    'text-gray-700': view.type !== currentView.type,
                  }
                )}
                key={view.type}
                onClick={() => {
                  changeView(view);
                  setDropdownOpen(false);
                }}
              >
                <p>{view.type}</p>
              </div>
            ))}
          </DropDownMenu>
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
          events={sessionsData?.flatMap(processSessionToEvents) as EventInput}
          datesSet={handleDatesSet}
          eventContent={renderEventContent}
          dayMaxEventRows={3}
          dayMaxEvents={true}
          moreLinkClick='popover'
          allDaySlot={false}
          headerToolbar={headerToolbar}
          timeZone='Africa/Nairobi'
          height={`calc(100vh - 160px)`}
          slotMinTime='06:00:00'
          slotMaxTime='22:00:00'
          slotDuration='00:30:00'
          slotLabelInterval='01:00:00'
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          eventClick={handleEventClick}
          dateClick={() =>
            permisions?.can_create_sessions &&
            openDrawer({
              type: 'session',
              isEditing: false,
            })
          }
          eventClassNames='fc-event-custom'
          eventMouseEnter={(info) => {
            info.el.style.cursor = 'pointer';
          }}
          loading={(isLoading) => {
            if (isLoading) {
              console.log('Calendar loading...');
            }
          }}
        />
        {popupData && (
          <>
            <div
              className='sm:hidden fixed inset-0 bg-black bg-opacity-50 z-[999]'
              onClick={() => setPopupData(null)}
            />

            <div
              className='absolute bg-white p-4 sm:p-6 border shadow-lg w-[calc(100vw-20px)] max-w-[350px] sm:min-w-[350px] min-h-[400px] max-h-[80vh] overflow-y-auto z-[1000] rounded-2xl'
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
                  setPopupData(null);
                  openDrawer({
                    type: 'session',
                    entityId: id,
                    isEditing: true,
                  });
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
